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

type Office = Tables<'offices'>;

const officeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().trim().max(500, 'Description must be less than 500 characters').optional(),
});

interface OfficeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  office?: Office | null;
  onSave: (data: { name: string; description?: string }) => Promise<{ error: Error | null }>;
}

export function OfficeDialog({ open, onOpenChange, office, onSave }: OfficeDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!office;

  useEffect(() => {
    if (office) {
      setName(office.name);
      setDescription(office.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setErrors({});
  }, [office, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const parsed = officeSchema.parse({
        name,
        description: description || undefined,
      });
      
      const validatedData = {
        name: parsed.name,
        description: parsed.description,
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
          <DialogTitle>{isEditing ? 'Edit Office' : 'Create Office'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your office details below.'
              : 'Create a new office to organize your AI personas and workflows.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="office-name">Office Name</Label>
            <Input
              id="office-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Company"
              disabled={loading}
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-destructive" role="alert">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-description">Description</Label>
            <Textarea
              id="office-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your office..."
              rows={3}
              disabled={loading}
              aria-describedby={errors.description ? "description-error" : undefined}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-destructive" role="alert">{errors.description}</p>
            )}
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
                'Create Office'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
