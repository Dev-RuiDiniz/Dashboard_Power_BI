import { render, screen } from '@testing-library/react';

import { AdminSettings } from './admin-settings';
import { fetchSystemSettings } from '@/lib/platform-api';

jest.mock('@/lib/platform-api', () => ({
  fetchSystemSettings: jest.fn(),
}));

describe('AdminSettings', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renderiza configuracoes carregadas pela API', async () => {
    (fetchSystemSettings as jest.Mock).mockResolvedValue([
      {
        id: 's1',
        setting_key: 'smtp.host',
        setting_value: 'smtp.example.com',
        description: 'Servidor SMTP',
        is_sensitive: false,
        updated_at: '2026-06-07T12:00:00.000Z',
      },
    ]);

    render(<AdminSettings />);

    expect(await screen.findByText('smtp.host')).toBeInTheDocument();
    expect(screen.getByText('"smtp.example.com"')).toBeInTheDocument();
  });

  it('renderiza erro quando a API falha', async () => {
    (fetchSystemSettings as jest.Mock).mockRejectedValue(new Error('falha'));

    render(<AdminSettings />);

    expect(
      await screen.findByText('Não foi possível carregar as configurações.'),
    ).toBeInTheDocument();
  });
});
