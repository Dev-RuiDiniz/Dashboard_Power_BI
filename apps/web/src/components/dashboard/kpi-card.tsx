import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import { SparklineChart } from '@/components/charts';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  calculateKpiDelta,
  formatDelta,
  formatKpiValue,
  getKpiTrend,
  type KpiItem,
  type KpiTrend,
} from '@/lib/kpis';

type KpiCardProps = {
  kpi: KpiItem;
};

const trendLabel: Record<KpiTrend, string> = {
  positive: 'Tendencia positiva',
  negative: 'Tendencia negativa',
  neutral: 'Tendencia neutra',
};

const trendClassName: Record<KpiTrend, string> = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  negative: 'border-rose-200 bg-rose-50 text-rose-700',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
};

export function KpiCard({ kpi }: KpiCardProps) {
  const delta = calculateKpiDelta(kpi.value, kpi.previousValue ?? 0);
  const trend = getKpiTrend(delta);
  const TrendIcon =
    trend === 'positive' ? ArrowUpRight : trend === 'negative' ? ArrowDownRight : ArrowRight;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className="border border-slate-200 bg-white text-slate-700">{kpi.sector}</Badge>
          <Badge className={trendClassName[trend]}>
            <TrendIcon className="mr-1 h-3 w-3" aria-hidden="true" />
            {formatDelta(delta)}
          </Badge>
        </div>
        <CardTitle className="mt-4">{kpi.title}</CardTitle>
        <CardDescription>{trendLabel[trend]}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight text-slate-950">{formatKpiValue(kpi)}</p>
        <p className="mt-2 text-xs text-slate-500">Comparado ao periodo anterior</p>
        <div className="mt-3">
          <SparklineChart value={kpi.value} previousValue={kpi.previousValue ?? kpi.value} />
        </div>
      </CardContent>
    </Card>
  );
}
