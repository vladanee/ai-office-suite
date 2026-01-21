import { useState, useEffect } from 'react';
import { FileText, Plus, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskTemplate, TaskTemplateInsert } from '@/hooks/useTaskTemplates';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: TaskTemplate | null;
  onSave: (template: TaskTemplateInsert) => Promise<void>;
}

const ICONS = ['📋', '🎯', '🔧', '📊', '💡', '🚀', '📝', '🔍', '⚡', '🎨', '📈', '🛠️'];
const CATEGORIES = ['Development', 'Design', 'Marketing', 'Support', 'Operations', 'Research'];

export function TemplateDialog({ open, onOpenChange, template, onSave }: TemplateDialogProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [titleTemplate, setTitleTemplate] = useState('');
  const [descriptionTemplate, setDescriptionTemplate] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('📋');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [criteriaInput, setCriteriaInput] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([]);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setTitleTemplate(template.title_template);
      setDescriptionTemplate(template.description_template || '');
      setPriority(template.priority);
      setEstimatedHours(template.estimated_hours?.toString() || '');
      setCategory(template.category || '');
      setIcon(template.icon);
      setTags(template.tags);
      setAcceptanceCriteria(template.acceptance_criteria);
    } else {
      resetForm();
    }
  }, [template, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTitleTemplate('');
    setDescriptionTemplate('');
    setPriority('medium');
    setEstimatedHours('');
    setCategory('');
    setIcon('📋');
    setTags([]);
    setAcceptanceCriteria([]);
    setTagInput('');
    setCriteriaInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleAddCriteria = () => {
    if (criteriaInput.trim()) {
      setAcceptanceCriteria([...acceptanceCriteria, criteriaInput.trim()]);
      setCriteriaInput('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !titleTemplate.trim()) return;
    
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        title_template: titleTemplate.trim(),
        description_template: descriptionTemplate.trim() || null,
        priority,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        category: category || null,
        icon,
        tags,
        acceptance_criteria: acceptanceCriteria,
      });
      onOpenChange(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {template ? 'Edit Template' : 'Create Task Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Info */}
          <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Bug Fix Template"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Template Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="When to use this template..."
            />
          </div>

          {/* Task Defaults */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Task Defaults</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titleTemplate">Task Title Template *</Label>
                <Input
                  id="titleTemplate"
                  value={titleTemplate}
                  onChange={(e) => setTitleTemplate(e.target.value)}
                  placeholder="e.g., Fix: [Issue Description]"
                />
                <p className="text-xs text-muted-foreground">
                  Use placeholders like [Description] that users can fill in
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionTemplate">Task Description Template</Label>
                <Textarea
                  id="descriptionTemplate"
                  value={descriptionTemplate}
                  onChange={(e) => setDescriptionTemplate(e.target.value)}
                  placeholder="Describe the task steps..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Est. Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="2.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Acceptance Criteria */}
          <div className="space-y-2">
            <Label>Acceptance Criteria</Label>
            <div className="flex gap-2">
              <Input
                value={criteriaInput}
                onChange={(e) => setCriteriaInput(e.target.value)}
                placeholder="Add acceptance criteria..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCriteria())}
              />
              <Button type="button" variant="outline" onClick={handleAddCriteria}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {acceptanceCriteria.length > 0 && (
              <ul className="mt-2 space-y-1">
                {acceptanceCriteria.map((criteria, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>✓</span>
                    <span className="flex-1">{criteria}</span>
                    <X 
                      className="w-3 h-3 cursor-pointer text-destructive" 
                      onClick={() => setAcceptanceCriteria(acceptanceCriteria.filter((_, idx) => idx !== i))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim() || !titleTemplate.trim()}>
            {saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
