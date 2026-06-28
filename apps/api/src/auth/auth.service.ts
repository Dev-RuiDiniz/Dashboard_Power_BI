import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomUUID } from 'node:crypto';

import { UsersRepository } from './repositories/users.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { LoginAttemptsService } from './services/login-attempts.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { TokenService } from './services/token.service';
import { TotpService } from './services/totp.service';
import { AuthTokens, AuthUser, RefreshSession } from './types/auth.types';

export type AuthUserProfile = Omit<AuthUser, 'passwordHash'>;

export type LoginResult = AuthTokens | { requiresTwoFactor: true; tempToken: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly loginAttemptsService: LoginAttemptsService,
    private readonly tokenService: TokenService,
    private readonly totpService: TotpService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string, ipAddress = 'unknown'): Promise<LoginResult> {
    try {
      this.loginAttemptsService.assertCanAttempt(email, ipAddress);
    } catch (error) {
      this.logger.warn(
        `login_rate_limited email=${this.loginAttemptsService.maskEmail(email)} ip=${this.maskIp(ipAddress)}`,
      );
      throw error;
    }

    const user = await this.usersRepository.findByEmail(email);

    if (!user || !user.isActive) {
      this.registerFailedLogin(email, ipAddress);
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      this.registerFailedLogin(email, ipAddress);
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    this.loginAttemptsService.clearFailures(email, ipAddress);
    this.logger.log(`login_success userId=${user.id} ip=${this.maskIp(ipAddress)}`);

    if (user.isTwoFactorEnabled) {
      const tempToken = this.tokenService.createTotpPendingToken(user.id);
      return { requiresTwoFactor: true, tempToken: tempToken.token };
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const session = await this.findValidRefreshSession(refreshToken);
    const user = await this.usersRepository.findById(session.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    this.assertSessionNotInactive(session);

    await this.refreshTokenRepository.revoke(session.id);

    return this.issueTokens(user);
  }

  async logout(
    refreshToken: string,
    accessTokenJti?: string,
    accessTokenExp?: number,
  ): Promise<{ success: true }> {
    const session = await this.findValidRefreshSession(refreshToken);

    await this.refreshTokenRepository.revoke(session.id);

    if (accessTokenJti && accessTokenExp) {
      this.tokenBlacklistService.add(accessTokenJti, accessTokenExp);
    }

    return { success: true };
  }

  async getCurrentUser(userId: string): Promise<AuthUserProfile> {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário autenticado inválido.');
    }

    return this.toProfile(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: true }> {
    if (newPassword.length < 8) {
      throw new BadRequestException('A nova senha deve ter no mínimo 8 caracteres.');
    }

    const user = await this.usersRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário autenticado inválido.');
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Senha atual inválida.');
    }

    await this.usersRepository.updatePasswordHash(user.id, await this.hashPassword(newPassword));
    await this.revokeAllSessions(user.id);

    return { success: true };
  }

  async totpLogin(tempToken: string, code: string): Promise<AuthTokens> {
    let payload;

    try {
      payload = this.tokenService.verifyTotpPendingToken(tempToken);
    } catch {
      throw new UnauthorizedException('Token temporário inválido ou expirado.');
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user || !user.isActive || !user.isTwoFactorEnabled || !user.totpSecret) {
      throw new UnauthorizedException('Autenticação de dois fatores não configurada.');
    }

    if (!this.totpService.verifyToken(user.totpSecret, code)) {
      throw new UnauthorizedException('Código de verificação inválido.');
    }

    return this.issueTokens(user);
  }

  async setupTotp(userId: string): Promise<{ secret: string; otpauthUrl: string }> {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário autenticado inválido.');
    }

    const result = this.totpService.generateSecret(user.id, user.email);
    await this.usersRepository.updateTotpSecret(user.id, result.secret);

    return result;
  }

  async verifyTotpSetup(userId: string, code: string): Promise<{ enabled: true }> {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.isActive || !user.totpSecret) {
      throw new UnauthorizedException('Configuração de 2FA não iniciada.');
    }

    if (!this.totpService.verifyToken(user.totpSecret, code)) {
      throw new UnauthorizedException('Código de verificação inválido.');
    }

    await this.usersRepository.enableTotp(user.id);

    return { enabled: true };
  }

  async disableTotp(userId: string, code: string): Promise<{ disabled: true }> {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.isActive || !user.totpSecret) {
      throw new UnauthorizedException('2FA não está ativo.');
    }

    if (!this.totpService.verifyToken(user.totpSecret, code)) {
      throw new UnauthorizedException('Código de verificação inválido.');
    }

    await this.usersRepository.disableTotp(user.id);

    return { disabled: true };
  }

  async revokeAllSessions(userId: string): Promise<{ success: true }> {
    await this.usersRepository.incrementTokenVersion(userId);
    await this.refreshTokenRepository.revokeActiveByUserId(userId);

    this.logger.log(`revoke_all_sessions userId=${userId}`);

    return { success: true };
  }

  private registerFailedLogin(email: string, ipAddress: string): void {
    const status = this.loginAttemptsService.recordFailure(email, ipAddress);
    const maskedEmail = this.loginAttemptsService.maskEmail(email);
    const maskedIp = this.maskIp(ipAddress);

    if (!status.allowed) {
      this.logger.warn(
        `login_rate_limited email=${maskedEmail} ip=${maskedIp} retryAfterSeconds=${status.retryAfterSeconds}`,
      );
      throw new HttpException(
        {
          message: 'Muitas tentativas de login. Tente novamente mais tarde.',
          retryAfterSeconds: status.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.logger.warn(
      `login_failed email=${maskedEmail} ip=${maskedIp} remainingAttempts=${status.remainingAttempts}`,
    );
  }

  private async issueTokens(user: AuthUser): Promise<AuthTokens> {
    const accessToken = this.tokenService.createAccessToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
      sectors: user.sectors,
      jti: '',
      tv: user.tokenVersion,
    });

    const refreshToken = this.createOpaqueRefreshToken();
    const refreshTokenHash = await this.hashRefreshToken(refreshToken);

    await this.refreshTokenRepository.create({
      id: randomUUID(),
      userId: user.id,
      refreshTokenHash,
      expiresAt: this.getRefreshTokenExpiresAt(),
      revokedAt: null,
      lastUsedAt: new Date(),
    });

    return {
      accessToken: accessToken.token,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessToken.expiresIn,
      jti: accessToken.jti,
    };
  }

  private assertSessionNotInactive(session: RefreshSession): void {
    const timeoutSeconds = Number(
      this.configService.get<number>('SESSION_INACTIVITY_TIMEOUT_SECONDS', 1800),
    );

    if (timeoutSeconds <= 0) {
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const lastUsed = Math.floor(session.lastUsedAt.getTime() / 1000);

    if (now - lastUsed > timeoutSeconds) {
      this.logger.warn(
        `refresh_rejected_inactivity userId=${session.userId} idleSeconds=${now - lastUsed}`,
      );
      throw new UnauthorizedException('Sessão expirada por inatividade.');
    }
  }

  private async findValidRefreshSession(refreshToken: string): Promise<RefreshSession> {
    const users = await this.getUsersWithActiveSessions();

    for (const session of users) {
      const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);

      if (matches) {
        return session;
      }
    }

    throw new UnauthorizedException('Refresh token inválido.');
  }

  private async getUsersWithActiveSessions(): Promise<RefreshSession[]> {
    const demoUserEmail = this.configService.get<string>('AUTH_DEMO_USER_EMAIL');
    const demoUser = demoUserEmail ? await this.usersRepository.findByEmail(demoUserEmail) : null;

    if (!demoUser) {
      return [];
    }

    return this.refreshTokenRepository.findActiveByUserId(demoUser.id);
  }

  private async hashRefreshToken(refreshToken: string): Promise<string> {
    const saltRounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10));

    return bcrypt.hash(refreshToken, saltRounds);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10));

    return bcrypt.hash(password, saltRounds);
  }

  private createOpaqueRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private getRefreshTokenExpiresAt(): Date {
    const ttlSeconds = Number(
      this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_SECONDS', 604800),
    );

    return new Date(Date.now() + ttlSeconds * 1000);
  }

  private maskIp(ipAddress: string): string {
    if (!ipAddress || ipAddress === 'unknown') {
      return 'unknown';
    }

    if (ipAddress.includes(':')) {
      return 'ipv6';
    }

    const parts = ipAddress.split('.');

    if (parts.length !== 4) {
      return 'unknown';
    }

    return `${parts[0]}.${parts[1]}.***.***`;
  }

  private toProfile(user: AuthUser): AuthUserProfile {
    const { passwordHash: _passwordHash, ...profile } = user;

    return profile;
  }
}
