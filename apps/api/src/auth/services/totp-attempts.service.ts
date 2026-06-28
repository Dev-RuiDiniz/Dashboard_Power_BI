import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TotpAttemptState = {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
};

@Injectable()
export class TotpAttemptsService {
  private readonly attempts = new Map<string, TotpAttemptState>();

  constructor(private readonly configService: ConfigService) {}

  assertCanAttempt(userId: string): void {
    const state = this.getCurrentState(userId, Date.now());

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

  registerFailure(userId: string): void {
    const now = Date.now();
    const state = this.getCurrentState(userId, now);
    const attempts = state.attempts + 1;
    const shouldLock = attempts >= this.getMaxAttempts();

    this.attempts.set(userId, {
      attempts,
      firstAttemptAt: state.firstAttemptAt,
      lockedUntil: shouldLock ? now + this.getLockoutMs() : null,
    });
  }

  clearFailures(userId: string): void {
    this.attempts.delete(userId);
  }

  private getCurrentState(userId: string, now: number): TotpAttemptState {
    const current = this.attempts.get(userId);

    if (!current || now - current.firstAttemptAt > this.getWindowMs()) {
      return {
        attempts: 0,
        firstAttemptAt: now,
        lockedUntil: null,
      };
    }

    if (current.lockedUntil !== null && current.lockedUntil <= now) {
      return {
        attempts: 0,
        firstAttemptAt: now,
        lockedUntil: null,
      };
    }

    return current;
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
