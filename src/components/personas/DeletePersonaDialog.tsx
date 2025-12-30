import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';

type Persona = Tables<'personas'>;

interface DeletePersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona | null;
  onConfirm: () => Promise<{ error: Error | null }>;
}

export function DeletePersonaDialog({
  open,
  onOpenChange,
  persona,
  onConfirm,
}: DeletePersonaDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await onConfirm();
    setDeleting(false);

    if (!error) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Persona
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{persona?.name}</strong>? This action cannot be
            undone. Any workflows using this persona may be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete Persona
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}