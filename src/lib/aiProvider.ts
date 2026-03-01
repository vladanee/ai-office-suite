/**
 * AI Provider abstraction layer.
 * Routes AI requests to either Lovable AI (cloud edge functions) or local Ollama.
 */

export type AIProvider = 'cloud' | 'ollama';

export interface AIProviderConfig {
  provider: AIProvider;
  ollamaUrl: string;
  ollamaModel: string;
}

const STORAGE_KEY = 'ai-provider-config';

const DEFAULT_CONFIG: AIProviderConfig = {
  provider: 'cloud',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
};

export function getAIProviderConfig(): AIProviderConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {
    // ignore parse errors
  }
  return DEFAULT_CONFIG;
}

export function setAIProviderConfig(config: Partial<AIProviderConfig>) {
  const current = getAIProviderConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Stream a chat completion from Ollama's local API.
 * Ollama exposes an OpenAI-compatible endpoint at /v1/chat/completions.
 */
export async function streamOllamaChat({
  messages,
  systemPrompt,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  messages: { role: string; content: string }[];
  systemPrompt?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}) {
  const config = getAIProviderConfig();
  const allMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages,
  ];

  try {
    const response = await fetch(`${config.ollamaUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollamaModel,
        messages: allMessages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama error (${response.status}): ${text}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body from Ollama');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          // partial JSON, put back
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }

    onDone();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Non-streaming Ollama call for task generation etc.
 */
export async function callOllamaCompletion({
  messages,
  systemPrompt,
}: {
  messages: { role: string; content: string }[];
  systemPrompt?: string;
}): Promise<string> {
  const config = getAIProviderConfig();
  const allMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages,
  ];

  const response = await fetch(`${config.ollamaUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.ollamaModel,
      messages: allMessages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Test connectivity to the Ollama instance.
 */
export async function testOllamaConnection(url?: string): Promise<{ ok: boolean; models?: string[]; error?: string }> {
  const baseUrl = url || getAIProviderConfig().ollamaUrl;
  try {
    const response = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const models = (data.models || []).map((m: { name: string }) => m.name);
    return { ok: true, models };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}
