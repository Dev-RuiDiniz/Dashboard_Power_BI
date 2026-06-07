import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UsersRepository } from './repositories/users.repository';
import { LoginAttemptsService } from './services/login-attempts.service';
import { TokenService } from './services/token.service';

describe('AuthService', () => {
  let authService: AuthService;
  let refreshTokenRepository: RefreshTokenRepository;
  let loginAttemptsService: LoginAttemptsService;
  let usersRepository: UsersRepository;

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

    usersRepository = new UsersRepository(configService);
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
    await expect(
      authService.login('admin@example.com', 'SenhaErrada123!', '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve rejeitar usuário inexistente', async () => {
    await expect(
      authService.login('unknown@example.com', 'Admin123!', '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve bloquear login após exceder limite de falhas', async () => {
    await expect(
      authService.login('admin@example.com', 'SenhaErrada123!', '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      authService.login('admin@example.com', 'SenhaErrada123!', '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      authService.login('admin@example.com', 'SenhaErrada123!', '127.0.0.1'),
    ).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
    await expect(
      authService.login('admin@example.com', 'Admin123!', '127.0.0.1'),
    ).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });

  it('deve limpar falhas após login válido', async () => {
    await expect(
      authService.login('admin@example.com', 'SenhaErrada123!', '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');

    expect(loginAttemptsService.getAttemptStatus('admin@example.com', '127.0.0.1').attempts).toBe(
      0,
    );
  });

  it('deve armazenar refresh token apenas como hash bcrypt', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');
    const sessions = await refreshTokenRepository.findActiveByUserId('demo-admin');
    const firstSession = sessions[0];

    expect(sessions).toHaveLength(1);
    expect(firstSession).toBeDefined();
    expect(firstSession!.refreshTokenHash).not.toBe(tokens.refreshToken);
    await expect(bcrypt.compare(tokens.refreshToken, firstSession!.refreshTokenHash)).resolves.toBe(
      true,
    );
  });

  it('deve rotacionar refresh token e invalidar o token anterior', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');
    const rotatedTokens = await authService.refresh(tokens.refreshToken);

    expect(rotatedTokens.refreshToken).not.toBe(tokens.refreshToken);
    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve invalidar refresh token no logout', async () => {
    const tokens = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');

    await expect(authService.logout(tokens.refreshToken)).resolves.toEqual({ success: true });
    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve rejeitar refresh token inválido', async () => {
    await expect(
      authService.refresh('refresh-token-invalido-com-tamanho-minimo'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve retornar o usuario autenticado sem expor password hash', async () => {
    await expect(authService.getCurrentUser('demo-admin')).resolves.toMatchObject({
      id: 'demo-admin',
      email: 'admin@example.com',
      roles: ['admin'],
      sectors: ['diretoria', 'financeiro', 'comercial', 'operacoes'],
      isActive: true,
    });
  });

  it('deve trocar a senha com sucesso quando a senha atual for valida', async () => {
    await expect(
      authService.changePassword('demo-admin', 'Admin123!', 'NovaSenha123!'),
    ).resolves.toEqual({ success: true });

    const updatedUser = await usersRepository.findById('demo-admin');

    expect(updatedUser).toBeDefined();
    await expect(bcrypt.compare('NovaSenha123!', updatedUser!.passwordHash)).resolves.toBe(true);
    await expect(
      authService.login('admin@example.com', 'NovaSenha123!', '127.0.0.1'),
    ).resolves.toMatchObject({
      tokenType: 'Bearer',
    });
  });

  it('deve rejeitar troca de senha com senha atual invalida', async () => {
    await expect(
      authService.changePassword('demo-admin', 'SenhaAtualErrada!', 'NovaSenha123!'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve rejeitar nova senha invalida', async () => {
    await expect(
      authService.changePassword('demo-admin', 'Admin123!', 'curta'),
    ).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
  });
});
