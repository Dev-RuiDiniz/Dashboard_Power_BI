import { AuthClientError } from './errors';
import { login } from './api';

describe('auth api client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => jest.resetAllMocks());

  it('deve enviar login para a API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'access', refreshToken: 'refresh', tokenType: 'Bearer', expiresIn: 900 }),
    });
    await expect(login('admin@example.com', 'Admin123!')).resolves.toEqual(expect.objectContaining({ accessToken: 'access' }));
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/auth/login', expect.objectContaining({ method: 'POST' }));
  });

  it('deve mapear 401 para credenciais inválidas', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    await expect(login('admin@example.com', 'errada')).rejects.toMatchObject<AuthClientError>({ code: 'invalid_credentials' });
  });

  it('deve mapear 429 para limite de tentativas', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
    await expect(login('admin@example.com', 'errada')).rejects.toMatchObject<AuthClientError>({ code: 'rate_limited' });
  });
});
