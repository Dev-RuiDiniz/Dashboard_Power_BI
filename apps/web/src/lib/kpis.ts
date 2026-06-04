export type KpiUnit = 'number' | 'currency' | 'percent';
export type KpiTrend = 'positive' | 'negative' | 'neutral';

export type KpiItem = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue?: number;
  unit: KpiUnit;
};

export type SectorKpiSummary = {
  sector: string;
  total: number;
  averageDelta: number;
};

export type KpiSummary = {
  totalKpis: number;
  totalSectors: number;
  averageDelta: number;
};

const numberFormatter = new Intl.NumberFormat('pt-BR');
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function calculateKpiDelta(value: number, previousValue = 0): number {
  if (previousValue === 0) {
    return round(value === 0 ? 0 : 100);
  }

  return round(((value - previousValue) / Math.abs(previousValue)) * 100);
}

export function getKpiTrend(delta: number): KpiTrend {
  if (delta > 0) {
    return 'positive';
  }

  if (delta < 0) {
    return 'negative';
  }

  return 'neutral';
}

export function formatKpiValue({ value, unit }: Pick<KpiItem, 'value' | 'unit'>): string {
  if (unit === 'currency') {
    return currencyFormatter.format(value).replace(/\u00a0/g, ' ');
  }

  if (unit === 'percent') {
    const normalized = Math.abs(value) <= 1 ? value * 100 : value;
    return `${numberFormatter.format(round(normalized))}%`;
  }

  return numberFormatter.format(value);
}

export function formatDelta(delta: number): string {
  const formatted = `${numberFormatter.format(Math.abs(round(delta)))}%`;

  if (delta > 0) {
    return `+${formatted}`;
  }

  if (delta < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

export function aggregateKpisBySector(kpis: KpiItem[]): SectorKpiSummary[] {
  const bySector = kpis.reduce<Record<string, { total: number; deltaSum: number }>>((acc, kpi) => {
    const delta = calculateKpiDelta(kpi.value, kpi.previousValue ?? 0);

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

export function summarizeKpis(kpis: KpiItem[]): KpiSummary {
  const sectors = new Set(kpis.map((kpi) => kpi.sector));
  const deltaSum = kpis.reduce((sum, kpi) => sum + calculateKpiDelta(kpi.value, kpi.previousValue ?? 0), 0);

  return {
    totalKpis: kpis.length,
    totalSectors: sectors.size,
    averageDelta: kpis.length > 0 ? round(deltaSum / kpis.length) : 0,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
