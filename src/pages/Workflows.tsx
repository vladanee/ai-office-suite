import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Play, 
  Pause, 
  Pencil, 
  Trash2, 
  Copy,
  Workflow as WorkflowIcon,
  Loader2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TopBar } from '@/components/layout/TopBar';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCurrentOffice, useWorkflows, useWorkflowRuns } from '@/hooks/useOfficeData';
import { WorkflowDialog } from '@/components/workflows/WorkflowDialog';
import { Tables } from '@/integrations/supabase/types';
import { formatDistanceToNow } from 'date-fns';

type Workflow = Tables<'workflows'>;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Workflows() {
  const navigate = useNavigate();
  const { currentOffice, loading: officeLoading } = useCurrentOffice();
  const { workflows, loading: workflowsLoading, createWorkflow, updateWorkflow, deleteWorkflow } = useWorkflows(currentOffice?.id);
  const { runs, executeWorkflow } = useWorkflowRuns(currentOffice?.id, 100);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);

  const isLoading = officeLoading || workflowsLoading;

  const filteredWorkflows = workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRunCount = (workflowId: string) => {
    return runs.filter(r => r.workflow_id === workflowId).length;
  };

  const getLastRun = (workflowId: string) => {
    const workflowRuns = runs.filter(r => r.workflow_id === workflowId);
    if (workflowRuns.length === 0) return null;
    return workflowRuns[0];
  };

  const handleCreate = () => {
    setEditingWorkflow(null);
    setDialogOpen(true);
  };

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setDialogOpen(true);
  };

  const handleOpenBuilder = (workflow: Workflow) => {
    navigate(`/workflows/${workflow.id}`);
  };

  const handleDuplicate = async (workflow: Workflow) => {
    const { error } = await createWorkflow({
      name: `${workflow.name} (Copy)`,
      description: workflow.description || undefined,
      nodes: workflow.nodes as any,
      edges: workflow.edges as any,
    });

    if (error) {
      toast.error('Failed to duplicate workflow');
    } else {
      toast.success('Workflow duplicated');
    }
  };

  const handleToggleActive = async (workflow: Workflow) => {
    const { error } = await updateWorkflow(workflow.id, { is_active: !workflow.is_active });
    if (error) {
      toast.error('Failed to update workflow');
    } else {
      toast.success(workflow.is_active ? 'Workflow deactivated' : 'Workflow activated');
    }
  };

  const handleRunWorkflow = async (workflow: Workflow) => {
    setExecuting(workflow.id);
    const { data, error } = await executeWorkflow(workflow.id);
    setExecuting(null);
    
    if (error) {
      toast.error('Failed to start workflow');
    } else {
      toast.success(`Workflow "${workflow.name}" started`, {
        description: `Run ID: ${data?.runId?.slice(0, 8)}...`,
        action: {
          label: 'View Runs',
          onClick: () => navigate('/runs'),
        },
      });
    }
  };

  const handleDeleteClick = (workflow: Workflow) => {
    setWorkflowToDelete(workflow);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!workflowToDelete) return;
    
    setDeleting(true);
    const { error } = await deleteWorkflow(workflowToDelete.id);
    setDeleting(false);

    if (error) {
      toast.error('Failed to delete workflow');
    } else {
      toast.success('Workflow deleted');
      setDeleteDialogOpen(false);
    }
  };

  const handleSave = async (data: { name: string; description?: string; nodes?: any; edges?: any }) => {
    if (editingWorkflow) {
      const { error } = await updateWorkflow(editingWorkflow.id, {
        name: data.name,
        description: data.description,
      });
      if (error) {
        toast.error('Failed to update workflow');
        return { error };
      }
      toast.success('Workflow updated');
      return { error: null };
    } else {
      // Use template nodes/edges if provided, otherwise use defaults
      const nodes = data.nodes || [
        { id: 'start-1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
        { id: 'end-1', type: 'end', position: { x: 250, y: 200 }, data: { label: 'End' } },
      ];
      const edges = data.edges || [
        { id: 'e-start-end', source: 'start-1', target: 'end-1', animated: true },
      ];

      const { data: newWorkflow, error } = await createWorkflow({
        name: data.name,
        description: data.description,
        nodes: nodes as any,
        edges: edges as any,
      });
      
      if (error) {
        toast.error('Failed to create workflow');
        return { error };
      }
      
      toast.success('Workflow created from template');
      
      // Navigate to builder after creation
      if (newWorkflow) {
        navigate(`/workflows/${newWorkflow.id}`);
      }
      
      return { error: null };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Workflows" 
        subtitle="Build and manage automation workflows"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        {/* Workflows Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredWorkflows.map((workflow) => {
            const lastRun = getLastRun(workflow.id);
            const runCount = getRunCount(workflow.id);
            
            return (
              <motion.div key={workflow.id} variants={itemVariants}>
                <Card 
                  className="group hover:border-primary/30 transition-all duration-200 hover:shadow-glow cursor-pointer"
                  onClick={() => handleOpenBuilder(workflow)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                          <WorkflowIcon className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{workflow.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {workflow.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => handleOpenBuilder(workflow)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Open Builder
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(workflow)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(workflow)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRunWorkflow(workflow)}
                            disabled={executing === workflow.id}
                          >
                            {executing === workflow.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 mr-2" />
                            )}
                            Run Now
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActive(workflow)}>
                            {workflow.is_active ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(workflow)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={workflow.is_active ? 'success' : 'muted'}>
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Version</span>
                        <span className="text-foreground">v{workflow.version || 1}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Runs</span>
                        <span className="text-foreground">{runCount}</span>
                      </div>

                      {lastRun && (
                        <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                          {lastRun.status === 'completed' ? (
                            <CheckCircle2 className="w-3 h-3 text-success" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          Last run {formatDistanceToNow(new Date(lastRun.created_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Add New Card */}
          <motion.div variants={itemVariants}>
            <Card 
              className="border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group h-full min-h-[200px]"
              onClick={handleCreate}
            >
              <CardContent className="p-5 flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-medium text-foreground mb-1">Create Workflow</p>
                <p className="text-sm text-muted-foreground">Build a new automation</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {filteredWorkflows.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <WorkflowIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No workflows found. Create your first workflow to get started.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <WorkflowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workflow={editingWorkflow}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{workflowToDelete?.name}</strong>? 
              This will also delete all associated workflow runs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}