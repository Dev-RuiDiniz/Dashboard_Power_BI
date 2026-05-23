import { Bit, DateTime2, Float, Int, NVarChar } from 'mssql';

import { validateSqlParameterName } from './sql-query-validator';

export type SqlParameterType = 'string' | 'int' | 'number' | 'boolean' | 'date';

export type SqlParameterPrimitive = string | number | boolean | Date | null;

export interface SqlParameterDefinition {
  name: string;
  type: SqlParameterType;
  required?: boolean;
  maxLength?: number;
}

export interface SqlParameterValue {
  name: string;
  type: SqlParameterType;
  value: SqlParameterPrimitive;
  driverType: unknown;
}

export class SqlParameterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SqlParameterValidationError';
  }
}

export function normalizeSqlParameters(
  definitions: SqlParameterDefinition[],
  values: Record<string, unknown>,
): SqlParameterValue[] {
  const safeValues = values ?? {};
  const definitionNames = new Set(definitions.map((definition) => validateSqlParameterName(definition.name)));

  for (const parameterName of Object.keys(safeValues)) {
    validateSqlParameterName(parameterName);

    if (!definitionNames.has(parameterName)) {
      throw new SqlParameterValidationError(`Parâmetro não permitido: ${parameterName}`);
    }
  }

  return definitions.flatMap((definition) => {
    const safeName = validateSqlParameterName(definition.name);
    const value = safeValues[safeName];

    if (value === undefined || value === null || value === '') {
      if (definition.required) {
        throw new SqlParameterValidationError(`Parâmetro obrigatório ausente: ${safeName}`);
      }

      return [
        {
          name: safeName,
          type: definition.type,
          value: null,
          driverType: getDriverType(definition),
        },
      ];
    }

    return [
      {
        name: safeName,
        type: definition.type,
        value: normalizeValue(definition, value),
        driverType: getDriverType(definition),
      },
    ];
  });
}

function normalizeValue(definition: SqlParameterDefinition, value: unknown): SqlParameterPrimitive {
  if (Array.isArray(value) || (typeof value === 'object' && !(value instanceof Date) && value !== null)) {
    throw new SqlParameterValidationError(`Parâmetro inválido: ${definition.name}`);
  }

  switch (definition.type) {
    case 'string':
      return normalizeString(definition, value);
    case 'int':
      return normalizeInteger(definition, value);
    case 'number':
      return normalizeNumber(definition, value);
    case 'boolean':
      return normalizeBoolean(definition, value);
    case 'date':
      return normalizeDate(definition, value);
    default:
      throw new SqlParameterValidationError(`Tipo de parâmetro não suportado: ${definition.type as string}`);
  }
}

function normalizeString(definition: SqlParameterDefinition, value: unknown): string {
  if (typeof value !== 'string') {
    throw new SqlParameterValidationError(`Parâmetro deve ser texto: ${definition.name}`);
  }

  const maxLength = definition.maxLength ?? 255;

  if (value.length > maxLength) {
    throw new SqlParameterValidationError(`Parâmetro excede tamanho máximo: ${definition.name}`);
  }

  return value;
}

function normalizeInteger(definition: SqlParameterDefinition, value: unknown): number {
  const numberValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(numberValue)) {
    throw new SqlParameterValidationError(`Parâmetro deve ser inteiro: ${definition.name}`);
  }

  return numberValue;
}

function normalizeNumber(definition: SqlParameterDefinition, value: unknown): number {
  const numberValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new SqlParameterValidationError(`Parâmetro deve ser numérico: ${definition.name}`);
  }

  return numberValue;
}

function normalizeBoolean(definition: SqlParameterDefinition, value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.toLowerCase();

    if (['true', '1', 'sim', 'yes'].includes(normalizedValue)) {
      return true;
    }

    if (['false', '0', 'nao', 'não', 'no'].includes(normalizedValue)) {
      return false;
    }
  }

  throw new SqlParameterValidationError(`Parâmetro deve ser booleano: ${definition.name}`);
}

function normalizeDate(definition: SqlParameterDefinition, value: unknown): Date {
  const dateValue = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(dateValue.getTime())) {
    throw new SqlParameterValidationError(`Parâmetro deve ser data válida: ${definition.name}`);
  }

  return dateValue;
}

function getDriverType(definition: SqlParameterDefinition): unknown {
  switch (definition.type) {
    case 'string':
      return NVarChar(definition.maxLength ?? 255);
    case 'int':
      return Int;
    case 'number':
      return Float;
    case 'boolean':
      return Bit;
    case 'date':
      return DateTime2;
    default:
      throw new SqlParameterValidationError(`Tipo de parâmetro não suportado: ${definition.type as string}`);
  }
}
