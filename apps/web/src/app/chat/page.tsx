'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';

export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
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
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-3xl font-bold">Welcome, {user?.name || 'User'}!</h1>
      <p className="text-muted-foreground">You are now logged in and viewing the protected chat area.</p>
      <Button onClick={handleLogout} variant="outline">
        Logout
      </Button>
    </div>
  );
}
