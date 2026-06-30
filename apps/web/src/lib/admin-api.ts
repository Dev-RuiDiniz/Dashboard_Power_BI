import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  type AuthSession,
} from '@/lib/auth/session';
import { refreshSession } from '@/lib/auth/api';
import { getCsrfHeader } from '@/lib/csrf';

const DEFAULT_API_URL = 'http://localhost:3001';

export function getApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}

function getAuthHeaders(session?: AuthSession | null): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `${session.tokenType} ${session.accessToken}` } : {}),
  };
}

async function handleJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(typeof body.message === 'string' ? body.message : 'Erro inesperado.');
  }

  return response.json() as Promise<T>;
}

async function handleBlobResponse(response: Response): Promise<Blob> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(typeof body.message === 'string' ? body.message : 'Erro inesperado.');
  }

  return response.blob();
}

async function executeWithAuth(
  path: string,
  init: RequestInit,
  parseResponse: (response: Response) => Promise<Response | Blob | unknown>,
  allowRefresh = true,
  sessionOverride?: AuthSession | null,
) {
  const session = sessionOverride ?? (typeof window !== 'undefined' ? getAuthSession() : null);
  const method = (init.method ?? 'GET').toUpperCase();
  const isStateChanging = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(session),
      ...(isStateChanging ? getCsrfHeader() : {}),
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
    credentials: 'include',
  });

  if (response.status === 401 && allowRefresh && session?.refreshToken) {
    try {
      const refreshedSession = await refreshSession(session.refreshToken);
      saveAuthSession(refreshedSession);

      return executeWithAuth(path, init, parseResponse, false, {
        ...refreshedSession,
        expiresAt: Date.now() + refreshedSession.expiresIn * 1_000,
      });
    } catch (error) {
      clearAuthSession();
      throw error;
    }
  }

  if (response.status === 401 && session?.refreshToken) {
    clearAuthSession();
  }

  return parseResponse(response);
}

export async function apiGet<T>(path: string): Promise<T> {
  return executeWithAuth(path, {}, handleJsonResponse) as Promise<T>;
}

export async function apiGetBlob(path: string): Promise<Blob> {
  return executeWithAuth(path, {}, handleBlobResponse) as Promise<Blob>;
}

export async function apiPost<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  return executeWithAuth(
    path,
    {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    },
    handleJsonResponse,
  ) as Promise<T>;
}

export async function apiPatch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return executeWithAuth(
    path,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    handleJsonResponse,
  ) as Promise<T>;
}

export async function apiPut<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return executeWithAuth(
    path,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
    handleJsonResponse,
  ) as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  return executeWithAuth(
    path,
    {
      method: 'DELETE',
    },
    handleJsonResponse,
  ) as Promise<T>;
}

export type AdminDashboardMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  totalExports: number;
  recentActivity: Array<{
    id: string;
    userEmail: string;
    action: string;
    resource: string;
    createdAt: string;
  }>;
};

export async function getAdminDashboard(): Promise<AdminDashboardMetrics> {
  return apiGet<AdminDashboardMetrics>('/admin/dashboard');
}

export type AdminDashboardTrends = {
  usersByMonth: Array<{ month: string; count: number }>;
  activityByWeek: Array<{ week: string; count: number }>;
  exportsByWeek: Array<{ week: string; count: number }>;
  topReports: Array<{ reportId: string; count: number }>;
  topSectors: Array<{ sector: string; count: number }>;
};

export async function getAdminDashboardTrends(): Promise<AdminDashboardTrends> {
  return apiGet<AdminDashboardTrends>('/admin/dashboard/trends');
}

export type RetentionConfig = {
  auditLogDays: number;
  refreshTokenDays: number;
  exportDays: number;
};

export type RetentionResult = {
  anonymizedLogs: number;
  deletedTokens: number;
  deletedExports: number;
};

export async function getRetentionStatus(): Promise<RetentionConfig> {
  return apiGet<RetentionConfig>('/admin/retention/status');
}

export async function runRetention(): Promise<RetentionResult> {
  return apiPost<RetentionResult>('/admin/retention/run', {});
}

export async function anonymizeUser(userId: string): Promise<{ anonymized: true }> {
  return apiPost<{ anonymized: true }>(`/admin/users/${userId}/anonymize`, {});
}

export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  return apiGet<Record<string, unknown>>(`/admin/users/${userId}/data-export`);
}
