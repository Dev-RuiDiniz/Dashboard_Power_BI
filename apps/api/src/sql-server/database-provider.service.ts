import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OracleHealthResponse, OracleService } from './oracle.service';
import { SqlServerHealthResponse, SqlServerService } from './sql-server.service';

export type DatabaseProvider = 'sqlserver' | 'oracle';

export type DatabaseHealthResponse = SqlServerHealthResponse | OracleHealthResponse;

@Injectable()
export class DatabaseProviderService {
  constructor(
    private readonly configService: ConfigService,
    private readonly sqlServerService: SqlServerService,
    private readonly oracleService: OracleService,
  ) {}

  getProvider(): DatabaseProvider {
    const rawValue = this.configService.get<string>('DATABASE_PROVIDER');
    const normalizedValue = rawValue?.trim().toLowerCase();

    if (normalizedValue === 'oracle') {
      return 'oracle';
    }

    return 'sqlserver';
  }

  async checkHealth(): Promise<DatabaseHealthResponse> {
    return this.getProvider() === 'oracle'
      ? this.oracleService.checkHealth()
      : this.sqlServerService.checkHealth();
  }
}
