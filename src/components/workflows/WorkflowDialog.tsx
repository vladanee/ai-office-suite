import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Loader2, ChevronRight, Check, Clock, Sparkles, BookOpen } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Tables, Json } from '@/integrations/supabase/types';
import { 
  workflowTemplates, 
  WorkflowTemplate, 
  templateCategories,
  difficultyLabels,
  getFeaturedTemplates 
} from '@/lib/workflowTemplates';
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
  const [activeCategory, setActiveCategory] = useState<string>('getting-started');

  const isEditing = !!workflow;
  const featuredTemplates = getFeaturedTemplates();

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
      setActiveCategory('getting-started');
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

  const filteredTemplates = workflowTemplates.filter(t => t.category === activeCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-md", !isEditing && step === 'template' && "max-w-4xl")}>
        <DialogHeader>
          <DialogTitle>
            {isEditing 
              ? 'Edit Workflow' 
              : step === 'template' 
                ? 'Create New Workflow' 
                : 'Workflow Details'}
          </DialogTitle>
        </DialogHeader>

        {!isEditing && step === 'template' ? (
          <div className="flex gap-4 min-h-[60vh]">
            {/* Category Sidebar */}
            <div className="w-56 flex-shrink-0 border-r border-border pr-4">
              <div className="space-y-1">
                {templateCategories.map(category => {
                  const count = workflowTemplates.filter(t => t.category === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        "w-full flex items-start gap-2 p-2.5 rounded-lg text-left transition-colors",
                        activeCategory === category.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-sm">{category.label.split(' ')[0]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {category.label.split(' ').slice(1).join(' ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {count} template{count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Tips */}
              <div className="mt-6 p-3 bg-secondary/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">Quick Tip</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Start with a <strong>Beginner</strong> template to learn the basics, then explore more advanced options.
                </p>
              </div>
            </div>

            {/* Template Grid */}
            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-4">
                {/* Featured Section */}
                {activeCategory === 'getting-started' && featuredTemplates.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <h4 className="text-sm font-medium text-foreground">Recommended for You</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {featuredTemplates.slice(0, 4).map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSelected={selectedTemplate?.id === template.id}
                          onSelect={handleSelectTemplate}
                          featured
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Templates */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    {templateCategories.find(c => c.id === activeCategory)?.label || 'Templates'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredTemplates.map(template => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplate?.id === template.id}
                        onSelect={handleSelectTemplate}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
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
              <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {selectedTemplate.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <Badge variant="outline" className={difficultyLabels[selectedTemplate.difficulty].color}>
                    {difficultyLabels[selectedTemplate.difficulty].label}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {selectedTemplate.estimatedTime}
                  </div>
                  <span className="text-muted-foreground">
                    {selectedTemplate.nodes.length - 2} nodes pre-configured
                  </span>
                </div>

                {selectedTemplate.useCases.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1.5">Great for:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTemplate.useCases.map(useCase => (
                        <span
                          key={useCase}
                          className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTemplate.steps && selectedTemplate.steps.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">💡 This template includes guided tips to help you get started!</p>
                  </div>
                )}
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

interface TemplateCardProps {
  template: WorkflowTemplate;
  isSelected: boolean;
  onSelect: (template: WorkflowTemplate) => void;
  featured?: boolean;
}

function TemplateCard({ template, isSelected, onSelect, featured }: TemplateCardProps) {
  return (
    <button
      onClick={() => onSelect(template)}
      className={cn(
        "relative flex flex-col gap-2 p-4 rounded-lg border text-left transition-all h-full",
        "hover:border-primary hover:bg-primary/5",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-card",
        featured && "ring-1 ring-yellow-500/20"
      )}
    >
      {featured && (
        <div className="absolute -top-2 -right-2">
          <span className="text-xs px-1.5 py-0.5 bg-yellow-500 text-yellow-950 rounded-full font-medium">
            ⭐ Popular
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <span className="text-2xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm line-clamp-1">
            {template.name}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {template.description}
          </p>
        </div>
        {isSelected && (
          <Check className="w-4 h-4 text-primary flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2">
        <Badge 
          variant="outline" 
          className={cn("text-[10px] px-1.5 py-0", difficultyLabels[template.difficulty].color)}
        >
          {difficultyLabels[template.difficulty].label}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {template.estimatedTime}
        </div>
      </div>
    </button>
  );
}
