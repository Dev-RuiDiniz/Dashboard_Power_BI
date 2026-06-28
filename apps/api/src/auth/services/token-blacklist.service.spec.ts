import { TokenBlacklistService } from './token-blacklist.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;

  beforeEach(() => {
    service = new TokenBlacklistService();
  });

  it('deve retornar false para jti não blacklistado', () => {
    expect(service.isBlacklisted('nonexistent-jti')).toBe(false);
  });

  it('deve blacklistar e retornar true para jti válido', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;

    service.add('test-jti', futureExp);

    expect(service.isBlacklisted('test-jti')).toBe(true);
  });

  it('deve remover entradas expiradas no isBlacklisted', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100;

    service.add('expired-jti', pastExp);

    expect(service.isBlacklisted('expired-jti')).toBe(false);
    expect(service.size).toBe(0);
  });

  it('deve limpar entradas expiradas no cleanup', () => {
    const now = Math.floor(Date.now() / 1000);

    service.add('valid-jti', now + 3600);
    service.add('expired-jti-1', now - 100);
    service.add('expired-jti-2', now - 200);

    service.cleanup();

    expect(service.size).toBe(1);
    expect(service.isBlacklisted('valid-jti')).toBe(true);
  });

  it('deve disparar cleanup automático ao atingir threshold', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const pastExp = Math.floor(Date.now() / 1000) - 100;

    for (let i = 0; i < 99; i++) {
      service.add(`jti-${i}`, pastExp);
    }

    expect(service.size).toBe(99);

    service.add('trigger-jti', futureExp);

    expect(service.size).toBe(1);
    expect(service.isBlacklisted('trigger-jti')).toBe(true);
  });
});
