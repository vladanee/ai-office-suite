import { Node, Edge } from 'reactflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'automation' | 'notification' | 'data' | 'integration';
  nodes: Node[];
  edges: Edge[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Workflow',
    description: 'Start from scratch with an empty canvas',
    icon: '📄',
    category: 'automation',
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 200 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e-start-end', source: 'start-1', target: 'end-1', animated: true },
    ],
  },
  {
    id: 'task-approval',
    name: 'Task Approval Flow',
    description: 'Route tasks through approval with conditional branching',
    icon: '✅',
    category: 'automation',
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-1', type: 'task', position: { x: 250, y: 150 }, data: { label: 'Review Request', description: 'Review the incoming request and prepare for approval' } },
      { id: 'cond-1', type: 'conditional', position: { x: 250, y: 280 }, data: { label: 'Approved?', condition: 'approved == true' } },
      { id: 'task-approve', type: 'task', position: { x: 100, y: 400 }, data: { label: 'Process Approval', description: 'Process the approved request' } },
      { id: 'task-reject', type: 'task', position: { x: 400, y: 400 }, data: { label: 'Handle Rejection', description: 'Notify requester of rejection with reasons' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 520 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-1' },
      { id: 'e2', source: 'task-1', target: 'cond-1' },
      { id: 'e3', source: 'cond-1', target: 'task-approve', sourceHandle: 'a' },
      { id: 'e4', source: 'cond-1', target: 'task-reject', sourceHandle: 'b' },
      { id: 'e5', source: 'task-approve', target: 'end-1' },
      { id: 'e6', source: 'task-reject', target: 'end-1' },
    ],
  },
  {
    id: 'email-notification',
    name: 'Email Notification',
    description: 'Process data and send email notifications',
    icon: '📧',
    category: 'notification',
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-1', type: 'task', position: { x: 250, y: 150 }, data: { label: 'Prepare Content', description: 'Generate email content based on input data' } },
      { id: 'email-1', type: 'email', position: { x: 250, y: 280 }, data: { label: 'Send Notification', to: '', subject: 'Workflow Notification', body: 'Your workflow has completed processing.' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 400 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-1' },
      { id: 'e2', source: 'task-1', target: 'email-1' },
      { id: 'e3', source: 'email-1', target: 'end-1' },
    ],
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'Fetch, transform, and process data from APIs',
    icon: '🔄',
    category: 'data',
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'http-1', type: 'http', position: { x: 250, y: 150 }, data: { label: 'Fetch Data', method: 'GET', url: '', headers: '', body: '' } },
      { id: 'transform-1', type: 'transform', position: { x: 250, y: 280 }, data: { label: 'Transform Data', transform: 'parse', inputVar: 'data', outputVar: 'processed' } },
      { id: 'task-1', type: 'task', position: { x: 250, y: 410 }, data: { label: 'Process Results', description: 'Analyze and summarize the transformed data' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 540 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'http-1' },
      { id: 'e2', source: 'http-1', target: 'transform-1' },
      { id: 'e3', source: 'transform-1', target: 'task-1' },
      { id: 'e4', source: 'task-1', target: 'end-1' },
    ],
  },
  {
    id: 'webhook-integration',
    name: 'Webhook Integration',
    description: 'Connect to external services via webhooks',
    icon: '🔗',
    category: 'integration',
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-1', type: 'task', position: { x: 250, y: 150 }, data: { label: 'Prepare Payload', description: 'Format data for external service' } },
      { id: 'webhook-1', type: 'webhook', position: { x: 250, y: 280 }, data: { label: 'Send to n8n', url: '' } },
      { id: 'delay-1', type: 'delay', position: { x: 250, y: 410 }, data: { label: 'Wait for Response', delay: 5 } },
      { id: 'task-2', type: 'task', position: { x: 250, y: 540 }, data: { label: 'Process Response', description: 'Handle the webhook response' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 670 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-1' },
      { id: 'e2', source: 'task-1', target: 'webhook-1' },
      { id: 'e3', source: 'webhook-1', target: 'delay-1' },
      { id: 'e4', source: 'delay-1', target: 'task-2' },
      { id: 'e5', source: 'task-2', target: 'end-1' },
    ],
  },
  {
    id: 'batch-processing',
    name: 'Batch Processing',
    description: 'Loop through items and process them in batches',
    icon: '🔁',
    category: 'data',
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'loop-1', type: 'loop', position: { x: 250, y: 150 }, data: { label: 'Process Items', iterations: 10, collection: 'items' } },
      { id: 'task-1', type: 'task', position: { x: 250, y: 280 }, data: { label: 'Process Item', description: 'Process each item in the collection' } },
      { id: 'delay-1', type: 'delay', position: { x: 250, y: 410 }, data: { label: 'Rate Limit', delay: 1 } },
      { id: 'task-2', type: 'task', position: { x: 250, y: 540 }, data: { label: 'Summarize Results', description: 'Compile and summarize all processed items' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 670 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'loop-1' },
      { id: 'e2', source: 'loop-1', target: 'task-1', sourceHandle: 'loop' },
      { id: 'e3', source: 'task-1', target: 'delay-1' },
      { id: 'e4', source: 'delay-1', target: 'loop-1' },
      { id: 'e5', source: 'loop-1', target: 'task-2', sourceHandle: 'done' },
      { id: 'e6', source: 'task-2', target: 'end-1' },
    ],
  },
];

export const getTemplateById = (id: string): WorkflowTemplate | undefined => {
  return workflowTemplates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: WorkflowTemplate['category']): WorkflowTemplate[] => {
  return workflowTemplates.filter(t => t.category === category);
};
