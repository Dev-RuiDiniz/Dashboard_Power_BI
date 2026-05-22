import type { ReactNode } from 'react';

import { AuthGuard } from '@/components/auth/auth-guard';

import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-100 md:flex">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <AppHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
