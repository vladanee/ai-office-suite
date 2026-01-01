import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Loader2, ChevronRight, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tables, Json } from '@/integrations/supabase/types';
import { workflowTemplates, WorkflowTemplate } from '@/lib/workflowTemplates';
import { cn } from '@/lib/utils';

type Workflow = Tables<'workflows'>;

const workflowSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type WorkflowFormData = z.infer<typeof workflowSchema> & {
  nodes?: Json;
  edges?: Json;
};

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow?: Workflow | null;
  onSave: (data: WorkflowFormData) => Promise<{ error: Error | null }>;
}

export function WorkflowDialog({
  open,
  onOpenChange,
  workflow,
  onSave,
}: WorkflowDialogProps) {
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEditing = !!workflow;

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description || '');
      setStep('details');
    } else {
      setName('');
      setDescription('');
      setSelectedTemplate(null);
      setStep('template');
    }
    setErrors({});
  }, [workflow, open]);

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    if (template.id !== 'blank') {
      setName(template.name);
      setDescription(template.description);
    }
    setStep('details');
  };

  const handleBack = () => {
    setStep('template');
  };

  const handleSave = async () => {
    const data: WorkflowFormData = {
      name,
      description: description || undefined,
    };

    // Add template nodes/edges if creating new workflow with template
    if (!isEditing && selectedTemplate) {
      data.nodes = selectedTemplate.nodes as unknown as Json;
      data.edges = selectedTemplate.edges as unknown as Json;
    }

    const result = workflowSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    const { error } = await onSave(data);
    setSaving(false);

    if (!error) {
      onOpenChange(false);
    }
  };

  const categories = [
    { id: 'automation', label: 'Automation' },
    { id: 'notification', label: 'Notifications' },
    { id: 'data', label: 'Data Processing' },
    { id: 'integration', label: 'Integrations' },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-md", !isEditing && step === 'template' && "max-w-2xl")}>
        <DialogHeader>
          <DialogTitle>
            {isEditing 
              ? 'Edit Workflow' 
              : step === 'template' 
                ? 'Choose a Template' 
                : 'Workflow Details'}
          </DialogTitle>
        </DialogHeader>

        {!isEditing && step === 'template' ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 py-4 pr-4">
              {categories.map(category => {
                const templates = workflowTemplates.filter(t => t.category === category.id);
                if (templates.length === 0) return null;
                
                return (
                  <div key={category.id}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      {category.label}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleSelectTemplate(template)}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-lg border text-left transition-all",
                            "hover:border-primary hover:bg-primary/5",
                            selectedTemplate?.id === template.id
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card"
                          )}
                        >
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">
                              {template.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {template.description}
                            </p>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Customer Onboarding"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
            </div>

            {!isEditing && selectedTemplate && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedTemplate.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Template: {selectedTemplate.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTemplate.nodes.length - 2} nodes pre-configured
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!isEditing && step === 'details' && (
            <Button variant="outline" onClick={handleBack} disabled={saving} className="mr-auto">
              Back
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          {step === 'template' ? (
            <Button 
              onClick={() => selectedTemplate && handleSelectTemplate(selectedTemplate)} 
              disabled={!selectedTemplate}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create & Open Builder'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
