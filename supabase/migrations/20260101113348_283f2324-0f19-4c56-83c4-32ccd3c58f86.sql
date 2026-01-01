-- Enable REPLICA IDENTITY FULL for complete row data in realtime updates
ALTER TABLE public.workflow_runs REPLICA IDENTITY FULL;

-- Add table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_runs;