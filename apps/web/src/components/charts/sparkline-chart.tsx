import { Line, LineChart, ResponsiveContainer } from 'recharts';

type SparklineChartProps = {
  value: number;
  previousValue: number;
  color?: string;
};

export function SparklineChart({ value, previousValue, color }: SparklineChartProps) {
  const isPositive = value >= previousValue;
  const trendColor = color ?? (isPositive ? '#10b981' : '#f43f5e');

  const data = [
    { v: previousValue },
    { v: previousValue + (value - previousValue) * 0.25 },
    { v: previousValue + (value - previousValue) * 0.5 },
    { v: previousValue + (value - previousValue) * 0.75 },
    { v: value },
  ];

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={trendColor}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
