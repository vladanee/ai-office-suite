import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { Tables } from '@/integrations/supabase/types';

type Workflow = Tables<'workflows'>;

const workflowSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEditing = !!workflow;

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setErrors({});
  }, [workflow, open]);

  const handleSave = async () => {
    const data = {
      name,
      description: description || undefined,
    };

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
    const { error } = await onSave(result.data);
    setSaving(false);

    if (!error) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
        </DialogHeader>

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create & Open Builder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}