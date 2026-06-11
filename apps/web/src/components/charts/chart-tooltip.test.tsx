import { render, screen } from '@testing-library/react';

import { ChartTooltip } from './chart-tooltip';

describe('ChartTooltip', () => {
  it('retorna null quando nao esta ativo', () => {
    const { container } = render(<ChartTooltip active={false} payload={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('retorna null quando payload esta vazio', () => {
    const { container } = render(<ChartTooltip active payload={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza label e entradas do payload', () => {
    render(
      <ChartTooltip
        active
        label="Janeiro"
        payload={[
          { name: 'Atual', value: 120000, dataKey: 'value', color: '#1d4ed8' },
          { name: 'Anterior', value: 100000, dataKey: 'previous', color: '#94a3b8' },
        ]}
        unit="currency"
      />,
    );

    expect(screen.getByText('Janeiro')).toBeInTheDocument();
    expect(screen.getByText('Atual:')).toBeInTheDocument();
    expect(screen.getByText('R$ 120.000,00')).toBeInTheDocument();
    expect(screen.getByText('Anterior:')).toBeInTheDocument();
    expect(screen.getByText('R$ 100.000,00')).toBeInTheDocument();
  });

  it('formata valores percentuais corretamente', () => {
    render(
      <ChartTooltip
        active
        label="Margem"
        payload={[{ name: 'Valor', value: 0.32, dataKey: 'value', color: '#1d4ed8' }]}
        unit="percent"
      />,
    );

    expect(screen.getByText('32%')).toBeInTheDocument();
  });

  it('formata valores numericos corretamente', () => {
    render(
      <ChartTooltip
        active
        label="Leads"
        payload={[{ name: 'Valor', value: 430, dataKey: 'value', color: '#1d4ed8' }]}
        unit="number"
      />,
    );

    expect(screen.getByText('430')).toBeInTheDocument();
  });
});
