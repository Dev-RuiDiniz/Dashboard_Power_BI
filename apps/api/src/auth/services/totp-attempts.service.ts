import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisConnectionService } from '../../common/redis-connection.service';

type TotpAttemptState = {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
};

const REDIS_PREFIX = 'totp-attempts:';

@Injectable()
export class TotpAttemptsService {
  private readonly logger = new Logger(TotpAttemptsService.name);
  private readonly attempts = new Map<string, TotpAttemptState>();

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisConnectionService,
  ) {}

  async assertCanAttempt(userId: string): Promise<void> {
    const state = await this.getCurrentState(userId, Date.now());

    if (state.lockedUntil !== null && state.lockedUntil > Date.now()) {
      throw new HttpException(
        {
          message: 'Muitas tentativas de código TOTP. Tente novamente mais tarde.',
          retryAfterSeconds: Math.ceil((state.lockedUntil - Date.now()) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async registerFailure(userId: string): Promise<void> {
    const now = Date.now();
    const state = await this.getCurrentState(userId, now);
    const attempts = state.attempts + 1;
    const shouldLock = attempts >= this.getMaxAttempts();

    await this.setState(userId, {
      attempts,
      firstAttemptAt: state.firstAttemptAt,
      lockedUntil: shouldLock ? now + this.getLockoutMs() : null,
    });
  }

  async clearFailures(userId: string): Promise<void> {
    const client = await this.redisService.getClient();

    if (client) {
      try {
        await client.del(`${REDIS_PREFIX}${userId}`);
        return;
      } catch (error) {
        this.logger.warn(
          `Redis clearFailures falhou: ${error instanceof Error ? error.message : 'erro'}`,
        );
      }
    }

    this.attempts.delete(userId);
  }

  private async getCurrentState(userId: string, now: number): Promise<TotpAttemptState> {
    const client = await this.redisService.getClient();

    if (client) {
      try {
        const raw = await client.get(`${REDIS_PREFIX}${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as TotpAttemptState;
          if (now - parsed.firstAttemptAt > this.getWindowMs()) {
            return { attempts: 0, firstAttemptAt: now, lockedUntil: null };
          }
          if (parsed.lockedUntil !== null && parsed.lockedUntil <= now) {
            return { attempts: 0, firstAttemptAt: now, lockedUntil: null };
          }
          return parsed;
        }
        return { attempts: 0, firstAttemptAt: now, lockedUntil: null };
      } catch (error) {
        this.logger.warn(
          `Redis getCurrentState falhou: ${error instanceof Error ? error.message : 'erro'}`,
        );
      }
    }

    const current = this.attempts.get(userId);

    if (!current || now - current.firstAttemptAt > this.getWindowMs()) {
      return { attempts: 0, firstAttemptAt: now, lockedUntil: null };
    }

    if (current.lockedUntil !== null && current.lockedUntil <= now) {
      return { attempts: 0, firstAttemptAt: now, lockedUntil: null };
    }

    return current;
  }

  private async setState(userId: string, state: TotpAttemptState): Promise<void> {
    const client = await this.redisService.getClient();

    if (client) {
      try {
        const ttlSeconds = Math.ceil(this.getWindowMs() / 1000);
        await client.set(`${REDIS_PREFIX}${userId}`, JSON.stringify(state), 'EX', ttlSeconds);
        return;
      } catch (error) {
        this.logger.warn(
          `Redis setState falhou: ${error instanceof Error ? error.message : 'erro'}`,
        );
      }
    }

    this.attempts.set(userId, state);
  }

  private getMaxAttempts(): number {
    return Number(this.configService.get<number>('TOTP_MAX_ATTEMPTS', 3));
  }

  private getWindowMs(): number {
    return Number(this.configService.get<number>('TOTP_WINDOW_SECONDS', 300)) * 1000;
  }

  private getLockoutMs(): number {
    return Number(this.configService.get<number>('TOTP_LOCKOUT_SECONDS', 900)) * 1000;
  }
}
