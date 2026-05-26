import { render, screen } from '@testing-library/react';

import { DashboardHome } from './dashboard-home';

describe('DashboardHome', () => {
  it('renderiza cards principais e resumo por setor', () => {
    render(
      <DashboardHome
        kpis={[
          { id: 'receita', title: 'Receita mensal', sector: 'Financeiro', value: 120000, previousValue: 100000, unit: 'currency' },
          { id: 'leads', title: 'Leads qualificados', sector: 'Comercial', value: 430, previousValue: 400, unit: 'number' },
          { id: 'sla', title: 'SLA operacional', sector: 'Operacoes', value: 0.92, previousValue: 0.9, unit: 'percent' },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Dashboard Home' })).toBeInTheDocument();
    expect(screen.getByText('Receita mensal')).toBeInTheDocument();
    expect(screen.getByText('Leads qualificados')).toBeInTheDocument();
    expect(screen.getByText('SLA operacional')).toBeInTheDocument();
    expect(screen.getAllByText('Financeiro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Comercial').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Operacoes').length).toBeGreaterThan(0);
  });

  it('renderiza estado vazio quando nao ha kpis', () => {
    render(<DashboardHome kpis={[]} />);

    expect(screen.getByText('Nenhum KPI disponivel')).toBeInTheDocument();
    expect(screen.getByText('Cadastre ou conecte indicadores para visualizar a home de BI.')).toBeInTheDocument();
  });
});
