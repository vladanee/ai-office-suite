import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WebhookPayload {
  event: string;
  workflow_id?: string;
  run_id?: string;
  node_id?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify webhook secret (mandatory security layer)
    const expectedSecret = Deno.env.get('N8N_WEBHOOK_SECRET');
    
    if (!expectedSecret) {
      console.error('N8N_WEBHOOK_SECRET not configured - rejecting request');
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const webhookSecret = req.headers.get('x-webhook-secret');
    if (webhookSecret !== expectedSecret) {
      console.log('Invalid or missing webhook secret');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: WebhookPayload = await req.json();
    console.log('Received n8n webhook:', JSON.stringify(payload, null, 2));

    // Process different event types
    const { event, workflow_id, run_id, node_id, data, timestamp } = payload;

    let response: Record<string, unknown> = {
      success: true,
      received_at: new Date().toISOString(),
      event,
    };

    switch (event) {
      case 'workflow.started':
        console.log(`Workflow ${workflow_id} started at ${timestamp}`);
        response.message = 'Workflow start acknowledged';
        break;

      case 'workflow.completed':
        console.log(`Workflow ${workflow_id} completed at ${timestamp}`);
        response.message = 'Workflow completion acknowledged';
        break;

      case 'workflow.failed':
        console.log(`Workflow ${workflow_id} failed at ${timestamp}`);
        response.message = 'Workflow failure acknowledged';
        break;

      case 'node.executed':
        console.log(`Node ${node_id} in workflow ${workflow_id} executed`);
        response.message = 'Node execution acknowledged';
        response.node_id = node_id;
        break;

      case 'task.created':
        console.log(`Task created via n8n: ${JSON.stringify(data)}`);
        response.message = 'Task creation acknowledged';
        response.task_data = data;
        break;

      case 'task.completed':
        console.log(`Task completed via n8n: ${JSON.stringify(data)}`);
        response.message = 'Task completion acknowledged';
        response.task_data = data;
        break;

      case 'persona.action':
        console.log(`Persona action triggered: ${JSON.stringify(data)}`);
        response.message = 'Persona action acknowledged';
        response.action_data = data;
        break;

      default:
        console.log(`Unknown event type: ${event}`);
        response.message = 'Event received';
        response.data = data;
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
