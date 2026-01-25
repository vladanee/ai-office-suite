-- Add UPDATE policy for chat_sessions
CREATE POLICY "Users can update their own chat sessions"
ON public.chat_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Add DELETE policy for workflow_runs (admins only)
CREATE POLICY "Admins can delete workflow runs"
ON public.workflow_runs
FOR DELETE
USING (is_office_admin(office_id));

-- Add DELETE policy for profiles (users can delete their own)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);