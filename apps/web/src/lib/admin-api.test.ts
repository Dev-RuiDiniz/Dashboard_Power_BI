import { apiGet } from './admin-api';
import * as authApi from './auth/api';
import * as authSession from './auth/session';

jest.mock('./auth/api', () => ({
  refreshSession: jest.fn(),
}));
jest.mock('./auth/session', () => ({
  clearAuthSession: jest.fn(),
  getAuthSession: jest.fn(),
  saveAuthSession: jest.fn(),
}));

describe('admin-api', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it('renova a sessao e repete a requisicao quando recebe 401', async () => {
    (authSession.getAuthSession as jest.Mock).mockReturnValue({
      accessToken: 'expired-access',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    (authApi.refreshSession as jest.Mock).mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'token expirado' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'u1' }],
      });

    await expect(apiGet<Array<{ id: string }>>('/admin/users')).resolves.toEqual([{ id: 'u1' }]);

    expect(authApi.refreshSession).toHaveBeenCalledWith('refresh-token');
    expect(authSession.saveAuthSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3001/admin/users',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer new-access',
        }),
      }),
    );
  });

  it('limpa a sessao quando o refresh falha', async () => {
    (authSession.getAuthSession as jest.Mock).mockReturnValue({
      accessToken: 'expired-access',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    (authApi.refreshSession as jest.Mock).mockRejectedValue(new Error('refresh inválido'));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'token expirado' }),
    });

    await expect(apiGet('/admin/users')).rejects.toThrow('refresh inválido');
    expect(authSession.clearAuthSession).toHaveBeenCalled();
  });
});
