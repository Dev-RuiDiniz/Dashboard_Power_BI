'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ChartBar as BarChart3,
  ChevronRight,
  Clock3,
  Layers as Layers3,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BarChartWidget } from '@/components/charts/bar-chart-widget';
import { LineChartWidget } from '@/components/charts/line-chart-widget';
import { PieChartWidget } from '@/components/charts/pie-chart-widget';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  calculateKpiDelta,
  formatDelta,
  formatKpiValue,
  type BusinessArea,
  type KpiItem,
} from '@/lib/kpis';
import {
  fetchDashboardDrilldown,
  fetchDashboardHome,
  fetchKpiHistory,
  type DashboardDrilldownResponse,
  type DashboardHomeResponse,
  type DrilldownDimension,
  type KpiHistoryResponse,
} from '@/lib/platform-api';

import { KpiCard } from './kpi-card';

const BUSINESS_AREA_LABEL: Record<BusinessArea, string> = {
  producao: 'Producao',
  comercial: 'Comercial',
  algodoeira: 'Algodoeira',
};

const TAB_LABELS = {
  executiva: 'Executiva',
  analitica: 'Analitica',
  operacional: 'Operacional',
} as const;

type DashboardTab = keyof typeof TAB_LABELS;

type DashboardHomeProps = {
  kpis?: KpiItem[];
};

type RankedKpi = KpiItem & {
  delta: number;
};

