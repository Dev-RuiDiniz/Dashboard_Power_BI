import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReportDetail } from './report-detail';
import { apiGet, apiPost } from '@/lib/admin-api';
import { createExport, favoriteReport } from '@/lib/platform-api';

jest.mock('@/lib/admin-api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

jest.mock('@/lib/platform-api', () => ({
  createExport: jest.fn(),
  favoriteReport: jest.fn(),
}));

describe('ReportDetail', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('solicita exportacao em PDF com os filtros atuais', async () => {
    const user = userEvent.setup();
    (apiGet as jest.Mock).mockResolvedValue({
      id: 'report-1',
      name: 'Relatório Financeiro',
      description: 'Visão consolidada',
      sector: 'financeiro',
      sourceType: 'view',
      parameters: [{ name: 'ano', type: 'int', required: true }],
      requiredPermissions: [],
    });
    (apiPost as jest.Mock).mockResolvedValue({
      items: [{ metric: 'Receita', value: 120000 }],
      page: 1,
      pageSize: 50,
      total: 1,
      totalPages: 1,
    });
    (createExport as jest.Mock).mockResolvedValue({
      id: 'export-1',
      report_id: 'report-1',
      export_format: 'pdf',
      status: 'pending',
      file_url: null,
      file_size_bytes: null,
      error_message: null,
      created_at: '2026-06-07T12:00:00.000Z',
      completed_at: null,
      expires_at: '2026-06-14T12:00:00.000Z',
    });

    render(<ReportDetail reportId="report-1" onBack={jest.fn()} />);

    await user.type(await screen.findByRole('spinbutton'), '2026');
    await user.click(screen.getByRole('button', { name: /executar consulta/i }));
    await screen.findByText('Receita');

    await user.click(screen.getByRole('button', { name: /exportar pdf/i }));

    await waitFor(() => {
      expect(createExport).toHaveBeenCalledWith({
        reportId: 'report-1',
        exportFormat: 'pdf',
        parameters: { ano: 2026 },
      });
    });
  });

  it('permite favoritar o relatorio aberto', async () => {
    const user = userEvent.setup();
    (apiGet as jest.Mock).mockResolvedValue({
      id: 'report-1',
      name: 'Relatorio Financeiro',
      description: 'Visao consolidada',
      sector: 'financeiro',
      sourceType: 'view',
      parameters: [],
      requiredPermissions: [],
    });
    (favoriteReport as jest.Mock).mockResolvedValue({ ok: true });

    render(<ReportDetail reportId="report-1" onBack={jest.fn()} />);

    await user.click(await screen.findByRole('button', { name: /favoritar relatorio/i }));

    await waitFor(() => {
      expect(favoriteReport).toHaveBeenCalledWith('report-1');
    });
  });
});
