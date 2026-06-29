import { UnauthorizedException } from '@nestjs/common';
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
      jti: '',
      tv: 0,
    });

    const payload = service.verifyAccessToken(token.token);

    expect(payload.sub).toBe('user-1');
    expect(payload.roles).toEqual(['viewer']);
    expect(payload.sectors).toEqual(['financeiro']);
    expect(payload.jti).toBeDefined();
    expect(payload.tv).toBe(0);
  });

  it('deve rejeitar token com assinatura inválida', () => {
    const token = service.createAccessToken({
      sub: 'user-1',
      email: 'viewer.financeiro@example.com',
      roles: ['viewer'],
      sectors: ['financeiro'],
      jti: '',
      tv: 0,
    });

    expect(() => service.verifyAccessToken(`${token.token}invalid`)).toThrow();
  });

  it('deve rejeitar token com assinatura tampered (payload modificado)', () => {
    const token = service.createAccessToken({
      sub: 'user-1',
      email: 'viewer.financeiro@example.com',
      roles: ['viewer'],
      sectors: ['financeiro'],
      jti: '',
      tv: 0,
    });

    const parts = token.token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        sub: 'user-2',
        roles: ['admin'],
        exp: Math.floor(Date.now() / 1000) + 9999,
      }),
    ).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    expect(() => service.verifyAccessToken(tamperedToken)).toThrow(UnauthorizedException);
  });

  it('deve rejeitar token com estrutura malformada', () => {
    expect(() => service.verifyAccessToken('not-a-jwt')).toThrow(UnauthorizedException);
    expect(() => service.verifyAccessToken('a.b')).toThrow(UnauthorizedException);
    expect(() => service.verifyAccessToken('')).toThrow(UnauthorizedException);
  });

  it('deve criar e verificar token TOTP pendente', () => {
    const { token } = service.createTotpPendingToken('user-1');

    const payload = service.verifyTotpPendingToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.type).toBe('totp_pending');
  });

  it('deve rejeitar token TOTP com assinatura inválida', () => {
    const { token } = service.createTotpPendingToken('user-1');
    const parts = token.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}.invalid-signature`;

    expect(() => service.verifyTotpPendingToken(tamperedToken)).toThrow(UnauthorizedException);
  });
});
