import type { ConfigService } from '@nestjs/config';

export interface OracleConfig {
  host: string;
  port: number;
  serviceName: string;
  user: string;
  password: string;
  poolMin: number;
  poolMax: number;
  poolIncrement: number;
  queueTimeout: number;
  stmtCacheSize: number;
}

export interface OracleSafeConfig {
  hostConfigured: boolean;
  port: number;
  serviceNameConfigured: boolean;
  userConfigured: boolean;
  poolMin: number;
  poolMax: number;
  poolIncrement: number;
  queueTimeout: number;
  stmtCacheSize: number;
}

const DEFAULT_PORT = 1521;
const DEFAULT_POOL_MIN = 0;
const DEFAULT_POOL_MAX = 5;
const DEFAULT_POOL_INCREMENT = 1;
const DEFAULT_QUEUE_TIMEOUT = 60000;
const DEFAULT_STMT_CACHE_SIZE = 30;

type EnvReader = Pick<ConfigService, 'get'>;

export class OracleConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OracleConfigError';
  }
}

export function getOracleConfig(configService: EnvReader): OracleConfig {
  return {
    host: readRequiredString(configService, 'ORACLE_HOST'),
    port: readPositiveInteger(configService, 'ORACLE_PORT', DEFAULT_PORT),
    serviceName: readRequiredString(configService, 'ORACLE_SERVICE_NAME'),
    user: readRequiredString(configService, 'ORACLE_USER'),
    password: readRequiredString(configService, 'ORACLE_PASSWORD'),
    poolMin: readNonNegativeInteger(configService, 'ORACLE_POOL_MIN', DEFAULT_POOL_MIN),
    poolMax: readPositiveInteger(configService, 'ORACLE_POOL_MAX', DEFAULT_POOL_MAX),
    poolIncrement: readPositiveInteger(configService, 'ORACLE_POOL_INCREMENT', DEFAULT_POOL_INCREMENT),
    queueTimeout: readPositiveInteger(configService, 'ORACLE_QUEUE_TIMEOUT_MS', DEFAULT_QUEUE_TIMEOUT),
    stmtCacheSize: readPositiveInteger(configService, 'ORACLE_STMT_CACHE_SIZE', DEFAULT_STMT_CACHE_SIZE),
  };
}

export function getOracleSafeConfig(configService: EnvReader): OracleSafeConfig {
  return {
    hostConfigured: Boolean(readOptionalString(configService, 'ORACLE_HOST')),
    port: readPositiveInteger(configService, 'ORACLE_PORT', DEFAULT_PORT),
    serviceNameConfigured: Boolean(readOptionalString(configService, 'ORACLE_SERVICE_NAME')),
    userConfigured: Boolean(readOptionalString(configService, 'ORACLE_USER')),
    poolMin: readNonNegativeInteger(configService, 'ORACLE_POOL_MIN', DEFAULT_POOL_MIN),
    poolMax: readPositiveInteger(configService, 'ORACLE_POOL_MAX', DEFAULT_POOL_MAX),
    poolIncrement: readPositiveInteger(configService, 'ORACLE_POOL_INCREMENT', DEFAULT_POOL_INCREMENT),
    queueTimeout: readPositiveInteger(configService, 'ORACLE_QUEUE_TIMEOUT_MS', DEFAULT_QUEUE_TIMEOUT),
    stmtCacheSize: readPositiveInteger(configService, 'ORACLE_STMT_CACHE_SIZE', DEFAULT_STMT_CACHE_SIZE),
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
    throw new OracleConfigError(`Variavel obrigatoria ausente: ${key}`);
  }

  return value;
}

function readPositiveInteger(configService: EnvReader, key: string, defaultValue: number): number {
  const value = readInteger(configService, key, defaultValue);

  if (value <= 0) {
    throw new OracleConfigError(`Variavel numerica deve ser maior que zero: ${key}`);
  }

  return value;
}

function readNonNegativeInteger(configService: EnvReader, key: string, defaultValue: number): number {
  const value = readInteger(configService, key, defaultValue);

  if (value < 0) {
    throw new OracleConfigError(`Variavel numerica nao pode ser negativa: ${key}`);
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
    throw new OracleConfigError(`Variavel numerica invalida: ${key}`);
  }

  return parsedValue;
}
