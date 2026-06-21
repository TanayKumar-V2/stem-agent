import { create } from 'zustand';
import { fetchApi } from '@/lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isStreaming: boolean;
  
  fetchHistory: () => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isStreaming: false,

  fetchHistory: async () => {
    try {
      const data = await fetchApi('/chat/history');
      set({ conversations: data });
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id, messages: [] });
    if (id) {
      get().fetchMessages(id);
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      const data = await fetchApi(`/chat/${conversationId}`);
      set({ messages: data });
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  },

  sendMessage: async (content: string) => {
    const { activeConversationId, messages } = get();
    
    // Optimistic UI for user message
    const tempUserMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: tempUserMsgId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    set({ messages: [...messages, newUserMsg], isStreaming: true });

    try {
      // Create a temporary assistant message
      const tempAssistantMsgId = (Date.now() + 1).toString();
      const newAssistantMsg: Message = {
        id: tempAssistantMsgId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };
      
      set((state) => ({ messages: [...state.messages, newAssistantMsg] }));

      const { useAuthStore } = await import('./auth.store');
      const token = useAuthStore.getState().accessToken;
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: content,
        }),
      });

      if (!res.ok) {
        throw new Error('Chat request failed');
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.conversationId && !get().activeConversationId) {
                // Set the active conversation ID if it's the first message
                set({ activeConversationId: data.conversationId });
                get().fetchHistory();
              }
              if (data.text) {
                assistantText += data.text;
                // Update the last message
                set((state) => {
                  const newMessages = [...state.messages];
                  newMessages[newMessages.length - 1].content = assistantText;
                  return { messages: newMessages };
                });
              }
            } catch (e) {
              console.error('Failed to parse SSE', e);
            }
          }
        }
      }

      set({ isStreaming: false });
    } catch (e) {
      console.error(e);
      set({ isStreaming: false });
    }
  },
}));
