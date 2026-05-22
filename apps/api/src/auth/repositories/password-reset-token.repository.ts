import { Injectable } from '@nestjs/common';

export type PasswordResetToken = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

@Injectable()
export class PasswordResetTokenRepository {
  private readonly tokens = new Map<string, PasswordResetToken>();

  async create(token: PasswordResetToken): Promise<PasswordResetToken> {
    this.tokens.set(token.id, token);
    return token;
  }

  async findActiveByUserId(userId: string): Promise<PasswordResetToken[]> {
    const now = Date.now();

    return Array.from(this.tokens.values()).filter(
      (token) =>
        token.userId === userId &&
        token.usedAt === null &&
        token.expiresAt.getTime() > now,
    );
  }

  async findAllActive(): Promise<PasswordResetToken[]> {
    const now = Date.now();

    return Array.from(this.tokens.values()).filter(
      (token) => token.usedAt === null && token.expiresAt.getTime() > now,
    );
  }

  async markAsUsed(id: string): Promise<void> {
    const token = this.tokens.get(id);

    if (!token) {
      return;
    }

    this.tokens.set(id, {
      ...token,
      usedAt: new Date(),
    });
  }

  async revokeActiveByUserId(userId: string): Promise<void> {
    const activeTokens = await this.findActiveByUserId(userId);

    await Promise.all(activeTokens.map((token) => this.markAsUsed(token.id)));
  }
}
