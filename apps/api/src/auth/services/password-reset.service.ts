import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UsersRepository } from '../repositories/users.repository';
import { EmailService } from './email.service';

export type ForgotPasswordResult = {
  success: true;
  message: string;
};

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly genericMessage =
    'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.';

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async forgotPassword(email: string): Promise<ForgotPasswordResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(normalizedEmail);

    if (!user || !user.isActive) {
      this.logger.warn(`password_reset_requested_unknown_email email=${this.maskEmail(normalizedEmail)}`);
      return this.getGenericResult();
    }

    await this.passwordResetTokenRepository.revokeActiveByUserId(user.id);

    const rawToken = randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(rawToken);
    const expiresInSeconds = this.getTokenExpiresInSeconds();

    await this.passwordResetTokenRepository.create({
      id: randomUUID(),
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      usedAt: null,
      createdAt: new Date(),
    });

    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      resetUrl: this.buildResetUrl(rawToken),
      expiresInSeconds,
    });

    this.logger.log(`password_reset_requested userId=${user.id} email=${this.maskEmail(user.email)}`);

    return this.getGenericResult();
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: true }> {
    const passwordResetToken = await this.findValidToken(token);
    const user = await this.usersRepository.findById(passwordResetToken.userId);

    if (!user || !user.isActive) {
      throw new BadRequestException('Token de recuperação inválido ou expirado.');
    }

    const saltRounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10));
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.usersRepository.updatePasswordHash(user.id, passwordHash);
    await this.passwordResetTokenRepository.markAsUsed(passwordResetToken.id);
    await this.refreshTokenRepository.revokeActiveByUserId(user.id);

    this.logger.log(`password_reset_completed userId=${user.id}`);

    return { success: true };
  }

  private async findValidToken(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const activeTokens = await this.passwordResetTokenRepository.findAllActive();
    const matchedToken = activeTokens.find((token) => token.tokenHash === tokenHash);

    if (!matchedToken) {
      throw new BadRequestException('Token de recuperação inválido ou expirado.');
    }

    if (matchedToken.expiresAt.getTime() <= Date.now() || matchedToken.usedAt !== null) {
      throw new BadRequestException('Token de recuperação inválido ou expirado.');
    }

    return matchedToken;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildResetUrl(token: string): string {
    const publicUrl = this.configService.get<string>('PASSWORD_RESET_PUBLIC_URL', 'http://localhost:3000/reset-password');
    const url = new URL(publicUrl);
    url.searchParams.set('token', token);

    return url.toString();
  }

  private getTokenExpiresInSeconds(): number {
    return Number(this.configService.get<number>('PASSWORD_RESET_TOKEN_EXPIRES_SECONDS', 900));
  }

  private getGenericResult(): ForgotPasswordResult {
    return {
      success: true,
      message: this.genericMessage,
    };
  }

  private maskEmail(email: string): string {
    const [name, domain] = email.trim().toLowerCase().split('@');

    if (!name || !domain) {
      return 'invalid-email';
    }

    return `${name.slice(0, 2)}***@${domain}`;
  }
}
