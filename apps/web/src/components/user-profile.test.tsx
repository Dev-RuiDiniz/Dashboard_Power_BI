import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UserProfile } from './user-profile';
import { apiGet, apiPatch } from '@/lib/admin-api';

jest.mock('@/lib/admin-api', () => ({
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
}));

describe('UserProfile', () => {
  const apiGetMock = apiGet as jest.MockedFunction<typeof apiGet>;
  const apiPatchMock = apiPatch as jest.MockedFunction<typeof apiPatch>;
  const alertMock = jest.fn();

  beforeAll(() => {
    Object.defineProperty(window, 'alert', {
      configurable: true,
      value: alertMock,
    });
  });

  beforeEach(() => {
    jest.resetAllMocks();
    apiGetMock.mockResolvedValue({
      id: 'demo-admin',
      email: 'admin@example.com',
      roles: ['admin'],
      sectors: ['financeiro'],
      groupIds: [],
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      deactivatedAt: null,
    });
  });

  it('deve carregar o perfil do usuario autenticado', async () => {
    render(<UserProfile />);

    expect(apiGetMock).toHaveBeenCalledWith('/auth/me');
    expect(await screen.findByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('deve atualizar a senha usando a rota de perfil da api', async () => {
    apiPatchMock.mockResolvedValue({ success: true });

    render(<UserProfile />);

    await screen.findByText('admin@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));

    await userEvent.type(screen.getByLabelText('Senha atual'), 'Admin123!');
    await userEvent.type(screen.getByLabelText('Nova senha'), 'NovaSenha123!');
    await userEvent.type(screen.getByLabelText('Confirmar nova senha'), 'NovaSenha123!');
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar senha' }));

    await waitFor(() =>
      expect(apiPatchMock).toHaveBeenCalledWith('/auth/me/password', {
        currentPassword: 'Admin123!',
        newPassword: 'NovaSenha123!',
      }),
    );
    expect(alertMock).toHaveBeenCalledWith('Senha atualizada com sucesso.');
  });
});
