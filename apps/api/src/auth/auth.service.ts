import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomUUID } from 'node:crypto';

import { UsersRepository } from './repositories/users.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { TokenService } from './services/token.service';
import { AuthTokens, AuthUser, RefreshSession } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

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
}
