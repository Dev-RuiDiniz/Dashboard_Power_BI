import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, HttpStatus, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UsersRepository } from './repositories/users.repository';
import { LoginAttemptsService } from './services/login-attempts.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { TokenService } from './services/token.service';
import { TotpAttemptsService } from './services/totp-attempts.service';
import { TotpEncryptionService } from './services/totp-encryption.service';
import { TotpService } from './services/totp.service';
import { RedisConnectionService } from '../common/redis-connection.service';

function createRedisMock(): RedisConnectionService {
  return { getClient: async () => null } as unknown as RedisConnectionService;
}

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
      TOTP_MAX_ATTEMPTS: 3,
      TOTP_WINDOW_SECONDS: 300,
      TOTP_LOCKOUT_SECONDS: 900,
    });

    usersRepository = new UsersRepository(configService);
    refreshTokenRepository = new RefreshTokenRepository();
    loginAttemptsService = new LoginAttemptsService(configService, createRedisMock());

    authService = new AuthService(
      usersRepository,
      refreshTokenRepository,
      loginAttemptsService,
      new TokenService(configService),
      new TotpService(),
      new TotpAttemptsService(configService, createRedisMock()),
      new TotpEncryptionService(configService),
      new TokenBlacklistService(createRedisMock()),
      configService,
    );
  });

  it('deve autenticar credenciais válidas e emitir tokens', async () => {
    const result = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');

    if ('requiresTwoFactor' in result) {
      throw new Error('Não deveria requerer 2FA para usuário padrão.');
    }

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBe(900);
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

    expect(
      (await loginAttemptsService.getAttemptStatus('admin@example.com', '127.0.0.1')).attempts,
    ).toBe(0);
  });

  function getTokens(result: Awaited<ReturnType<typeof authService.login>>) {
    if ('requiresTwoFactor' in result) {
      throw new Error('Não deveria requerer 2FA para usuário padrão.');
    }
    return result;
  }

  it('deve armazenar refresh token apenas como hash bcrypt', async () => {
    const tokens = getTokens(
      await authService.login('admin@example.com', 'Admin123!', '127.0.0.1'),
    );
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
    const tokens = getTokens(
      await authService.login('admin@example.com', 'Admin123!', '127.0.0.1'),
    );
    const rotatedTokens = await authService.refresh(tokens.refreshToken);

    expect(rotatedTokens.refreshToken).not.toBe(tokens.refreshToken);
    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve invalidar refresh token no logout', async () => {
    const tokens = getTokens(
      await authService.login('admin@example.com', 'Admin123!', '127.0.0.1'),
    );

    await expect(authService.logout(tokens.refreshToken)).resolves.toEqual({ success: true });
    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve blacklistar access token no logout quando jti e exp fornecidos', async () => {
    const tokens = getTokens(
      await authService.login('admin@example.com', 'Admin123!', '127.0.0.1'),
    );
    const futureExp = Math.floor(Date.now() / 1000) + 3600;

    await expect(authService.logout(tokens.refreshToken, tokens.jti, futureExp)).resolves.toEqual({
      success: true,
    });
  });

  it('deve revogar todas as sessões do usuário com revokeAllSessions', async () => {
    const tokens = getTokens(
      await authService.login('admin@example.com', 'Admin123!', '127.0.0.1'),
    );

    await expect(authService.revokeAllSessions('demo-admin')).resolves.toEqual({ success: true });

    const user = await usersRepository.findById('demo-admin');
    expect(user!.tokenVersion).toBe(1);

    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve invalidar todas as sessões ao trocar senha', async () => {
    const tokens = getTokens(
      await authService.login('admin@example.com', 'Admin123!', '127.0.0.1'),
    );

    await expect(
      authService.changePassword('demo-admin', 'Admin123!', 'NovaSenha123!'),
    ).resolves.toEqual({ success: true });

    const user = await usersRepository.findById('demo-admin');
    expect(user!.tokenVersion).toBe(1);

    await expect(authService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve rejeitar refresh token inválido', async () => {
    await expect(
      authService.refresh('refresh-token-invalido-com-tamanho-minimo'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve permitir refresh para usuário não-demo (viewer)', async () => {
    const tokens = getTokens(
      await authService.login('viewer.financeiro@example.com', 'Admin123!', '127.0.0.1'),
    );

    expect(tokens.refreshToken).toEqual(expect.any(String));

    const rotatedTokens = await authService.refresh(tokens.refreshToken);

    expect(rotatedTokens.accessToken).toEqual(expect.any(String));
    expect(rotatedTokens.refreshToken).not.toBe(tokens.refreshToken);
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

  it('deve retornar tempToken quando 2FA está ativo no login', async () => {
    const user = await usersRepository.findByEmail('admin@example.com');

    expect(user).toBeDefined();
    await usersRepository.updateTotpSecret(user!.id, 'JBSWY3DPEHPK3PXP');
    await usersRepository.enableTotp(user!.id);

    const result = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');

    expect('requiresTwoFactor' in result).toBe(true);
    if ('requiresTwoFactor' in result) {
      expect(result.tempToken).toEqual(expect.any(String));
    }
  });

  it('deve concluir login TOTP com código válido', async () => {
    const totpService = new TotpService();
    const user = await usersRepository.findByEmail('admin@example.com');

    expect(user).toBeDefined();
    const setup = totpService.generateSecret(user!.id, user!.email);
    await usersRepository.updateTotpSecret(user!.id, setup.secret);
    await usersRepository.enableTotp(user!.id);

    const loginResult = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');
    expect('requiresTwoFactor' in loginResult).toBe(true);

    if ('requiresTwoFactor' in loginResult) {
      const counter = Math.floor(Date.now() / 1000 / 30);
      const code = totpService.generateTokenAtCounter(setup.secret, counter);
      const tokens = await authService.totpLogin(loginResult.tempToken, code);

      expect(tokens.accessToken).toEqual(expect.any(String));
      expect(tokens.refreshToken).toEqual(expect.any(String));
    }
  });

  it('deve rejeitar login TOTP com código inválido', async () => {
    const totpService = new TotpService();
    const user = await usersRepository.findByEmail('admin@example.com');

    expect(user).toBeDefined();
    const setup = totpService.generateSecret(user!.id, user!.email);
    await usersRepository.updateTotpSecret(user!.id, setup.secret);
    await usersRepository.enableTotp(user!.id);

    const loginResult = await authService.login('admin@example.com', 'Admin123!', '127.0.0.1');
    expect('requiresTwoFactor' in loginResult).toBe(true);

    if ('requiresTwoFactor' in loginResult) {
      await expect(authService.totpLogin(loginResult.tempToken, '000000')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    }
  });

  it('deve configurar e ativar 2FA com sucesso', async () => {
    const setup = await authService.setupTotp('demo-admin');

    expect(setup.secret).toEqual(expect.any(String));
    expect(setup.otpauthUrl).toContain('otpauth://totp/');

    const totpService = new TotpService();
    const counter = Math.floor(Date.now() / 1000 / 30);
    const code = totpService.generateTokenAtCounter(setup.secret, counter);

    await expect(authService.verifyTotpSetup('demo-admin', code)).resolves.toEqual({
      enabled: true,
    });

    const user = await usersRepository.findById('demo-admin');

    expect(user!.isTwoFactorEnabled).toBe(true);
  });

  it('deve desativar 2FA com sucesso para usuario nao-admin', async () => {
    const totpService = new TotpService();
    const viewer = await usersRepository.findByEmail('viewer.financeiro@example.com');

    expect(viewer).toBeDefined();
    const setup = totpService.generateSecret(viewer!.id, viewer!.email);

    await usersRepository.updateTotpSecret(viewer!.id, setup.secret);
    await usersRepository.enableTotp(viewer!.id);

    const counter = Math.floor(Date.now() / 1000 / 30);
    const code = totpService.generateTokenAtCounter(setup.secret, counter);

    await expect(authService.disableTotp(viewer!.id, code, 'Admin123!')).resolves.toEqual({
      disabled: true,
    });

    const user = await usersRepository.findById(viewer!.id);

    expect(user!.isTwoFactorEnabled).toBe(false);
    expect(user!.totpSecret).toBeNull();
  });

  it('deve rejeitar desativacao de 2FA para admin', async () => {
    const totpService = new TotpService();
    const setup = totpService.generateSecret('demo-admin', 'admin@example.com');

    await usersRepository.updateTotpSecret('demo-admin', setup.secret);
    await usersRepository.enableTotp('demo-admin');

    const counter = Math.floor(Date.now() / 1000 / 30);
    const code = totpService.generateTokenAtCounter(setup.secret, counter);

    await expect(authService.disableTotp('demo-admin', code, 'Admin123!')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve rejeitar refresh por inatividade após timeout', async () => {
    const configWithShortTimeout = new ConfigService({
      AUTH_DEMO_USER_EMAIL: 'admin@example.com',
      AUTH_DEMO_USER_PASSWORD: 'Admin123!',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_ACCESS_EXPIRES_IN_SECONDS: 900,
      JWT_REFRESH_EXPIRES_IN_SECONDS: 604800,
      SESSION_INACTIVITY_TIMEOUT_SECONDS: 1,
      BCRYPT_SALT_ROUNDS: 4,
      AUTH_LOGIN_MAX_ATTEMPTS: 2,
      AUTH_LOGIN_WINDOW_SECONDS: 60,
      AUTH_LOGIN_LOCKOUT_SECONDS: 60,
      TOTP_MAX_ATTEMPTS: 3,
      TOTP_WINDOW_SECONDS: 300,
      TOTP_LOCKOUT_SECONDS: 900,
    });

    const inactivityAuthService = new AuthService(
      new UsersRepository(configWithShortTimeout),
      new RefreshTokenRepository(),
      new LoginAttemptsService(configWithShortTimeout, createRedisMock()),
      new TokenService(configWithShortTimeout),
      new TotpService(),
      new TotpAttemptsService(configWithShortTimeout, createRedisMock()),
      new TotpEncryptionService(configWithShortTimeout),
      new TokenBlacklistService(createRedisMock()),
      configWithShortTimeout,
    );

    const tokens = getTokens(
      await inactivityAuthService.login('admin@example.com', 'Admin123!', '127.0.0.1'),
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await expect(inactivityAuthService.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve permitir refresh quando timeout é desabilitado (0)', async () => {
    const configNoTimeout = new ConfigService({
      AUTH_DEMO_USER_EMAIL: 'admin@example.com',
      AUTH_DEMO_USER_PASSWORD: 'Admin123!',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_ACCESS_EXPIRES_IN_SECONDS: 900,
      JWT_REFRESH_EXPIRES_IN_SECONDS: 604800,
      SESSION_INACTIVITY_TIMEOUT_SECONDS: 0,
      BCRYPT_SALT_ROUNDS: 4,
      AUTH_LOGIN_MAX_ATTEMPTS: 2,
      AUTH_LOGIN_WINDOW_SECONDS: 60,
      AUTH_LOGIN_LOCKOUT_SECONDS: 60,
      TOTP_MAX_ATTEMPTS: 3,
      TOTP_WINDOW_SECONDS: 300,
      TOTP_LOCKOUT_SECONDS: 900,
    });

    const noTimeoutAuthService = new AuthService(
      new UsersRepository(configNoTimeout),
      new RefreshTokenRepository(),
      new LoginAttemptsService(configNoTimeout, createRedisMock()),
      new TokenService(configNoTimeout),
      new TotpService(),
      new TotpAttemptsService(configNoTimeout, createRedisMock()),
      new TotpEncryptionService(configNoTimeout),
      new TokenBlacklistService(createRedisMock()),
      configNoTimeout,
    );

    const tokens = getTokens(
      await noTimeoutAuthService.login('admin@example.com', 'Admin123!', '127.0.0.1'),
    );

    await expect(noTimeoutAuthService.refresh(tokens.refreshToken)).resolves.toMatchObject({
      tokenType: 'Bearer',
    });
  });
});
