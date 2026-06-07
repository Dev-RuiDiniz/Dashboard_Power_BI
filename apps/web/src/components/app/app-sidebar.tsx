'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Bell,
  ChartBar as BarChart3,
  Download,
  LayoutDashboard,
  Settings,
  Star,
  UserCog,
  Users,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  {
    href: '/app',
    label: 'Visao geral',
    description: 'Dashboard com KPIs e indicadores.',
    icon: LayoutDashboard,
  },
  {
    href: '/app/reports',
    label: 'Relatorios',
    description: 'Catalogo de dashboards e consultas.',
    icon: BarChart3,
  },
  {
    href: '/app/dashboards',
    label: 'Personalizados',
    description: 'Dashboards, favoritos e atalhos do usuario.',
    icon: Star,
  },
  {
    href: '/app/exports',
    label: 'Exportacoes',
    description: 'Historico de exportacoes em PDF e Excel.',
    icon: Download,
  },
  {
    href: '/app/notifications',
    label: 'Notificacoes',
    description: 'Alertas e avisos importantes.',
    icon: Bell,
  },
  {
    href: '/app/admin/users',
    label: 'Usuarios',
    description: 'Gerenciamento de usuarios.',
    icon: UserCog,
  },
  {
    href: '/app/admin/groups',
    label: 'Grupos',
    description: 'Grupos de acesso e permissoes.',
    icon: Users,
  },
  {
    href: '/app/admin/settings',
    label: 'Configuracoes',
    description: 'Parametros globais do sistema.',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-800 bg-slate-950 p-4 md:min-h-screen md:w-72 md:border-b-0 md:border-r md:p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
          Dashboard Power BI
        </p>
        <h2 className="mt-3 text-xl font-bold text-white">Area autenticada</h2>
      </div>

      <nav aria-label="Navegacao autenticada" className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                isActive
                  ? 'border-blue-500 bg-slate-800'
                  : 'border-slate-800 bg-slate-900 hover:border-blue-500 hover:bg-slate-800'
              }`}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <div>
                <span className="block text-sm font-semibold text-white">{item.label}</span>
                <span className="block text-xs leading-5 text-slate-400">{item.description}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
