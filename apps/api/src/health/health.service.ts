import { Injectable } from '@nestjs/common';

import { DatabaseHealthResponse, DatabaseProviderService } from '../sql-server/database-provider.service';

export interface HealthResponse {
  status: 'ok';
  service: 'dashboard-power-bi-api';
}

@Injectable()
export class HealthService {
  constructor(private readonly databaseProviderService: DatabaseProviderService) {}

  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'dashboard-power-bi-api',
    };
  }

  async getSqlHealth(): Promise<DatabaseHealthResponse> {
    return this.databaseProviderService.checkHealth();
  }
}
