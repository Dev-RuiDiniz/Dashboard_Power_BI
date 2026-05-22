import { TooManyRequestsException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LoginAttemptsService } from './login-attempts.service';

describe('LoginAttemptsService', () => {
  let service: LoginAttemptsService;

  beforeEach(() => {
    service = new LoginAttemptsService(
      new ConfigService({
        AUTH_LOGIN_MAX_ATTEMPTS: 2,
        AUTH_LOGIN_WINDOW_SECONDS: 60,
        AUTH_LOGIN_LOCKOUT_SECONDS: 60,
      }),
    );
  });

  it('deve permitir login quando não houver falhas registradas', () => {
    expect(service.getAttemptStatus('Admin@Example.com', '127.0.0.1')).toEqual({
      allowed: true,
      attempts: 0,
      remainingAttempts: 2,
      retryAfterSeconds: 0,
    });
  });

  it('deve registrar falha de login', () => {
    const status = service.recordFailure('admin@example.com', '127.0.0.1');

    expect(status.allowed).toBe(true);
    expect(status.attempts).toBe(1);
    expect(status.remainingAttempts).toBe(1);
  });

  it('deve bloquear após atingir o limite de falhas dentro da janela', () => {
    service.recordFailure('admin@example.com', '127.0.0.1');
    const status = service.recordFailure('admin@example.com', '127.0.0.1');

    expect(status.allowed).toBe(false);
    expect(status.retryAfterSeconds).toBeGreaterThan(0);
    expect(() => service.assertCanAttempt('admin@example.com', '127.0.0.1')).toThrow(TooManyRequestsException);
  });

  it('deve limpar falhas após login bem-sucedido', () => {
    service.recordFailure('admin@example.com', '127.0.0.1');

    service.clearFailures('admin@example.com', '127.0.0.1');

    expect(service.getAttemptStatus('admin@example.com', '127.0.0.1')).toEqual({
      allowed: true,
      attempts: 0,
      remainingAttempts: 2,
      retryAfterSeconds: 0,
    });
  });

  it('deve usar chave baseada em e-mail normalizado e IP', () => {
    const firstKey = service.buildKey('Admin@Example.com ', '127.0.0.1');
    const secondKey = service.buildKey('admin@example.com', '127.0.0.1');
    const thirdKey = service.buildKey('admin@example.com', '10.0.0.1');

    expect(firstKey).toBe(secondKey);
    expect(firstKey).not.toBe(thirdKey);
  });

  it('deve mascarar e-mail para logs seguros', () => {
    expect(service.maskEmail('admin@example.com')).toBe('ad***@example.com');
  });
});
