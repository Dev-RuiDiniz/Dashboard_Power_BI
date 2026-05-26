import { render, screen } from '@testing-library/react';

import { KpiCard } from './kpi-card';

describe('KpiCard', () => {
  it('renderiza titulo, setor, valor formatado e delta positivo', () => {
    render(
      <KpiCard
        kpi={{
          id: 'receita',
          title: 'Receita mensal',
          sector: 'Financeiro',
          value: 120000,
          previousValue: 100000,
          unit: 'currency',
        }}
      />,
    );

    expect(screen.getByText('Receita mensal')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
    expect(screen.getByText('R$ 120.000,00')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('Tendencia positiva')).toBeInTheDocument();
  });

  it('renderiza delta negativo', () => {
    render(
      <KpiCard
        kpi={{
          id: 'sla',
          title: 'SLA operacional',
          sector: 'Operacoes',
          value: 85,
          previousValue: 100,
          unit: 'percent',
        }}
      />,
    );

    expect(screen.getByText('-15%')).toBeInTheDocument();
    expect(screen.getByText('Tendencia negativa')).toBeInTheDocument();
  });

  it('renderiza tendencia neutra quando nao ha variacao', () => {
    render(
      <KpiCard
        kpi={{
          id: 'usuarios',
          title: 'Usuarios ativos',
          sector: 'Produto',
          value: 250,
          previousValue: 250,
          unit: 'number',
        }}
      />,
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Tendencia neutra')).toBeInTheDocument();
  });
});
