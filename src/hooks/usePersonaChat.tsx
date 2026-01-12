import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  persona_id: string;
  title: string | null;
  created_at: string;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
  system_prompt: string | null;
}

export function usePersonaChat(personaId: string | null, officeId: string | undefined) {
  const { user } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(null);

  // Fetch persona details
  useEffect(() => {
    if (!personaId) {
      setPersona(null);
      return;
    }

    const fetchPersona = async () => {
      const { data, error } = await supabase
        .from('personas')
        .select('id, name, role, avatar, system_prompt')
        .eq('id', personaId)
        .single();

      if (error) {
        console.error('Error fetching persona:', error);
        return;
      }
      setPersona(data);
    };

    fetchPersona();
  }, [personaId]);

  // Fetch or create session
  useEffect(() => {
    if (!personaId || !officeId || !user) {
      setSession(null);
      setMessages([]);
      return;
    }

    const fetchOrCreateSession = async () => {
      setLoading(true);

      // Try to find existing session
      const { data: existingSession, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('persona_id', personaId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        setLoading(false);
        return;
      }

      if (existingSession) {
        setSession(existingSession);
        // Fetch messages for this session
        const { data: messagesData } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', existingSession.id)
          .order('created_at', { ascending: true });

        setMessages((messagesData || []).map(m => ({
          ...m,
          role: m.role as 'user' | 'assistant'
        })));
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('chat_sessions')
          .insert({
            persona_id: personaId,
            office_id: officeId,
            user_id: user.id,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating session:', createError);
          toast.error('Failed to start chat session');
        } else {
          setSession(newSession);
          setMessages([]);
        }
      }

      setLoading(false);
    };

    fetchOrCreateSession();
  }, [personaId, officeId, user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`chat-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const sendMessage = useCallback(async (content: string) => {
    if (!session || !persona || sending) return;

    setSending(true);

    try {
      // Insert user message
      const { data: userMessageData, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          role: 'user',
          content,
        })
        .select()
        .single();

      if (insertError || !userMessageData) {
        throw insertError || new Error('Failed to insert message');
      }

      const userMessage: Message = {
        ...userMessageData,
        role: userMessageData.role as 'user' | 'assistant'
      };

      // Add user message to local state immediately
      setMessages((prev) => [...prev, userMessage]);

      // Prepare messages for API
      const apiMessages = [...messages, { role: 'user' as const, content }].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Get user's session token for proper authentication
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call the edge function with streaming using user's token
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/persona-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authSession.access_token}`,
          },
          body: JSON.stringify({
            sessionId: session.id,
            messages: apiMessages,
            personaSystemPrompt: persona.system_prompt,
            personaName: persona.name,
            personaRole: persona.role,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let tempMessageId = `temp-${Date.now()}`;

      // Add temporary assistant message
      setMessages((prev) => [
        ...prev,
        { id: tempMessageId, role: 'assistant', content: '', created_at: new Date().toISOString() },
      ]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process line by line
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempMessageId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }

      // Save assistant message to database
      const { data: savedMessageData, error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          role: 'assistant',
          content: assistantContent,
        })
        .select()
        .single();

      if (saveError || !savedMessageData) {
        console.error('Error saving assistant message:', saveError);
      } else {
        const savedMessage: Message = {
          ...savedMessageData,
          role: savedMessageData.role as 'user' | 'assistant'
        };
        // Replace temp message with saved one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessageId ? savedMessage : m))
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [session, persona, messages, sending]);

  const clearSession = useCallback(async () => {
    if (!session) return;

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', session.id);

    if (error) {
      toast.error('Failed to clear chat');
      return;
    }

    setSession(null);
    setMessages([]);
  }, [session]);

  return {
    session,
    messages,
    persona,
    loading,
    sending,
    sendMessage,
    clearSession,
  };
}
