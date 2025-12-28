export interface WebhookPayload {
  event: string;
  workflow_id?: string;
  run_id?: string;
  node_id?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

export const getN8nWebhookUrl = (): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/functions/v1/n8n-webhook`;
};

export const triggerN8nWebhook = async (
  webhookUrl: string,
  payload: WebhookPayload,
  secret?: string
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (secret) {
    headers['x-webhook-secret'] = secret;
  }

  return fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
    }),
  });
};

// Event types for n8n integration
export const N8N_EVENTS = {
  WORKFLOW_STARTED: 'workflow.started',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
  NODE_EXECUTED: 'node.executed',
  TASK_CREATED: 'task.created',
  TASK_COMPLETED: 'task.completed',
  PERSONA_ACTION: 'persona.action',
} as const;

export type N8nEventType = typeof N8N_EVENTS[keyof typeof N8N_EVENTS];
