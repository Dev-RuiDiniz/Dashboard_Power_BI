'use client';

import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query/query-client';

export function QueryClientProviderWrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
