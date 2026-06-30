import { render, screen, waitFor } from '@testing-library/react';

import { getAdminDashboard, getAdminDashboardTrends } from '@/lib/admin-api';

import AdminPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/admin-api', () => ({
  getAdminDashboard: jest.fn(),
  getAdminDashboardTrends: jest.fn(),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const mockMetrics = {
  totalUsers: 10,
  activeUsers: 8,
  totalGroups: 3,
  totalExports: 5,
  recentActivity: [
    {
      id: 'a1',
      userEmail: 'admin@test.com',
      action: 'CREATE',
      resource: 'user',
      createdAt: '2026-06-29T10:00:00.000Z',
    },
  ],
};

const mockTrends = {
  usersByMonth: [
    { month: '2026-01', count: 0 },
    { month: '2026-02', count: 0 },
    { month: '2026-03', count: 0 },
    { month: '2026-04', count: 0 },
    { month: '2026-05', count: 0 },
    { month: '2026-06', count: 0 },
    { month: '2026-07', count: 0 },
    { month: '2026-08', count: 0 },
    { month: '2026-09', count: 0 },
    { month: '2026-10', count: 0 },
    { month: '2026-11', count: 0 },
    { month: '2026-12', count: 2 },
  ],
  activityByWeek: [
    { week: '2026-W01', count: 0 },
    { week: '2026-W02', count: 0 },
    { week: '2026-W03', count: 0 },
    { week: '2026-W04', count: 0 },
    { week: '2026-W05', count: 0 },
    { week: '2026-W06', count: 0 },
    { week: '2026-W07', count: 0 },
    { week: '2026-W26', count: 5 },
  ],
  exportsByWeek: [
    { week: '2026-W01', count: 0 },
    { week: '2026-W02', count: 0 },
    { week: '2026-W03', count: 0 },
    { week: '2026-W04', count: 0 },
    { week: '2026-W05', count: 0 },
    { week: '2026-W06', count: 0 },
    { week: '2026-W07', count: 0 },
    { week: '2026-W26', count: 3 },
  ],
  topReports: [
    { reportId: 'r1', count: 10 },
    { reportId: 'r2', count: 5 },
  ],
  topSectors: [
    { sector: 'operacoes', count: 8 },
    { sector: 'comercial', count: 4 },
  ],
};

describe('AdminPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: ResizeObserverMock,
    });
  });

  it('renderiza KPIs e graficos de tendencia quando dados disponiveis', async () => {
    (getAdminDashboard as jest.Mock).mockResolvedValue(mockMetrics);
    (getAdminDashboardTrends as jest.Mock).mockResolvedValue(mockTrends);

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Usuários novos por mês')).toBeInTheDocument();
    });

    expect(screen.getByText('Atividade por semana')).toBeInTheDocument();
    expect(screen.getByText('Exports por semana')).toBeInTheDocument();
    expect(screen.getByText('Top 5 relatórios')).toBeInTheDocument();
    expect(screen.getByText('Top 5 setores com mais atividade')).toBeInTheDocument();
  });

  it('exibe estado vazio quando trends nao tem dados', async () => {
    (getAdminDashboard as jest.Mock).mockResolvedValue(mockMetrics);
    (getAdminDashboardTrends as jest.Mock).mockResolvedValue({
      usersByMonth: Array.from({ length: 12 }, (_, i) => ({
        month: `2026-${String(i + 1).padStart(2, '0')}`,
        count: 0,
      })),
      activityByWeek: Array.from({ length: 8 }, (_, i) => ({
        week: `2026-W${String(i + 1).padStart(2, '0')}`,
        count: 0,
      })),
      exportsByWeek: Array.from({ length: 8 }, (_, i) => ({
        week: `2026-W${String(i + 1).padStart(2, '0')}`,
        count: 0,
      })),
      topReports: [],
      topSectors: [],
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Dados insuficientes para tendência.')).toBeInTheDocument();
    });
  });

  it('exibe erro quando API de trends falha', async () => {
    (getAdminDashboard as jest.Mock).mockResolvedValue(mockMetrics);
    (getAdminDashboardTrends as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Nao foi possivel carregar as tendencias.')).toBeInTheDocument();
    });
  });
});
