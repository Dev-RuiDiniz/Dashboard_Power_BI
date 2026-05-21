import { BarChart3, FileText, LayoutDashboard, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';

const items = [
  { label: 'Visão geral', href: '/', icon: LayoutDashboard },
  { label: 'Relatórios', href: '/reports', icon: FileText },
  { label: 'Dashboards', href: '/dashboards', icon: BarChart3 },
  { label: 'Administração', href: '/admin', icon: Settings },
];

export function Sidebar({ activePath = '/' }: { activePath?: string }) {
  return (
    <aside className="hidden min-h-[calc(100vh-73px)] w-72 border-r border-border bg-white px-4 py-6 lg:block">
      <nav aria-label="Menu lateral" className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === activePath;
          return (
            <a key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground', active && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground')}>
              <Icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
