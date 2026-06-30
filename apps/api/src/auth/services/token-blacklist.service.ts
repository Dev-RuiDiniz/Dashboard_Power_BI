import { Injectable, Logger } from '@nestjs/common';

import { RedisConnectionService } from '../../common/redis-connection.service';

const REDIS_PREFIX = 'token-blacklist:';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly blacklist = new Map<string, number>();
  private cleanupThreshold = 100;

  constructor(private readonly redisService: RedisConnectionService) {}

  async add(jti: string, exp: number): Promise<void> {
    const client = await this.redisService.getClient();

    if (client) {
      try {
        const ttl = Math.max(exp - Math.floor(Date.now() / 1000), 1);
        await client.set(`${REDIS_PREFIX}${jti}`, String(exp), 'EX', ttl);
        return;
      } catch (error) {
        this.logger.warn(
          `Redis add falhou, usando memoria: ${error instanceof Error ? error.message : 'erro'}`,
        );
      }
    }

    this.blacklist.set(jti, exp);

    if (this.blacklist.size >= this.cleanupThreshold) {
      this.cleanup();
    }
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const client = await this.redisService.getClient();

    if (client) {
      try {
        const result = await client.get(`${REDIS_PREFIX}${jti}`);
        if (result === null) {
          return false;
        }

        const exp = Number(result);
        if (exp < Math.floor(Date.now() / 1000)) {
          await client.del(`${REDIS_PREFIX}${jti}`);
          return false;
        }

        return true;
      } catch (error) {
        this.logger.warn(
          `Redis isBlacklisted falhou, usando memoria: ${error instanceof Error ? error.message : 'erro'}`,
        );
      }
    }

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
