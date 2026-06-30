import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TotpAttemptsService } from './totp-attempts.service';
import { RedisConnectionService } from '../../common/redis-connection.service';

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
    const redisMock = { getClient: async () => null } as unknown as RedisConnectionService;
    service = new TotpAttemptsService(createConfigService(), redisMock);
  });

  it('deve permitir tentativa quando sem falhas previas', async () => {
    await expect(service.assertCanAttempt('user-1')).resolves.toBeUndefined();
  });

  it('deve bloquear apos 3 falhas', async () => {
    await service.registerFailure('user-1');
    await service.registerFailure('user-1');
    await service.registerFailure('user-1');

    await expect(service.assertCanAttempt('user-1')).rejects.toThrow(HttpException);
    try {
      await service.assertCanAttempt('user-1');
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it('deve limpar falhas apos sucesso', async () => {
    await service.registerFailure('user-1');
    await service.registerFailure('user-1');
    await service.clearFailures('user-1');

    await expect(service.assertCanAttempt('user-1')).resolves.toBeUndefined();
  });

  it('deve permitir apos bloqueio expirar', async () => {
    await service.registerFailure('user-1');
    await service.registerFailure('user-1');
    await service.registerFailure('user-1');

    await expect(service.assertCanAttempt('user-1')).rejects.toThrow();

    const future = Date.now() + 901 * 1000;
    jest.spyOn(Date, 'now').mockReturnValue(future);

    await expect(service.assertCanAttempt('user-1')).resolves.toBeUndefined();

    jest.restoreAllMocks();
  });

  it('deve rastrear usuarios independentemente', async () => {
    await service.registerFailure('user-1');
    await service.registerFailure('user-1');
    await service.registerFailure('user-1');

    await expect(service.assertCanAttempt('user-1')).rejects.toThrow();
    await expect(service.assertCanAttempt('user-2')).resolves.toBeUndefined();
  });
});
