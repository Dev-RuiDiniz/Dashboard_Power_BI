import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { DatabaseHealthResponse } from '../sql-server/database-provider.service';
import { HealthResponse, HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({
    description: 'Retorna o status da API.',
    schema: {
      example: {
        status: 'ok',
        service: 'dashboard-power-bi-api',
      },
    },
  })
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }

  @Get('sql')
  @ApiOkResponse({
    description: 'Retorna o status sanitizado da conexão com SQL Server.',
    schema: {
      example: {
        status: 'ok',
        dependency: 'sql-server',
        details: {
          configured: {
            serverConfigured: true,
            port: 1433,
            databaseConfigured: true,
            userConfigured: true,
            encrypt: true,
            trustServerCertificate: false,
            connectionTimeout: 5000,
            requestTimeout: 5000,
          },
          latencyMs: 12,
        },
      },
    },
  })
  getSqlHealth(): Promise<DatabaseHealthResponse> {
    return this.healthService.getSqlHealth();
  }
}
