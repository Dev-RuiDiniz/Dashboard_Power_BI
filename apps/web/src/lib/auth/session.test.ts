import {
  authSessionStorageKey,
  clearAuthSession,
  getAuthSession,
  hasAuthSession,
  requireAuthSession,
  saveAuthSession,
} from './session';

const session = {
  accessToken: 'access',
  refreshToken: 'refresh',
  tokenType: 'Bearer' as const,
  expiresIn: 900,
};

describe('auth session', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('deve retornar null sem sessão', () => {
    expect(getAuthSession()).toBeNull();
    expect(hasAuthSession()).toBe(false);
  });

  it('deve salvar e recuperar sessão válida', () => {
    saveAuthSession(session);

    expect(getAuthSession()).toEqual(session);
    expect(hasAuthSession()).toBe(true);
    expect(requireAuthSession()).toEqual(session);
  });

  it('deve limpar sessão corrompida', () => {
    window.localStorage.setItem(authSessionStorageKey, '{invalid-json');

    expect(getAuthSession()).toBeNull();
    expect(window.localStorage.getItem(authSessionStorageKey)).toBeNull();
  });

  it('deve limpar sessão com formato inválido', () => {
    window.localStorage.setItem(authSessionStorageKey, JSON.stringify({ accessToken: 'access' }));

    expect(getAuthSession()).toBeNull();
    expect(window.localStorage.getItem(authSessionStorageKey)).toBeNull();
  });

  it('deve remover sessão', () => {
    saveAuthSession(session);
    clearAuthSession();

    expect(getAuthSession()).toBeNull();
  });
});
