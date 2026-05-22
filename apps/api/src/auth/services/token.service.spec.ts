import { ConfigService } from '@nestjs/config';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    service = new TokenService(
      new ConfigService({
        JWT_ACCESS_SECRET: 'test-secret',
        JWT_ACCESS_EXPIRES_IN_SECONDS: 900,
      }),
    );
  });

  it('deve incluir roles e setores no access token', () => {
    const token = service.createAccessToken({
      sub: 'user-1',
      email: 'viewer.financeiro@example.com',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    const payload = service.verifyAccessToken(token.token);

    expect(payload.sub).toBe('user-1');
    expect(payload.roles).toEqual(['viewer']);
    expect(payload.sectors).toEqual(['financeiro']);
  });

  it('deve rejeitar token com assinatura inválida', () => {
    const token = service.createAccessToken({
      sub: 'user-1',
      email: 'viewer.financeiro@example.com',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    expect(() => service.verifyAccessToken(`${token.token}invalid`)).toThrow();
  });
});
