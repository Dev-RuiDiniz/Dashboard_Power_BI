import type { ReactNode } from 'react';

import { AuthenticatedLayout } from '@/components/app/authenticated-layout';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
