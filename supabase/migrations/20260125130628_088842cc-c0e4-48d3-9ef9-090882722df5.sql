-- Add NOT NULL constraint to tasks.office_id
-- First, delete any orphaned tasks without an office_id
DELETE FROM public.tasks WHERE office_id IS NULL;

-- Then alter the column to be NOT NULL
ALTER TABLE public.tasks ALTER COLUMN office_id SET NOT NULL;