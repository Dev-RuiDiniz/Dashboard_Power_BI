import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

@Injectable()
export class RedisConnectionService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisConnectionService.name);
  private client: IORedis | null = null;
  private connected = false;

  constructor(private readonly configService: ConfigService) {}

  async getClient(): Promise<IORedis | null> {
    if (this.client && this.connected) {
      return this.client;
    }

    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));

    try {
      this.client = new IORedis({
        host,
        port,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableReadyCheck: true,
      });

      await this.client.connect();
      this.connected = true;
      this.logger.log('Redis conectado com sucesso.');
      return this.client;
    } catch (error) {
      this.connected = false;
      this.client = null;
      this.logger.warn(
        `Redis indisponivel, usando fallback em memoria: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
      return null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client && this.connected) {
      try {
        await this.client.quit();
      } catch {
        // ignore
      }
    }
  }
}
