import { render, screen, waitFor } from '@testing-library/react';

import { DashboardHome } from './dashboard-home';
import { fetchDashboardKpis } from '@/lib/platform-api';

jest.mock('@/lib/platform-api', () => ({
  fetchDashboardKpis: jest.fn(),
}));

describe('DashboardHome', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (fetchDashboardKpis as jest.Mock).mockResolvedValue([
      {
        id: 'receita',
        title: 'Receita mensal',
        sector: 'Financeiro',
        value: 120000,
        previousValue: 108000,
        unit: 'currency',
      },
      {
        id: 'leads',
        title: 'Leads qualificados',
        sector: 'Comercial',
        value: 430,
        previousValue: 387,
        unit: 'number',
      },
      {
        id: 'sla',
        title: 'SLA operacional',
        sector: 'Operacoes',
        value: 0.92,
        previousValue: 0.83,
        unit: 'percent',
      },
    ]);
  });

  it('renderiza cards principais e resumo por setor', async () => {
    render(<DashboardHome />);

    expect(await screen.findByRole('heading', { name: 'Dashboard Home' })).toBeInTheDocument();
    expect(screen.getByText('Receita mensal')).toBeInTheDocument();
    expect(screen.getByText('Leads qualificados')).toBeInTheDocument();
    expect(screen.getByText('SLA operacional')).toBeInTheDocument();
    expect(screen.getAllByText('Financeiro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Comercial').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Operacoes').length).toBeGreaterThan(0);
  });

  it('renderiza fallback quando a carga falha', async () => {
    (fetchDashboardKpis as jest.Mock).mockRejectedValueOnce(new Error('falha'));

    render(<DashboardHome />);

    await waitFor(() => {
      expect(screen.getByText('Receita mensal')).toBeInTheDocument();
    });
  });
});
