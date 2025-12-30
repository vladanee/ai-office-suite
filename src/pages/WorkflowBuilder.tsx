import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { 
  Play, 
  Save, 
  Undo, 
  Redo, 
  Settings2,
  ArrowLeft,
  Loader2,
  CheckCircle2
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
import { useCurrentOffice, useWorkflows } from '@/hooks/useOfficeData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type Workflow = Tables<'workflows'>;

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  end: EndNode,
  conditional: ConditionalNode,
  webhook: WebhookNode,
};

const defaultNodes: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Start' },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 250, y: 200 },
    data: { label: 'End' },
  },
];

const defaultEdges: Edge[] = [
  { id: 'e-start-end', source: 'start-1', target: 'end-1', animated: true },
];

export default function WorkflowBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOffice } = useCurrentOffice();
  const { updateWorkflow } = useWorkflows(currentOffice?.id);
  
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showPalette, setShowPalette] = useState(true);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Load workflow
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadWorkflow = async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        toast.error('Workflow not found');
        navigate('/workflows');
        return;
      }

      setWorkflow(data);
      
      // Load nodes and edges from workflow
      const loadedNodes = (data.nodes as unknown as Node[]) || defaultNodes;
      const loadedEdges = (data.edges as unknown as Edge[]) || defaultEdges;
      
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setLoading(false);
    };

    loadWorkflow();
  }, [id, navigate, setNodes, setEdges]);

  const handleSave = async () => {
    if (!workflow || !id) return;

    setSaving(true);
    
    const { error } = await updateWorkflow(id, {
      nodes: nodes as any,
      edges: edges as any,
    });

    setSaving(false);

    if (error) {
      toast.error('Failed to save workflow');
    } else {
      setSaved(true);
      toast.success('Workflow saved');
      setTimeout(() => setSaved(false), 2000);
    }
  };

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
      if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: type.charAt(0).toUpperCase() + type.slice(1),
          ...(type === 'task' && { description: 'Enter task description' }),
          ...(type === 'conditional' && { condition: '' }),
          ...(type === 'webhook' && { url: '' }),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, reactFlowInstance]
  );

  const handleUpdateNode = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
    // Update selected node as well
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <TopBar 
        title={workflow?.name || 'Workflow Builder'}
        subtitle={workflow?.description || 'Design your automation workflows'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/workflows')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="success" size="sm" disabled>
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
        <div className="flex-1 relative" ref={reactFlowWrapper}>
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
            onInit={setReactFlowInstance}
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
            <PropertyPanel 
              node={selectedNode} 
              onClose={() => setSelectedNode(null)}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}