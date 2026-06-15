import { formatKpiValue } from '@/lib/kpis';

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
  unit?: 'number' | 'currency' | 'percent';
};

export function ChartTooltip({ active, payload, label, unit = 'number' }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-500">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-slate-600">{entry.name}:</span>
            <span className="text-xs font-medium text-slate-950">
              {formatKpiValue({ value: entry.value, unit })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
