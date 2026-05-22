'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { getAuthSession } from '@/lib/auth/session';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = getAuthSession();

    if (!session) {
      setIsAuthenticated(false);
      setIsCheckingSession(false);
      router.replace('/login');
      return;
    }

    setIsAuthenticated(true);
    setIsCheckingSession(false);
  }, [router]);

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div role="status" className="rounded-2xl border border-slate-800 bg-white px-6 py-5 text-sm font-medium text-slate-700 shadow-xl">
          Verificando sessão...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
