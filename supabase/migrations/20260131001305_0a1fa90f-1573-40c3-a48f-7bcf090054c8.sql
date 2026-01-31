-- Add UPDATE policy for chat_messages
CREATE POLICY "Users can update messages in their sessions"
ON public.chat_messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM chat_sessions
  WHERE chat_sessions.id = chat_messages.session_id
  AND chat_sessions.user_id = auth.uid()
));

-- Add DELETE policy for chat_messages
CREATE POLICY "Users can delete messages in their sessions"
ON public.chat_messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM chat_sessions
  WHERE chat_sessions.id = chat_messages.session_id
  AND chat_sessions.user_id = auth.uid()
));