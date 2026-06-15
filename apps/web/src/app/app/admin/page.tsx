'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { getAdminDashboard, type AdminDashboardMetrics } from '@/lib/admin-api';
import {
  Activity,
  FileDown,
  Loader2,
  Settings,
  TriangleAlert,
  Users,
  UserCog,
  UsersRound,
} from 'lucide-react';

const adminCards = [
  {
    href: '/app/admin/users',
    icon: UserCog,
    title: 'Usuarios',
    description: 'Crie, edite e desative usuários. Gerencie roles, setores e redefina senhas.',
  },
  {
    href: '/app/admin/groups',
    icon: Users,
    title: 'Grupos',
    description: 'Crie e gerencie grupos de acesso com permissoes e setores predefinidos.',
  },
  {
    href: '/app/admin/settings',
    icon: Settings,
    title: 'Configuracoes',
    description: 'Gerencie parametros globais da plataforma como SMTP, pool e cache.',
  },
];

export default function AdminPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await getAdminDashboard();
        setMetrics(data);
      } catch {
        setErrorMessage('Nao foi possivel carregar as metricas administrativas.');
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  const kpiItems = metrics
    ? [
        {
          label: 'Total de usuarios',
          value: metrics.totalUsers,
          icon: UsersRound,
          color: 'text-blue-700',
          bg: 'bg-blue-50',
        },
        {
          label: 'Usuarios ativos',
          value: metrics.activeUsers,
          icon: Users,
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
        },
        {
          label: 'Grupos',
          value: metrics.totalGroups,
          icon: UsersRound,
          color: 'text-violet-700',
          bg: 'bg-violet-50',
        },
        {
          label: 'Exportacoes',
          value: metrics.totalExports,
          icon: FileDown,
          color: 'text-amber-700',
          bg: 'bg-amber-50',
        },
      ]
    : [];

  return (
    <section className="space-y-6" aria-labelledby="admin-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Administração
        </p>
        <h1 id="admin-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Painel administrativo
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Gerencie usuários, grupos de acesso e configurações do sistema. Acesso restrito a
          administradores.
        </p>
      </div>

      {errorMessage && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center gap-3">
            <TriangleAlert className="h-5 w-5 text-amber-700" />
            <CardTitle className="text-base text-amber-800">{errorMessage}</CardTitle>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-8 w-8 rounded-xl bg-slate-200" />
                  <div className="mt-2 h-6 w-16 rounded bg-slate-200" />
                  <div className="mt-1 h-4 w-24 rounded bg-slate-200" />
                </CardHeader>
              </Card>
            ))
          : kpiItems.map((kpi) => (
              <Card key={kpi.label}>
                <CardHeader>
                  <div className={`w-fit rounded-2xl ${kpi.bg} p-3 ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{kpi.value}</p>
                  <CardDescription>{kpi.label}</CardDescription>
                </CardHeader>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Activity className="h-5 w-5 text-blue-700" />
          <CardTitle className="text-base">Atividade recente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : metrics && metrics.recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 font-medium">Usuario</th>
                    <th className="pb-2 font-medium">Acao</th>
                    <th className="pb-2 font-medium">Recurso</th>
                    <th className="pb-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentActivity.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 text-slate-700">{log.userEmail}</td>
                      <td className="py-2 text-slate-700">{log.action}</td>
                      <td className="py-2 text-slate-700">{log.resource}</td>
                      <td className="py-2 text-slate-500">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma atividade registrada recentemente.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="w-fit rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <card.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="mt-4">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
