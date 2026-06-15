import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExportsList } from './exports-list';
import { downloadExportFile, fetchExports } from '@/lib/platform-api';

jest.mock('@/lib/platform-api', () => ({
  fetchExports: jest.fn(),
  downloadExportFile: jest.fn(),
}));

describe('ExportsList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    URL.createObjectURL = jest.fn(() => 'blob:download');
    URL.revokeObjectURL = jest.fn();
    HTMLAnchorElement.prototype.click = jest.fn();
  });

  it('renderiza exportacoes vindas da API', async () => {
    (fetchExports as jest.Mock).mockResolvedValue([
      {
        id: 'e1',
        report_id: 'financeiro-dre',
        export_format: 'pdf',
        status: 'completed',
        file_url: 'http://localhost:3001/exports/files/e1.pdf',
        file_size_bytes: 2048,
        error_message: null,
        created_at: '2026-06-07T12:00:00.000Z',
        completed_at: '2026-06-07T12:02:00.000Z',
        expires_at: '2026-06-14T12:00:00.000Z',
      },
    ]);

    render(<ExportsList />);

    expect(await screen.findByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Concluido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /baixar/i })).toBeInTheDocument();
  });

  it('renderiza erro quando a API falha', async () => {
    (fetchExports as jest.Mock).mockRejectedValue(new Error('falha'));

    render(<ExportsList />);

    expect(
      await screen.findByText('Não foi possível carregar o histórico de exportações.'),
    ).toBeInTheDocument();
  });

  it('baixa o arquivo concluido usando a API autenticada', async () => {
    const user = userEvent.setup();
    (fetchExports as jest.Mock).mockResolvedValue([
      {
        id: 'e1',
        report_id: 'financeiro-dre',
        export_format: 'pdf',
        status: 'completed',
        file_url: 'http://localhost:3001/exports/files/e1.pdf',
        file_size_bytes: 2048,
        error_message: null,
        created_at: '2026-06-07T12:00:00.000Z',
        completed_at: '2026-06-07T12:02:00.000Z',
        expires_at: '2026-06-14T12:00:00.000Z',
      },
    ]);
    (downloadExportFile as jest.Mock).mockResolvedValue(new Blob(['pdf']));

    render(<ExportsList />);

    await user.click(await screen.findByRole('button', { name: /baixar/i }));

    expect(downloadExportFile).toHaveBeenCalledWith('http://localhost:3001/exports/files/e1.pdf');
  });
});
