import { Injectable } from '@nestjs/common';

import { RefreshSession } from '../types/auth.types';

@Injectable()
export class RefreshTokenRepository {
  private readonly sessions = new Map<string, RefreshSession>();

  async create(session: RefreshSession): Promise<RefreshSession> {
    this.sessions.set(session.id, session);
    return session;
  }

  async findActiveByUserId(userId: string): Promise<RefreshSession[]> {
    const now = new Date();

    return Array.from(this.sessions.values()).filter(
      (session) =>
        session.userId === userId &&
        session.revokedAt === null &&
        session.expiresAt.getTime() > now.getTime(),
    );
  }

  async revoke(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    this.sessions.set(sessionId, {
      ...session,
      revokedAt: new Date(),
    });
  }

  async revokeActiveByUserId(userId: string): Promise<void> {
    const activeSessions = await this.findActiveByUserId(userId);

    await Promise.all(activeSessions.map((session) => this.revoke(session.id)));
  }
}
