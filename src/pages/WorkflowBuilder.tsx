import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Save, 
  Undo, 
  Redo, 
  Maximize2,
  Settings2,
  Workflow as WorkflowIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/layout/TopBar';
import { StartNode } from '@/components/workflow/nodes/StartNode';
import { TaskNode } from '@/components/workflow/nodes/TaskNode';
import { EndNode } from '@/components/workflow/nodes/EndNode';
import { ConditionalNode } from '@/components/workflow/nodes/ConditionalNode';
import { WebhookNode } from '@/components/workflow/nodes/WebhookNode';
import { NodePalette } from '@/components/workflow/NodePalette';
import { PropertyPanel } from '@/components/workflow/PropertyPanel';

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  end: EndNode,
  conditional: ConditionalNode,
  webhook: WebhookNode,
};

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Start' },
  },
  {
    id: 'task-1',
    type: 'task',
    position: { x: 250, y: 180 },
    data: { label: 'Generate Tasks', description: 'AI generates task list' },
  },
  {
    id: 'task-2',
    type: 'task',
    position: { x: 250, y: 320 },
    data: { label: 'Assign to Persona', description: 'Route to appropriate persona' },
  },
  {
    id: 'conditional-1',
    type: 'conditional',
    position: { x: 250, y: 460 },
    data: { label: 'QA Check', condition: 'quality >= 80' },
  },
  {
    id: 'webhook-1',
    type: 'webhook',
    position: { x: 450, y: 600 },
    data: { label: 'Send to n8n', url: 'https://n8n.example.com/webhook' },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 250, y: 740 },
    data: { label: 'End' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'start-1', target: 'task-1', animated: true },
  { id: 'e2-3', source: 'task-1', target: 'task-2' },
  { id: 'e3-4', source: 'task-2', target: 'conditional-1' },
  { id: 'e4-5', source: 'conditional-1', target: 'webhook-1', label: 'Pass' },
  { id: 'e4-6', source: 'conditional-1', target: 'end-1', label: 'Fail' },
  { id: 'e5-6', source: 'webhook-1', target: 'end-1' },
];

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showPalette, setShowPalette] = useState(true);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX - 300,
        y: event.clientY - 100,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `New ${type}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  return (
    <div className="h-screen flex flex-col">
      <TopBar 
        title="Workflow Builder" 
        subtitle="Design your automation workflows"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="success" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex relative">
        {/* Node Palette */}
        {showPalette && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="w-64 border-r border-border bg-card p-4 overflow-y-auto"
          >
            <NodePalette />
          </motion.div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
              type: 'smoothstep',
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted))" />
            <Controls className="!bg-card !border-border !rounded-lg" />
            <MiniMap 
              className="!bg-card !border-border !rounded-lg"
              nodeColor={() => 'hsl(var(--primary))'}
            />
            <Panel position="top-left" className="!m-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPalette(!showPalette)}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                {showPalette ? 'Hide' : 'Show'} Palette
              </Button>
            </Panel>
          </ReactFlow>
        </div>

        {/* Property Panel */}
        {selectedNode && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="w-80 border-l border-border bg-card p-4 overflow-y-auto"
          >
            <PropertyPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
