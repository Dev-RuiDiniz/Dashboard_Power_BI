import {
  createExport,
  downloadExportFile,
  fetchDashboardKpis,
  fetchExports,
  fetchNotifications,
  fetchSystemSettings,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateSystemSetting,
} from './platform-api';
import { apiGet, apiGetBlob, apiPatch, apiPost } from './admin-api';

jest.mock('./admin-api', () => ({
  apiGet: jest.fn(),
  apiGetBlob: jest.fn(),
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
});
