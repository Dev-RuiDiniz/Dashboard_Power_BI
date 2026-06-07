import { AuthClientError } from './errors';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

export type ForgotPasswordResponse = {
  success: true;
  message: string;
};

export type ResetPasswordResponse = {
  success: true;
};

const DEFAULT_API_URL = 'http://localhost:3001';

function getApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw mapAuthError(response.status, body);
  }

  return body as T;
}

function mapAuthError(status: number, body: Record<string, unknown>): AuthClientError {
  const fallbackMessage = typeof body.message === 'string' ? body.message : undefined;

  if (status === 401) {
    return new AuthClientError('invalid_credentials', 'E-mail ou senha inválidos.', status);
  }

  if (status === 429) {
    return new AuthClientError(
      'rate_limited',
      'Muitas tentativas de login. Tente novamente mais tarde.',
      status,
    );
  }

  if (status === 400) {
    return new AuthClientError(
      'invalid_reset_token',
      fallbackMessage ?? 'Token de recuperação inválido ou expirado.',
      status,
    );
  }

  return new AuthClientError(
    'unexpected_error',
    fallbackMessage ?? 'Erro inesperado ao comunicar com a API.',
    status,
  );
}

async function post<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  try {
    const response = await fetch(`${getApiUrl()}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return parseJsonResponse<T>(response);
  } catch (error) {
    if (error instanceof AuthClientError) {
      throw error;
    }

    throw new AuthClientError(
      'network_error',
      'Não foi possível conectar à API. Verifique sua conexão.',
    );
  }
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', { email, password });
}

export function refreshSession(refreshToken: string): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/refresh', { refreshToken });
}

export function logout(refreshToken: string): Promise<{ success: true }> {
  return post<{ success: true }>('/auth/logout', { refreshToken });
}

export function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return post<ForgotPasswordResponse>('/auth/forgot-password', { email });
}

export function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  return post<ResetPasswordResponse>('/auth/reset-password', { token, newPassword });
}
