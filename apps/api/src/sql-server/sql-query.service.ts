import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';

import {
  normalizeSqlParameters,
  SqlParameterDefinition,
  SqlParameterPrimitive,
  SqlParameterType,
} from './sql-parameters';
import { DatabaseProvider } from './database-provider.service';
import { OracleService } from './oracle.service';
import { validateSqlColumnName, validateSqlObjectName } from './sql-query-validator';
import { SqlServerService } from './sql-server.service';

export interface ExecuteViewFilter extends SqlParameterDefinition {
  column: string;
  value: SqlParameterPrimitive;
}

export interface ExecuteViewInput {
  viewName: string;
  columns?: string[];
  filters?: ExecuteViewFilter[];
}

export interface ExecuteStoredProcedureInput {
  procedureName: string;
  parameters?: Array<SqlParameterDefinition & { value: SqlParameterPrimitive }>;
}

export class SqlQueryExecutionError extends Error {
  constructor(message = 'Falha ao executar consulta SQL parametrizada.') {
    super(message);
    this.name = 'SqlQueryExecutionError';
  }
}

@Injectable()
export class SqlQueryService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly oracleService: OracleService,
  ) {}

  async executeView<TRecord extends Record<string, unknown> = Record<string, unknown>>(
    input: ExecuteViewInput,
    provider: DatabaseProvider = 'sqlserver',
  ): Promise<TRecord[]> {
    const viewName = validateSqlObjectName(input.viewName, 'view SQL');
    const columns = this.buildColumns(input.columns);
    const filters = input.filters ?? [];
    const normalizedParameters = this.normalizeFilterParameters(filters);
    const whereClause = this.buildWhereClause(filters, provider);
    const query = `SELECT ${columns} FROM ${viewName}${whereClause}`;

    try {
      if (provider === 'oracle') {
        return this.oracleService.execute<TRecord>(
          query,
          this.toOracleBindParameters(normalizedParameters),
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
      }

      const pool = await this.sqlServerService.getPool();
      const request = pool.request();

      for (const parameter of normalizedParameters) {
        request.input(parameter.name, parameter.driverType, parameter.value);
      }

      const result = await request.query<TRecord>(query);

      return result.recordset;
    } catch (error) {
      if (error instanceof SqlQueryExecutionError) {
        throw error;
      }

      throw new SqlQueryExecutionError();
    }
  }

  async executeStoredProcedure<TRecord extends Record<string, unknown> = Record<string, unknown>>(
    input: ExecuteStoredProcedureInput,
    provider: DatabaseProvider = 'sqlserver',
  ): Promise<TRecord[]> {
    const procedureName = validateSqlObjectName(input.procedureName, 'stored procedure SQL');
    const parameters = input.parameters ?? [];
    const normalizedParameters = this.normalizeProcedureParameters(parameters);

    try {
      if (provider === 'oracle') {
        return this.executeOracleStoredProcedure<TRecord>(procedureName, normalizedParameters);
      }

      const pool = await this.sqlServerService.getPool();
      const request = pool.request();

      for (const parameter of normalizedParameters) {
        request.input(parameter.name, parameter.driverType, parameter.value);
      }

      const result = await request.execute<TRecord>(procedureName);

      return result.recordset;
    } catch (error) {
      if (error instanceof SqlQueryExecutionError) {
        throw error;
      }

      throw new SqlQueryExecutionError();
    }
  }

  private async executeOracleStoredProcedure<TRecord extends Record<string, unknown>>(
    procedureName: string,
    normalizedParameters: ReturnType<SqlQueryService['normalizeProcedureParameters']>,
  ): Promise<TRecord[]> {
    const cursorName = 'result_cursor';
    const bindParameters = this.toOracleBindParameters(normalizedParameters);
    const procedureArguments = normalizedParameters.map((parameter) => `:${parameter.name}`);
    procedureArguments.push(`:${cursorName}`);
    const plsql = `BEGIN ${procedureName}(${procedureArguments.join(', ')}); END;`;

    return this.oracleService.execute<TRecord>(plsql, {
      ...bindParameters,
      [cursorName]: {
        dir: oracledb.BIND_OUT,
        type: oracledb.CURSOR,
      },
    });
  }

  private buildColumns(columns: string[] | undefined): string {
    if (!columns || columns.length === 0) {
      return '*';
    }

    return columns.map((column) => validateSqlColumnName(column)).join(', ');
  }

  private buildWhereClause(filters: ExecuteViewFilter[], provider: DatabaseProvider): string {
    if (filters.length === 0) {
      return '';
    }

    const clauses = filters.map((filter) => {
      const column = validateSqlColumnName(filter.column);
      const parameterName = validateSqlColumnName(filter.name, 'nome do parametro');

      return `${column} = ${provider === 'oracle' ? ':' : '@'}${parameterName}`;
    });

    return ` WHERE ${clauses.join(' AND ')}`;
  }

  private normalizeFilterParameters(filters: ExecuteViewFilter[]) {
    return normalizeSqlParameters(
      filters.map((filter) => ({
        name: filter.name,
        type: filter.type,
        required: filter.required,
        maxLength: filter.maxLength,
      })),
      Object.fromEntries(filters.map((filter) => [filter.name, filter.value])),
    );
  }

  private normalizeProcedureParameters(
    parameters: Array<SqlParameterDefinition & { value: SqlParameterPrimitive }>,
  ) {
    return normalizeSqlParameters(
      parameters.map((parameter) => ({
        name: parameter.name,
        type: parameter.type,
        required: parameter.required,
        maxLength: parameter.maxLength,
      })),
      Object.fromEntries(parameters.map((parameter) => [parameter.name, parameter.value])),
    );
  }

  private toOracleBindParameters(
    parameters: ReturnType<SqlQueryService['normalizeProcedureParameters']>,
  ) {
    return Object.fromEntries(
      parameters.map((parameter) => [
        parameter.name,
        {
          dir: oracledb.BIND_IN,
          type: this.getOracleType(parameter.type),
          val: parameter.value,
        },
      ]),
    );
  }

  private getOracleType(type: SqlParameterType) {
    switch (type) {
      case 'string':
        return oracledb.STRING;
      case 'int':
      case 'number':
        return oracledb.NUMBER;
      case 'boolean':
        return oracledb.DB_TYPE_BOOLEAN;
      case 'date':
        return oracledb.DATE;
      default:
        return oracledb.STRING;
    }
  }
}
