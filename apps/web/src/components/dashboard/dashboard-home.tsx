'use client';

import { ChartBar as BarChart3, Layers as Layers3, TriangleAlert, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { formatDelta, type KpiItem } from '@/lib/kpis';
import { fetchDashboardHome, type DashboardHomeResponse } from '@/lib/platform-api';

import { KpiCard } from './kpi-card';

export function DashboardHome() {
  const [home, setHome] = useState<DashboardHomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHome = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setHome(await fetchDashboardHome());
    } catch {
      setHome(null);
      setErrorMessage('Nao foi possivel carregar os indicadores de BI.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

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

  if (errorMessage) {
    return (
      <Card className="border-amber-200 bg-amber-50 text-center">
        <CardHeader>
          <TriangleAlert className="mx-auto h-8 w-8 text-amber-700" aria-hidden="true" />
          <CardTitle>{errorMessage}</CardTitle>
          <CardDescription>
            Verifique a API da plataforma e a persistencia do dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!home || home.kpis.length === 0) {
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
          Visao executiva dos principais indicadores por setor, com series prontas para analise,
          charts reais e base consolidada para drill-down.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={BarChart3}
          label="KPIs monitorados"
          value={String(home.summary.totalKpis)}
        />
        <SummaryCard
          icon={Layers3}
          label="Setores cobertos"
          value={String(home.summary.totalSectors)}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Delta medio"
          value={formatDelta(home.summary.averageDelta)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {home.kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi as KpiItem} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Distribuicao por setor"
          description="Quantidade de KPIs e delta medio agrupados por area."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={home.charts.sectorDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="sector" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Performance dos KPIs"
          description="Serie comparando o valor atual com a referencia anterior."
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={home.charts.kpiPerformance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1d4ed8" strokeWidth={3} />
              <Line
                type="monotone"
                dataKey="previousValue"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPIs por setor</CardTitle>
          <CardDescription>Total de indicadores e delta medio agrupados por area.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {home.sectorSummaries.map((sector) => (
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

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