export function DashboardHome({ kpis: initialKpis }: DashboardHomeProps) {
  const [home, setHome] = useState<DashboardHomeResponse | null>(
    initialKpis
      ? {
          summary: { totalKpis: initialKpis.length, totalSectors: 0, averageDelta: 0 },
          kpis: initialKpis,
          businessAreas: [],
          sectorSummaries: [],
          charts: { sectorDistribution: [], kpiPerformance: [] },
          availableDrilldowns: [],
        }
      : null,
  );
  const [isLoading, setIsLoading] = useState(initialKpis === undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDrilldown, setActiveDrilldown] = useState<DashboardDrilldownResponse | null>(null);
  const [isDrilldownLoading, setIsDrilldownLoading] = useState(false);
  const [activeKpiId, setActiveKpiId] = useState<string | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<DrilldownDimension | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useState<DashboardTab>('executiva');
  const [featuredHistory, setFeaturedHistory] = useState<KpiHistoryResponse | null>(null);

  const loadHome = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchDashboardHome();
      setHome(response);
    } catch {
      setErrorMessage('Nao foi possivel carregar os indicadores de BI.');
      setHome(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialKpis !== undefined) {
      return;
    }

    void loadHome();
  }, [initialKpis, loadHome]);

  const groupedKpis = useMemo(() => {
    const items = new Map<BusinessArea, KpiItem[]>();

    for (const kpi of home?.kpis ?? []) {
      const key = kpi.businessArea ?? inferBusinessArea(kpi.sector);
      const current = items.get(key) ?? [];
      current.push(kpi);
      items.set(key, current);
    }

    return items;
  }, [home?.kpis]);

  const rankedKpis = useMemo<RankedKpi[]>(
    () =>
      [...(home?.kpis ?? [])]
        .map((kpi) => ({
          ...kpi,
          delta: calculateKpiDelta(kpi.value, kpi.previousValue ?? 0),
        }))
        .sort((left, right) => right.delta - left.delta),
    [home?.kpis],
  );

  const strongestPositive = rankedKpis[0] ?? null;
  const strongestNegative =
    [...rankedKpis].sort((left, right) => left.delta - right.delta)[0] ?? null;
  const mostStable =
    [...rankedKpis].sort((left, right) => Math.abs(left.delta) - Math.abs(right.delta))[0] ?? null;

  useEffect(() => {
    if (!strongestPositive) {
      setFeaturedHistory(null);
      return;
    }

    let ignore = false;

    void fetchKpiHistory(strongestPositive.id)
      .then((response) => {
        if (!ignore) {
          setFeaturedHistory(response);
        }
      })
      .catch(() => {
        if (!ignore) {
          setFeaturedHistory(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [strongestPositive]);

  const heroAreaCount = home?.businessAreas.length || home?.summary.totalSectors || 0;
  const lineData =
    featuredHistory?.periods.map((item) => ({
      period: item.period,
      atual: item.value,
      anterior: item.previousValue,
    })) ?? [];
  const distributionData =
    home?.charts.sectorDistribution.map((item) => ({
      sector: item.sector,
      total: item.total,
    })) ?? [];
  const performanceData =
    home?.charts.kpiPerformance.slice(0, 6).map((item) => ({
      title: item.title,
      delta: item.delta,
    })) ?? [];
  const operationalItems = [...rankedKpis]
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    .slice(0, 5);

  const openDrilldown = useCallback(async (kpiId: string, dimension?: DrilldownDimension) => {
    setIsDrilldownLoading(true);
    setErrorMessage(null);
    setActiveKpiId(kpiId);
    setSelectedDimension(dimension);

    try {
      const response = await fetchDashboardDrilldown(kpiId, dimension);
      setActiveDrilldown(response);
    } catch {
      setErrorMessage('Nao foi possivel carregar o drill-down selecionado.');
    } finally {
      setIsDrilldownLoading(false);
    }
  }, []);

  const switchDimension = useCallback(
    async (dimension: DrilldownDimension) => {
      if (!activeKpiId) return;
      await openDrilldown(activeKpiId, dimension);
    },
    [activeKpiId, openDrilldown],
  );

  const closeDrilldown = useCallback(() => {
    setActiveDrilldown(null);
    setActiveKpiId(null);
    setSelectedDimension(undefined);
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
          <CardDescription>
            Consultando KPIs do Oracle e consolidando a home executiva.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage && !home) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardHeader>
          <CardTitle>Falha ao carregar a home</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
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
            Conecte a fonte Oracle para visualizar os indicadores executivos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (activeDrilldown) {
    const activeDimensionLabel =
      activeDrilldown.availableDimensions.find((d) => d.dimension === activeDrilldown.dimension)
        ?.label ?? activeDrilldown.dimension;

    return (
      <section className="space-y-6" aria-labelledby="dashboard-drilldown-title">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <nav className="flex items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={closeDrilldown}
              className="font-medium text-blue-700 hover:underline"
            >
              Home
            </button>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium text-slate-700">{activeDrilldown.label}</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold text-slate-950">{activeDimensionLabel}</span>
          </nav>

          <div className="mt-4 flex items-center justify-between">
            <h1
              id="dashboard-drilldown-title"
              className="text-3xl font-bold tracking-tight text-slate-950"
            >
              {`Drill-down · ${activeDrilldown.label}`}
            </h1>
            <Button variant="outline" onClick={closeDrilldown} aria-label="Voltar ao resumo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao resumo
            </Button>
          </div>

          {activeDrilldown.availableDimensions.length > 0 && (
            <div
              className="mt-4 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Seletor de dimensão do drill-down"
            >
              {activeDrilldown.availableDimensions.map((dim) => {
                const isActive = dim.dimension === activeDrilldown.dimension;
                return (
                  <button
                    key={dim.dimension}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => void switchDimension(dim.dimension)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {dim.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {isDrilldownLoading && (
          <Card className="border-dashed text-center">
            <CardHeader>
              <div
                className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700"
                aria-hidden="true"
              />
              <CardTitle>Carregando drill-down</CardTitle>
            </CardHeader>
          </Card>
        )}

        {!isDrilldownLoading && activeDrilldown.rows.length === 0 && (
          <Card className="border-dashed text-center">
            <CardHeader>
              <CardTitle>Dados insuficientes</CardTitle>
              <CardDescription>
                Nao ha dados para esta dimensao no periodo selecionado.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isDrilldownLoading && activeDrilldown.rows.length > 0 && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do KPI</CardTitle>
                  <CardDescription>Atual versus anterior</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {activeDrilldown.series.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-500">
                        {item.label === 'Atual' ? 'Atual' : 'Valor anterior'}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento por {activeDimensionLabel}</CardTitle>
                  <CardDescription>Evolucao do drill-down carregado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeDrilldown.rows.map((row) => (
                    <div
                      key={row.period}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-950">{row.period}</p>
                        <p className="text-lg font-bold text-slate-950">{row.value}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Delta {formatDelta(row.delta)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Itens do drill-down</CardTitle>
                <CardDescription>
                  Top grupos por {activeDimensionLabel.toLowerCase()} retornados pela API.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeDrilldown.rows.map((row) => (
                  <div
                    key={row.period}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{row.period}</p>
                      <p className="text-xs text-slate-500">Delta {formatDelta(row.delta)}</p>
                    </div>
                    <p className="text-lg font-bold text-slate-950">{row.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="dashboard-home-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Oracle · Home executiva
        </p>
        <h1
          id="dashboard-home-title"
          className="mt-3 text-3xl font-bold tracking-tight text-slate-950"
        >
          Dashboard Home
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Visao executiva consolidada para Producao, Comercial e Algodoeira, com KPIs reais do
          Oracle.
        </p>
        {errorMessage ? <p className="mt-3 text-sm text-rose-600">{errorMessage}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={BarChart3}
          label="KPIs monitorados"
          value={String(home.summary.totalKpis)}
        />
        <SummaryCard icon={Layers3} label="Areas cobertas" value={String(heroAreaCount)} />
        <SummaryCard
          icon={TrendingUp}
          label="Delta medio"
          value={formatDelta(home.summary.averageDelta)}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-2 shadow-sm">
        <div
          role="tablist"
          aria-label="Modos da home de KPIs"
          className="grid gap-2 md:grid-cols-3"
        >
          {(Object.entries(TAB_LABELS) as Array<[DashboardTab, string]>).map(([tabId, label]) => {
            const isActive = activeTab === tabId;

            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-label={label}
                aria-selected={isActive}
                aria-controls={`panel-${tabId}`}
                id={`tab-${tabId}`}
                onClick={() => setActiveTab(tabId)}
                className={`rounded-xl px-4 py-3 text-left transition ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <p className="text-sm font-semibold">{label}</p>
                <p className={`mt-1 text-xs ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                  {tabId === 'executiva'
                    ? 'Leitura de topo para decisao rapida'
                    : tabId === 'analitica'
                      ? 'Graficos comparativos e linha do tempo'
                      : 'Pendencias, variacoes e acompanhamento'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'executiva' ? (
        <section
          id="panel-executiva"
          role="tabpanel"
          aria-labelledby="tab-executiva"
          className="space-y-6"
        >
          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 text-white">
              <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                    Principal destaque do periodo
                  </p>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {strongestPositive?.title ?? 'Sem destaque principal'}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                      {strongestPositive
                        ? `${BUSINESS_AREA_LABEL[strongestPositive.businessArea ?? inferBusinessArea(strongestPositive.sector)]} lidera o periodo com ${formatDelta(strongestPositive.delta)} sobre a base anterior.`
                        : 'Assim que houver historico, a home destaca o melhor movimento do periodo.'}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <HighlightChip
                      icon={BarChart3}
                      label="KPIs monitorados"
                      value={String(home.summary.totalKpis)}
                    />
                    <HighlightChip
                      icon={Layers3}
                      label="Areas cobertas"
                      value={String(heroAreaCount)}
                    />
                    <HighlightChip
                      icon={TrendingUp}
                      label="Delta medio"
                      value={formatDelta(home.summary.averageDelta)}
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  <MetricCallout
                    title="Maior avanco"
                    value={strongestPositive ? formatDelta(strongestPositive.delta) : '0%'}
                    description={strongestPositive?.title ?? 'Sem KPI'}
                    tone="positive"
                  />
                  <MetricCallout
                    title="Maior atencao"
                    value={strongestNegative ? formatDelta(strongestNegative.delta) : '0%'}
                    description={strongestNegative?.title ?? 'Sem KPI'}
                    tone="negative"
                  />
                  <MetricCallout
                    title="Mais estavel"
                    value={mostStable ? formatDelta(mostStable.delta) : '0%'}
                    description={mostStable?.title ?? 'Sem KPI'}
                    tone="neutral"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maiores destaques</CardTitle>
                <CardDescription>
                  Leitura curta para direcao e acompanhamento executivo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  strongestPositive
                    ? { label: 'Maior avanco', kpi: strongestPositive, icon: TrendingUp }
                    : null,
                  strongestNegative
                    ? { label: 'Maior atencao', kpi: strongestNegative, icon: TrendingDown }
                    : null,
                  mostStable ? { label: 'Mais estavel', kpi: mostStable, icon: Clock3 } : null,
                ]
                  .filter(
                    (item): item is { label: string; kpi: RankedKpi; icon: LucideIcon } =>
                      item !== null,
                  )
                  .map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-2 text-lg font-bold text-slate-950">
                              {item.kpi.title}
                            </p>
                          </div>
                          <Icon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{formatDelta(item.kpi.delta)}</p>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            {lineData.length > 0 ? (
              <LineChartWidget
                title="Linha do tempo principal"
                description={featuredHistory?.label ?? 'Timeline historica'}
                data={lineData}
                xKey="period"
                unit={featuredHistory?.unit ?? 'number'}
                series={[
                  { dataKey: 'atual', name: 'Atual', color: '#2563eb' },
                  {
                    dataKey: 'anterior',
                    name: 'Anterior',
                    color: '#94a3b8',
                    strokeDasharray: '6 4',
                  },
                ]}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Linha do tempo principal</CardTitle>
                  <CardDescription>
                    Serie historica ainda indisponivel para o KPI em destaque.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Leitura por area</CardTitle>
                <CardDescription>KPIs agrupados por frente de negocio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {home.businessAreas.map((area) => (
                  <div
                    key={area.businessArea}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{area.label}</p>
                      <p className="text-sm font-bold text-slate-950">{area.total}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Delta medio {formatDelta(area.averageDelta)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {(Object.keys(BUSINESS_AREA_LABEL) as BusinessArea[]).map((businessArea) => {
            const items = groupedKpis.get(businessArea) ?? [];
            if (items.length === 0) {
              return null;
            }

            return (
              <Card key={businessArea}>
                <CardHeader>
                  <CardTitle>{BUSINESS_AREA_LABEL[businessArea]}</CardTitle>
                  <CardDescription>
                    KPIs principais desta frente com acesso rapido ao drill-down.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {items.map((kpi) => (
                    <div key={kpi.id} className="space-y-3">
                      <KpiCard kpi={kpi} />
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => void openDrilldown(kpi.id)}
                        disabled={isDrilldownLoading}
                        aria-label={`Abrir drilldown ${kpi.title}`}
                      >
                        Abrir drill-down
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </section>
      ) : null}

      {activeTab === 'analitica' ? (
        <section
          id="panel-analitica"
          role="tabpanel"
          aria-labelledby="tab-analitica"
          className="space-y-6"
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <PieChartWidget
              title="Distribuicao por setor"
              description="Participacao de KPIs por setor consolidado na home."
              data={distributionData}
              nameKey="sector"
              valueKey="total"
            />
            <BarChartWidget
              title="Performance dos KPIs"
              description="Comparacao das variacoes mais relevantes do periodo."
              data={performanceData}
              xKey="title"
              yKey="delta"
              unit="percent"
              color="#0f766e"
            />
          </div>

          {lineData.length > 0 ? (
            <LineChartWidget
              title="Timeline comparativa"
              description="Evolucao temporal do KPI em destaque versus periodo anterior."
              data={lineData}
              xKey="period"
              unit={featuredHistory?.unit ?? 'number'}
              series={[
                { dataKey: 'atual', name: 'Atual', color: '#1d4ed8' },
                { dataKey: 'anterior', name: 'Anterior', color: '#64748b', strokeDasharray: '5 5' },
              ]}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Timeline comparativa</CardTitle>
                <CardDescription>
                  Sem serie historica disponivel para a comparacao visual.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
      ) : null}

      {activeTab === 'operacional' ? (
        <section
          id="panel-operacional"
          role="tabpanel"
          aria-labelledby="tab-operacional"
          className="space-y-6"
        >
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Acompanhamento operacional</CardTitle>
                <CardDescription>
                  Panorama do volume atual, comparativo anterior e tendencia imediata.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {operationalItems.map((kpi) => (
                  <button
                    key={kpi.id}
                    type="button"
                    onClick={() => void openDrilldown(kpi.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{kpi.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {BUSINESS_AREA_LABEL[kpi.businessArea ?? inferBusinessArea(kpi.sector)]} ·{' '}
                        {kpi.sector}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-950">{formatKpiValue(kpi)}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {formatDelta(kpi.delta)}
                      </p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Itens que pedem atencao</CardTitle>
                <CardDescription>
                  Foco rapido nos indicadores com maior variacao absoluta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {operationalItems.map((kpi) => (
                  <div key={kpi.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950">{kpi.title}</p>
                          <p className="text-xs text-slate-500">{kpi.sector}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-950">{formatDelta(kpi.delta)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}
    </section>
  );
}

type SummaryCardProps = {
  icon: LucideIcon;
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

function HighlightChip({ icon: Icon, label, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/10 p-2 text-blue-100">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">{label}</p>
          <p className="mt-1 text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

type MetricCalloutProps = {
  title: string;
  value: string;
  description: string;
  tone: 'positive' | 'negative' | 'neutral';
};

function MetricCallout({ title, value, description, tone }: MetricCalloutProps) {
  const toneClassName =
    tone === 'positive'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
      : tone === 'negative'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-100'
        : 'border-white/20 bg-white/10 text-slate-100';

  return (
    <div className={`rounded-2xl border p-4 ${toneClassName}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{title}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="mt-2 text-sm opacity-90">{description}</p>
    </div>
  );
}

function inferBusinessArea(sector: string): BusinessArea {
  const normalized = sector.toLowerCase();
  if (normalized.includes('algod')) {
    return 'algodoeira';
  }
  if (normalized.includes('comercial')) {
    return 'comercial';
  }
  return 'producao';
}
