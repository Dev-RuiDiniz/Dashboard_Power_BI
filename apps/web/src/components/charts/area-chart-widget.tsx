import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

import { ChartTooltip } from './chart-tooltip';

type AreaSeries = {
  dataKey: string;
  name: string;
  color: string;
  fillOpacity?: number;
};

type AreaChartWidgetProps = {
  title: string;
  description: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  series: AreaSeries[];
  unit?: 'number' | 'currency' | 'percent';
};

export function AreaChartWidget({
  title,
  description,
  data,
  xKey,
  series,
  unit = 'number',
}: AreaChartWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.dataKey}
                  id={`color-${s.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={s.fillOpacity ?? 0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<ChartTooltip unit={unit} />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                fill={`url(#color-${s.dataKey})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
