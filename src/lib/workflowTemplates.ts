import { Node, Edge } from 'reactflow';

export interface TemplateStep {
  nodeId: string;
  title: string;
  description: string;
  tip?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'getting-started' | 'automation' | 'notification' | 'data' | 'integration' | 'ai-powered' | 'social-media';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  useCases: string[];
  nodes: Node[];
  edges: Edge[];
  steps?: TemplateStep[];
  featured?: boolean;
}

export const workflowTemplates: WorkflowTemplate[] = [
  // ============ GETTING STARTED ============
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with a clean canvas. Best for experienced users who want full control.',
    icon: '📄',
    category: 'getting-started',
    difficulty: 'intermediate',
    estimatedTime: 'Varies',
    useCases: ['Custom workflows', 'Unique processes', 'Experimental designs'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 200 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e-start-end', source: 'start-1', target: 'end-1', animated: true },
    ],
  },
  {
    id: 'hello-world',
    name: 'Hello World',
    description: 'Your first workflow! A simple task that demonstrates how workflows execute step by step.',
    icon: '👋',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: '2 min',
    useCases: ['Learning the basics', 'Understanding workflow flow', 'First-time setup'],
    featured: true,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-1', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Say Hello', description: 'Generate a friendly greeting message for the user' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 280 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-1' },
      { id: 'e2', source: 'task-1', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'start-1', title: 'Workflow Begins', description: 'Every workflow starts here. This node triggers when you run the workflow.' },
      { nodeId: 'task-1', title: 'AI Task Execution', description: 'This task uses AI to generate a greeting. Click on it to customize the description.', tip: 'Tasks are AI-powered! Describe what you want in plain English.' },
      { nodeId: 'end-1', title: 'Completion', description: 'The workflow finishes here. You\'ll see the results in the Runs page.' },
    ],
  },

  // ============ AUTOMATION ============
  {
    id: 'simple-approval',
    name: 'Simple Approval',
    description: 'Route requests through a yes/no decision. Perfect for learning conditional logic.',
    icon: '✅',
    category: 'automation',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    useCases: ['Leave requests', 'Purchase approvals', 'Content review', 'Access requests'],
    featured: true,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-review', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Review Request', description: 'Analyze the incoming request and determine if it should be approved based on the criteria' } },
      { id: 'cond-1', type: 'conditional', position: { x: 250, y: 290 }, data: { label: 'Is Approved?', condition: 'approved == true' } },
      { id: 'task-approve', type: 'task', position: { x: 80, y: 420 }, data: { label: '✓ Approved', description: 'Request approved! Process the approval and prepare confirmation.' } },
      { id: 'task-reject', type: 'task', position: { x: 420, y: 420 }, data: { label: '✗ Rejected', description: 'Request declined. Prepare a polite rejection with clear reasoning.' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 550 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-review' },
      { id: 'e2', source: 'task-review', target: 'cond-1' },
      { id: 'e3', source: 'cond-1', target: 'task-approve', sourceHandle: 'a' },
      { id: 'e4', source: 'cond-1', target: 'task-reject', sourceHandle: 'b' },
      { id: 'e5', source: 'task-approve', target: 'end-1' },
      { id: 'e6', source: 'task-reject', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'cond-1', title: 'Decision Point', description: 'This conditional node creates two paths based on a condition.', tip: 'The condition "approved == true" checks if the variable is true. Green path = Yes, Red path = No.' },
    ],
  },
  {
    id: 'scheduled-report',
    name: 'Daily Summary Report',
    description: 'Generate and send a daily summary. Great for automated reporting.',
    icon: '📊',
    category: 'automation',
    difficulty: 'beginner',
    estimatedTime: '8 min',
    useCases: ['Daily standups', 'Sales reports', 'Activity summaries', 'Team updates'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-gather', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Gather Data', description: 'Collect and compile the key metrics and activities from today' } },
      { id: 'task-analyze', type: 'task', position: { x: 250, y: 280 }, data: { label: 'Analyze Trends', description: 'Identify patterns, highlights, and any issues that need attention' } },
      { id: 'task-format', type: 'task', position: { x: 250, y: 400 }, data: { label: 'Create Report', description: 'Format the analysis into a clear, readable summary report' } },
      { id: 'email-1', type: 'email', position: { x: 250, y: 520 }, data: { label: 'Send Report', to: '', subject: 'Daily Summary Report - {{date}}', body: 'Hi team,\n\nHere is your daily summary:\n\n{{report}}\n\nBest regards,\nAI Assistant' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 640 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-gather' },
      { id: 'e2', source: 'task-gather', target: 'task-analyze' },
      { id: 'e3', source: 'task-analyze', target: 'task-format' },
      { id: 'e4', source: 'task-format', target: 'email-1' },
      { id: 'e5', source: 'email-1', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'email-1', title: 'Email Variables', description: 'Notice {{date}} and {{report}}? These are variables that get replaced with real values.', tip: 'Use {{variableName}} syntax to insert dynamic content into emails.' },
    ],
  },
  {
    id: 'multi-step-approval',
    name: 'Multi-Step Approval',
    description: 'Complex approval with multiple reviewers and escalation paths.',
    icon: '🔀',
    category: 'automation',
    difficulty: 'advanced',
    estimatedTime: '15 min',
    useCases: ['Budget approvals', 'Contract reviews', 'Hiring decisions', 'Policy changes'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-initial', type: 'task', position: { x: 250, y: 150 }, data: { label: 'Initial Review', description: 'First-level review: Check completeness and basic eligibility' } },
      { id: 'cond-valid', type: 'conditional', position: { x: 250, y: 270 }, data: { label: 'Valid Request?', condition: 'valid == true' } },
      { id: 'task-manager', type: 'task', position: { x: 100, y: 390 }, data: { label: 'Manager Review', description: 'Manager evaluation: Assess business justification and priority' } },
      { id: 'task-reject-invalid', type: 'task', position: { x: 450, y: 390 }, data: { label: 'Request Invalid', description: 'Return to requester with specific issues to address' } },
      { id: 'cond-amount', type: 'conditional', position: { x: 100, y: 510 }, data: { label: 'Needs Director?', condition: 'amount > 10000' } },
      { id: 'task-director', type: 'task', position: { x: -50, y: 630 }, data: { label: 'Director Approval', description: 'High-value review: Director sign-off for amounts over $10,000' } },
      { id: 'task-approved', type: 'task', position: { x: 250, y: 630 }, data: { label: 'Process Approval', description: 'Finalize approval and notify all stakeholders' } },
      { id: 'email-1', type: 'email', position: { x: 150, y: 750 }, data: { label: 'Notify Requester', to: '{{requester_email}}', subject: 'Your Request Has Been Processed', body: 'Your request has been processed. Status: {{status}}' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 870 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-initial' },
      { id: 'e2', source: 'task-initial', target: 'cond-valid' },
      { id: 'e3', source: 'cond-valid', target: 'task-manager', sourceHandle: 'a' },
      { id: 'e4', source: 'cond-valid', target: 'task-reject-invalid', sourceHandle: 'b' },
      { id: 'e5', source: 'task-manager', target: 'cond-amount' },
      { id: 'e6', source: 'cond-amount', target: 'task-director', sourceHandle: 'a' },
      { id: 'e7', source: 'cond-amount', target: 'task-approved', sourceHandle: 'b' },
      { id: 'e8', source: 'task-director', target: 'task-approved' },
      { id: 'e9', source: 'task-approved', target: 'email-1' },
      { id: 'e10', source: 'task-reject-invalid', target: 'email-1' },
      { id: 'e11', source: 'email-1', target: 'end-1' },
    ],
  },

  // ============ NOTIFICATION ============
  {
    id: 'simple-notification',
    name: 'Quick Notification',
    description: 'Send a single notification email. The easiest way to learn email nodes.',
    icon: '📧',
    category: 'notification',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    useCases: ['Alerts', 'Reminders', 'Welcome emails', 'Thank you messages'],
    featured: true,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-1', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Compose Message', description: 'Create a clear, friendly notification message for the recipient' } },
      { id: 'email-1', type: 'email', position: { x: 250, y: 290 }, data: { label: 'Send Email', to: '', subject: 'Important Update', body: 'Hi there!\n\nThis is an automated notification from your workflow.\n\nBest regards,\nYour AI Assistant' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 420 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-1' },
      { id: 'e2', source: 'task-1', target: 'email-1' },
      { id: 'e3', source: 'email-1', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'email-1', title: 'Email Node', description: 'Click on this node to set the recipient, subject, and body of your email.', tip: 'Leave the "To" field empty to set it when running the workflow.' },
    ],
  },
  {
    id: 'smart-alert',
    name: 'Smart Alert System',
    description: 'Analyze a situation and send different alerts based on severity.',
    icon: '🚨',
    category: 'notification',
    difficulty: 'intermediate',
    estimatedTime: '10 min',
    useCases: ['Error monitoring', 'Performance alerts', 'Security notifications', 'Threshold alerts'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-assess', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Assess Situation', description: 'Analyze the incoming data and determine the severity level (low, medium, high, critical)' } },
      { id: 'cond-critical', type: 'conditional', position: { x: 250, y: 290 }, data: { label: 'Is Critical?', condition: 'severity == "critical"' } },
      { id: 'task-urgent', type: 'task', position: { x: 80, y: 420 }, data: { label: 'Urgent Response', description: 'This is critical! Prepare immediate action items and escalation plan.' } },
      { id: 'email-urgent', type: 'email', position: { x: 80, y: 550 }, data: { label: '🔴 Critical Alert', to: '', subject: '🚨 CRITICAL: Immediate Action Required', body: 'URGENT: A critical issue has been detected.\n\nDetails: {{issue}}\n\nPlease take immediate action.' } },
      { id: 'cond-high', type: 'conditional', position: { x: 420, y: 420 }, data: { label: 'Is High?', condition: 'severity == "high"' } },
      { id: 'email-high', type: 'email', position: { x: 300, y: 550 }, data: { label: '🟠 High Alert', to: '', subject: '⚠️ High Priority Issue Detected', body: 'A high-priority issue requires your attention.\n\nDetails: {{issue}}\n\nPlease review when possible.' } },
      { id: 'email-normal', type: 'email', position: { x: 520, y: 550 }, data: { label: '🟢 Info Alert', to: '', subject: 'ℹ️ Notification', body: 'An event has occurred that you may want to review.\n\nDetails: {{issue}}' } },
      { id: 'end-1', type: 'end', position: { x: 300, y: 680 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-assess' },
      { id: 'e2', source: 'task-assess', target: 'cond-critical' },
      { id: 'e3', source: 'cond-critical', target: 'task-urgent', sourceHandle: 'a' },
      { id: 'e4', source: 'task-urgent', target: 'email-urgent' },
      { id: 'e5', source: 'cond-critical', target: 'cond-high', sourceHandle: 'b' },
      { id: 'e6', source: 'cond-high', target: 'email-high', sourceHandle: 'a' },
      { id: 'e7', source: 'cond-high', target: 'email-normal', sourceHandle: 'b' },
      { id: 'e8', source: 'email-urgent', target: 'end-1' },
      { id: 'e9', source: 'email-high', target: 'end-1' },
      { id: 'e10', source: 'email-normal', target: 'end-1' },
    ],
  },

  // ============ DATA ============
  {
    id: 'api-data-fetch',
    name: 'Fetch & Analyze Data',
    description: 'Pull data from an API and analyze it with AI. Great for learning HTTP nodes.',
    icon: '📥',
    category: 'data',
    difficulty: 'beginner',
    estimatedTime: '8 min',
    useCases: ['API integrations', 'Data collection', 'External data analysis', 'Report generation'],
    featured: true,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'http-1', type: 'http', position: { x: 250, y: 160 }, data: { label: 'Fetch Data', method: 'GET', url: 'https://api.example.com/data', headers: '{"Content-Type": "application/json"}', body: '' } },
      { id: 'transform-1', type: 'transform', position: { x: 250, y: 290 }, data: { label: 'Parse Response', transform: 'parse', inputVar: 'response', outputVar: 'data' } },
      { id: 'task-1', type: 'task', position: { x: 250, y: 420 }, data: { label: 'Analyze Data', description: 'Review the fetched data and provide insights, patterns, and recommendations' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 550 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'http-1' },
      { id: 'e2', source: 'http-1', target: 'transform-1' },
      { id: 'e3', source: 'transform-1', target: 'task-1' },
      { id: 'e4', source: 'task-1', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'http-1', title: 'HTTP Request', description: 'This node makes an API call. Replace the example URL with your actual API endpoint.', tip: 'GET requests fetch data, POST requests send data. Most APIs require authentication headers.' },
      { nodeId: 'transform-1', title: 'Data Transform', description: 'Transform nodes process data. "parse" converts JSON strings to objects.', tip: 'Available transforms: parse, stringify, uppercase, lowercase, keys, values' },
    ],
  },
  {
    id: 'batch-processor',
    name: 'Batch Item Processor',
    description: 'Process a list of items one by one. Essential for bulk operations.',
    icon: '🔁',
    category: 'data',
    difficulty: 'intermediate',
    estimatedTime: '10 min',
    useCases: ['Bulk updates', 'Mass email sends', 'Data migration', 'List processing'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-prepare', type: 'task', position: { x: 250, y: 150 }, data: { label: 'Prepare Items', description: 'Validate and prepare the list of items to be processed' } },
      { id: 'loop-1', type: 'loop', position: { x: 250, y: 270 }, data: { label: 'For Each Item', iterations: 10, collection: 'items' } },
      { id: 'task-process', type: 'task', position: { x: 250, y: 400 }, data: { label: 'Process Item', description: 'Handle the current item: {{_loopItem}}' } },
      { id: 'delay-1', type: 'delay', position: { x: 250, y: 530 }, data: { label: 'Rate Limit', delay: 1 } },
      { id: 'task-summary', type: 'task', position: { x: 250, y: 660 }, data: { label: 'Generate Summary', description: 'Compile results from all processed items into a final summary' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 780 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-prepare' },
      { id: 'e2', source: 'task-prepare', target: 'loop-1' },
      { id: 'e3', source: 'loop-1', target: 'task-process', sourceHandle: 'loop' },
      { id: 'e4', source: 'task-process', target: 'delay-1' },
      { id: 'e5', source: 'delay-1', target: 'loop-1' },
      { id: 'e6', source: 'loop-1', target: 'task-summary', sourceHandle: 'done' },
      { id: 'e7', source: 'task-summary', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'loop-1', title: 'Loop Node', description: 'This creates a loop! Items go through the "loop" path, then back. When done, it exits via "done".', tip: 'Use {{_loopIndex}} for the current index and {{_loopItem}} for the current item.' },
      { nodeId: 'delay-1', title: 'Rate Limiting', description: 'Delays prevent overwhelming external services. This waits 1 second between items.', tip: 'Always add delays when calling external APIs to avoid rate limits.' },
    ],
  },
  {
    id: 'data-pipeline',
    name: 'ETL Data Pipeline',
    description: 'Extract, Transform, Load pattern for data processing.',
    icon: '🔄',
    category: 'data',
    difficulty: 'advanced',
    estimatedTime: '20 min',
    useCases: ['Data synchronization', 'Report generation', 'Data warehousing', 'Analytics pipelines'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'http-extract', type: 'http', position: { x: 250, y: 150 }, data: { label: 'Extract: Fetch Source', method: 'GET', url: '', headers: '', body: '' } },
      { id: 'transform-parse', type: 'transform', position: { x: 250, y: 270 }, data: { label: 'Transform: Parse', transform: 'parse', inputVar: 'response', outputVar: 'rawData' } },
      { id: 'task-clean', type: 'task', position: { x: 250, y: 390 }, data: { label: 'Transform: Clean', description: 'Clean and validate the data. Remove duplicates, fix formatting, handle missing values.' } },
      { id: 'task-enrich', type: 'task', position: { x: 250, y: 510 }, data: { label: 'Transform: Enrich', description: 'Add calculated fields, lookups, and business logic transformations.' } },
      { id: 'http-load', type: 'http', position: { x: 250, y: 630 }, data: { label: 'Load: Save to Destination', method: 'POST', url: '', headers: '{"Content-Type": "application/json"}', body: '{{processedData}}' } },
      { id: 'task-verify', type: 'task', position: { x: 250, y: 750 }, data: { label: 'Verify Load', description: 'Confirm data was saved correctly and generate a completion report.' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 870 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'http-extract' },
      { id: 'e2', source: 'http-extract', target: 'transform-parse' },
      { id: 'e3', source: 'transform-parse', target: 'task-clean' },
      { id: 'e4', source: 'task-clean', target: 'task-enrich' },
      { id: 'e5', source: 'task-enrich', target: 'http-load' },
      { id: 'e6', source: 'http-load', target: 'task-verify' },
      { id: 'e7', source: 'task-verify', target: 'end-1' },
    ],
  },

  // ============ INTEGRATION ============
  {
    id: 'webhook-receiver',
    name: 'Webhook Handler',
    description: 'Receive and process webhooks from external services like n8n.',
    icon: '🔗',
    category: 'integration',
    difficulty: 'intermediate',
    estimatedTime: '10 min',
    useCases: ['n8n integration', 'Third-party triggers', 'Event-driven automation', 'External notifications'],
    featured: true,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-validate', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Validate Payload', description: 'Check the incoming webhook data for required fields and correct format' } },
      { id: 'cond-valid', type: 'conditional', position: { x: 250, y: 290 }, data: { label: 'Valid Data?', condition: 'isValid == true' } },
      { id: 'task-process', type: 'task', position: { x: 100, y: 420 }, data: { label: 'Process Event', description: 'Handle the webhook event based on its type and content' } },
      { id: 'webhook-respond', type: 'webhook', position: { x: 100, y: 550 }, data: { label: 'Send Confirmation', url: '' } },
      { id: 'task-error', type: 'task', position: { x: 400, y: 420 }, data: { label: 'Log Error', description: 'Record the invalid webhook attempt for debugging' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 680 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-validate' },
      { id: 'e2', source: 'task-validate', target: 'cond-valid' },
      { id: 'e3', source: 'cond-valid', target: 'task-process', sourceHandle: 'a' },
      { id: 'e4', source: 'cond-valid', target: 'task-error', sourceHandle: 'b' },
      { id: 'e5', source: 'task-process', target: 'webhook-respond' },
      { id: 'e6', source: 'webhook-respond', target: 'end-1' },
      { id: 'e7', source: 'task-error', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'webhook-respond', title: 'Outbound Webhook', description: 'This sends data TO an external service. Enter the target URL where you want to send data.', tip: 'Use this to notify n8n or other services when something happens in your workflow.' },
    ],
  },
  {
    id: 'sync-systems',
    name: 'Two-Way Sync',
    description: 'Synchronize data between two systems with conflict detection.',
    icon: '🔄',
    category: 'integration',
    difficulty: 'advanced',
    estimatedTime: '25 min',
    useCases: ['CRM sync', 'Inventory updates', 'User synchronization', 'Cross-platform data'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'http-source', type: 'http', position: { x: 100, y: 160 }, data: { label: 'Fetch Source A', method: 'GET', url: '', headers: '', body: '' } },
      { id: 'http-dest', type: 'http', position: { x: 400, y: 160 }, data: { label: 'Fetch Source B', method: 'GET', url: '', headers: '', body: '' } },
      { id: 'task-compare', type: 'task', position: { x: 250, y: 290 }, data: { label: 'Compare Records', description: 'Identify new, updated, and conflicting records between both sources' } },
      { id: 'cond-conflicts', type: 'conditional', position: { x: 250, y: 420 }, data: { label: 'Has Conflicts?', condition: 'conflicts > 0' } },
      { id: 'task-resolve', type: 'task', position: { x: 80, y: 550 }, data: { label: 'Resolve Conflicts', description: 'Apply conflict resolution rules: newest wins, merge fields, or flag for review' } },
      { id: 'task-sync', type: 'task', position: { x: 420, y: 550 }, data: { label: 'Prepare Sync', description: 'Build the update payloads for both systems' } },
      { id: 'http-update-a', type: 'http', position: { x: 150, y: 680 }, data: { label: 'Update Source A', method: 'PUT', url: '', headers: '{"Content-Type": "application/json"}', body: '{{updateA}}' } },
      { id: 'http-update-b', type: 'http', position: { x: 350, y: 680 }, data: { label: 'Update Source B', method: 'PUT', url: '', headers: '{"Content-Type": "application/json"}', body: '{{updateB}}' } },
      { id: 'task-report', type: 'task', position: { x: 250, y: 810 }, data: { label: 'Sync Report', description: 'Generate a summary of all changes made during synchronization' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 930 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'http-source' },
      { id: 'e2', source: 'start-1', target: 'http-dest' },
      { id: 'e3', source: 'http-source', target: 'task-compare' },
      { id: 'e4', source: 'http-dest', target: 'task-compare' },
      { id: 'e5', source: 'task-compare', target: 'cond-conflicts' },
      { id: 'e6', source: 'cond-conflicts', target: 'task-resolve', sourceHandle: 'a' },
      { id: 'e7', source: 'cond-conflicts', target: 'task-sync', sourceHandle: 'b' },
      { id: 'e8', source: 'task-resolve', target: 'task-sync' },
      { id: 'e9', source: 'task-sync', target: 'http-update-a' },
      { id: 'e10', source: 'task-sync', target: 'http-update-b' },
      { id: 'e11', source: 'http-update-a', target: 'task-report' },
      { id: 'e12', source: 'http-update-b', target: 'task-report' },
      { id: 'e13', source: 'task-report', target: 'end-1' },
    ],
  },

  // ============ SOCIAL MEDIA ============
  {
    id: 'cross-platform-post',
    name: 'Cross-Platform Publishing',
    description: 'Create content once and publish to multiple social networks simultaneously.',
    icon: '📱',
    category: 'social-media',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    useCases: ['Brand awareness', 'Product launches', 'Announcements', 'Content marketing'],
    featured: true,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-create', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Create Content', description: 'Generate engaging social media content based on {{topic}}. Create a compelling message that works across platforms.' } },
      { id: 'twitter-1', type: 'twitter', position: { x: 50, y: 300 }, data: { label: 'Post to Twitter', platform: 'twitter', content: '{{content_short}}' } },
      { id: 'linkedin-1', type: 'linkedin', position: { x: 250, y: 300 }, data: { label: 'Post to LinkedIn', platform: 'linkedin', content: '{{content_professional}}' } },
      { id: 'facebook-1', type: 'facebook', position: { x: 450, y: 300 }, data: { label: 'Post to Facebook', platform: 'facebook', content: '{{content_full}}' } },
      { id: 'task-summary', type: 'task', position: { x: 250, y: 440 }, data: { label: 'Generate Report', description: 'Compile posting results and create a summary of all published content.' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 560 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-create' },
      { id: 'e2', source: 'task-create', target: 'twitter-1' },
      { id: 'e3', source: 'task-create', target: 'linkedin-1' },
      { id: 'e4', source: 'task-create', target: 'facebook-1' },
      { id: 'e5', source: 'twitter-1', target: 'task-summary' },
      { id: 'e6', source: 'linkedin-1', target: 'task-summary' },
      { id: 'e7', source: 'facebook-1', target: 'task-summary' },
      { id: 'e8', source: 'task-summary', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'task-create', title: 'Content Creation', description: 'AI creates platform-optimized versions of your content.', tip: 'Use {{content_short}} for Twitter\'s limit, {{content_professional}} for LinkedIn tone.' },
      { nodeId: 'twitter-1', title: 'Twitter/X Post', description: 'Posts to Twitter with optimized short-form content.', tip: 'Keep content under 280 characters. Use hashtags strategically.' },
    ],
  },
  {
    id: 'scheduled-social',
    name: 'Scheduled Social Posts',
    description: 'Plan and schedule social media posts with AI-generated content suggestions.',
    icon: '📅',
    category: 'social-media',
    difficulty: 'intermediate',
    estimatedTime: '10 min',
    useCases: ['Content calendar', 'Campaign scheduling', 'Holiday posts', 'Regular updates'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-plan', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Plan Content', description: 'Based on the topic "{{topic}}", create 3-5 post ideas with different angles and hooks.' } },
      { id: 'loop-1', type: 'loop', position: { x: 250, y: 290 }, data: { label: 'For Each Post', iterations: 5, collection: 'posts' } },
      { id: 'task-write', type: 'task', position: { x: 250, y: 420 }, data: { label: 'Write Post', description: 'Create engaging copy for post {{_loopIndex}}: {{_loopItem.idea}}' } },
      { id: 'delay-1', type: 'delay', position: { x: 250, y: 550 }, data: { label: 'Schedule Gap', delay: 3600 } },
      { id: 'twitter-1', type: 'twitter', position: { x: 250, y: 680 }, data: { label: 'Post to Twitter', platform: 'twitter', content: '{{post_content}}' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 810 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-plan' },
      { id: 'e2', source: 'task-plan', target: 'loop-1' },
      { id: 'e3', source: 'loop-1', target: 'task-write', sourceHandle: 'loop' },
      { id: 'e4', source: 'task-write', target: 'delay-1' },
      { id: 'e5', source: 'delay-1', target: 'twitter-1' },
      { id: 'e6', source: 'twitter-1', target: 'loop-1' },
      { id: 'e7', source: 'loop-1', target: 'end-1', sourceHandle: 'done' },
    ],
    steps: [
      { nodeId: 'delay-1', title: 'Scheduling Posts', description: 'The delay node spaces out posts to avoid flooding your feed.', tip: 'Set delay in seconds: 3600 = 1 hour, 86400 = 24 hours.' },
    ],
  },
  {
    id: 'instagram-content',
    name: 'Instagram Content Pipeline',
    description: 'Generate captions, hashtags, and posting schedule for Instagram content.',
    icon: '📸',
    category: 'social-media',
    difficulty: 'beginner',
    estimatedTime: '7 min',
    useCases: ['Instagram marketing', 'Influencer content', 'Product showcases', 'Story planning'],
    featured: true,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-analyze', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Analyze Image/Topic', description: 'Analyze the provided image or topic "{{topic}}" and identify key themes, emotions, and relevant keywords.' } },
      { id: 'task-caption', type: 'task', position: { x: 250, y: 290 }, data: { label: 'Write Caption', description: 'Create an engaging Instagram caption with a hook, story, and call-to-action. Include relevant emojis.' } },
      { id: 'task-hashtags', type: 'task', position: { x: 250, y: 420 }, data: { label: 'Generate Hashtags', description: 'Create 15-30 relevant hashtags mixing popular, niche, and branded tags. Organize by reach potential.' } },
      { id: 'instagram-1', type: 'instagram', position: { x: 250, y: 550 }, data: { label: 'Post to Instagram', platform: 'instagram', content: '{{caption}}\n\n{{hashtags}}' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 680 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-analyze' },
      { id: 'e2', source: 'task-analyze', target: 'task-caption' },
      { id: 'e3', source: 'task-caption', target: 'task-hashtags' },
      { id: 'e4', source: 'task-hashtags', target: 'instagram-1' },
      { id: 'e5', source: 'instagram-1', target: 'end-1' },
    ],
  },
  {
    id: 'linkedin-thought-leadership',
    name: 'LinkedIn Thought Leadership',
    description: 'Create professional LinkedIn posts that establish expertise and drive engagement.',
    icon: '💼',
    category: 'social-media',
    difficulty: 'intermediate',
    estimatedTime: '10 min',
    useCases: ['Personal branding', 'B2B marketing', 'Industry insights', 'Career growth'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-research', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Research Topic', description: 'Research current trends and insights about "{{topic}}" in the professional context.' } },
      { id: 'task-angle', type: 'task', position: { x: 250, y: 290 }, data: { label: 'Find Unique Angle', description: 'Identify a unique perspective or contrarian viewpoint that will spark discussion.' } },
      { id: 'task-draft', type: 'task', position: { x: 250, y: 420 }, data: { label: 'Draft Post', description: 'Write a LinkedIn post with: strong hook, personal story/insight, valuable takeaway, and engagement question. Format with line breaks for readability.' } },
      { id: 'task-optimize', type: 'task', position: { x: 250, y: 550 }, data: { label: 'Optimize for Engagement', description: 'Review and enhance the post for maximum engagement. Add relevant emojis sparingly, ensure the hook is compelling.' } },
      { id: 'linkedin-1', type: 'linkedin', position: { x: 250, y: 680 }, data: { label: 'Post to LinkedIn', platform: 'linkedin', content: '{{optimized_post}}' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 810 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-research' },
      { id: 'e2', source: 'task-research', target: 'task-angle' },
      { id: 'e3', source: 'task-angle', target: 'task-draft' },
      { id: 'e4', source: 'task-draft', target: 'task-optimize' },
      { id: 'e5', source: 'task-optimize', target: 'linkedin-1' },
      { id: 'e6', source: 'linkedin-1', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'task-draft', title: 'LinkedIn Best Practices', description: 'LinkedIn rewards engagement, so end with a question or call-to-action.', tip: 'Posts with 1-2 emojis and line breaks perform better. Aim for 1200-1500 characters.' },
    ],
  },

  // ============ AI-POWERED ============
  {
    id: 'content-generator',
    name: 'AI Content Creator',
    description: 'Generate blog posts, social media content, or marketing copy with AI.',
    icon: '✨',
    category: 'ai-powered',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    useCases: ['Blog writing', 'Social media posts', 'Product descriptions', 'Marketing emails'],
    featured: true,
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-topic', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Define Topic', description: 'Based on the input topic "{{topic}}", identify key themes, target audience, and tone' } },
      { id: 'task-outline', type: 'task', position: { x: 250, y: 290 }, data: { label: 'Create Outline', description: 'Generate a structured outline with introduction, main points, and conclusion' } },
      { id: 'task-write', type: 'task', position: { x: 250, y: 420 }, data: { label: 'Write Content', description: 'Create engaging, well-written content following the outline. Include a compelling hook and clear call-to-action.' } },
      { id: 'task-polish', type: 'task', position: { x: 250, y: 550 }, data: { label: 'Polish & Format', description: 'Review for grammar, optimize for readability, add formatting (headers, bullet points), and ensure brand voice consistency' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 680 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-topic' },
      { id: 'e2', source: 'task-topic', target: 'task-outline' },
      { id: 'e3', source: 'task-outline', target: 'task-write' },
      { id: 'e4', source: 'task-write', target: 'task-polish' },
      { id: 'e5', source: 'task-polish', target: 'end-1' },
    ],
    steps: [
      { nodeId: 'task-write', title: 'AI Writing', description: 'Each task node uses AI to complete its description. The more specific you are, the better the output.', tip: 'Try adding tone (professional, casual), length (short, detailed), and format (bullet points, paragraphs) to your task descriptions.' },
    ],
  },
  {
    id: 'document-analyzer',
    name: 'Smart Document Review',
    description: 'Analyze documents, extract key information, and generate summaries.',
    icon: '📄',
    category: 'ai-powered',
    difficulty: 'intermediate',
    estimatedTime: '12 min',
    useCases: ['Contract review', 'Research summaries', 'Report analysis', 'Meeting notes'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-read', type: 'task', position: { x: 250, y: 160 }, data: { label: 'Read Document', description: 'Process the document content and identify its type, structure, and key sections' } },
      { id: 'task-extract', type: 'task', position: { x: 250, y: 290 }, data: { label: 'Extract Key Info', description: 'Identify and extract: main topics, important dates, names, numbers, and action items' } },
      { id: 'task-analyze', type: 'task', position: { x: 250, y: 420 }, data: { label: 'Analyze Content', description: 'Assess sentiment, identify potential issues, highlight important clauses or statements' } },
      { id: 'cond-issues', type: 'conditional', position: { x: 250, y: 550 }, data: { label: 'Issues Found?', condition: 'hasIssues == true' } },
      { id: 'task-flag', type: 'task', position: { x: 80, y: 680 }, data: { label: 'Flag for Review', description: 'Create a detailed list of concerns with recommendations for human review' } },
      { id: 'task-summary', type: 'task', position: { x: 420, y: 680 }, data: { label: 'Generate Summary', description: 'Create a concise executive summary with key takeaways and next steps' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 810 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-read' },
      { id: 'e2', source: 'task-read', target: 'task-extract' },
      { id: 'e3', source: 'task-extract', target: 'task-analyze' },
      { id: 'e4', source: 'task-analyze', target: 'cond-issues' },
      { id: 'e5', source: 'cond-issues', target: 'task-flag', sourceHandle: 'a' },
      { id: 'e6', source: 'cond-issues', target: 'task-summary', sourceHandle: 'b' },
      { id: 'e7', source: 'task-flag', target: 'end-1' },
      { id: 'e8', source: 'task-summary', target: 'end-1' },
    ],
  },
  {
    id: 'customer-support',
    name: 'AI Support Assistant',
    description: 'Triage support tickets, draft responses, and escalate complex issues.',
    icon: '🎧',
    category: 'ai-powered',
    difficulty: 'intermediate',
    estimatedTime: '15 min',
    useCases: ['Help desk automation', 'Email support', 'Ticket triage', 'FAQ responses'],
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
      { id: 'task-classify', type: 'task', position: { x: 250, y: 150 }, data: { label: 'Classify Ticket', description: 'Analyze the support request. Determine: category (billing, technical, general), urgency (low, medium, high), and sentiment' } },
      { id: 'cond-urgent', type: 'conditional', position: { x: 250, y: 280 }, data: { label: 'High Urgency?', condition: 'urgency == "high"' } },
      { id: 'task-escalate', type: 'task', position: { x: 80, y: 410 }, data: { label: 'Prepare Escalation', description: 'Create escalation notes with full context for human agent handoff' } },
      { id: 'email-escalate', type: 'email', position: { x: 80, y: 540 }, data: { label: 'Notify Team', to: 'support-urgent@company.com', subject: '🔴 Urgent Ticket: {{ticketId}}', body: 'An urgent support ticket requires immediate attention.\n\nCategory: {{category}}\nIssue: {{summary}}' } },
      { id: 'task-respond', type: 'task', position: { x: 420, y: 410 }, data: { label: 'Draft Response', description: 'Create a helpful, empathetic response addressing the customer\'s concern. Include relevant help articles if applicable.' } },
      { id: 'task-review', type: 'task', position: { x: 420, y: 540 }, data: { label: 'Quality Check', description: 'Review the draft for accuracy, tone, and completeness. Ensure it fully addresses the customer\'s needs.' } },
      { id: 'email-response', type: 'email', position: { x: 300, y: 670 }, data: { label: 'Send Response', to: '{{customer_email}}', subject: 'Re: {{ticketSubject}}', body: '{{draftResponse}}\n\nBest regards,\nSupport Team' } },
      { id: 'end-1', type: 'end', position: { x: 250, y: 800 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-classify' },
      { id: 'e2', source: 'task-classify', target: 'cond-urgent' },
      { id: 'e3', source: 'cond-urgent', target: 'task-escalate', sourceHandle: 'a' },
      { id: 'e4', source: 'cond-urgent', target: 'task-respond', sourceHandle: 'b' },
      { id: 'e5', source: 'task-escalate', target: 'email-escalate' },
      { id: 'e6', source: 'email-escalate', target: 'email-response' },
      { id: 'e7', source: 'task-respond', target: 'task-review' },
      { id: 'e8', source: 'task-review', target: 'email-response' },
      { id: 'e9', source: 'email-response', target: 'end-1' },
    ],
  },
];

export const getTemplateById = (id: string): WorkflowTemplate | undefined => {
  return workflowTemplates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: WorkflowTemplate['category']): WorkflowTemplate[] => {
  return workflowTemplates.filter(t => t.category === category);
};

export const getFeaturedTemplates = (): WorkflowTemplate[] => {
  return workflowTemplates.filter(t => t.featured);
};

export const getTemplatesByDifficulty = (difficulty: WorkflowTemplate['difficulty']): WorkflowTemplate[] => {
  return workflowTemplates.filter(t => t.difficulty === difficulty);
};

export const templateCategories = [
  { id: 'getting-started', label: '🚀 Getting Started', description: 'Perfect for beginners' },
  { id: 'automation', label: '⚡ Automation', description: 'Automate repetitive tasks' },
  { id: 'notification', label: '📧 Notifications', description: 'Alerts and emails' },
  { id: 'social-media', label: '📱 Social Media', description: 'Post to social networks' },
  { id: 'data', label: '📊 Data Processing', description: 'Fetch, transform, analyze' },
  { id: 'integration', label: '🔗 Integrations', description: 'Connect external services' },
  { id: 'ai-powered', label: '✨ AI-Powered', description: 'Smart automation with AI' },
] as const;

export const difficultyLabels = {
  beginner: { label: 'Beginner', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  intermediate: { label: 'Intermediate', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' },
  advanced: { label: 'Advanced', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' },
} as const;
