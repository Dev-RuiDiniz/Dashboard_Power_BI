import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

import { ChartTooltip } from './chart-tooltip';

type BarChartWidgetProps = {
  title: string;
  description: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  color?: string;
  unit?: 'number' | 'currency' | 'percent';
  onBarClick?: (data: Record<string, unknown>) => void;
};

export function BarChartWidget({
  title,
  description,
  data,
  xKey,
  yKey,
  color = '#1d4ed8',
  unit = 'number',
  onBarClick,
}: BarChartWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip content={<ChartTooltip unit={unit} />} />
            <Bar
              dataKey={yKey}
              fill={color}
              radius={[8, 8, 0, 0]}
              onClick={(_, index) => {
                if (onBarClick) {
                  onBarClick(data[index] as Record<string, unknown>);
                }
              }}
              cursor={onBarClick ? 'pointer' : 'default'}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
