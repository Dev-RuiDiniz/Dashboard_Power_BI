import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DashboardDetail } from './dashboard-detail';
import {
  addDashboardWidget,
  batchUpdateDashboardWidgets,
  fetchDashboardKpis,
  fetchKpiHistory,
  getDashboardById,
  removeDashboardWidget,
  updateDashboardWidget,
} from '@/lib/platform-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/platform-api', () => ({
  addDashboardWidget: jest.fn(),
  batchUpdateDashboardWidgets: jest.fn(),
  fetchDashboardKpis: jest.fn(),
  fetchKpiHistory: jest.fn(),
  getDashboardById: jest.fn(),
  removeDashboardWidget: jest.fn(),
  reorderDashboardWidgets: jest.fn(),
  updateDashboardWidget: jest.fn(),
}));

jest.mock('react-grid-layout', () => ({
  Responsive: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid-layout">{children}</div>
  ),
  useContainerWidth: () => ({
    width: 800,
    containerRef: { current: null },
    mounted: true,
  }),
  WidthProvider: (Comp: React.ComponentType) => Comp,
}));

jest.mock('recharts', () => {
  const actual = jest.requireActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 280 }}>{children}</div>
    ),
  };
});

describe('DashboardDetail', () => {
  const mockDashboard = {
    id: 'dash-1',
    name: 'Executivo',
    description: 'Visao executiva',
    isDefault: true,
    layout: { columns: 12 },
    widgets: [
      {
        id: 'widget-1',
        dashboardId: 'dash-1',
        widgetType: 'kpi' as const,
        title: 'Receita',
        chartType: null,
        reportId: null,
        kpiId: 'kpi-1',
        displayOrder: 1,
        config: {},
        content: null,
        url: null,
        position: { x: 0, y: 0, width: 6, height: 4 },
        createdAt: '2026-06-01T00:00:00.000Z',
      },
      {
        id: 'widget-2',
        dashboardId: 'dash-1',
        widgetType: 'chart' as const,
        title: 'Evolucao',
        chartType: 'line',
        reportId: null,
        kpiId: 'kpi-1',
        displayOrder: 2,
        config: {},
        content: null,
        url: null,
        position: { x: 6, y: 0, width: 6, height: 4 },
        createdAt: '2026-06-01T00:00:00.000Z',
      },
    ],
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  const mockKpis = [
    {
      id: 'kpi-1',
      title: 'Receita mensal',
      sector: 'Financeiro',
      value: 120000,
      previousValue: 100000,
      unit: 'currency' as const,
    },
  ];

  const mockHistory = {
    kpiId: 'kpi-1',
    label: 'Receita mensal',
    unit: 'currency' as const,
    periods: [
      { period: 'Jan', value: 90000, previousValue: 85000, delta: 5.9 },
      { period: 'Fev', value: 100000, previousValue: 90000, delta: 11.1 },
      { period: 'Mar', value: 120000, previousValue: 100000, delta: 20 },
    ],
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (getDashboardById as jest.Mock).mockResolvedValue(mockDashboard);
    (fetchDashboardKpis as jest.Mock).mockResolvedValue(mockKpis);
    (fetchKpiHistory as jest.Mock).mockResolvedValue(mockHistory);
    (removeDashboardWidget as jest.Mock).mockResolvedValue({ removed: true });
    (addDashboardWidget as jest.Mock).mockResolvedValue({ id: 'widget-new' });
    (batchUpdateDashboardWidgets as jest.Mock).mockResolvedValue(mockDashboard);
    (updateDashboardWidget as jest.Mock).mockResolvedValue({ id: 'widget-1' });
  });

  it('renderiza nome do dashboard e widgets', async () => {
    render(<DashboardDetail dashboardId="dash-1" />);

    expect(await screen.findByText('Executivo')).toBeInTheDocument();
    expect(screen.getByText('Visao executiva')).toBeInTheDocument();
    expect(screen.getByText('Receita')).toBeInTheDocument();
    expect(screen.getByText('Evolucao')).toBeInTheDocument();
  });

  it('renderiza widget chart com dados de historico', async () => {
    render(<DashboardDetail dashboardId="dash-1" />);

    await screen.findByText('Executivo');

    await waitFor(() => {
      expect(fetchKpiHistory).toHaveBeenCalledWith('kpi-1');
    });
  });

  it('remove widget no modo edicao ao clicar no botao de remover', async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();

    render(<DashboardDetail dashboardId="dash-1" onBack={onBack} />);

    await screen.findByText('Executivo');

    const editButton = screen.getByText('Editar layout');
    await user.click(editButton);

    const removeButtons = screen.getAllByLabelText('Remover widget');
    await user.click(removeButtons[0]!);

    await waitFor(() => {
      expect(removeDashboardWidget).toHaveBeenCalledWith('dash-1', 'widget-1');
    });
  });

  it('renderiza estado vazio quando nao ha widgets', async () => {
    (getDashboardById as jest.Mock).mockResolvedValue({
      ...mockDashboard,
      widgets: [],
    });

    render(<DashboardDetail dashboardId="dash-1" />);

    expect(await screen.findByText('Nenhum widget configurado')).toBeInTheDocument();
  });

  it('entra no modo edicao e mostra paleta de widgets', async () => {
    const user = userEvent.setup();

    render(<DashboardDetail dashboardId="dash-1" />);

    await screen.findByText('Executivo');

    const editButton = screen.getByText('Editar layout');
    await user.click(editButton);

    expect(screen.getByText('Paleta de Widgets')).toBeInTheDocument();
    expect(screen.getByText('KPI')).toBeInTheDocument();
    expect(screen.getByText('Gráfico')).toBeInTheDocument();
  });

  it('adiciona widget ao clicar na paleta', async () => {
    const user = userEvent.setup();

    render(<DashboardDetail dashboardId="dash-1" />);

    await screen.findByText('Executivo');

    await user.click(screen.getByText('Editar layout'));
    await user.click(screen.getByLabelText('Adicionar widget KPI'));

    await waitFor(() => {
      expect(addDashboardWidget).toHaveBeenCalledWith(
        'dash-1',
        expect.objectContaining({ widgetType: 'kpi' }),
      );
    });
  });

  it('salva layout ao concluir edicao', async () => {
    const user = userEvent.setup();

    render(<DashboardDetail dashboardId="dash-1" />);

    await screen.findByText('Executivo');

    await user.click(screen.getByText('Editar layout'));

    const concludeButton = screen.getByText('Concluir');
    await user.click(concludeButton);

    await waitFor(() => {
      expect(batchUpdateDashboardWidgets).toHaveBeenCalledWith(
        'dash-1',
        expect.arrayContaining([
          expect.objectContaining({ widgetId: 'widget-1' }),
          expect.objectContaining({ widgetId: 'widget-2' }),
        ]),
      );
    });
  });

  it('abre painel de configuracao ao clicar em configurar widget', async () => {
    const user = userEvent.setup();

    render(<DashboardDetail dashboardId="dash-1" />);

    await screen.findByText('Executivo');

    await user.click(screen.getByText('Editar layout'));

    const configButtons = screen.getAllByLabelText('Configurar widget');
    await user.click(configButtons[0]!);

    expect(screen.getByText('Configurar widget')).toBeInTheDocument();
    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });
});
