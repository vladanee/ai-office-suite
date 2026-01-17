import { useState } from 'react';
import { Sparkles, Loader2, Save, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generatePersonaTasks, GeneratedTask } from '@/lib/aiTaskGenerator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TaskGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: {
    id: string;
    name: string;
    role: string;
    department: string;
    skills?: string[];
    status?: string | null;
  } | null;
  onSaveTasks: (tasks: GeneratedTask[], personaId: string) => Promise<void>;
}

export function TaskGenerationDialog({
  open,
  onOpenChange,
  persona,
  onSaveTasks,
}: TaskGenerationDialogProps) {
  const [step, setStep] = useState<'config' | 'results'>('config');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Configuration
  const [numTasks, setNumTasks] = useState(3);
  const [priorityFocus, setPriorityFocus] = useState<'low' | 'medium' | 'high'>('medium');
  const [workflowContext, setWorkflowContext] = useState('');
  
  // Results
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!persona) return;
    
    setGenerating(true);
    try {
      const result = await generatePersonaTasks(
        {
          name: persona.name,
          role: persona.role,
          department: persona.department,
          skills: persona.skills || [],
          workload: persona.status === 'busy' ? 'heavy' : 'normal',
        },
        workflowContext || undefined,
        numTasks,
        priorityFocus
      );

      if (result.success && result.tasks) {
        setGeneratedTasks(result.tasks);
        setSelectedTasks(new Set(result.tasks.map((_, i) => i)));
        setStep('results');
        toast.success(`Generated ${result.tasks.length} tasks`);
      } else {
        throw new Error(result.error || 'Failed to generate tasks');
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate tasks');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleSaveSelected = async () => {
    if (!persona) return;
    
    const tasksToSave = generatedTasks.filter((_, i) => selectedTasks.has(i));
    if (tasksToSave.length === 0) {
      toast.error('Please select at least one task');
      return;
    }

    setSaving(true);
    try {
      await onSaveTasks(tasksToSave, persona.id);
      toast.success(`Saved ${tasksToSave.length} tasks`);
      handleClose();
    } catch (error) {
      toast.error('Failed to save tasks');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStep('config');
    setGeneratedTasks([]);
    setSelectedTasks(new Set());
    setWorkflowContext('');
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep('config');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {step === 'config' ? 'Generate AI Tasks' : 'Review Generated Tasks'}
            {persona && <span className="text-muted-foreground font-normal">for {persona.name}</span>}
          </DialogTitle>
        </DialogHeader>

        {step === 'config' ? (
          <>
            <div className="space-y-6 py-4">
              {/* Number of Tasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Number of Tasks</Label>
                  <span className="text-sm font-medium text-primary">{numTasks}</span>
                </div>
                <Slider
                  value={[numTasks]}
                  onValueChange={([value]) => setNumTasks(value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Generate between 1-10 tasks based on the persona's role and skills
                </p>
              </div>

              {/* Priority Focus */}
              <div className="space-y-2">
                <Label>Priority Focus</Label>
                <Select value={priorityFocus} onValueChange={(v) => setPriorityFocus(v as 'low' | 'medium' | 'high')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority - Maintenance & improvements</SelectItem>
                    <SelectItem value="medium">Medium Priority - Standard work items</SelectItem>
                    <SelectItem value="high">High Priority - Critical & urgent tasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Workflow Context */}
              <div className="space-y-2">
                <Label htmlFor="context">Workflow Context (Optional)</Label>
                <textarea
                  id="context"
                  value={workflowContext}
                  onChange={(e) => setWorkflowContext(e.target.value)}
                  placeholder="Add context about current projects, goals, or specific requirements..."
                  className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  Provide additional context to generate more relevant tasks
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Tasks
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Select the tasks you want to save. You can edit them later.
              </p>

              {generatedTasks.map((task, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    'p-4 cursor-pointer transition-all',
                    selectedTasks.has(index) ? 'border-primary bg-primary/5' : 'opacity-60'
                  )}
                  onClick={() => handleToggleTask(index)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedTasks.has(index)} 
                      onCheckedChange={() => handleToggleTask(index)}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{task.title}</h4>
                        <Badge 
                          variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'muted'}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>⏱️ {task.estimated_hours}h</span>
                        <span>🎯 {task.acceptance_criteria?.length || 0} criteria</span>
                      </div>
                      {task.suggested_approach && (
                        <p className="text-xs text-primary mt-2 italic">
                          💡 {task.suggested_approach}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleBack}>
                ← Back
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSaveSelected} disabled={saving || selectedTasks.size === 0}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
