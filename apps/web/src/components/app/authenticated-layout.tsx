import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { useInactivityTimeout } from '@/lib/auth/use-inactivity-timeout';
import { apiGet } from '@/lib/admin-api';

import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

type UserProfile = {
  roles: string[];
  isTwoFactorEnabled: boolean;
};

function TwoFactorEnforcement({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiGet<UserProfile>('/auth/me')
      .then((user) => {
        if (cancelled) return;
        if (
          user.roles.includes('admin') &&
          !user.isTwoFactorEnabled &&
          pathname !== '/app/profile'
        ) {
          router.replace('/app/profile');
        } else {
          setChecked(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (!checked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div
          role="status"
          className="rounded-2xl border border-slate-800 bg-white px-6 py-5 text-sm font-medium text-slate-700 shadow-xl"
        >
          Verificando autenticação...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter();

  useInactivityTimeout(() => router.replace('/login'));

  return (
    <AuthGuard>
      <TwoFactorEnforcement>
        <div className="min-h-screen bg-slate-100 md:flex">
          <AppSidebar />
          <div className="min-w-0 flex-1">
            <AppHeader />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </TwoFactorEnforcement>
    </AuthGuard>
  );
}
