import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

import { ChartTooltip } from './chart-tooltip';

const COLORS = ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1e40af'];

type PieChartWidgetProps = {
  title: string;
  description: string;
  data: Array<Record<string, unknown>>;
  nameKey: string;
  valueKey: string;
  unit?: 'number' | 'currency' | 'percent';
};

export function PieChartWidget({
  title,
  description,
  data,
  nameKey,
  valueKey,
  unit = 'number',
}: PieChartWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey={valueKey}
              nameKey={nameKey}
              label={({ name, percent }) => `${String(name)} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip unit={unit} />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
