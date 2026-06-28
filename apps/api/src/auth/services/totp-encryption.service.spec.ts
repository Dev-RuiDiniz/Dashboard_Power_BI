import { ConfigService } from '@nestjs/config';

import { TotpEncryptionService } from './totp-encryption.service';

function createConfigService(key?: string): jest.Mocked<ConfigService> {
  return {
    get: jest.fn((name: string) => (name === 'TOTP_ENCRYPTION_KEY' ? key : undefined)),
  } as unknown as jest.Mocked<ConfigService>;
}

describe('TotpEncryptionService', () => {
  it('deve criptografar e descriptografar retornando o valor original', () => {
    const service = new TotpEncryptionService(
      createConfigService('test-encryption-key-32-chars-long!!'),
    );
    const plaintext = 'JBSWY3DPEHPK3PXP';

    const encrypted = service.encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('deve produzir ciphertext diferente a cada encrypt (IV aleatorio)', () => {
    const service = new TotpEncryptionService(
      createConfigService('test-encryption-key-32-chars-long!!'),
    );
    const plaintext = 'JBSWY3DPEHPK3PXP';

    const enc1 = service.encrypt(plaintext);
    const enc2 = service.encrypt(plaintext);

    expect(enc1).not.toBe(enc2);
    expect(service.decrypt(enc1)).toBe(plaintext);
    expect(service.decrypt(enc2)).toBe(plaintext);
  });

  it('deve falhar ao descriptografar com chave diferente', () => {
    const service1 = new TotpEncryptionService(
      createConfigService('key-one-32-characters-long-123456'),
    );
    const service2 = new TotpEncryptionService(
      createConfigService('key-two-32-characters-long-123456'),
    );

    const encrypted = service1.encrypt('JBSWY3DPEHPK3PXP');

    expect(() => service2.decrypt(encrypted)).toThrow();
  });

  it('deve retornar plaintext quando chave nao definida (fallback)', () => {
    const service = new TotpEncryptionService(createConfigService(undefined));

    const plaintext = 'JBSWY3DPEHPK3PXP';
    expect(service.encrypt(plaintext)).toBe(plaintext);
    expect(service.decrypt(plaintext)).toBe(plaintext);
  });
});
