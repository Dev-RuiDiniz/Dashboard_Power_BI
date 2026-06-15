import { render, screen } from '@testing-library/react';

import { PieChartWidget } from './pie-chart-widget';

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 280 }}>{children}</div>
    ),
  };
});

describe('PieChartWidget', () => {
  const sampleData = [
    { sector: 'Financeiro', total: 40 },
    { sector: 'Comercial', total: 30 },
    { sector: 'Operacoes', total: 30 },
  ];

  it('renderiza titulo e descricao', () => {
    render(
      <PieChartWidget
        title="Distribuicao"
        description="Por setor"
        data={sampleData}
        nameKey="sector"
        valueKey="total"
      />,
    );

    expect(screen.getByText('Distribuicao')).toBeInTheDocument();
    expect(screen.getByText('Por setor')).toBeInTheDocument();
  });

  it('renderiza sem erros com dados vazios', () => {
    render(
      <PieChartWidget
        title="Vazio"
        description="Sem dados"
        data={[]}
        nameKey="sector"
        valueKey="total"
      />,
    );

    expect(screen.getByText('Vazio')).toBeInTheDocument();
  });
});
