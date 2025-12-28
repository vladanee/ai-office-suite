import { 
  Play, 
  ListTodo, 
  StopCircle, 
  GitBranch, 
  Webhook,
  Users,
  ClipboardCheck,
  BarChart3,
  FileText
} from 'lucide-react';

const nodeCategories = [
  {
    name: 'Flow Control',
    nodes: [
      { type: 'start', label: 'Start', icon: Play, color: 'success', description: 'Workflow trigger point' },
      { type: 'end', label: 'End', icon: StopCircle, color: 'destructive', description: 'Workflow completion' },
      { type: 'conditional', label: 'Condition', icon: GitBranch, color: 'warning', description: 'Branch based on logic' },
    ],
  },
  {
    name: 'Tasks',
    nodes: [
      { type: 'task', label: 'Task', icon: ListTodo, color: 'primary', description: 'Execute a task' },
      { type: 'assignment', label: 'Assignment', icon: Users, color: 'accent', description: 'Assign to persona' },
      { type: 'qa', label: 'QA Check', icon: ClipboardCheck, color: 'warning', description: 'Quality assurance' },
    ],
  },
  {
    name: 'Data & Integration',
    nodes: [
      { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'accent', description: 'n8n integration' },
      { type: 'kpi', label: 'KPI Score', icon: BarChart3, color: 'primary', description: 'Calculate KPIs' },
      { type: 'report', label: 'Report', icon: FileText, color: 'muted', description: 'Generate report' },
    ],
  },
];

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Node Palette</h3>
        <p className="text-xs text-muted-foreground">Drag nodes to canvas</p>
      </div>

      {nodeCategories.map((category) => (
        <div key={category.name}>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            {category.name}
          </h4>
          <div className="space-y-2">
            {category.nodes.map((node) => (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border
                  hover:bg-secondary hover:border-${node.color}/30 cursor-grab active:cursor-grabbing
                  transition-all duration-200 group
                `}
              >
                <div className={`w-8 h-8 rounded-lg bg-${node.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <node.icon className={`w-4 h-4 text-${node.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{node.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{node.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
