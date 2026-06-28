import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly blacklist = new Map<string, number>();
  private cleanupThreshold = 100;

  add(jti: string, exp: number): void {
    this.blacklist.set(jti, exp);

    if (this.blacklist.size >= this.cleanupThreshold) {
      this.cleanup();
    }
  }

  isBlacklisted(jti: string): boolean {
    const exp = this.blacklist.get(jti);

    if (exp === undefined) {
      return false;
    }

    if (exp < Math.floor(Date.now() / 1000)) {
      this.blacklist.delete(jti);
      return false;
    }

    return true;
  }

  cleanup(): void {
    const now = Math.floor(Date.now() / 1000);
    let removed = 0;

    for (const [jti, exp] of this.blacklist) {
      if (exp < now) {
        this.blacklist.delete(jti);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.log(`blacklist_cleanup removed=${removed} remaining=${this.blacklist.size}`);
    }
  }

  get size(): number {
    return this.blacklist.size;
  }
}
