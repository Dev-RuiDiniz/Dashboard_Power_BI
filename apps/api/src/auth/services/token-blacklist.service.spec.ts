import { TokenBlacklistService } from './token-blacklist.service';
import { RedisConnectionService } from '../../common/redis-connection.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;

  beforeEach(() => {
    const redisMock = { getClient: async () => null } as unknown as RedisConnectionService;
    service = new TokenBlacklistService(redisMock);
  });

  it('deve retornar false para jti não blacklistado', async () => {
    expect(await service.isBlacklisted('nonexistent-jti')).toBe(false);
  });

  it('deve blacklistar e retornar true para jti válido', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;

    await service.add('test-jti', futureExp);

    expect(await service.isBlacklisted('test-jti')).toBe(true);
  });

  it('deve remover entradas expiradas no isBlacklisted', async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100;

    await service.add('expired-jti', pastExp);

    expect(await service.isBlacklisted('expired-jti')).toBe(false);
    expect(service.size).toBe(0);
  });

  it('deve limpar entradas expiradas no cleanup', async () => {
    const now = Math.floor(Date.now() / 1000);

    await service.add('valid-jti', now + 3600);
    await service.add('expired-jti-1', now - 100);
    await service.add('expired-jti-2', now - 200);

    service.cleanup();

    expect(service.size).toBe(1);
    expect(await service.isBlacklisted('valid-jti')).toBe(true);
  });

  it('deve disparar cleanup automático ao atingir threshold', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const pastExp = Math.floor(Date.now() / 1000) - 100;

    for (let i = 0; i < 99; i++) {
      await service.add(`jti-${i}`, pastExp);
    }

    expect(service.size).toBe(99);

    await service.add('trigger-jti', futureExp);

    expect(service.size).toBe(1);
    expect(await service.isBlacklisted('trigger-jti')).toBe(true);
  });
});
