const CSRF_COOKIE_NAME = 'csrf-token';

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]+)`));

  const token = match?.[1];
  return token ? decodeURIComponent(token) : null;
}

export function getCsrfHeader(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { 'x-csrf-token': token } : {};
}
