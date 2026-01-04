import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePersonaChat } from '@/hooks/usePersonaChat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PersonaChatInterfaceProps {
  personaId: string | null;
  officeId: string | undefined;
}

export function PersonaChatInterface({ personaId, officeId }: PersonaChatInterfaceProps) {
  const { messages, persona, loading, sending, sendMessage, clearSession } = usePersonaChat(
    personaId,
    officeId
  );
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const message = input.trim();
    setInput('');
    await sendMessage(message);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!personaId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a persona to start chatting</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {persona && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-lg">{persona.avatar || '🤖'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{persona.name}</h3>
              <p className="text-sm text-muted-foreground">{persona.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSession}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">Start a conversation with {persona?.name}</p>
              <p className="text-sm">
                {persona?.system_prompt
                  ? 'This persona has a custom personality configured.'
                  : 'Send a message to begin.'}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>
                  {message.role === 'user' ? '👤' : persona?.avatar || '🤖'}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'rounded-2xl px-4 py-2 max-w-[80%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}
                >
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}

          {sending && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{persona?.avatar || '🤖'}</AvatarFallback>
              </Avatar>
              <div className="rounded-2xl px-4 py-3 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-card/50">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${persona?.name || 'persona'}...`}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button onClick={handleSend} disabled={!input.trim() || sending} size="icon">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
