-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'error', 'info', 'warning')),
  read BOOLEAN NOT NULL DEFAULT false,
  workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Allow service role to insert notifications (for triggers/edge functions)
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify office members when workflow completes or fails
CREATE OR REPLACE FUNCTION public.notify_workflow_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  workflow_name TEXT;
  member_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Only trigger on status change to completed or failed
  IF (NEW.status = 'completed' OR NEW.status = 'failed') AND 
     (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    
    -- Get workflow name
    SELECT name INTO workflow_name FROM public.workflows WHERE id = NEW.workflow_id;
    
    -- Set notification details based on status
    IF NEW.status = 'completed' THEN
      notification_title := 'Workflow Completed';
      notification_message := 'Workflow "' || COALESCE(workflow_name, 'Unknown') || '" completed successfully.';
      notification_type := 'success';
    ELSE
      notification_title := 'Workflow Failed';
      notification_message := 'Workflow "' || COALESCE(workflow_name, 'Unknown') || '" failed. ' || COALESCE(NEW.error, 'Check the run details for more information.');
      notification_type := 'error';
    END IF;
    
    -- Create notification for all office members
    FOR member_record IN 
      SELECT user_id FROM public.office_members WHERE office_id = NEW.office_id
    LOOP
      INSERT INTO public.notifications (user_id, office_id, title, message, type, workflow_run_id)
      VALUES (member_record.user_id, NEW.office_id, notification_title, notification_message, notification_type, NEW.id);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for workflow run status changes
CREATE TRIGGER on_workflow_run_status_change
AFTER UPDATE ON public.workflow_runs
FOR EACH ROW
EXECUTE FUNCTION public.notify_workflow_completion();