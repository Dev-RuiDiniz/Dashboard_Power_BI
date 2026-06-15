export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  expiresAt?: number;
};

type AuthSessionInput = AuthSession;
type StoredAuthSession = AuthSession & { expiresAt: number };

const SESSION_STORAGE_KEY = 'dashboard-power-bi:auth-session';

function isAuthSession(value: unknown): value is AuthSessionInput {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<AuthSession>;

  return (
    typeof candidate.accessToken === 'string' &&
    candidate.accessToken.length > 0 &&
    typeof candidate.refreshToken === 'string' &&
    candidate.refreshToken.length > 0 &&
    candidate.tokenType === 'Bearer' &&
    typeof candidate.expiresIn === 'number' &&
    Number.isFinite(candidate.expiresIn) &&
    candidate.expiresIn > 0 &&
    (candidate.expiresAt === undefined ||
      (typeof candidate.expiresAt === 'number' &&
        Number.isFinite(candidate.expiresAt) &&
        candidate.expiresAt > 0))
  );
}

function normalizeAuthSession(session: AuthSessionInput): StoredAuthSession {
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    tokenType: session.tokenType,
    expiresIn: session.expiresIn,
    expiresAt: session.expiresAt ?? Date.now() + session.expiresIn * 1_000,
  };
}

function isExpired(session: StoredAuthSession): boolean {
  return session.expiresAt <= Date.now();
}

function readFromSessionStorage(): StoredAuthSession | null {
  const rawSession = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as unknown;

    if (!isAuthSession(parsedSession)) {
      clearAuthSession();
      return null;
    }

    const normalizedSession = normalizeAuthSession(parsedSession);

    if (isExpired(normalizedSession)) {
      clearAuthSession();
      return null;
    }

    return normalizedSession;
  } catch {
    clearAuthSession();
    return null;
  }
}

function migrateLegacyLocalStorageSession(): StoredAuthSession | null {
  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as unknown;

    if (!isAuthSession(parsedSession)) {
      clearAuthSession();
      return null;
    }

    const normalizedSession = normalizeAuthSession(parsedSession);

    if (isExpired(normalizedSession)) {
      clearAuthSession();
      return null;
    }

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalizedSession));
    window.localStorage.removeItem(SESSION_STORAGE_KEY);

    return normalizedSession;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveAuthSession(session: AuthSessionInput): void {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedSession = normalizeAuthSession(session);
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalizedSession));
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return readFromSessionStorage() ?? migrateLegacyLocalStorageSession();
}

export function hasAuthSession(): boolean {
  return getAuthSession() !== null;
}

export function requireAuthSession(): AuthSession {
  const session = getAuthSession();

  if (!session) {
    throw new Error('Sessao autenticada nao encontrada.');
  }

  return session;
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export const authSessionStorageKey = SESSION_STORAGE_KEY;
