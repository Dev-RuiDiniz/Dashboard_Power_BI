import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UsersRepository } from './repositories/users.repository';
import { TokenService } from './services/token.service';

describe('AuthService', () => {
  let authService: AuthService;
  let refreshTokenRepository: RefreshTokenRepository;

  beforeEach(() => {
    const configService = new ConfigService({
      AUTH_DEMO_USER_EMAIL: 'admin@example.com',
      AUTH_DEMO_USER_PASSWORD: 'Admin123!',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_ACCESS_EXPIRES_IN_SECONDS: 900,
      JWT_REFRESH_EXPIRES_IN_SECONDS: 604800,
      BCRYPT_SALT_ROUNDS: 4,
    });

    const usersRepository = new UsersRepository(configService);
    refreshTokenRepository = new RefreshTokenRepository();

    authService = new AuthService(
      usersRepository,
      refreshTokenRepository,
      new TokenService(configService),
      configService,
    );
  });

  it('deve autenticar credenciais válidas e emitir tokens', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!');

    expect(tokens.accessToken).toEqual(expect.any(String));
    expect(tokens.refreshToken).toEqual(expect.any(String));
    expect(tokens.tokenType).toBe('Bearer');
    expect(tokens.expiresIn).toBe(900);
  });

  it('deve rejeitar senha inválida', async () => {
    await expect(authService.login('admin@example.com', 'SenhaErrada123!')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve rejeitar usuário inexistente', async () => {
    await expect(authService.login('unknown@example.com', 'Admin123!')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve armazenar refresh token apenas como hash bcrypt', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!');
    const sessions = await refreshTokenRepository.findActiveByUserId('demo-admin');

    expect(sessions).toHaveLength(1);
    expect(sessions[0].refreshTokenHash).not.toBe(tokens.refreshToken);
    await expect(bcrypt.compare(tokens.refreshToken, sessions[0].refreshTokenHash)).resolves.toBe(
      true,
    );
  });

  it('deve rotacionar refresh token e invalidar o token anterior', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!');
    const rotatedTokens = await authService.refresh(tokens.refreshToken);

    expect(rotatedTokens.refreshToken).not.toBe(tokens.refreshToken);
    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve invalidar refresh token no logout', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!');

    await expect(authService.logout(tokens.refreshToken)).resolves.toEqual({ success: true });
    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve rejeitar refresh token inválido', async () => {
    await expect(authService.refresh('refresh-token-invalido-com-tamanho-minimo')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
