import { BarChart3, FileText, ShieldCheck } from 'lucide-react';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Relatórios',
    description: 'Centralização dos relatórios por setor, perfil e regra de acesso.',
    icon: FileText,
  },
  {
    title: 'Dashboards',
    description: 'Base preparada para dashboards interativos e indicadores operacionais.',
    icon: BarChart3,
  },
  {
    title: 'Administração',
    description: 'Fundação técnica para gestão de usuários, permissões e auditoria.',
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="rounded-2xl bg-slate-950 px-8 py-10 text-white shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300">
            Fundação Técnica
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Dashboard Power BI
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Plataforma web para centralizar relatórios, dashboards interativos, permissões por
            setor, exportações e administração.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">Next.js 14</span>
            <span className="rounded-full bg-white/10 px-4 py-2">App Router</span>
            <span className="rounded-full bg-white/10 px-4 py-2">Tailwind CSS</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title}>
                <Icon aria-hidden="true" className="h-6 w-6 text-slate-700" />
                <CardTitle className="mt-5">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </Card>
            );
          })}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Status da Sprint 1</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            A aplicação web foi inicializada com layout global, providers, Tailwind CSS, componentes
            base e rota home. A API NestJS pode ser validada em <code>/health</code> e documentada em
            <code> /docs</code>.
          </p>
        </section>
      </section>
    </main>
  );
}
