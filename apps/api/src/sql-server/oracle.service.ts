import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import oracledb from 'oracledb';

import {
  getOracleConfig,
  getOracleSafeConfig,
  OracleConfigError,
  OracleSafeConfig,
} from './oracle.config';

export interface OracleHealthResponse {
  status: 'ok' | 'unavailable';
  dependency: 'oracle';
  details: {
    configured: OracleSafeConfig;
    latencyMs?: number;
    message?: string;
  };
}

export class OracleConnectionError extends Error {
  constructor(message = 'Falha ao conectar ao Oracle.') {
    super(message);
    this.name = 'OracleConnectionError';
  }
}

@Injectable()
export class OracleService implements OnModuleDestroy {
  private pool?: oracledb.Pool;
  private connectingPool?: Promise<oracledb.Pool>;

  constructor(private readonly configService: ConfigService) {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  }

  async getPool(): Promise<oracledb.Pool> {
    if (this.pool) {
      return this.pool;
    }

    if (this.connectingPool) {
      return this.connectingPool;
    }

    this.connectingPool = this.createPool();

    return this.connectingPool;
  }

  async execute<TRecord extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    bindParams: Record<string, unknown> = {},
    options: oracledb.ExecuteOptions = {},
  ): Promise<TRecord[]> {
    const pool = await this.getPool();
    const connection = await pool.getConnection();

    try {
      const result = await connection.execute(sql, bindParams, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: false,
        ...options,
      });

      if (result.rows) {
        return result.rows as TRecord[];
      }

      const outBinds = result.outBinds as Record<string, unknown> | undefined;
      const firstResultSet = outBinds
        ? (Object.values(outBinds).find(isOracleResultSet) as
            | oracledb.ResultSet<Record<string, unknown>>
            | undefined)
        : undefined;

      if (!firstResultSet) {
        return [];
      }

      try {
        const rows = await firstResultSet.getRows();
        return rows as TRecord[];
      } finally {
        await firstResultSet.close();
      }
    } finally {
      await connection.close();
    }
  }

  async checkHealth(): Promise<OracleHealthResponse> {
    const startedAt = Date.now();

    try {
      await this.execute('SELECT 1 AS ok FROM dual');

      return {
        status: 'ok',
        dependency: 'oracle',
        details: {
          configured: getOracleSafeConfig(this.configService),
          latencyMs: Date.now() - startedAt,
        },
      };
    } catch {
      return {
        status: 'unavailable',
        dependency: 'oracle',
        details: {
          configured: getOracleSafeConfig(this.configService),
          message: 'Oracle indisponivel ou configuracao invalida.',
        },
      };
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.pool) {
      return;
    }

    await this.pool.close(0);
    this.pool = undefined;
    this.connectingPool = undefined;
  }

  private async createPool(): Promise<oracledb.Pool> {
    try {
      const config = getOracleConfig(this.configService);

      this.pool = await oracledb.createPool({
        user: config.user,
        password: config.password,
        connectString: `${config.host}:${config.port}/${config.serviceName}`,
        poolMin: config.poolMin,
        poolMax: config.poolMax,
        poolIncrement: config.poolIncrement,
        queueTimeout: config.queueTimeout,
        stmtCacheSize: config.stmtCacheSize,
      });

      return this.pool;
    } catch (error) {
      this.pool = undefined;
      this.connectingPool = undefined;

      if (error instanceof OracleConfigError) {
        throw error;
      }

      throw new OracleConnectionError();
    }
  }
}

function isOracleResultSet(value: unknown): value is oracledb.ResultSet<Record<string, unknown>> {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'getRows' in value &&
    typeof (value as { getRows?: unknown }).getRows === 'function',
  );
}
