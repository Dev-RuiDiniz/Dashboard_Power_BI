import { SqlServerService } from '../sql-server/sql-server.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const sqlServerService = {
    checkHealth: jest.fn(),
  } as unknown as jest.Mocked<SqlServerService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o status da API', () => {
    const service = new HealthService(sqlServerService);

    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'dashboard-power-bi-api',
    });
  });

  it('deve delegar o healthcheck SQL Server ao serviço de banco', async () => {
    sqlServerService.checkHealth.mockResolvedValue({
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
        latencyMs: 10,
      },
    });

    const service = new HealthService(sqlServerService);

    await expect(service.getSqlHealth()).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        dependency: 'sql-server',
      }),
    );
  });
});
