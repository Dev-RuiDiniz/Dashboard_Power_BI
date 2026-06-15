import { TotpService } from './totp.service';

describe('TotpService', () => {
  const service = new TotpService();

  it('deve gerar secret base32 e otpauthUrl', () => {
    const result = service.generateSecret('user-1', 'test@example.com');

    expect(result.secret).toMatch(/^[A-Z2-7]+$/);
    expect(result.secret.length).toBe(32);
    expect(result.otpauthUrl).toContain('otpauth://totp/');
    expect(result.otpauthUrl).toContain(result.secret);
    expect(result.otpauthUrl).toContain('test%40example.com');
  });

  it('deve verificar token gerado no mesmo time step', () => {
    const { secret } = service.generateSecret('user-1', 'test@example.com');
    const counter = Math.floor(Date.now() / 1000 / 30);
    const token = service.generateTokenAtCounter(secret, counter);

    expect(service.verifyToken(secret, token)).toBe(true);
  });

  it('deve rejeitar token inválido', () => {
    const { secret } = service.generateSecret('user-1', 'test@example.com');

    expect(service.verifyToken(secret, '000000')).toBe(false);
    expect(service.verifyToken(secret, '999999')).toBe(false);
    expect(service.verifyToken(secret, 'abcdef')).toBe(false);
  });

  it('deve aceitar token no time step anterior (janela ±1)', () => {
    const { secret } = service.generateSecret('user-1', 'test@example.com');
    const counter = Math.floor(Date.now() / 1000 / 30) - 1;
    const token = service.generateTokenAtCounter(secret, counter);

    expect(service.verifyToken(secret, token)).toBe(true);
  });
});
