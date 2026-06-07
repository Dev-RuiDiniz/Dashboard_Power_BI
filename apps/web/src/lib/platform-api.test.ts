import {
  fetchDashboardKpis,
  fetchExports,
  fetchNotifications,
  fetchSystemSettings,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './platform-api';
import { apiGet, apiPatch } from './admin-api';

jest.mock('./admin-api', () => ({
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
  apiPost: jest.fn(),
}));

describe('platform-api', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('busca os KPIs do dashboard pela API', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);

    await fetchDashboardKpis();

    expect(apiGet).toHaveBeenCalledWith('/dashboard/kpis');
  });

  it('busca exportacoes pela API', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);

    await fetchExports();

    expect(apiGet).toHaveBeenCalledWith('/exports');
  });

  it('busca notificacoes e marca leitura pela API', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    (apiPatch as jest.Mock).mockResolvedValueOnce({ id: 'n1', is_read: true });
    (apiPatch as jest.Mock).mockResolvedValueOnce({ updated: 2 });

    await fetchNotifications();
    await markNotificationAsRead('n1');
    await markAllNotificationsAsRead();

    expect(apiGet).toHaveBeenCalledWith('/notifications');
    expect(apiPatch).toHaveBeenNthCalledWith(1, '/notifications/n1/read', {});
    expect(apiPatch).toHaveBeenNthCalledWith(2, '/notifications/read-all', {});
  });

  it('busca configuracoes do sistema pela API', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);

    await fetchSystemSettings();

    expect(apiGet).toHaveBeenCalledWith('/admin/settings');
  });
});
