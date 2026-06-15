'use client';

import { ChartBar as BarChart3, Layers as Layers3, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { demoKpis, getAppDataClient } from '@/lib/app-data';
import { aggregateKpisBySector, formatDelta, summarizeKpis, type KpiItem } from '@/lib/kpis';

import { KpiCard } from './kpi-card';

type DashboardHomeProps = {
  kpis?: KpiItem[];
};

export function DashboardHome({ kpis: initialKpis }: DashboardHomeProps) {
  const [kpis, setKpis] = useState<KpiItem[]>(initialKpis ?? []);
  const [isLoading, setIsLoading] = useState(initialKpis === undefined);

  const loadKpis = useCallback(async () => {
    const client = getAppDataClient();

    setIsLoading(true);
    try {
      const items = await client.listKpis();
      setKpis(items.length > 0 ? items : demoKpis);
    } catch {
      setKpis(demoKpis);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialKpis !== undefined) {
      return;
    }

    void loadKpis();
  }, [initialKpis, loadKpis]);

  if (isLoading) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700"
            aria-hidden="true"
          />
          <CardTitle>Carregando indicadores</CardTitle>
          <CardDescription>Consultando KPIs e dados setoriais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (kpis.length === 0) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader>
          <CardTitle>Nenhum KPI disponivel</CardTitle>
          <CardDescription>
            Cadastre ou conecte indicadores para visualizar a home de BI.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const summary = summarizeKpis(kpis);
  const sectors = aggregateKpisBySector(kpis);

  return (
    <section className="space-y-6" aria-labelledby="dashboard-home-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Sprint 4 · BI
        </p>
        <h1
          id="dashboard-home-title"
          className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
        >
          Dashboard Home
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Visao executiva dos principais indicadores por setor, com delta percentual em relacao ao
          periodo anterior e cards resumidos para acompanhamento rapido.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={BarChart3} label="KPIs monitorados" value={String(summary.totalKpis)} />
        <SummaryCard icon={Layers3} label="Setores cobertos" value={String(summary.totalSectors)} />
        <SummaryCard
          icon={TrendingUp}
          label="Delta medio"
          value={formatDelta(summary.averageDelta)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPIs por setor</CardTitle>
          <CardDescription>Total de indicadores e delta medio agrupados por area.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {sectors.map((sector) => (
            <div key={sector.sector} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">{sector.sector}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{sector.total}</p>
              <p className="mt-1 text-xs text-slate-500">
                Delta medio {formatDelta(sector.averageDelta)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

type SummaryCardProps = {
  icon: typeof BarChart3;
  label: string;
  value: string;
};

function SummaryCard({ icon: Icon, label, value }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
