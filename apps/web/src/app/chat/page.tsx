'use client';

import { ChatSidebar } from '@/components/chat/sidebar';
import { ChatMessageArea } from '@/components/chat/message-area';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function ChatPage() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      clearAuth();
      router.push('/auth/login');
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar />
      <div className="flex-1 flex flex-col relative">
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4 z-10 opacity-50 hover:opacity-100"
          onClick={handleLogout}
        >
          <LogOut size={18} />
        </Button>
        <ChatMessageArea />
      </div>
    </div>
  );
}
