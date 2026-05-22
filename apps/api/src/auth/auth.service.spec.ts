import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { TooManyRequestsException, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UsersRepository } from './repositories/users.repository';
import { LoginAttemptsService } from './services/login-attempts.service';
import { TokenService } from './services/token.service';

describe('AuthService', () => {
  let authService: AuthService;
  let refreshTokenRepository: RefreshTokenRepository;
  let loginAttemptsService: LoginAttemptsService;

  beforeEach(() => {
    const configService = new ConfigService({
      AUTH_DEMO_USER_EMAIL: 'admin@example.com',
      AUTH_DEMO_USER_PASSWORD: 'Admin123!',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_ACCESS_EXPIRES_IN_SECONDS: 900,
      JWT_REFRESH_EXPIRES_IN_SECONDS: 604800,
      BCRYPT_SALT_ROUNDS: 4,
      AUTH_LOGIN_MAX_ATTEMPTS: 2,
      AUTH_LOGIN_WINDOW_SECONDS: 60,
      AUTH_LOGIN_LOCKOUT_SECONDS: 60,
    });

    const usersRepository = new UsersRepository(configService);
    refreshTokenRepository = new RefreshTokenRepository();
    loginAttemptsService = new LoginAttemptsService(configService);

    authService = new AuthService(
      usersRepository,
      refreshTokenRepository,
      loginAttemptsService,
      new TokenService(configService),
      configService,
    );
  });

  it('deve autenticar credenciais válidas e emitir tokens', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');

    expect(tokens.accessToken).toEqual(expect.any(String));
    expect(tokens.refreshToken).toEqual(expect.any(String));
    expect(tokens.tokenType).toBe('Bearer');
    expect(tokens.expiresIn).toBe(900);
  });

  it('deve rejeitar senha inválida', async () => {
    await expect(authService.login('admin@example.com', 'SenhaErrada123!', '127.0.0.1')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve rejeitar usuário inexistente', async () => {
    await expect(authService.login('unknown@example.com', 'Admin123!', '127.0.0.1')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve bloquear login após limite de falhas', async () => {
    await expect(authService.login('admin@example.com', 'SenhaErrada123!', '127.0.0.1')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(authService.login('admin@example.com', 'SenhaErrada123!', '127.0.0.1')).rejects.toBeInstanceOf(
      TooManyRequestsException,
    );
    await expect(authService.login('admin@example.com', 'Admin123!', '127.0.0.1')).rejects.toBeInstanceOf(
      TooManyRequestsException,
    );
  });

  it('deve limpar falhas após login válido', async () => {
    await expect(authService.login('admin@example.com', 'SenhaErrada123!', '127.0.0.1')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');

    expect(loginAttemptsService.getAttemptStatus('admin@example.com', '127.0.0.1').attempts).toBe(0);
  });

  it('deve armazenar refresh token apenas como hash bcrypt', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');
    const sessions = await refreshTokenRepository.findActiveByUserId('demo-admin');

    expect(sessions).toHaveLength(1);
    expect(sessions[0].refreshTokenHash).not.toBe(tokens.refreshToken);
    await expect(bcrypt.compare(tokens.refreshToken, sessions[0].refreshTokenHash)).resolves.toBe(true);
  });

  it('deve rotacionar refresh token e invalidar o token anterior', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');
    const rotatedTokens = await authService.refresh(tokens.refreshToken);

    expect(rotatedTokens.refreshToken).not.toBe(tokens.refreshToken);
    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve invalidar refresh token no logout', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');

    await expect(authService.logout(tokens.refreshToken)).resolves.toEqual({ success: true });
    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve rejeitar refresh token inválido', async () => {
    await expect(authService.refresh('refresh-token-invalido-com-tamanho-minimo')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
