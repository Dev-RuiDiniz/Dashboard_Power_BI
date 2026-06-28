'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth/api';
import { clearAuthSession, getAuthSession } from '@/lib/auth/session';

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    const session = getAuthSession();

    try {
      if (session) {
        await logout(session.refreshToken, session.accessToken);
      }
    } catch {
      // A limpeza local continua obrigatória mesmo se a API falhar.
    } finally {
      clearAuthSession();
      router.replace('/login');
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={() => void onLogout()}>
      Sair
    </Button>
  );
}
