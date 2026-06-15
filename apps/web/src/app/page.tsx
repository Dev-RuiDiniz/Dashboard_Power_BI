import Link from 'next/link';
import { ArrowRight, LockKeyhole, ShieldCheck, SquareChartGantt } from 'lucide-react';

const pillars = [
  {
    title: 'Controle de acesso',
    description:
      'Permissoes por perfil e setor para distribuir informacao com seguranca e clareza.',
    icon: LockKeyhole,
  },
  {
    title: 'Visao consolidada',
    description:
      'Relatorios e dashboards reunidos em uma unica experiencia para apoiar decisao e acompanhamento.',
    icon: SquareChartGantt,
  },
  {
    title: 'Operacao mais segura',
    description:
      'Governanca sobre consultas, exportacoes e administracao para reduzir risco operacional.',
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
          <div className="grid gap-10 px-8 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:px-14">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.32em] text-slate-300">
                Plataforma institucional
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Dashboard Power BI
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Um ambiente central para governanca, visibilidade e controle sobre indicadores,
                relatorios e acessos da operacao.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Entrar na plataforma
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-300">
                Valor para o cliente
              </p>
              <div className="mt-6 space-y-5">
                <div>
                  <span className="text-3xl font-semibold">1</span>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Entrada unica para acompanhar informacoes criticas com menos dispersao.
                  </p>
                </div>
                <div className="border-t border-white/10 pt-5">
                  <span className="text-3xl font-semibold">100%</span>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Estrutura preparada para demonstracao local com acessos seedados e dados
                    mockados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article
                key={pillar.title}
                className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
