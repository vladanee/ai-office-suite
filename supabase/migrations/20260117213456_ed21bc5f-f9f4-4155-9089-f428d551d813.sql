-- Create tasks table with comprehensive fields
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES public.offices(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES public.personas(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  
  -- Core task fields
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Planning fields
  estimated_hours NUMERIC(5,2),
  actual_hours NUMERIC(5,2),
  due_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- AI generation context
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generated', 'workflow', 'template')),
  acceptance_criteria JSONB DEFAULT '[]'::jsonb,
  skills_required JSONB DEFAULT '[]'::jsonb,
  suggested_approach TEXT,
  
  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for common queries
CREATE INDEX idx_tasks_office_id ON public.tasks(office_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_persona_id ON public.tasks(persona_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view tasks in their offices"
ON public.tasks FOR SELECT
USING (
  office_id IN (
    SELECT office_id FROM public.office_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create tasks in their offices"
ON public.tasks FOR INSERT
WITH CHECK (
  office_id IN (
    SELECT office_id FROM public.office_members 
    WHERE user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "Users can update tasks in their offices"
ON public.tasks FOR UPDATE
USING (
  office_id IN (
    SELECT office_id FROM public.office_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete tasks they created or are admins"
ON public.tasks FOR DELETE
USING (
  created_by = auth.uid()
  OR office_id IN (
    SELECT office_id FROM public.office_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;