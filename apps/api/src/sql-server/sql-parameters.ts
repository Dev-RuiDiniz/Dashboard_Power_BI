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
  values: Record<string, unknown,`?
?:


