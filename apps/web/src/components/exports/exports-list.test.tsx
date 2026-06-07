import { render, screen } from '@testing-library/react';

import { ExportsList } from './exports-list';
import { fetchExports } from '@/lib/platform-api';

jest.mock('@/lib/platform-api', () => ({
  fetchExports: jest.fn(),
}));

describe('ExportsList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renderiza exportacoes vindas da API', async () => {
    (fetchExports as jest.Mock).mockResolvedValue([
      {
        id: 'e1',
        report_id: 'financeiro-dre',
        export_format: 'pdf',
        status: 'completed',
        file_url: 'http://localhost/file.pdf',
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
    expect(screen.getByRole('link', { name: /baixar/i })).toHaveAttribute(
      'href',
      'http://localhost/file.pdf',
    );
  });

  it('renderiza erro quando a API falha', async () => {
    (fetchExports as jest.Mock).mockRejectedValue(new Error('falha'));

    render(<ExportsList />);

    expect(
      await screen.findByText('Não foi possível carregar o histórico de exportações.'),
    ).toBeInTheDocument();
  });
});
