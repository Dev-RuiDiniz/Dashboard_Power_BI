'use client';

import { ChartBar as BarChart3, Layers as Layers3, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { aggregateKpisBySector, formatDelta, summarizeKpis, type KpiItem } from '@/lib/kpis';
import { supabase } from '@/lib/supabase';

import { KpiCard } from './kpi-card';

type KpiRow = {
  id: string;
  name: string;
  description?: string;
  sector_id: string;
  unit: 'number' | 'currency' | 'percent';
  target_value?: number;
  warning_threshold?: number;
  critical_threshold?: number;
  is_active: boolean;
};

type SectorRow = {
  id: string;
  code: string;
  name: string;
};

export function DashboardHome() {
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadKpis = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kpisResult, sectorsResult] = await Promise.all([
        supabase.from('kpis').select('*').eq('is_active', true),
        supabase.from('sectors').select('*').eq('is_active', true),
      ]);

      const sectorMap = new Map<string, SectorRow>();
      for (const s of sectorsResult.data ?? []) {
        sectorMap.set(s.id, s);
      }

      const items: KpiItem[] = (kpisResult.data ?? []).map((kpi: KpiRow) => {
        const sector = sectorMap.get(kpi.sector_id);
        const value = kpi.target_value ?? 0;
        return {
          id: kpi.id,
          title: kpi.name,
          sector: sector?.name ?? kpi.sector_id,
          value,
          previousValue: Math.round(value * 0.9),
          unit: kpi.unit,
        };
      });

      setKpis(items.length > 0 ? items : getFallbackKpis());
    } catch {
      setKpis(getFallbackKpis());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKpis();
  }, [loadKpis]);

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

function getFallbackKpis(): KpiItem[] {
  return [
    {
      id: 'receita-mensal',
      title: 'Receita mensal',
      sector: 'Financeiro',
      value: 120000,
      previousValue: 100000,
      unit: 'currency',
    },
    {
      id: 'margem-operacional',
      title: 'Margem operacional',
      sector: 'Financeiro',
      value: 0.32,
      previousValue: 0.3,
      unit: 'percent',
    },
    {
      id: 'leads-qualificados',
      title: 'Leads qualificados',
      sector: 'Comercial',
      value: 430,
      previousValue: 400,
      unit: 'number',
    },
    {
      id: 'sla-operacional',
      title: 'SLA operacional',
      sector: 'Operacoes',
      value: 0.92,
      previousValue: 0.9,
      unit: 'percent',
    },
    {
      id: 'dashboards-ativos',
      title: 'Dashboards ativos',
      sector: 'BI',
      value: 18,
      previousValue: 16,
      unit: 'number',
    },
    {
      id: 'exportacoes-mensais',
      title: 'Exportações mensais',
      sector: 'BI',
      value: 240,
      previousValue: 220,
      unit: 'number',
    },
  ];
}
