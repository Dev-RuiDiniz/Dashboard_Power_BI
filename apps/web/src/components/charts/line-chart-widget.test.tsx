import { render, screen } from '@testing-library/react';

import { LineChartWidget } from './line-chart-widget';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 280 }}>{children}</div>
    ),
  };
});

describe('LineChartWidget', () => {
  const sampleData = [
    { period: 'Jan', atual: 100, anterior: 90 },
    { period: 'Fev', atual: 150, anterior: 120 },
  ];

  it('renderiza titulo e descricao', () => {
    render(
      <LineChartWidget
        title="Evolucao"
        description="Serie temporal"
        data={sampleData}
        xKey="period"
        series={[
          { dataKey: 'atual', name: 'Atual', color: '#1d4ed8' },
          { dataKey: 'anterior', name: 'Anterior', color: '#94a3b8' },
        ]}
      />,
    );

    expect(screen.getByText('Evolucao')).toBeInTheDocument();
    expect(screen.getByText('Serie temporal')).toBeInTheDocument();
  });

  it('renderiza sem erros com dados vazios', () => {
    render(
      <LineChartWidget
        title="Vazio"
        description="Sem dados"
        data={[]}
        xKey="period"
        series={[{ dataKey: 'value', name: 'Valor', color: '#1d4ed8' }]}
      />,
    );

    expect(screen.getByText('Vazio')).toBeInTheDocument();
  });
});
