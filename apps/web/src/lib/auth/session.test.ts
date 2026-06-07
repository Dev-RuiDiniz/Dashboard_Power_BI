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
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-07T14:00:00.000Z'));
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve retornar null sem sessao', () => {
    expect(getAuthSession()).toBeNull();
    expect(hasAuthSession()).toBe(false);
  });

  it('deve salvar em sessionStorage e nao persistir token sensivel em localStorage', () => {
    saveAuthSession(session);

    expect(getAuthSession()).toEqual(
      expect.objectContaining({
        accessToken: 'access',
        refreshToken: 'refresh',
        tokenType: 'Bearer',
        expiresIn: 900,
      }),
    );
    expect(window.sessionStorage.getItem(authSessionStorageKey)).not.toBeNull();
    expect(window.localStorage.getItem(authSessionStorageKey)).toBeNull();
    expect(hasAuthSession()).toBe(true);
    expect(requireAuthSession()).toEqual(expect.objectContaining({ accessToken: 'access' }));
  });

  it('deve migrar sessao legacy do localStorage para sessionStorage', () => {
    window.localStorage.setItem(authSessionStorageKey, JSON.stringify(session));

    const migratedSession = getAuthSession();

    expect(migratedSession).toEqual(expect.objectContaining({ accessToken: 'access' }));
    expect(window.localStorage.getItem(authSessionStorageKey)).toBeNull();
    expect(window.sessionStorage.getItem(authSessionStorageKey)).not.toBeNull();
  });

  it('deve limpar sessao expirada', () => {
    saveAuthSession({
      ...session,
      expiresIn: 1,
    });

    jest.advanceTimersByTime(2_000);

    expect(getAuthSession()).toBeNull();
    expect(window.sessionStorage.getItem(authSessionStorageKey)).toBeNull();
  });

  it('deve limpar sessao corrompida', () => {
    window.sessionStorage.setItem(authSessionStorageKey, '{invalid-json');

    expect(getAuthSession()).toBeNull();
    expect(window.sessionStorage.getItem(authSessionStorageKey)).toBeNull();
  });

  it('deve limpar sessao com formato invalido', () => {
    window.sessionStorage.setItem(authSessionStorageKey, JSON.stringify({ accessToken: 'access' }));

    expect(getAuthSession()).toBeNull();
    expect(window.sessionStorage.getItem(authSessionStorageKey)).toBeNull();
  });

  it('deve remover sessao de ambos os storages', () => {
    saveAuthSession(session);
    window.localStorage.setItem(authSessionStorageKey, JSON.stringify(session));

    clearAuthSession();

    expect(getAuthSession()).toBeNull();
    expect(window.localStorage.getItem(authSessionStorageKey)).toBeNull();
    expect(window.sessionStorage.getItem(authSessionStorageKey)).toBeNull();
  });
});
