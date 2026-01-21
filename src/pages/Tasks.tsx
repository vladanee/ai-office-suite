import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopBar } from '@/components/layout/TopBar';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { DeleteTaskDialog } from '@/components/tasks/DeleteTaskDialog';
import { TaskGenerationDialog } from '@/components/tasks/TaskGenerationDialog';
import { TemplateDialog } from '@/components/tasks/TemplateDialog';
import { TemplatePicker } from '@/components/tasks/TemplatePicker';
import { useTasks, Task, TaskInsert, TaskUpdate } from '@/hooks/useTasks';
import { useTaskTemplates, TaskTemplate, TaskTemplateInsert } from '@/hooks/useTaskTemplates';
import { useCurrentOffice, usePersonas } from '@/hooks/useOfficeData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'kanban' | 'list';
type FilterStatus = 'all' | Task['status'];
type FilterPriority = 'all' | Task['priority'];

const statusColumns: { key: Task['status']; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: 'bg-muted' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-warning/20' },
  { key: 'in_review', label: 'In Review', color: 'bg-primary/20' },
  { key: 'done', label: 'Done', color: 'bg-success/20' },
];

export default function Tasks() {
  const { currentOffice, loading: officeLoading } = useCurrentOffice();
  const { personas, loading: personasLoading } = usePersonas(currentOffice?.id);
  const { 
    tasks, 
    tasksByStatus, 
    stats, 
    loading: tasksLoading,
    createTask,
    updateTask,
    deleteTask,
    bulkCreateTasks,
  } = useTasks(currentOffice?.id);
  const {
    templates,
    loading: templatesLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
  } = useTaskTemplates();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterPersona, setFilterPersona] = useState<string>('all');

  // Dialogs
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedPersonaForGen, setSelectedPersonaForGen] = useState<{
    id: string;
    name: string;
    role: string;
    department: string;
    skills?: string[];
    status?: string | null;
  } | null>(null);

  // Template dialogs
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const isLoading = officeLoading || personasLoading || tasksLoading || templatesLoading;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesPersona = filterPersona === 'all' || task.persona_id === filterPersona;
      return matchesSearch && matchesStatus && matchesPriority && matchesPersona;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority, filterPersona]);

  // Filtered tasks by status for Kanban
  const filteredTasksByStatus = useMemo(() => {
    return {
      todo: filteredTasks.filter(t => t.status === 'todo'),
      in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
      in_review: filteredTasks.filter(t => t.status === 'in_review'),
      done: filteredTasks.filter(t => t.status === 'done'),
    };
  }, [filteredTasks]);

  const getPersonaName = (personaId: string | null) => {
    if (!personaId) return undefined;
    return personas.find(p => p.id === personaId)?.name;
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleSaveTask = async (data: TaskInsert | TaskUpdate) => {
    if (editingTask) {
      const { error } = await updateTask(editingTask.id, data as TaskUpdate);
      if (error) {
        toast.error('Failed to update task');
        return { error: error as Error };
      }
      toast.success('Task updated');
      return { error: null };
    } else {
      const { error } = await createTask(data as TaskInsert);
      if (error) {
        toast.error('Failed to create task');
        return { error: error as Error };
      }
      toast.success('Task created');
      return { error: null };
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    const { error } = await deleteTask(taskToDelete.id);
    if (error) {
      toast.error('Failed to delete task');
    } else {
      toast.success('Task deleted');
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    const { error } = await updateTask(taskId, { status });
    if (error) {
      toast.error('Failed to update status');
    }
  };

  const handleOpenGenerateDialog = (persona?: { id: string; name: string; role: string; skills?: string[] | null; status?: string | null }) => {
    if (persona) {
      setSelectedPersonaForGen({
        id: persona.id,
        name: persona.name,
        role: persona.role,
        department: 'General',
        skills: persona.skills || undefined,
        status: persona.status,
      });
    } else if (personas.length > 0) {
      const firstPersona = personas[0];
      setSelectedPersonaForGen({
        id: firstPersona.id,
        name: firstPersona.name,
        role: firstPersona.role,
        department: 'General',
        skills: firstPersona.skills || undefined,
        status: firstPersona.status,
      });
    }
    setGenerateDialogOpen(true);
  };

  const handleSaveGeneratedTasks = async (generatedTasks: any[], personaId: string) => {
    if (!currentOffice) return;

    const tasksToCreate: TaskInsert[] = generatedTasks.map(task => ({
      office_id: currentOffice.id,
      persona_id: personaId,
      title: task.title,
      description: task.description,
      priority: task.priority as Task['priority'],
      estimated_hours: task.estimated_hours,
      source: 'ai_generated' as const,
      acceptance_criteria: task.acceptance_criteria || [],
      skills_required: task.skills_required || [],
      suggested_approach: task.suggested_approach,
    }));

    const { error } = await bulkCreateTasks(tasksToCreate);
    if (error) {
      throw error;
    }
  };

  // Template handlers
  const handleSelectTemplate = (template: TaskTemplate) => {
    setEditingTask(null);
    setTaskDialogOpen(true);
    incrementUsage(template.id);
    // Prefill task dialog with template data - using setTimeout to ensure dialog is open
    setTimeout(() => {
      const event = new CustomEvent('prefill-task', { detail: template });
      window.dispatchEvent(event);
    }, 100);
  };

  const handleSaveTemplate = async (templateData: TaskTemplateInsert) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, templateData);
    } else {
      await createTemplate(templateData);
    }
  };

  const handleOpenTemplateManager = () => {
    setEditingTemplate(null);
    setTemplateDialogOpen(true);
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
        title="Tasks"
        subtitle="Manage and track all your tasks"
        actions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Templates
                  {templates.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{templates.length}</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenTemplateManager}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Manage Templates
                </DropdownMenuItem>
                {templates.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    {templates.slice(0, 5).map(template => (
                      <DropdownMenuItem 
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        {template.icon} {template.name}
                      </DropdownMenuItem>
                    ))}
                    {templates.length > 5 && (
                      <DropdownMenuItem onClick={() => setTemplatePickerOpen(true)}>
                        View all templates...
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {personas.map(persona => (
                  <DropdownMenuItem 
                    key={persona.id}
                    onClick={() => handleOpenGenerateDialog(persona)}
                  >
                    {persona.avatar || '🤖'} {persona.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <List className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as FilterPriority)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPersona} onValueChange={setFilterPersona}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Personas</SelectItem>
                {personas.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.avatar || '🤖'} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Task Views */}
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusColumns.map(column => (
              <div key={column.key} className="space-y-3">
                <div className={cn('p-3 rounded-lg', column.color)}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{column.label}</h3>
                    <Badge variant="secondary">
                      {filteredTasksByStatus[column.key]?.length || 0}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {filteredTasksByStatus[column.key]?.map(task => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <TaskCard
                        task={task}
                        personaName={getPersonaName(task.persona_id)}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteClick}
                        onStatusChange={handleStatusChange}
                        compact
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No tasks found. Create your first task or generate tasks with AI.</p>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <TaskCard
                    task={task}
                    personaName={getPersonaName(task.persona_id)}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteClick}
                    onStatusChange={handleStatusChange}
                  />
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        personas={personas.map(p => ({ id: p.id, name: p.name, avatar: p.avatar }))}
        onSave={handleSaveTask}
        officeId={currentOffice?.id || ''}
        templates={templates}
        onOpenTemplatePicker={() => {
          setTaskDialogOpen(false);
          setTemplatePickerOpen(true);
        }}
      />

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        task={taskToDelete}
        onConfirm={handleConfirmDelete}
      />

      <TaskGenerationDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        persona={selectedPersonaForGen}
        onSaveTasks={handleSaveGeneratedTasks}
      />

      <TemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />

      <TemplatePicker
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        templates={templates}
        onSelect={handleSelectTemplate}
        onCreateNew={handleOpenTemplateManager}
      />
    </div>
  );
}
