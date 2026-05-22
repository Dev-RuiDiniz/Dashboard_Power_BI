export type AuthErrorCode =
  | 'invalid_credentials'
  | 'rate_limited'
  | 'invalid_reset_token'
  | 'network_error'
  | 'unexpected_error';

export class AuthClientError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'AuthClientError';
  }
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthClientError) {
    return error.message;
  }

  return 'Não foi possível concluir a solicitação. Tente novamente.';
}
