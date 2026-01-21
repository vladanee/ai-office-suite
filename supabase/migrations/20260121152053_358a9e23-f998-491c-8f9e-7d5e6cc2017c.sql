-- Create task_templates table
CREATE TABLE public.task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  title_template TEXT NOT NULL,
  description_template TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  estimated_hours NUMERIC,
  tags JSONB DEFAULT '[]'::jsonb,
  acceptance_criteria JSONB DEFAULT '[]'::jsonb,
  skills_required JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  icon TEXT DEFAULT '📋',
  is_shared BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view templates in their offices"
  ON public.task_templates FOR SELECT
  USING (
    office_id IN (
      SELECT office_id FROM office_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates in their offices"
  ON public.task_templates FOR INSERT
  WITH CHECK (
    office_id IN (
      SELECT office_id FROM office_members WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own templates or shared ones if admin"
  ON public.task_templates FOR UPDATE
  USING (
    created_by = auth.uid() OR 
    office_id IN (
      SELECT office_id FROM office_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete their own templates or if admin"
  ON public.task_templates FOR DELETE
  USING (
    created_by = auth.uid() OR 
    office_id IN (
      SELECT office_id FROM office_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON public.task_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();