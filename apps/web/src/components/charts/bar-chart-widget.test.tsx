import { render, screen } from '@testing-library/react';

import { BarChartWidget } from './bar-chart-widget';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 280 }}>{children}</div>
    ),
  };
});

describe('BarChartWidget', () => {
  const sampleData = [
    { label: 'Jan', value: 100 },
    { label: 'Fev', value: 150 },
    { label: 'Mar', value: 120 },
  ];

  it('renderiza titulo e descricao', () => {
    render(
      <BarChartWidget
        title="Faturamento mensal"
        description="Comparativo mensal de receita"
        data={sampleData}
        xKey="label"
        yKey="value"
      />,
    );

    expect(screen.getByText('Faturamento mensal')).toBeInTheDocument();
    expect(screen.getByText('Comparativo mensal de receita')).toBeInTheDocument();
  });

  it('renderiza sem erros com dados vazios', () => {
    render(
      <BarChartWidget title="Vazio" description="Sem dados" data={[]} xKey="label" yKey="value" />,
    );

    expect(screen.getByText('Vazio')).toBeInTheDocument();
  });

  it('renderiza com onBarClick sem erros', () => {
    const handleClick = jest.fn();
    render(
      <BarChartWidget
        title="Clique"
        description="Teste de click"
        data={sampleData}
        xKey="label"
        yKey="value"
        onBarClick={handleClick}
      />,
    );

    expect(screen.getByText('Clique')).toBeInTheDocument();
  });
});
