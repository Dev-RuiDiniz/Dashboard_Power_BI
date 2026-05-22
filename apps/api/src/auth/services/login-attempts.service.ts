import { Injectable, TooManyRequestsException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';

type LoginAttemptState = {
  attempts: number;
  firstAttemptAt: number;
  lastFailureAt: number;
  lockedUntil: number | null;
};

export type LoginAttemptStatus = {
  allowed: boolean;
  attempts: number;
  remainingAttempts: number;
  retryAfterSeconds: number;
};

@Injectable()
export class LoginAttemptsService {
  private readonly attempts = new Map<string, LoginAttemptState>();

  constructor(private readonly configService: ConfigService) {}

  assertCanAttempt(email: string, ipAddress: string): void {
    const status = this.getAttemptStatus(email, ipAddress);

    if (!status.allowed) {
      throw new TooManyRequestsException({
        message: 'Muitas tentativas de login. Tente novamente mais tarde.',
        retryAfterSeconds: status.retryAfterSeconds,
      });
    }
  }

  recordFailure(email: string, ipAddress: string): LoginAttemptStatus {
    const key = this.buildKey(email, ipAddress);
    const now = Date.now();
    const state = this.getCurrentState(key, now);
    const attempts = state.attempts + 1;
    const shouldLock = attempts >= this.getMaxAttempts();

    const nextState: LoginAttemptState = {
      attempts,
      firstAttemptAt: state.firstAttemptAt,
      lastFailureAt: now,
      lockedUntil: shouldLock ? now + this.getLockoutMs() : null,
    };

    this.attempts.set(key, nextState);

    return this.toStatus(nextState, now);
  }

  clearFailures(email: string, ipAddress: string): void {
    this.attempts.delete(this.buildKey(email, ipAddress));
  }

  getAttemptStatus(email: string, ipAddress: string): LoginAttemptStatus {
    const key = this.buildKey(email, ipAddress);
    const now = Date.now();
    const state = this.getCurrentState(key, now);

    this.attempts.set(key, state);

    return this.toStatus(state, now);
  }

  buildKey(email: string, ipAddress: string): string {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedIp = ipAddress.trim() || 'unknown';
    const value = `${normalizedEmail}:${normalizedIp}`;

    return createHash('sha256').update(value).digest('hex');
  }

  maskEmail(email: string): string {
    const normalizedEmail = email.trim().toLowerCase();
    const [name, domain] = normalizedEmail.split('@');

    if (!name || !domain) {
      return 'invalid-email';
    }

    const visiblePrefix = name.slice(0, 2);
    return `${visiblePrefix}***@${domain}`;
  }

  private getCurrentState(key: string, now: number): LoginAttemptState {
    const current = this.attempts.get(key);

    if (!current || now - current.firstAttemptAt > this.getWindowMs()) {
      return {
        attempts: 0,
        firstAttemptAt: now,
        lastFailureAt: 0,
        lockedUntil: null,
      };
    }

    if (current.lockedUntil !== null && current.lockedUntil <= now) {
      return {
        attempts: 0,
        firstAttemptAt: now,
        lastFailureAt: 0,
        lockedUntil: null,
      };
    }

    return current;
  }

  private toStatus(state: LoginAttemptState, now: number): LoginAttemptStatus {
    const lockedUntil = state.lockedUntil;
    const allowed = lockedUntil === null || lockedUntil <= now;
    const retryAfterSeconds = allowed ? 0 : Math.ceil((lockedUntil - now) / 1000);

    return {
      allowed,
      attempts: state.attempts,
      remainingAttempts: Math.max(this.getMaxAttempts() - state.attempts, 0),
      retryAfterSeconds,
    };
  }

  private getMaxAttempts(): number {
    return Number(this.configService.get<number>('AUTH_LOGIN_MAX_ATTEMPTS', 5));
  }

  private getWindowMs(): number {
    return Number(this.configService.get<number>('AUTH_LOGIN_WINDOW_SECONDS', 900)) * 1000;
  }

  private getLockoutMs(): number {
    return Number(this.configService.get<number>('AUTH_LOGIN_LOCKOUT_SECONDS', 900)) * 1000;
  }
}
