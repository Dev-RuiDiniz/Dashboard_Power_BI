type SparklineChartProps = {
  value: number;
  previousValue: number;
  color?: string;
};

export function SparklineChart({ value, previousValue, color }: SparklineChartProps) {
  const isPositive = value >= previousValue;
  const trendColor = color ?? (isPositive ? '#10b981' : '#f43f5e');
  const points = buildPoints(value, previousValue);

  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full" aria-hidden="true" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={trendColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

function buildPoints(value: number, previousValue: number) {
  const values = [
    previousValue,
    previousValue + (value - previousValue) * 0.25,
    previousValue + (value - previousValue) * 0.5,
    previousValue + (value - previousValue) * 0.75,
    value,
  ];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((currentValue, index) => {
      const x = index * 25;
      const y = 36 - ((currentValue - min) / range) * 32;

      return `${x},${Math.round(y * 100) / 100}`;
    })
    .join(' ');
}
