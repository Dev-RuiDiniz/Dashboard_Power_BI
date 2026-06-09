'use client';

import { ChartBar as BarChart3, Layers as Layers3, TriangleAlert, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  BarChartWidget,
  LineChartWidget,
  PieChartWidget,
  AreaChartWidget,
} from '@/components/charts';
import { formatDelta, type KpiItem } from '@/lib/kpis';
import {
  fetchDashboardDrilldown,
  fetchDashboardHome,
  fetchKpiHistory,
  type DashboardDrilldownResponse,
  type DashboardHomeResponse,
  type KpiHistoryResponse,
} from '@/lib/platform-api';

import { KpiCard } from './kpi-card';

export function DashboardHome() {
  const [home, setHome] = useState<DashboardHomeResponse | null>(null);
  const [drilldown, setDrilldown] = useState<DashboardDrilldownResponse | null>(null);
  const [history, setHistory] = useState<KpiHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHome = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setHome(await fetchDashboardHome());
      setDrilldown(null);
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

  const handleOpenDrilldown = useCallback(async (kpi: KpiItem) => {
    setErrorMessage(null);
    setHistory(null);
    try {
      const [drilldownData, historyData] = await Promise.all([
        fetchDashboardDrilldown(kpi.id),
        fetchKpiHistory(kpi.id),
      ]);
      setDrilldown(drilldownData);
      setHistory(historyData);
    } catch {
      setErrorMessage('Nao foi possivel carregar o drill-down do indicador.');
    }
  }, []);

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
          <div key={kpi.id} className="space-y-3">
            <KpiCard kpi={kpi as KpiItem} />
            <button
              type="button"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
              onClick={() => void handleOpenDrilldown(kpi as KpiItem)}
              aria-label={`Abrir drilldown ${kpi.title}`}
            >
              Abrir drill-down
            </button>
          </div>
        ))}
      </div>

      {drilldown ? (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{`Drill-down · ${drilldown.label}`}</CardTitle>
              <CardDescription>
                Detalhe tabular do indicador com comparativo entre valor atual e referencia
                anterior.
              </CardDescription>
            </div>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
              onClick={() => {
                setDrilldown(null);
                setHistory(null);
              }}
            >
              Voltar ao resumo
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {drilldown.series.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center"
                >
                  <p className="text-sm font-semibold text-slate-600">{`Serie ${item.label}`}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>

            {history && history.periods.length > 0 && (
              <div className="space-y-4">
                <LineChartWidget
                  title="Evolucao historica (12 meses)"
                  description="Serie temporal comparando valor atual com referencia anterior."
                  data={history.periods.map((p) => ({
                    period: p.period,
                    value: p.value,
                    previousValue: p.previousValue,
                  }))}
                  xKey="period"
                  series={[
                    { dataKey: 'value', name: 'Atual', color: '#1d4ed8' },
                    {
                      dataKey: 'previousValue',
                      name: 'Anterior',
                      color: '#94a3b8',
                      strokeDasharray: '4 4',
                    },
                  ]}
                  unit={history.unit}
                />

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Periodo</th>
                        <th className="px-4 py-3 font-medium">Valor</th>
                        <th className="px-4 py-3 font-medium">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {history.periods.map((row) => (
                        <tr key={row.period}>
                          <td className="px-4 py-3 font-medium text-slate-950">{row.period}</td>
                          <td className="px-4 py-3 text-slate-700">{row.value}</td>
                          <td className="px-4 py-3 text-slate-700">{formatDelta(row.delta)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <BarChartWidget
          title="Distribuicao por setor"
          description="Quantidade de KPIs e delta medio agrupados por area."
          data={home.charts.sectorDistribution.map((s) => ({
            sector: s.sector,
            total: s.total,
          }))}
          xKey="sector"
          yKey="total"
          unit="number"
        />

        <LineChartWidget
          title="Performance dos KPIs"
          description="Serie comparando o valor atual com a referencia anterior."
          data={home.charts.kpiPerformance.map((k) => ({
            title: k.title,
            value: k.value,
            previousValue: k.previousValue,
          }))}
          xKey="title"
          series={[
            { dataKey: 'value', name: 'Atual', color: '#1d4ed8' },
            {
              dataKey: 'previousValue',
              name: 'Anterior',
              color: '#94a3b8',
              strokeDasharray: '4 4',
            },
          ]}
          unit="number"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PieChartWidget
          title="Distribuicao percentual por setor"
          description="Proporcao de KPIs monitorados por area."
          data={home.charts.sectorDistribution.map((s) => ({
            sector: s.sector,
            total: s.total,
          }))}
          nameKey="sector"
          valueKey="total"
          unit="number"
        />

        <AreaChartWidget
          title="Tendencia de delta medio"
          description="Evolucao do delta medio por setor ao longo do tempo."
          data={home.charts.sectorDistribution.map((s) => ({
            sector: s.sector,
            averageDelta: s.averageDelta,
          }))}
          xKey="sector"
          series={[
            { dataKey: 'averageDelta', name: 'Delta medio', color: '#1d4ed8', fillOpacity: 0.3 },
          ]}
          unit="percent"
        />
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
