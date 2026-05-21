import { BarChart3 } from 'lucide-react';

import { Badge } from '@/components/ui';

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BarChart3 aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Dashboard Power BI</p>
            <p className="text-xs text-muted-foreground">Fundação técnica da Sprint 1</p>
          </div>
        </div>
        <nav aria-label="Navegação principal" className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
          <a href="/">Home</a>
          <a href="/design-system">Design system</a>
          <Badge variant="success">Online</Badge>
        </nav>
      </div>
    </header>
  );
}
