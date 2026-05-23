import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionPool } from 'mssql';

import {
  getSqlServerConfig,
  getSqlServerSafeConfig,
  SqlServerConfig,
  SqlServerConfigError,
  SqlServerSafeConfig,
} from './sql-server.config';

export interface SqlServerHealthResponse {
  status: 'ok' | 'unavailable';
  dependency: 'sql-server';
  details: {
    configured: SqlServerSafeConfig;
    latencyMs?: number;
    message?: string;
  };
}

export class SqlServerConnectionError extends Error {
  constructor(message = 'Falha ao conectar ao SQL Server.') {
    super(message);
    this.name = 'SqlServerConnectionError';
  }
}

@Injectable()
export class SqlServerService implements OnModuleDestroy {
  private pool?: ConnectionPool;
  private connectingPool?: Promise<ConnectionPool>;

  constructor(private readonly configService: ConfigService) {}

  async getPool(): Promise<ConnectionPool> {
    if (this.pool?.connected) {
      return this.pool;
    }

    if (this.connectingPool) {
      return this.connectingPool;
    }

    this.connectingPool = this.createPool();

    return this.connectingPool;
  }

  async checkHealth(): Promise<SqlServerHealthResponse> {
    const startedAt = Date.now();

    try {
      const pool = await this.getPool();
      await pool.request().query('SELECT 1 AS ok');

      return {
        status: 'ok',
        dependency: 'sql-server',
        details: {
          configured: getSqlServerSafeConfig(this.configService),
          latencyMs: Date.now() - startedAt,
        },
      };
    } catch {
      return {
        status: 'unavailable',
        dependency: 'sql-server',
        details: {
          configured: getSqlServerSafeConfig(this.configService),
          message: 'SQL Server indisponível ou configuração inválida.',
        },
      };
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.pool) {
      return;
    }

    await this.pool.close();
    this.pool = undefined;
    this.connectingPool = undefined;
  }

  private async createPool(): Promise<ConnectionPool> {
    try {
      const sqlConfig = getSqlServerConfig(this.configService);
      const pool = new ConnectionPool(this.toMssqlConfig(sqlConfig));
      this.pool = await pool.connect();

      return this.pool;
    } catch (error) {
      this.pool = undefined;
      this.connectingPool = undefined;

      if (error instanceof SqlServerConfigError) {
        throw error;
      }

      throw new SqlServerConnectionError();
    }
  }

  private toMssqlConfig(config: SqlServerConfig): ConstructorParameters<typeof ConnectionPool>[0] {
    return {
      server: config.server,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      connectionTimeout: config.connectionTimeout,
      requestTimeout: config.requestTimeout,
      pool: config.pool,
      options: config.options,
    };
  }
}
