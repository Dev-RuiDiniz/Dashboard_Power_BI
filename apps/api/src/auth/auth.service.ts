import * as bcrypt from 'bcrypt';
import {
  Injectable,
  Logger,
  TooManyRequestsException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomUUID } from 'node:crypto';

import { UsersRepository } from './repositories/users.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { LoginAttemptsService } from './services/login-attempts.service';
import { TokenService } from './services/token.service';
import { AuthTokens, AuthUser, RefreshSession } from './types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly loginAttemptsService: LoginAttemptsService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string, ipAddress = 'unknown'): Promise<AuthTokens> {
    try {
      this.loginAttemptsService.assertCanAttempt(email, ipAddress);
    } catch (error) {
      this.logger.warn(`login_rate_limited email=${this.loginAttemptsService.maskEmail(email)} ip=${this.maskIp(ipAddress)}`);
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

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const session = await this.findValidRefreshSession(refreshToken);
    const user = await this.usersRepository.findById(session.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    await this.refreshTokenRepository.revoke(session.id);

    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<{ success: true }> {
    const session = await this.findValidRefreshSession(refreshToken);

    await this.refreshTokenRepository.revoke(session.id);

    return { success: true };
  }

  private registerFailedLogin(email: string, ipAddress: string): void {
    const status = this.loginAttemptsService.recordFailure(email, ipAddress);
    const maskedEmail = this.loginAttemptsService.maskEmail(email);
    const maskedIp = this.maskIp(ipAddress);

    if (!status.allowed) {
      this.logger.warn(`login_rate_limited email=${maskedEmail} ip=${maskedIp} retryAfterSeconds=${status.retryAfterSeconds}`);
      throw new TooManyRequestsException({
        message: 'Muitas tentativas de login. Tente novamente mais tarde.',
        retryAfterSeconds: status.retryAfterSeconds,
      });
    }

    this.logger.warn(`login_failed email=${maskedEmail} ip=${maskedIp} remainingAttempts=${status.remainingAttempts}`);
  }

  private async issueTokens(user: AuthUser): Promise<AuthTokens> {
    const accessToken = this.tokenService.createAccessToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    const refreshToken = this.createOpaqueRefreshToken();
    const refreshTokenHash = await this.hashRefreshToken(refreshToken);

    await this.refreshTokenRepository.create({
      id: randomUUID(),
      userId: user.id,
      refreshTokenHash,
      expiresAt: this.getRefreshTokenExpiresAt(),
      revokedAt: null,
    });

    return {
      accessToken: accessToken.token,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessToken.expiresIn,
    };
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

  private createOpaqueRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private getRefreshTokenExpiresAt(): Date {
    const ttlSeconds = Number(this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_SECONDS', 604800));

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
}
