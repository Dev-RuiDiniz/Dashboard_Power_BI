import { Injectable } from '@nestjs/common';

import { SqlServerHealthResponse, SqlServerService } from '../sql-server/sql-server.service';

export interface HealthResponse {
  status: 'ok';
  service: 'dashboard-power-bi-api';
}

@Injectable()
export class HealthService {
  constructor(private readonly sqlServerService: SqlServerService) {}

  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'dashboard-power-bi-api',
    };
  }

  async getSqlHealth(): Promise<SqlServerHealthResponse> {
    return this.sqlServerService.checkHealth();
  }
}
