import {
  createExport,
  createDashboard,
  favoriteReport,
  fetchDashboards,
  fetchDashboardDrilldown,
  fetchDashboardHome,
  downloadExportFile,
  fetchDashboardKpis,
  fetchExports,
  fetchFavoriteReports,
  fetchNotifications,
  fetchSystemSettings,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  unfavoriteReport,
  updateSystemSetting,
} from './platform-api';
import { apiDelete, apiGet, apiGetBlob, apiPatch, apiPost } from './admin-api';

jest.mock('./admin-api', () => ({
  apiGet: jest.fn(),
  apiGetBlob: jest.fn(),
  apiPatch: jest.fn(),
  apiPost: jest.fn(),
  apiDelete: jest.fn(),
}));

describe('platform-api', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('busca os KPIs do dashboard pela API', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    (apiGet as jest.Mock).mockResolvedValueOnce({ kpis: [] });
    (apiGet as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await fetchDashboardKpis();
    await fetchDashboardHome();
    await fetchDashboardDrilldown('receita-mensal');

    expect(apiGet).toHaveBeenCalledWith('/dashboard/kpis');
    expect(apiGet).toHaveBeenCalledWith('/dashboard/home');
    expect(apiGet).toHaveBeenCalledWith('/dashboard/kpis/receita-mensal/drilldown');
  });

  it('busca exportacoes pela API', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);

    await fetchExports();

    expect(apiGet).toHaveBeenCalledWith('/exports');
  });

  it('cria exportacoes e baixa arquivos pela API autenticada', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ id: 'e1' });
    (apiGetBlob as jest.Mock).mockResolvedValueOnce(new Blob(['pdf']));

    await createExport({ reportId: 'report-1', exportFormat: 'pdf', parameters: { ano: 2026 } });
    await downloadExportFile('http://localhost:3001/exports/files/e1.pdf');

    expect(apiPost).toHaveBeenCalledWith('/exports', {
      reportId: 'report-1',
      exportFormat: 'pdf',
      parameters: { ano: 2026 },
    });
    expect(apiGetBlob).toHaveBeenCalledWith('/exports/files/e1.pdf');
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

  it('busca e atualiza configuracoes do sistema pela API', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    (apiPatch as jest.Mock).mockResolvedValueOnce({ id: 's1' });

    await fetchSystemSettings();
    await updateSystemSetting('smtp.host', { value: 'smtp.example.com' });

    expect(apiGet).toHaveBeenCalledWith('/admin/settings');
    expect(apiPatch).toHaveBeenCalledWith('/admin/settings/smtp.host', {
      value: { value: 'smtp.example.com' },
    });
  });

  it('lista dashboards e favoritos e envia mutacoes desses fluxos', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([{ id: 'dashboard-1', widgets: [] }]);
    (apiGet as jest.Mock).mockResolvedValueOnce([{ id: 'report-1', name: 'Receita' }]);
    (apiPost as jest.Mock).mockResolvedValueOnce({ id: 'dashboard-2', widgets: [] });
    (apiPost as jest.Mock).mockResolvedValueOnce({ ok: true });
    (apiDelete as jest.Mock).mockResolvedValueOnce({ ok: true });

    await fetchDashboards();
    await fetchFavoriteReports();
    await createDashboard({ name: 'Comercial', description: 'Pipeline', isDefault: false });
    await favoriteReport('report-1');
    await unfavoriteReport('report-1');

    expect(apiGet).toHaveBeenNthCalledWith(1, '/dashboards');
    expect(apiGet).toHaveBeenNthCalledWith(2, '/reports/favorites');
    expect(apiPost).toHaveBeenNthCalledWith(1, '/dashboards', {
      name: 'Comercial',
      description: 'Pipeline',
      isDefault: false,
    });
    expect(apiPost).toHaveBeenNthCalledWith(2, '/reports/report-1/favorite');
    expect(apiDelete).toHaveBeenCalledWith('/reports/report-1/favorite');
  });
});
