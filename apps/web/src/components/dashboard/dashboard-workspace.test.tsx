import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DashboardWorkspace } from './dashboard-workspace';
import { createDashboard, fetchDashboards, fetchFavoriteReports } from '@/lib/platform-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/platform-api', () => ({
  createDashboard: jest.fn(),
  fetchDashboards: jest.fn(),
  fetchFavoriteReports: jest.fn(),
}));

describe('DashboardWorkspace', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (fetchDashboards as jest.Mock).mockResolvedValue({
      dashboards: [
        {
          id: 'dashboard-1',
          name: 'Executivo',
          description: 'Resumo principal',
          isDefault: true,
          layout: { columns: 12 },
          widgets: [],
          createdAt: '2026-06-07T12:00:00.000Z',
          updatedAt: '2026-06-07T12:00:00.000Z',
        },
      ],
      seededViaApi: false,
    });
    (fetchFavoriteReports as jest.Mock).mockResolvedValue([
      {
        id: 'report-1',
        name: 'Receita',
        description: 'Consolidado',
        sector: 'financeiro',
        sourceType: 'view',
        requiredPermissions: [],
      },
    ]);
    (createDashboard as jest.Mock).mockResolvedValue({
      id: 'dashboard-2',
      name: 'Comercial',
      description: 'Pipeline',
      isDefault: false,
      layout: { columns: 12 },
      widgets: [],
      createdAt: '2026-06-07T13:00:00.000Z',
      updatedAt: '2026-06-07T13:00:00.000Z',
    });
  });

  it('lista dashboards e cria um novo dashboard personalizado', async () => {
    const user = userEvent.setup();

    render(<DashboardWorkspace />);

    expect(await screen.findByText('Executivo')).toBeInTheDocument();
    expect(screen.getByText('Receita')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/nome do dashboard/i), 'Comercial');
    await user.type(screen.getByLabelText(/descricao do dashboard/i), 'Pipeline');
    await user.click(screen.getByRole('button', { name: /criar dashboard/i }));

    await waitFor(() => {
      expect(createDashboard).toHaveBeenCalledWith({
        name: 'Comercial',
        description: 'Pipeline',
        isDefault: false,
      });
    });

    expect(await screen.findByText('Comercial')).toBeInTheDocument();
  });

  it('exibe banner de boas-vindas quando dashboard e criado via seed', async () => {
    (fetchDashboards as jest.Mock).mockResolvedValue({
      dashboards: [
        {
          id: 'dashboard-seed',
          name: 'Dashboard de Produção',
          description: 'KPIs de plantio, colheita e variedades — gerado automaticamente.',
          isDefault: true,
          layout: { columns: 12 },
          widgets: [],
          createdAt: '2026-06-29T12:00:00.000Z',
          updatedAt: '2026-06-29T12:00:00.000Z',
        },
      ],
      seededViaApi: true,
    });

    render(<DashboardWorkspace />);

    expect(await screen.findByText('Dashboard de Produção')).toBeInTheDocument();
    expect(screen.getByText(/criamos um dashboard padrão para você começar/i)).toBeInTheDocument();
  });

  it('banner de boas-vindas e dismissível', async () => {
    (fetchDashboards as jest.Mock).mockResolvedValue({
      dashboards: [
        {
          id: 'dashboard-seed',
          name: 'Dashboard Comercial',
          description: 'KPIs de contratos — gerado automaticamente.',
          isDefault: true,
          layout: { columns: 12 },
          widgets: [],
          createdAt: '2026-06-29T12:00:00.000Z',
          updatedAt: '2026-06-29T12:00:00.000Z',
        },
      ],
      seededViaApi: true,
    });

    const user = userEvent.setup();

    render(<DashboardWorkspace />);

    expect(await screen.findByText('Dashboard Comercial')).toBeInTheDocument();
    expect(screen.getByText(/criamos um dashboard padrão para você começar/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText('Fechar aviso'));

    expect(
      screen.queryByText(/criamos um dashboard padrão para você começar/i),
    ).not.toBeInTheDocument();
  });

  it('nao exibe banner quando seededViaApi e false', async () => {
    render(<DashboardWorkspace />);

    expect(await screen.findByText('Executivo')).toBeInTheDocument();
    expect(
      screen.queryByText(/criamos um dashboard padrão para você começar/i),
    ).not.toBeInTheDocument();
  });
});
