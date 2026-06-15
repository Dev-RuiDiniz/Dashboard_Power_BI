import { DatabaseProvider, DatabaseProviderService } from '../sql-server/database-provider.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const databaseProviderService = {
    checkHealth: jest.fn(),
    getProvider: jest.fn(),
  } as unknown as jest.Mocked<DatabaseProviderService>;

  beforeEach(() => {
    jest.clearAllMocks();
    databaseProviderService.getProvider.mockReturnValue('sqlserver' as DatabaseProvider);
  });

  it('deve retornar o status da API', () => {
    const service = new HealthService(databaseProviderService);

    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'dashboard-power-bi-api',
    });
  });

  it('deve delegar o healthcheck do banco ao provider ativo', async () => {
    databaseProviderService.checkHealth.mockResolvedValue({
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

    const service = new HealthService(databaseProviderService);

    await expect(service.getSqlHealth()).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        dependency: 'sql-server',
      }),
    );
  });
});
