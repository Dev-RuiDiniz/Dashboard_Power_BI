import { AuthClientError } from './errors';
import { login, logout, refreshSession } from './api';

describe('auth api client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => jest.resetAllMocks());

  it('deve enviar login para a API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'access',
        refreshToken: 'refresh',
        tokenType: 'Bearer',
        expiresIn: 900,
      }),
    });
    await expect(login('admin@example.com', 'Admin123!')).resolves.toEqual(
      expect.objectContaining({ accessToken: 'access' }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/auth/login',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('deve rotacionar refresh token pela API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        tokenType: 'Bearer',
        expiresIn: 900,
      }),
    });

    await expect(refreshSession('refresh')).resolves.toEqual(
      expect.objectContaining({ accessToken: 'new-access' }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/auth/refresh',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('deve invalidar refresh token no logout', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(logout('refresh')).resolves.toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('deve mapear 401 para credenciais invalidas', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    });
    await expect(login('admin@example.com', 'errada')).rejects.toMatchObject({
      code: 'invalid_credentials',
      name: 'AuthClientError',
    } satisfies Partial<AuthClientError>);
  });

  it('deve mapear 429 para limite de tentativas', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    });
    await expect(login('admin@example.com', 'errada')).rejects.toMatchObject({
      code: 'rate_limited',
      name: 'AuthClientError',
    } satisfies Partial<AuthClientError>);
  });
});
