-- Create chat_sessions table for conversations with personas
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
USING (auth.uid() = user_id AND is_office_member(office_id));

CREATE POLICY "Users can create chat sessions"
ON public.chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_office_member(office_id));

CREATE POLICY "Users can delete their own chat sessions"
ON public.chat_sessions FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages in their sessions"
ON public.chat_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.chat_sessions 
  WHERE chat_sessions.id = chat_messages.session_id 
  AND chat_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can insert messages in their sessions"
ON public.chat_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chat_sessions 
  WHERE chat_sessions.id = chat_messages.session_id 
  AND chat_sessions.user_id = auth.uid()
));

-- Service role policy for edge function to insert assistant messages
CREATE POLICY "Service role can insert messages"
ON public.chat_messages FOR INSERT
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;