import { TourStep } from '@/hooks/useOnboardingTour';

// Tour for the Workflows list page
export const workflowsListTourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="workflows-header"]',
    title: 'Welcome to Workflows! 🎉',
    content: 'Workflows are powerful automations that help you streamline your tasks. Let\'s take a quick tour to get you started.',
    position: 'bottom',
    action: 'This tour will show you how to create and manage workflows.',
  },
  {
    id: 'create-workflow',
    target: '[data-tour="new-workflow-button"]',
    title: 'Create Your First Workflow',
    content: 'Click this button to create a new workflow. You\'ll be able to choose from our intelligent templates or start from scratch.',
    position: 'bottom',
    action: 'Try clicking "New Workflow" after the tour!',
  },
  {
    id: 'workflow-card',
    target: '[data-tour="workflow-card"]',
    title: 'Your Workflows',
    content: 'Each workflow appears as a card here. You can see its status, run count, and last execution time at a glance.',
    position: 'right',
  },
  {
    id: 'search',
    target: '[data-tour="workflow-search"]',
    title: 'Quick Search',
    content: 'Use the search bar to quickly find workflows by name or description as your collection grows.',
    position: 'bottom',
  },
];

// Tour for the Workflow Builder page
export const workflowBuilderTourSteps: TourStep[] = [
  {
    id: 'builder-welcome',
    target: '[data-tour="builder-header"]',
    title: 'Welcome to the Workflow Builder! 🛠️',
    content: 'This is where you design your automations. Drag nodes, connect them, and create powerful workflows visually.',
    position: 'bottom',
  },
  {
    id: 'node-palette',
    target: '[data-tour="node-palette"]',
    title: 'Node Palette',
    content: 'Drag nodes from here onto the canvas. Each node type performs a different action like sending emails, making HTTP requests, or running AI tasks.',
    position: 'right',
    action: 'Try dragging a "Task" node onto the canvas!',
  },
  {
    id: 'canvas',
    target: '[data-tour="workflow-canvas"]',
    title: 'Design Canvas',
    content: 'This is your workflow canvas. Connect nodes by dragging from one handle to another. The flow runs from Start to End.',
    position: 'left',
  },
  {
    id: 'save-button',
    target: '[data-tour="save-button"]',
    title: 'Save Your Work',
    content: 'Don\'t forget to save! Click this button to persist your changes. Your workflow will be ready to run.',
    position: 'bottom',
  },
  {
    id: 'toggle-palette',
    target: '[data-tour="toggle-palette"]',
    title: 'Toggle Palette',
    content: 'Need more canvas space? Toggle the palette visibility with this button.',
    position: 'bottom',
    nextLabel: 'Start Building!',
  },
];

// Tour for first-time workflow creation (in dialog)
export const workflowCreationTourSteps: TourStep[] = [
  {
    id: 'template-selection',
    target: '[data-tour="template-categories"]',
    title: 'Choose a Template Category',
    content: 'Browse templates by category. We have options for beginners, automation experts, and specific use cases.',
    position: 'right',
  },
  {
    id: 'recommended',
    target: '[data-tour="recommended-templates"]',
    title: 'Recommended for You',
    content: 'These templates are perfect for getting started. They include step-by-step guidance and smart defaults.',
    position: 'bottom',
  },
  {
    id: 'template-preview',
    target: '[data-tour="template-preview"]',
    title: 'Preview & Customize',
    content: 'Select a template to see details, use cases, and what you\'ll learn. Then customize the name and description.',
    position: 'left',
    nextLabel: 'Got it!',
  },
];
