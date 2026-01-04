import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useCurrentOffice, usePersonas } from '@/hooks/useOfficeData';
import { PersonaChatInterface } from '@/components/chat/PersonaChatInterface';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Chat() {
  const { currentOffice } = useCurrentOffice();
  const { personas, loading } = usePersonas(currentOffice?.id);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Persona List */}
      <div className="w-72 border-r border-border/50 bg-card/30 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat with Personas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select a persona to start a conversation
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading personas...</div>
            ) : personas.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No personas available. Create one in the Personas page.
              </div>
            ) : (
              personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersonaId(persona.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                    selectedPersonaId === persona.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-lg">{persona.avatar || '🤖'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{persona.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{persona.role}</p>
                  </div>
                  <Badge
                    variant={persona.status === 'active' ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {persona.status || 'idle'}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        <PersonaChatInterface personaId={selectedPersonaId} officeId={currentOffice?.id} />
      </div>
    </div>
  );
}
