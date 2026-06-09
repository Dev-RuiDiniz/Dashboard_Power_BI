import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';

export type DashboardKpi = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue: number;
  unit: 'number' | 'currency' | 'percent';
};

export type DashboardSector = {
  id: string;
  code: string;
  name: string;
};

export type DashboardSectorSummary = {
  sector: string;
  total: number;
  averageDelta: number;
};

export type DashboardHomeChartPoint = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue: number;
  delta: number;
};

export type DashboardHomeResponse = {
  summary: {
    totalKpis: number;
    totalSectors: number;
    averageDelta: number;
  };
  kpis: DashboardKpi[];
  sectorSummaries: DashboardSectorSummary[];
  charts: {
    sectorDistribution: DashboardSectorSummary[];
    kpiPerformance: DashboardHomeChartPoint[];
  };
  availableDrilldowns: Array<{
    kpiId: string;
    label: string;
    dimension: 'sector';
  }>;
};

export type DashboardDrilldownResponse = {
  kpiId: string;
  label: string;
  dimension: 'sector';
  series: Array<{
    label: string;
    value: number;
  }>;
  rows: Array<{
    period: string;
    value: number;
    delta: number;
  }>;
};

export type KpiHistoryItem = {
  period: string;
  value: number;
  previousValue: number;
  delta: number;
};

export type KpiHistoryResponse = {
  kpiId: string;
  label: string;
  unit: DashboardKpi['unit'];
  periods: KpiHistoryItem[];
};

type DashboardKpiRow = {
  id: string;
  name: string;
  sector_id: string;
  target_value: number | string | null;
  unit: DashboardKpi['unit'] | null;
};

type DashboardSectorRow = {
  id: string;
  name: string;
};

@Injectable()
export class DashboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getHome(): Promise<DashboardHomeResponse> {
    const kpis = await this.listKpis();

    return buildDashboardHome(kpis);
  }

  async getKpiDrilldown(kpiId: string): Promise<DashboardDrilldownResponse> {
    const kpi = (await this.listKpis()).find((item) => item.id === kpiId);

    if (!kpi) {
      throw new NotFoundException('KPI nao encontrado.');
    }

    const delta = calculateKpiDelta(kpi.value, kpi.previousValue);

    return {
      kpiId: kpi.id,
      label: kpi.title,
      dimension: 'sector',
      series: [
        { label: 'Atual', value: kpi.value },
        { label: 'Anterior', value: kpi.previousValue },
      ],
      rows: [
        {
          period: 'Atual',
          value: kpi.value,
          delta,
        },
        {
          period: 'Anterior',
          value: kpi.previousValue,
          delta: 0,
        },
      ],
    };
  }

  async listKpis(): Promise<DashboardKpi[]> {
    if (!this.supabaseService.isEnabled()) {
      return this.getFallbackKpis();
    }

    const client = this.supabaseService.getClient();
    const [kpisResult, sectorsResult] = await Promise.all([
      client.from('kpis').select('*').eq('is_active', true),
      client.from('sectors').select('*').eq('is_active', true),
    ]);

    if (kpisResult.error) {
      throw kpisResult.error;
    }

    if (sectorsResult.error) {
      throw sectorsResult.error;
    }

    const sectorMap = new Map<string, { name: string }>();
    for (const sector of (sectorsResult.data ?? []) as DashboardSectorRow[]) {
      sectorMap.set(sector.id, { name: sector.name });
    }

    const items = ((kpisResult.data ?? []) as DashboardKpiRow[]).map((kpi) => {
      const sector = sectorMap.get(kpi.sector_id);
      const value = Number(kpi.target_value ?? 0);

      return {
        id: kpi.id,
        title: kpi.name,
        sector: sector?.name ?? kpi.sector_id,
        value,
        previousValue: Math.round(value * 0.9),
        unit: (kpi.unit ?? 'number') as DashboardKpi['unit'],
      };
    });

    return items.length > 0 ? items : this.getFallbackKpis();
  }

  async listSectors(): Promise<DashboardSector[]> {
    if (!this.supabaseService.isEnabled()) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('sectors')
      .select('id, code, name')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async getKpiHistory(kpiId: string): Promise<KpiHistoryResponse> {
    const kpi = (await this.listKpis()).find((item) => item.id === kpiId);

    if (!kpi) {
      throw new NotFoundException('KPI nao encontrado.');
    }

    const periods = this.buildKpiHistory(kpi.value, kpi.unit);

    return {
      kpiId: kpi.id,
      label: kpi.title,
      unit: kpi.unit,
      periods,
    };
  }

  private buildKpiHistory(currentValue: number, unit: DashboardKpi['unit']): KpiHistoryItem[] {
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    const now = new Date();
    const currentMonth = now.getMonth();
    const periods: KpiHistoryItem[] = [];

    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const period = months[monthIndex];
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variação
      const value = Math.max(0, round(currentValue * (1 + variation * (i / 12))));
      const previousValue = Math.max(0, round(value * (1 + (Math.random() - 0.5) * 0.1)));
      const delta = calculateKpiDelta(value, previousValue);

      periods.push({
        period,
        value: unit === 'currency' ? Math.round(value) : round(value),
        previousValue: unit === 'currency' ? Math.round(previousValue) : round(previousValue),
        delta,
      });
    }

    return periods;
  }

  private getFallbackKpis(): DashboardKpi[] {
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
    ];
  }
}

function buildDashboardHome(kpis: DashboardKpi[]): DashboardHomeResponse {
  const sectorSummaries = aggregateKpisBySector(kpis);
  const totalSectors = new Set(kpis.map((kpi) => kpi.sector)).size;
  const averageDelta =
    kpis.length > 0
      ? round(
          kpis.reduce((sum, kpi) => sum + calculateKpiDelta(kpi.value, kpi.previousValue), 0) /
            kpis.length,
        )
      : 0;

  return {
    summary: {
      totalKpis: kpis.length,
      totalSectors,
      averageDelta,
    },
    kpis,
    sectorSummaries,
    charts: {
      sectorDistribution: sectorSummaries,
      kpiPerformance: kpis.map((kpi) => ({
        id: kpi.id,
        title: kpi.title,
        sector: kpi.sector,
        value: kpi.value,
        previousValue: kpi.previousValue,
        delta: calculateKpiDelta(kpi.value, kpi.previousValue),
      })),
    },
    availableDrilldowns: kpis.map((kpi) => ({
      kpiId: kpi.id,
      label: kpi.title,
      dimension: 'sector' as const,
    })),
  };
}

function aggregateKpisBySector(kpis: DashboardKpi[]): DashboardSectorSummary[] {
  const bySector = kpis.reduce<Record<string, { total: number; deltaSum: number }>>((acc, kpi) => {
    const delta = calculateKpiDelta(kpi.value, kpi.previousValue);

    if (!acc[kpi.sector]) {
      acc[kpi.sector] = { total: 0, deltaSum: 0 };
    }

    acc[kpi.sector]!.total += 1;
    acc[kpi.sector]!.deltaSum += delta;

    return acc;
  }, {});

  return Object.entries(bySector).map(([sector, summary]) => ({
    sector,
    total: summary.total,
    averageDelta: round(summary.deltaSum / summary.total),
  }));
}

function calculateKpiDelta(value: number, previousValue = 0): number {
  if (previousValue === 0) {
    return round(value === 0 ? 0 : 100);
  }

  return round(((value - previousValue) / Math.abs(previousValue)) * 100);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
