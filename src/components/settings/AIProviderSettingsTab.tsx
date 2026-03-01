import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Check, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  type AIProvider,
  getAIProviderConfig,
  setAIProviderConfig,
  testOllamaConnection,
} from '@/lib/aiProvider';

export function AIProviderSettingsTab() {
  const [config, setConfig] = useState(getAIProviderConfig());
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    if (config.provider === 'ollama') {
      handleTest();
    }
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    const updated = setAIProviderConfig({ provider });
    setConfig(updated);
    toast.success(`AI provider set to ${provider === 'cloud' ? 'Cloud (Lovable AI)' : 'Ollama (Local)'}`);
  };

  const handleSaveOllamaConfig = () => {
    const updated = setAIProviderConfig({
      ollamaUrl: config.ollamaUrl,
      ollamaModel: config.ollamaModel,
    });
    setConfig(updated);
    toast.success('Ollama configuration saved');
  };

  const handleTest = async () => {
    setTesting(true);
    const result = await testOllamaConnection(config.ollamaUrl);
    setTesting(false);

    if (result.ok) {
      setConnectionStatus('connected');
      setAvailableModels(result.models || []);
      toast.success(`Connected! Found ${result.models?.length || 0} models.`);
    } else {
      setConnectionStatus('failed');
      setAvailableModels([]);
      toast.error(`Connection failed: ${result.error}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Provider
          </CardTitle>
          <CardDescription>
            Choose between cloud AI or a local Ollama instance for all AI features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cloud option */}
            <button
              onClick={() => handleProviderChange('cloud')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                config.provider === 'cloud'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-foreground">☁️ Cloud</span>
                {config.provider === 'cloud' && (
                  <Badge variant="default" className="bg-primary">
                    <Check className="w-3 h-3 mr-1" /> Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Lovable AI Gateway — Gemini & GPT-5 models. No setup needed.
              </p>
            </button>

            {/* Ollama option */}
            <button
              onClick={() => handleProviderChange('ollama')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                config.provider === 'ollama'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-foreground">🦙 Ollama</span>
                {config.provider === 'ollama' && (
                  <Badge variant="default" className="bg-primary">
                    <Check className="w-3 h-3 mr-1" /> Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Local models via Ollama. Requires Ollama running on your machine.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Ollama Config */}
      {config.provider === 'ollama' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ollama Configuration</CardTitle>
                <CardDescription>
                  Configure your local Ollama instance. Make sure Ollama is running with{' '}
                  <code className="text-xs bg-secondary px-1 py-0.5 rounded">OLLAMA_ORIGINS=*</code> for browser access.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' && (
                  <Badge variant="outline" className="text-success border-success/30">
                    <Wifi className="w-3 h-3 mr-1" /> Connected
                  </Badge>
                )}
                {connectionStatus === 'failed' && (
                  <Badge variant="outline" className="text-destructive border-destructive/30">
                    <WifiOff className="w-3 h-3 mr-1" /> Disconnected
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ollamaUrl">Ollama URL</Label>
              <Input
                id="ollamaUrl"
                value={config.ollamaUrl}
                onChange={(e) => setConfig((c) => ({ ...c, ollamaUrl: e.target.value }))}
                placeholder="http://localhost:11434"
                className="bg-card max-w-md font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ollamaModel">Model</Label>
              {availableModels.length > 0 ? (
                <Select
                  value={config.ollamaModel}
                  onValueChange={(value) => setConfig((c) => ({ ...c, ollamaModel: value }))}
                >
                  <SelectTrigger className="max-w-md bg-card">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="ollamaModel"
                  value={config.ollamaModel}
                  onChange={(e) => setConfig((c) => ({ ...c, ollamaModel: e.target.value }))}
                  placeholder="llama3.2"
                  className="bg-card max-w-md"
                />
              )}
              <p className="text-xs text-muted-foreground">
                The model to use for all AI features. Must be pulled in Ollama first.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveOllamaConfig}>Save Configuration</Button>
              <Button variant="outline" onClick={handleTest} disabled={testing}>
                {testing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Test Connection
              </Button>
            </div>

            {/* Setup instructions */}
            <div className="mt-4 p-4 bg-secondary/50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-foreground">Quick Setup</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  Install Ollama:{' '}
                  <code className="text-xs bg-background px-1 py-0.5 rounded">curl -fsSL https://ollama.com/install.sh | sh</code>
                </li>
                <li>
                  Pull a model:{' '}
                  <code className="text-xs bg-background px-1 py-0.5 rounded">ollama pull llama3.2</code>
                </li>
                <li>
                  Start with CORS enabled:{' '}
                  <code className="text-xs bg-background px-1 py-0.5 rounded">OLLAMA_ORIGINS=* ollama serve</code>
                </li>
                <li>Click "Test Connection" above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
