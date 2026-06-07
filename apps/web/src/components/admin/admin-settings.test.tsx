import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AdminSettings } from './admin-settings';
import { fetchSystemSettings, updateSystemSetting } from '@/lib/platform-api';

jest.mock('@/lib/platform-api', () => ({
  fetchSystemSettings: jest.fn(),
  updateSystemSetting: jest.fn(),
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
        setting_value: { value: 'smtp.example.com' },
        description: 'Servidor SMTP',
        is_sensitive: false,
        updated_at: '2026-06-07T12:00:00.000Z',
      },
    ]);

    render(<AdminSettings />);

    expect(await screen.findByText('smtp.host')).toBeInTheDocument();
    expect(screen.getByDisplayValue('smtp.example.com')).toBeInTheDocument();
  });

  it('renderiza erro quando a API falha', async () => {
    (fetchSystemSettings as jest.Mock).mockRejectedValue(new Error('falha'));

    render(<AdminSettings />);

    expect(
      await screen.findByText('Não foi possível carregar as configurações.'),
    ).toBeInTheDocument();
  });

  it('permite salvar uma configuracao editavel', async () => {
    const user = userEvent.setup();
    (fetchSystemSettings as jest.Mock).mockResolvedValue([
      {
        id: 's1',
        setting_key: 'smtp.host',
        setting_value: { value: 'smtp.example.com' },
        description: 'Servidor SMTP',
        is_sensitive: false,
        updated_at: '2026-06-07T12:00:00.000Z',
      },
    ]);
    (updateSystemSetting as jest.Mock).mockResolvedValue({
      id: 's1',
      setting_key: 'smtp.host',
      setting_value: { value: 'smtp.new.example.com' },
      description: 'Servidor SMTP',
      is_sensitive: false,
      updated_at: '2026-06-07T12:30:00.000Z',
    });

    render(<AdminSettings />);

    const input = await screen.findByDisplayValue('smtp.example.com');
    await user.clear(input);
    await user.type(input, 'smtp.new.example.com');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(updateSystemSetting).toHaveBeenCalledWith('smtp.host', {
      value: 'smtp.new.example.com',
    });
  });
});
