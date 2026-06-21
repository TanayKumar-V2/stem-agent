'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chat.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export function ChatMessageArea() {
  const { messages, sendMessage, isStreaming } = useChatStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  return (
    <div className="flex flex-col h-screen flex-1 bg-background relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <h2 className="text-2xl font-bold">STEM Agent</h2>
            <p className="text-muted-foreground max-w-md">
              Ask any question about Science, Technology, Engineering, or Mathematics. I'm here to help you solve complex problems and write production-quality code.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex max-w-3xl mx-auto",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "p-4 rounded-xl border prose prose-sm md:prose-base dark:prose-invert max-w-full overflow-x-auto",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card border-border"
                )}
              >
                {msg.role === 'user' ? (
                  <p className="m-0">{msg.content}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content || '...'}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 md:p-8 border-t bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message STEM Agent..."
            className="flex-1"
            disabled={isStreaming}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isStreaming}>
            <SendHorizontal size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
