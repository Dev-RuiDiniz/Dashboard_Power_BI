import Link from 'next/link';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Settings, Users, UserCog } from 'lucide-react';

const adminCards = [
  {
    href: '/app/admin/users',
    icon: UserCog,
    title: 'Usuarios',
    description: 'Crie, edite e desative usuarios. Gerencie roles, setores e redefina senhas.',
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
  return (
    <section className="space-y-6" aria-labelledby="admin-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Administracao</p>
        <h1 id="admin-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Painel administrativo
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Gerencie usuarios, grupos de acesso e configuracoes do sistema. Acesso restrito a administradores.
        </p>
      </div>

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
