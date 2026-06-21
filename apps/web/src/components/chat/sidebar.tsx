'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store/chat.store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlusCircle, MessageSquare } from 'lucide-react';

export function ChatSidebar() {
  const { conversations, fetchHistory, activeConversationId, setActiveConversation } = useChatStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="w-64 border-r bg-background/50 flex flex-col h-screen">
      <div className="p-4 border-b">
        <Button 
          className="w-full justify-start gap-2" 
          variant="outline"
          onClick={() => setActiveConversation(null)}
        >
          <PlusCircle size={16} />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.map((convo) => (
          <button
            key={convo.id}
            onClick={() => setActiveConversation(convo.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm truncate flex items-center gap-2 hover:bg-accent transition-colors",
              activeConversationId === convo.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <MessageSquare size={16} />
            <span className="truncate">{convo.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
