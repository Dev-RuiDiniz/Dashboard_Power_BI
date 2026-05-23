import { ConfigService } from '@nestjs/config';
import { ConnectionPool } from 'mssql';

import { SqlServerService } from './sql-server.service';

const mockConnect = jest.fn();
const mockQuery = jest.fn();
const mockClose = jest.fn();

jest.mock('mssql', () => ({
  ConnectionPool: jest.fn().mockImplementation(() => ({
    connected: true,
    connect: mockConnect,
    request: () => ({
      query: mockQuery,
    }),
    close: mockClose,
  })),
}));

const createConfigService = (): ConfigService =>
  ({
    get: jest.fn((key: string) => {
      const env: Record<string, string> = {
        SQLSERVER_HOST: 'sql.example.local',
        SQLSERVER_PORT: '1433',
        SQLSERVER_DATABASE: 'PowerBI',
        SQLSERVER_USER: 'powerbi_readonly',
        SQLSERVER_PASSWORD: 'secret',
      };

      return env[key];
    }),
  }) as unknown as ConfigService;

describe('SqlServerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockResolvedValue({
      connected: true,
      request: () => ({
        query: mockQuery,
      }),
      close: mockClose,
    });
    mockQuery.mockResolvedValue({ recordset: [{ ok: 1 }] });
  });

  it('deve criar pool com configuração vinda do ambiente', async () => {
    const service = new SqlServerService(createConfigService());

    await service.getPool();

    expect(ConnectionPool).toHaveBeenCalledWith(
      expect.objectContaining({
        server: 'sql.example.local',
        port: 1433,
        database: 'PowerBI',
        user: 'powerbi_readonly',
        password: 'secret',
        connectionTimeout: 5000,
        requestTimeout: 5000,
      }),
    );
  });

  it('deve reutilizar pool já conectado', async () => {
    const service = new SqlServerService(createConfigService());

    await service.getPool();
    await service.getPool();

    expect(ConnectionPool).toHaveBeenCalledTimes(1);
  });

  it('deve retornar healthcheck SQL saudável sem expor credenciais', async () => {
    const service = new SqlServerService(createConfigService());

    const response = await service.checkHealth();

    expect(response.status).toBe('ok');
    expect(response.dependency).toBe('sql-server');
    expect(JSON.stringify(response)).not.toContain('secret');
    expect(JSON.stringify(response)).not.toContain('powerbi_readonly');
    expect(JSON.stringify(response)).not.toContain('sql.example.local');
    expect(mockQuery).toHaveBeenCalledWith('SELECT 1 AS ok');
  });

  it('deve retornar indisponível quando conexão falhar sem expor erro bruto', async () => {
    mockConnect.mockRejectedValueOnce(new Error('Login failed for user powerbi_readonly secret'));

    const service = new SqlServerService(createConfigService());

    const response = await service.checkHealth();

    expect(response.status).toBe('unavailable');
    expect(JSON.stringify(response)).not.toContain('secret');
    expect(JSON.stringify(response)).not.toContain('powerbi_readonly');
    expect(JSON.stringify(response)).not.toContain('Login failed');
  });

  it('deve fechar pool no encerramento do módulo', async () => {
    const service = new SqlServerService(createConfigService());

    await service.getPool();
    await service.onModuleDestroy();

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
