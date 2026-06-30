import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';

import { RedisConnectionService } from '../../common/redis-connection.service';

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

const REDIS_PREFIX = 'login-attempts:';

@Injectable()
export class LoginAttemptsService {
  private readonly logger = new Logger(LoginAttemptsService.name);
  private readonly attempts = new Map<string, LoginAttemptState>();

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisConnectionService,
  ) {}

  async assertCanAttempt(email: string, ipAddress: string): Promise<void> {
    const status = await this.getAttemptStatus(email, ipAddress);

    if (!status.allowed) {
      throw new HttpException(
        {
          message: 'Muitas tentativas de login. Tente novamente mais tarde.',
          retryAfterSeconds: status.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordFailure(email: string, ipAddress: string): Promise<LoginAttemptStatus> {
    const key = this.buildKey(email, ipAddress);
    const now = Date.now();
    const state = await this.getCurrentState(key, now);
    const attempts = state.attempts + 1;
    const shouldLock = attempts > this.getMaxAttempts();

    const nextState: LoginAttemptState = {
      attempts,
      firstAttemptAt: state.firstAttemptAt,
      lastFailureAt: now,
      lockedUntil: shouldLock ? now + this.getLockoutMs() : null,
    };

    await this.setState(key, nextState);

    return this.toStatus(nextState, now);
  }

  async clearFailures(email: string, ipAddress: string): Promise<void> {
    const key = this.buildKey(email, ipAddress);
    const client = await this.redisService.getClient();

    if (client) {
      try {
        await client.del(`${REDIS_PREFIX}${key}`);
        return;
      } catch (error) {
        this.logger.warn(
          `Redis clearFailures falhou: ${error instanceof Error ? error.message : 'erro'}`,
        );
      }
    }

    this.attempts.delete(key);
  }

  async getAttemptStatus(email: string, ipAddress: string): Promise<LoginAttemptStatus> {
    const key = this.buildKey(email, ipAddress);
    const now = Date.now();
    const state = await this.getCurrentState(key, now);

    await this.setState(key, state);

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

  private async getCurrentState(key: string, now: number): Promise<LoginAttemptState> {
    const client = await this.redisService.getClient();

    if (client) {
      try {
        const raw = await client.get(`${REDIS_PREFIX}${key}`);
        if (raw) {
          const parsed = JSON.parse(raw) as LoginAttemptState;
          if (now - parsed.firstAttemptAt > this.getWindowMs()) {
            return { attempts: 0, firstAttemptAt: now, lastFailureAt: 0, lockedUntil: null };
          }
          if (parsed.lockedUntil !== null && parsed.lockedUntil <= now) {
            return { attempts: 0, firstAttemptAt: now, lastFailureAt: 0, lockedUntil: null };
          }
          return parsed;
        }
        return { attempts: 0, firstAttemptAt: now, lastFailureAt: 0, lockedUntil: null };
      } catch (error) {
        this.logger.warn(
          `Redis getCurrentState falhou: ${error instanceof Error ? error.message : 'erro'}`,
        );
      }
    }

    const current = this.attempts.get(key);

    if (!current || now - current.firstAttemptAt > this.getWindowMs()) {
      return { attempts: 0, firstAttemptAt: now, lastFailureAt: 0, lockedUntil: null };
    }

    if (current.lockedUntil !== null && current.lockedUntil <= now) {
      return { attempts: 0, firstAttemptAt: now, lastFailureAt: 0, lockedUntil: null };
    }

    return current;
  }

  private async setState(key: string, state: LoginAttemptState): Promise<void> {
    const client = await this.redisService.getClient();

    if (client) {
      try {
        const ttlSeconds = Math.ceil(this.getWindowMs() / 1000);
        await client.set(`${REDIS_PREFIX}${key}`, JSON.stringify(state), 'EX', ttlSeconds);
        return;
      } catch (error) {
        this.logger.warn(
          `Redis setState falhou: ${error instanceof Error ? error.message : 'erro'}`,
        );
      }
    }

    this.attempts.set(key, state);
  }

  private toStatus(state: LoginAttemptState, now: number): LoginAttemptStatus {
    const lockedUntil = state.lockedUntil;
    const allowed = lockedUntil === null || lockedUntil <= now;
    const retryAfterSeconds =
      lockedUntil === null || lockedUntil <= now ? 0 : Math.ceil((lockedUntil - now) / 1000);

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
