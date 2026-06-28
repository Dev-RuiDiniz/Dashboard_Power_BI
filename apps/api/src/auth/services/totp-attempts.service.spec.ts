import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TotpAttemptsService } from './totp-attempts.service';

function createConfigService(overrides: Record<string, unknown> = {}): jest.Mocked<ConfigService> {
  const defaults: Record<string, unknown> = {
    TOTP_MAX_ATTEMPTS: 3,
    TOTP_WINDOW_SECONDS: 300,
    TOTP_LOCKOUT_SECONDS: 900,
  };
  const merged = { ...defaults, ...overrides };
  return {
    get: jest.fn((key: string) => merged[key]),
  } as unknown as jest.Mocked<ConfigService>;
}

describe('TotpAttemptsService', () => {
  let service: TotpAttemptsService;

  beforeEach(() => {
    service = new TotpAttemptsService(createConfigService());
  });

  it('deve permitir tentativa quando sem falhas previas', () => {
    expect(() => service.assertCanAttempt('user-1')).not.toThrow();
  });

  it('deve bloquear apos 3 falhas', () => {
    service.registerFailure('user-1');
    service.registerFailure('user-1');
    service.registerFailure('user-1');

    expect(() => service.assertCanAttempt('user-1')).toThrow(HttpException);
    try {
      service.assertCanAttempt('user-1');
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it('deve limpar falhas apos sucesso', () => {
    service.registerFailure('user-1');
    service.registerFailure('user-1');
    service.clearFailures('user-1');

    expect(() => service.assertCanAttempt('user-1')).not.toThrow();
  });

  it('deve permitir apos bloqueio expirar', () => {
    service.registerFailure('user-1');
    service.registerFailure('user-1');
    service.registerFailure('user-1');

    expect(() => service.assertCanAttempt('user-1')).toThrow();

    const future = Date.now() + 901 * 1000;
    jest.spyOn(Date, 'now').mockReturnValue(future);

    expect(() => service.assertCanAttempt('user-1')).not.toThrow();

    jest.restoreAllMocks();
  });

  it('deve rastrear usuarios independentemente', () => {
    service.registerFailure('user-1');
    service.registerFailure('user-1');
    service.registerFailure('user-1');

    expect(() => service.assertCanAttempt('user-1')).toThrow();
    expect(() => service.assertCanAttempt('user-2')).not.toThrow();
  });
});
