import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UsersRepository } from '../repositories/users.repository';
import { EmailService } from './email.service';
import { PasswordResetService } from './password-reset.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let usersRepository: UsersRepository;
  let passwordResetTokenRepository: PasswordResetTokenRepository;
  let refreshTokenRepository: RefreshTokenRepository;
  let emailService: EmailService;

  beforeEach(() => {
    const configService = new ConfigService({
      AUTH_DEMO_USER_EMAIL: 'admin@example.com',
      AUTH_DEMO_USER_PASSWORD: 'Admin123!',
      BCRYPT_SALT_ROUNDS: 4,
      PASSWORD_RESET_TOKEN_EXPIRES_SECONDS: 900,
      PASSWORD_RESET_PUBLIC_URL: 'http://localhost:3000/reset-password',
      SMTP_MODE: 'mock',
    });

    usersRepository = new UsersRepository(configService);
    passwordResetTokenRepository = new PasswordResetTokenRepository();
    refreshTokenRepository = new RefreshTokenRepository();
    emailService = new EmailService(configService);

    service = new PasswordResetService(
      usersRepository,
      passwordResetTokenRepository,
      refreshTokenRepository,
      emailService,
      configService,
    );
  });

  it('deve retornar resposta genérica para usuário inexistente sem enviar e-mail', async () => {
    const response = await service.forgotPassword('unknown@example.com');

    expect(response.success).toBe(true);
    expect(response.message).toContain('Se o e-mail estiver cadastrado');
    expect(emailService.getSentEmails()).toHaveLength(0);
  });

  it('deve gerar token temporário e enviar e-mail mockado para usuário existente', async () => {
    const response = await service.forgotPassword('admin@example.com');
    const sentEmails = emailService.getSentEmails();
    const activeTokens = await passwordResetTokenRepository.findActiveByUserId('demo-admin');

    expect(response.success).toBe(true);
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe('admin@example.com');
    expect(sentEmails[0].resetUrl).toContain('token=');
    expect(activeTokens).toHaveLength(1);
    expect(sentEmails[0].resetUrl).not.toContain(activeTokens[0].tokenHash);
  });

  it('deve rejeitar token inválido', async () => {
    await expect(service.resetPassword('token-invalido-com-tamanho-minimo-para-teste', 'NovaSenha123!')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('deve rejeitar token já utilizado', async () => {
    await service.forgotPassword('admin@example.com');
    const token = new URL(emailService.getSentEmails()[0].resetUrl).searchParams.get('token') as string;

    await service.resetPassword(token, 'NovaSenha123!');

    await expect(service.resetPassword(token, 'OutraSenha123!')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deve rejeitar token expirado', async () => {
    const configService = new ConfigService({
      AUTH_DEMO_USER_EMAIL: 'admin@example.com',
      AUTH_DEMO_USER_PASSWORD: 'Admin123!',
      BCRYPT_SALT_ROUNDS: 4,
      PASSWORD_RESET_TOKEN_EXPIRES_SECONDS: -1,
      PASSWORD_RESET_PUBLIC_URL: 'http://localhost:3000/reset-password',
      SMTP_MODE: 'mock',
    });

    usersRepository = new UsersRepository(configService);
    passwordResetTokenRepository = new PasswordResetTokenRepository();
    refreshTokenRepository = new RefreshTokenRepository();
    emailService = new EmailService(configService);

    service = new PasswordResetService(
      usersRepository,
      passwordResetTokenRepository,
      refreshTokenRepository,
      emailService,
      configService,
    );

    await service.forgotPassword('admin@example.com');
    const token = new URL(emailService.getSentEmails()[0].resetUrl).searchParams.get('token') as string;

    await expect(service.resetPassword(token, 'NovaSenha123!')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deve atualizar senha com bcrypt e permitir validação da nova senha', async () => {
    await service.forgotPassword('admin@example.com');
    const token = new URL(emailService.getSentEmails()[0].resetUrl).searchParams.get('token') as string;

    await service.resetPassword(token, 'NovaSenha123!');

    const user = await usersRepository.findByEmail('admin@example.com');

    expect(user).not.toBeNull();
    await expect(bcrypt.compare('NovaSenha123!', user!.passwordHash)).resolves.toBe(true);
    await expect(bcrypt.compare('Admin123!', user!.passwordHash)).resolves.toBe(false);
  });
});
