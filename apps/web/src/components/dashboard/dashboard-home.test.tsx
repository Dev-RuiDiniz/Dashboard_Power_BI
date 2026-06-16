import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DashboardHome } from './dashboard-home';
import { fetchDashboardDrilldown, fetchDashboardHome, fetchKpiHistory } from '@/lib/platform-api';

jest.mock('@/lib/platform-api', () => ({
  fetchDashboardDrilldown: jest.fn(),
  fetchDashboardHome: jest.fn(),
  fetchKpiHistory: jest.fn(),
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
      businessAreas: [
        { businessArea: 'producao', label: 'Producao', total: 1, averageDelta: 11.11 },
        { businessArea: 'comercial', label: 'Comercial', total: 1, averageDelta: 11.11 },
        { businessArea: 'algodoeira', label: 'Algodoeira', total: 1, averageDelta: 10.84 },
      ],
      kpis: [
        {
          id: 'receita',
          title: 'Receita mensal',
          businessArea: 'producao',
          sector: 'Financeiro',
          value: 120000,
          previousValue: 108000,
          unit: 'currency',
        },
        {
          id: 'leads',
          title: 'Leads qualificados',
          businessArea: 'comercial',
          sector: 'Comercial',
          value: 430,
          previousValue: 387,
          unit: 'number',
        },
        {
          id: 'sla',
          title: 'SLA operacional',
          businessArea: 'algodoeira',
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
            businessArea: 'producao',
            sector: 'Financeiro',
            value: 120000,
            previousValue: 108000,
            delta: 11.11,
          },
          {
            id: 'leads',
            title: 'Leads qualificados',
            businessArea: 'comercial',
            sector: 'Comercial',
            value: 430,
            previousValue: 387,
            delta: 11.11,
          },
        ],
      },
      availableDrilldowns: [
        { kpiId: 'receita', label: 'Receita mensal', dimension: 'businessArea' },
      ],
    });

    (fetchDashboardDrilldown as jest.Mock).mockResolvedValue({
      kpiId: 'receita',
      label: 'Receita mensal',
      dimension: 'businessArea',
      series: [
        { label: 'Atual', value: 120000 },
        { label: 'Anterior', value: 108000 },
      ],
      rows: [
        { period: 'Atual', value: 120000, delta: 11.11 },
        { period: 'Anterior', value: 108000, delta: 0 },
      ],
    });

    (fetchKpiHistory as jest.Mock).mockResolvedValue({
      kpiId: 'receita',
      label: 'Receita mensal',
      unit: 'currency',
      granularity: 'monthly',
      rangeMonths: 12,
      periods: [
        { period: 'Jan', value: 98000, previousValue: 92000, delta: 6.52 },
        { period: 'Fev', value: 108000, previousValue: 98000, delta: 10.2 },
        { period: 'Mar', value: 120000, previousValue: 108000, delta: 11.11 },
      ],
    });
  });

  it('renderiza a aba executiva como padrao com hero, timeline e destaques', async () => {
    render(<DashboardHome />);

    expect(await screen.findByRole('heading', { name: 'Dashboard Home' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Executiva' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Analitica' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Operacional' })).toBeInTheDocument();
    expect(screen.getByText('Principal destaque do periodo')).toBeInTheDocument();
    expect(screen.getByText('Linha do tempo principal')).toBeInTheDocument();
    expect(screen.getByText('Maiores destaques')).toBeInTheDocument();
    expect(screen.getAllByText('Receita mensal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Leads qualificados').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SLA operacional').length).toBeGreaterThan(0);
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

  it('troca para as abas analitica e operacional sem recarregar a home', async () => {
    const user = userEvent.setup();

    render(<DashboardHome />);

    await user.click(await screen.findByRole('tab', { name: 'Analitica' }));

    expect(screen.getByRole('tab', { name: 'Analitica' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Distribuicao por setor')).toBeInTheDocument();
    expect(screen.getByText('Performance dos KPIs')).toBeInTheDocument();
    expect(screen.getByText('Timeline comparativa')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Operacional' }));

    expect(screen.getByRole('tab', { name: 'Operacional' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Acompanhamento operacional')).toBeInTheDocument();
    expect(screen.getByText('Itens que pedem atencao')).toBeInTheDocument();
    expect(fetchDashboardHome).toHaveBeenCalledTimes(1);
  });
});
