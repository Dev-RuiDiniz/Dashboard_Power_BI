import { Injectable, Optional } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { RefreshSession } from '../types/auth.types';

type RefreshTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
};

@Injectable()
export class RefreshTokenRepository {
  private readonly sessions = new Map<string, RefreshSession>();

  constructor(@Optional() private readonly supabaseService?: SupabaseService) {}

  async create(session: RefreshSession): Promise<RefreshSession> {
    if (this.useSupabase()) {
      const { error } = await this.supabaseService!.getClient()
        .from('refresh_tokens')
        .insert({
          id: session.id,
          user_id: session.userId,
          token_hash: session.refreshTokenHash,
          expires_at: session.expiresAt.toISOString(),
          revoked_at: session.revokedAt?.toISOString() ?? null,
        });

      if (error) {
        throw error;
      }

      return session;
    }

    this.sessions.set(session.id, session);
    return session;
  }

  async findActiveByUserId(userId: string): Promise<RefreshSession[]> {
    if (this.useSupabase()) {
      const { data, error } = await this.supabaseService!.getClient()
        .from('refresh_tokens')
        .select('*')
        .eq('user_id', userId)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        throw error;
      }

      return (data as RefreshTokenRow[]).map((row) => this.rowToSession(row));
    }

    const now = new Date();

    return Array.from(this.sessions.values()).filter(
      (session) =>
        session.userId === userId &&
        session.revokedAt === null &&
        session.expiresAt.getTime() > now.getTime(),
    );
  }

  async updateLastUsedAt(sessionId: string, date: Date): Promise<void> {
    if (this.useSupabase()) {
      const { error } = await this.supabaseService!.getClient()
        .from('refresh_tokens')
        .update({ last_used_at: date.toISOString() })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      return;
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    this.sessions.set(sessionId, { ...session, lastUsedAt: date });
  }

  async revoke(sessionId: string): Promise<void> {
    if (this.useSupabase()) {
      const { error } = await this.supabaseService!.getClient()
        .from('refresh_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', sessionId)
        .is('revoked_at', null);

      if (error) {
        throw error;
      }

      return;
    }

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
    if (this.useSupabase()) {
      const { error } = await this.supabaseService!.getClient()
        .from('refresh_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('revoked_at', null);

      if (error) {
        throw error;
      }

      return;
    }

    const activeSessions = await this.findActiveByUserId(userId);

    await Promise.all(activeSessions.map((session) => this.revoke(session.id)));
  }

  private useSupabase(): boolean {
    return this.supabaseService?.isEnabled() ?? false;
  }

  private rowToSession(row: RefreshTokenRow): RefreshSession {
    return {
      id: row.id,
      userId: row.user_id,
      refreshTokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : new Date(row.expires_at),
    };
  }
}
