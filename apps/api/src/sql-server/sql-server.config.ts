import type { ConfigService } from '@nestjs/config';

export interface SqlServerConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionTimeout: number;
  requestTimeout: number;
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    enableArithAbort: boolean;
  };
}

export interface SqlServerSafeConfig {
  serverConfigured: boolean;
  port: number;
  databaseConfigured: boolean;
  userConfigured: boolean;
  encrypt: boolean;
  trustServerCertificate: boolean;
  connectionTimeout: number;
  requestTimeout: number;
}

const DEFAULT_PORT = 1433;
const DEFAULT_CONNECTION_TIMEOUT = 5000;
const DEFAULT_REQUEST_TIMEOUT = 5000;
const DEFAULT_POOL_MAX = 5;
const DEFAULT_POOL_MIN = 0;
const DEFAULT_POOL_IDLE_TIMEOUT = 30000;

type EnvReader = Pick<ConfigService, 'get'>;

export class SqlServerConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SqlServerConfigError';
  }
}

export function getSqlServerConfig(configService: EnvReader): SqlServerConfig {
  const server = readRequiredString(configService, 'SQLSERVER_HOST');
  const database = readRequiredString(configService, 'SQLSERVER_DATABASE');
  const user = readRequiredString(configService, 'SQLSERVER_USER');
  const password = readRequiredString(configService, 'SQLSERVER_PASSWORD');

  return {
    server,
    port: readPositiveInteger(configService, 'SQLSERVER_PORT', DEFAULT_PORT),
    database,
    user,
    password,
    connectionTimeout: readPositiveInteger(
      configService,
      'SQLSERVER_CONNECTION_TIMEOUT_MS',
      DEFAULT_CONNECTION_TIMEOUT,
    ),
    requestTimeout: readPositiveInteger(
      configService,
      'SQLSERVER_REQUEST_TIMEOUT_MS',
      DEFAULT_REQUEST_TIMEOUT,
    ),
    pool: {
      max: readPositiveInteger(configService, 'SQLSERVER_POOL_MAX', DEFAULT_POOL_MAX),
      min: readNonNegativeInteger(configService, 'SQLSERVER_POOL_MIN', DEFAULT_POOL_MIN),
      idleTimeoutMillis: readPositiveInteger(
        configService,
        'SQLSERVER_POOL_IDLE_TIMEOUT_MS',
        DEFAULT_POOL_IDLE_TIMEOUT,
      ),
    },
    options: {
      encrypt: readBoolean(configService, 'SQLSERVER_ENCRYPT', true),
      trustServerCertificate: readBoolean(
        configService,
        'SQLSERVER_TRUST_SERVER_CERTIFICATE',
        false,
      ),
      enableArithAbort: true,
    },
  };
}

export function getSqlServerSafeConfig(configService: EnvReader): SqlServerSafeConfig {
  return {
    serverConfigured: Boolean(readOptionalString(configService, 'SQLSERVER_HOST')),
    port: readPositiveInteger(configService, 'SQLSERVER_PORT', DEFAULT_PORT),
    databaseConfigured: Boolean(readOptionalString(configService, 'SQLSERVER_DATABASE')),
    userConfigured: Boolean(readOptionalString(configService, 'SQLSERVER_USER')),
    encrypt: readBoolean(configService, 'SQLSERVER_ENCRYPT', true),
    trustServerCertificate: readBoolean(
      configService,
      'SQLSERVER_TRUST_SERVER_CERTIFICATE',
      false,
    ),
    connectionTimeout: readPositiveInteger(
      configService,
      'SQLSERVER_CONNECTION_TIMEOUT_MS',
      DEFAULT_CONNECTION_TIMEOUT,
    ),
    requestTimeout: readPositiveInteger(
      configService,
      'SQLSERVER_REQUEST_TIMEOUT_MS',
      DEFAULT_REQUEST_TIMEOUT,
    ),
  };
}

function readOptionalString(configService: EnvReader, key: string): string | undefined {
  const value = configService.get<string>(key);

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function readRequiredString(configService: EnvReader, key: string): string {
  const value = readOptionalString(configService, key);

  if (!value) {
    throw new SqlServerConfigError(`Variável obrigatória ausente: ${key}`);
  }

  return value;
}

function readBoolean(configService: EnvReader, key: string, defaultValue: boolean): boolean {
  const value = readOptionalString(configService, key);

  if (!value) {
    return defaultValue;
  }

  if (['true', '1', 'yes', 'y', 'sim'].includes(value.toLowerCase())) {
    return true;
  }

  if (['false', '0', 'no', 'n', 'nao', 'não'].includes(value.toLowerCase())) {
    return false;
  }

  throw new SqlServerConfigError(`Variável booleana inválida: ${key}`);
}

function readPositiveInteger(configService: EnvReader, key: string, defaultValue: number): number {
  const value = readInteger(configService, key, defaultValue);

  if (value <= 0) {
    throw new SqlServerConfigError(`Variável numérica deve ser maior que zero: ${key}`);
  }

  return value;
}

function readNonNegativeInteger(
  configService: EnvReader,
  key: string,
  defaultValue: number,
): number {
  const value = readInteger(configService, key, defaultValue);

  if (value < 0) {
    throw new SqlServerConfigError(`Variável numérica não pode ser negativa: ${key}`);
  }

  return value;
}

function readInteger(configService: EnvReader, key: string, defaultValue: number): number {
  const value = readOptionalString(configService, key);

  if (!value) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue)) {
    throw new SqlServerConfigError(`Variável numérica inválida: ${key}`);
  }

  return parsedValue;
}
