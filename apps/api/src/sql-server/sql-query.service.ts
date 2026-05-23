import { Injectable } from '@nestjs/common';

import { normalizeSqlParameters, SqlParameterDefinition, SqlParameterPrimitive } from './sql-parameters';
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
  constructor(private readonly sqlServerService: SqlServerService) {}

  async executeView<TRecord extends Record<string, unknown> = Record<string, unknown>>(
    input: ExecuteViewInput,
  ): Promise<TRecord[]> {
    const viewName = validateSqlObjectName(input.viewName, 'view SQL');
    const columns = this.buildColumns(input.columns);
    const filters = input.filters ?? [];
    const whereClause = this.buildWhereClause(filters);
    const query = `SELECT ${columns} FROM ${viewName}${whereClause}`;

    try {
      const pool = await this.sqlServerService.getPool();
      const request = pool.request();

      for (const parameter of this.normalizeFilterParameters(filters)) {
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
  ): Promise<TRecord[]> {
    const procedureName = validateSqlObjectName(input.procedureName, 'stored procedure SQL');
    const parameters = input.parameters ?? [];

    try {
      const pool = await this.sqlServerService.getPool();
      const request = pool.request();

      for (const parameter of this.normalizeProcedureParameters(parameters)) {
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

  private buildColumns(columns: string[] | undefined): string {
    if (!columns || columns.length === 0) {
      return '*';
    }

    return columns.map((column) => validateSqlColumnName(column)).join(', ');
  }

  private buildWhereClause(filters: ExecuteViewFilter[]): string {
    if (filters.length === 0) {
      return '';
    }

    const clauses = filters.map((filter) => {
      const column = validateSqlColumnName(filter.column);
      const parameterName = validateSqlColumnName(filter.name, 'nome do parâmetro');

      return `${column} = @${parameterName}`;
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

  private normalizeProcedureParameters(parameters: Array<SqlParameterDefinition & { value: SqlParameterPrimitive }>) {
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
}
