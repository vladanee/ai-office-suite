import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tables } from '@/integrations/supabase/types';
import { z } from 'zod';

type Department = Tables<'departments'>;

const departmentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().trim().max(500, 'Description must be less than 500 characters').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

const colorOptions = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#3b82f6', label: 'Blue' },
];

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  onSave: (data: { name: string; description?: string; color?: string }) => Promise<{ error: Error | null }>;
}

export function DepartmentDialog({ open, onOpenChange, department, onSave }: DepartmentDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!department;

  useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description || '');
      setColor(department.color || '#6366f1');
    } else {
      setName('');
      setDescription('');
      setColor('#6366f1');
    }
    setErrors({});
  }, [department, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const parsed = departmentSchema.parse({
        name,
        description: description || undefined,
        color,
      });
      
      const validatedData = {
        name: parsed.name,
        description: parsed.description,
        color: parsed.color,
      };
      
      setErrors({});
      setLoading(true);

      const { error } = await onSave(validatedData);

      if (error) {
        setErrors({ submit: error.message });
      } else {
        onOpenChange(false);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Department' : 'Create Department'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the department details below.'
              : 'Add a new department to organize your AI personas.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Customer Support"
              disabled={loading}
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-destructive" role="alert">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this department's purpose..."
              rows={3}
              disabled={loading}
              aria-describedby={errors.description ? "description-error" : undefined}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-destructive" role="alert">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`w-8 h-8 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    color === option.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: option.value }}
                  title={option.label}
                  aria-label={`Select ${option.label} color`}
                  aria-pressed={color === option.value}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-destructive" role="alert">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Department'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}