'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { clearAuthSession } from '@/lib/auth/session';

export function LogoutButton() {
  const router = useRouter();

  function onLogout() {
    clearAuthSession();
    router.replace('/login');
  }

  return (
    <Button type="button" variant="secondary" onClick={onLogout}>
      Sair
    </Button>
  );
}
