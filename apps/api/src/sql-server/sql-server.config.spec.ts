import {
  getSqlServerConfig,
  getSqlServerSafeConfig,
  SqlServerConfigError,
} from './sql-server.config';

const createConfigService = (env: Record<string, string | undefined>) => ({
  get: jest.fn(<T = string>(key: string): T | undefined => env[key] as T | undefined),
});

describe('getSqlServerConfig', () => {
  it('deve montar a configuração segura do SQL Server a partir do ambiente', () => {
    const configService = createConfigService({
      SQLSERVER_HOST: 'sql.example.local',
      SQLSERVER_PORT: '1434',
      SQLSERVER_DATABASE: 'PowerBI',
      SQLSERVER_USER: 'powerbi_readonly',
      SQLSERVER_PASSWORD: 'secret',
      SQLSERVER_ENCRYPT: 'true',
      SQLSERVER_TRUST_SERVER_CERTIFICATE: 'false',
      SQLSERVER_CONNECTION_TIMEOUT_MS: '7000',
      SQLSERVER_REQUEST_TIMEOUT_MS: '8000',
      SQLSERVER_POOL_MAX: '10',
      SQLSERVER_POOL_MIN: '1',
      SQLSERVER_POOL_IDLE_TIMEOUT_MS: '45000',
    });

    expect(getSqlServerConfig(configService)).toEqual({
      server: 'sql.example.local',
      port: 1434,
      database: 'PowerBI',
      user: 'powerbi_readonly',
      password: 'secret',
      connectionTimeout: 7000,
      requestTimeout: 8000,
      pool: {
        max: 10,
        min: 1,
        idleTimeoutMillis: 45000,
      },
      options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
      },
    });
  });

  it('deve aplicar defaults seguros de porta, timeout, pool e criptografia', () => {
    const configService = createConfigService({
      SQLSERVER_HOST: 'sql.example.local',
      SQLSERVER_DATABASE: 'PowerBI',
      SQLSERVER_USER: 'powerbi_readonly',
      SQLSERVER_PASSWORD: 'secret',
    });

    expect(getSqlServerConfig(configService)).toMatchObject({
      port: 1433,
      connectionTimeout: 5000,
      requestTimeout: 5000,
      pool: {
        max: 5,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    });
  });

  it('deve falhar sem expor senha quando variável obrigatória estiver ausente', () => {
    const configService = createConfigService({
      SQLSERVER_HOST: 'sql.example.local',
      SQLSERVER_DATABASE: 'PowerBI',
      SQLSERVER_USER: 'powerbi_readonly',
      SQLSERVER_PASSWORD: '',
    });

    expect(() => getSqlServerConfig(configService)).toThrow(SqlServerConfigError);

    try {
      getSqlServerConfig(configService);
    } catch (error) {
      expect((error as Error).message).not.toContain('secret');
      expect((error as Error).message).not.toContain('powerbi_readonly');
      expect((error as Error).message).not.toContain('sql.example.local');
    }
  });

  it('deve retornar configuração sanitizada sem credenciais', () => {
    const configService = createConfigService({
      SQLSERVER_HOST: 'sql.example.local',
      SQLSERVER_DATABASE: 'PowerBI',
      SQLSERVER_USER: 'powerbi_readonly',
      SQLSERVER_PASSWORD: 'secret',
      SQLSERVER_ENCRYPT: 'false',
      SQLSERVER_TRUST_SERVER_CERTIFICATE: 'true',
    });

    expect(getSqlServerSafeConfig(configService)).toEqual({
      serverConfigured: true,
      port: 1433,
      databaseConfigured: true,
      userConfigured: true,
      encrypt: false,
      trustServerCertificate: true,
      connectionTimeout: 5000,
      requestTimeout: 5000,
    });
  });
});
