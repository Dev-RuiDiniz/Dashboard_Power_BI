import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersRepository } from '../repositories/users.repository';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { TokenService } from '../services/token.service';

function createMockContext(authHeader?: string): ExecutionContext {
  const request: Record<string, unknown> = {
    headers: authHeader ? { authorization: authHeader } : {},
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let tokenService: TokenService;
  let tokenBlacklistService: TokenBlacklistService;
  let usersRepository: UsersRepository;

  beforeEach(() => {
    const configService = new ConfigService({
      AUTH_DEMO_USER_EMAIL: 'admin@example.com',
      AUTH_DEMO_USER_PASSWORD: 'Admin123!',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_ACCESS_EXPIRES_IN_SECONDS: 900,
      BCRYPT_SALT_ROUNDS: 4,
    });

    usersRepository = new UsersRepository(configService);
    tokenBlacklistService = new TokenBlacklistService();
    tokenService = new TokenService(configService);
    guard = new JwtAuthGuard(tokenService, tokenBlacklistService, usersRepository);
  });

  function createTokenForUser(
    userId: string,
    email: string,
    roles: string[],
    sectors: string[],
    tv: number,
  ): string {
    const result = tokenService.createAccessToken({
      sub: userId,
      email,
      roles: roles as never,
      sectors: sectors as never,
      jti: 'test-jti',
      tv,
    });
    return result.token;
  }

  it('deve rejeitar requisição sem authorization header', async () => {
    await expect(guard.canActivate(createMockContext())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve aceitar token válido com tv correto', async () => {
    const token = createTokenForUser(
      'demo-admin',
      'admin@example.com',
      ['admin'],
      ['diretoria'],
      0,
    );

    await expect(guard.canActivate(createMockContext(`Bearer ${token}`))).resolves.toBe(true);
  });

  it('deve rejeitar token com jti blacklistado', async () => {
    const result = tokenService.createAccessToken({
      sub: 'demo-admin',
      email: 'admin@example.com',
      roles: ['admin'] as never,
      sectors: ['diretoria'] as never,
      jti: '',
      tv: 0,
    });

    tokenBlacklistService.add(result.jti, Math.floor(Date.now() / 1000) + 3600);

    await expect(
      guard.canActivate(createMockContext(`Bearer ${result.token}`)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve rejeitar token com tv desatualizado', async () => {
    const token = createTokenForUser(
      'demo-admin',
      'admin@example.com',
      ['admin'],
      ['diretoria'],
      0,
    );

    await usersRepository.incrementTokenVersion('demo-admin');

    await expect(guard.canActivate(createMockContext(`Bearer ${token}`))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve rejeitar token de usuário desativado', async () => {
    const token = createTokenForUser(
      'demo-admin',
      'admin@example.com',
      ['admin'],
      ['diretoria'],
      0,
    );

    await usersRepository.deactivate('demo-admin');

    await expect(guard.canActivate(createMockContext(`Bearer ${token}`))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
