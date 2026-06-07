import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DashboardHome } from './dashboard-home';
import { fetchDashboardDrilldown, fetchDashboardHome } from '@/lib/platform-api';

jest.mock('@/lib/platform-api', () => ({
  fetchDashboardDrilldown: jest.fn(),
  fetchDashboardHome: jest.fn(),
}));

describe('DashboardHome', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    });
    (fetchDashboardHome as jest.Mock).mockResolvedValue({
      summary: {
        totalKpis: 3,
        totalSectors: 3,
        averageDelta: 10.5,
      },
      kpis: [
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
      ],
      sectorSummaries: [
        { sector: 'Financeiro', total: 1, averageDelta: 11.11 },
        { sector: 'Comercial', total: 1, averageDelta: 11.11 },
        { sector: 'Operacoes', total: 1, averageDelta: 10.84 },
      ],
      charts: {
        sectorDistribution: [
          { sector: 'Financeiro', total: 1, averageDelta: 11.11 },
          { sector: 'Comercial', total: 1, averageDelta: 11.11 },
          { sector: 'Operacoes', total: 1, averageDelta: 10.84 },
        ],
        kpiPerformance: [
          {
            id: 'receita',
            title: 'Receita mensal',
            sector: 'Financeiro',
            value: 120000,
            previousValue: 108000,
            delta: 11.11,
          },
          {
            id: 'leads',
            title: 'Leads qualificados',
            sector: 'Comercial',
            value: 430,
            previousValue: 387,
            delta: 11.11,
          },
        ],
      },
      availableDrilldowns: [{ kpiId: 'receita', label: 'Receita mensal', dimension: 'sector' }],
    });
    (fetchDashboardDrilldown as jest.Mock).mockResolvedValue({
      kpiId: 'receita',
      label: 'Receita mensal',
      dimension: 'sector',
      series: [
        { label: 'Atual', value: 120000 },
        { label: 'Anterior', value: 108000 },
      ],
      rows: [
        { period: 'Atual', value: 120000, delta: 11.11 },
        { period: 'Anterior', value: 108000, delta: 0 },
      ],
    });
  });

  it('renderiza cards principais, resumo por setor e charts de BI', async () => {
    render(<DashboardHome />);

    expect(await screen.findByRole('heading', { name: 'Dashboard Home' })).toBeInTheDocument();
    expect(screen.getByText('Receita mensal')).toBeInTheDocument();
    expect(screen.getByText('Leads qualificados')).toBeInTheDocument();
    expect(screen.getByText('SLA operacional')).toBeInTheDocument();
    expect(screen.getAllByText('Financeiro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Comercial').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Operacoes').length).toBeGreaterThan(0);
    expect(screen.getByText('Distribuicao por setor')).toBeInTheDocument();
    expect(screen.getByText('Performance dos KPIs')).toBeInTheDocument();
  });

  it('renderiza fallback quando a carga falha', async () => {
    (fetchDashboardHome as jest.Mock).mockRejectedValueOnce(new Error('falha'));

    render(<DashboardHome />);

    await waitFor(() => {
      expect(
        screen.getByText('Nao foi possivel carregar os indicadores de BI.'),
      ).toBeInTheDocument();
    });
  });

  it('abre drilldown ao clicar em um KPI e permite voltar', async () => {
    const user = userEvent.setup();

    render(<DashboardHome />);

    await user.click(
      await screen.findByRole('button', { name: /abrir drilldown receita mensal/i }),
    );

    expect(fetchDashboardDrilldown).toHaveBeenCalledWith('receita');
    expect(await screen.findByText('Drill-down · Receita mensal')).toBeInTheDocument();
    expect(screen.getByText('Atual')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /voltar ao resumo/i }));

    expect(screen.queryByText('Drill-down · Receita mensal')).not.toBeInTheDocument();
  });
});
