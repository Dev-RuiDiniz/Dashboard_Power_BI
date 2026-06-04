import { getAuthSession } from '@/lib/auth/session';

const DEFAULT_API_URL = 'http://localhost:3001';

function getApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}

function getAuthHeaders(): Record<string, string> {
  const session = typeof window !== 'undefined' ? getAuthSession() : null;

  return {
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `${session.tokenType} ${session.accessToken}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(typeof body.message === 'string' ? body.message : 'Erro inesperado.');
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse<T>(response);
}
