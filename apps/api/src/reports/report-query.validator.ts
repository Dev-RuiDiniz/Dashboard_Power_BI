import { BadRequestException } from '@nestjs/common';

import { normalizeSqlParameters, SqlParameterPrimitive } from '../sql-server/sql-parameters';
import { ReportDefinition, ReportParameterDefinition } from './entities/report-definition.entity';
import { validateSector } from './report-definition.validator';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export interface PaginationInput {
  page?: number | string;
  pageSize?: number | string;
}

export interface NormalizedPagination {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
}

export interface QueryReportInput extends PaginationInput {
  filters?: Record<string, unknown>;
}

export interface NormalizedReportQuery {
  filters: Record<string, SqlParameterPrimitive>;
  pagination: NormalizedPagination;
}

export class ReportQueryValidationError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export function normalizePagination(input: PaginationInput = {}): NormalizedPagination {
  const page = normalizePositiveInteger(input.page, DEFAULT_PAGE, 'page');
  const pageSize = normalizePositiveInteger(input.pageSize, DEFAULT_PAGE_SIZE, 'pageSize');

  if (pageSize > MAX_PAGE_SIZE) {
    throw new ReportQueryValidationError(`pageSize deve ser menor ou igual a ${MAX_PAGE_SIZE}.`);
  }

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

export function normalizeListReportsQuery(input: PaginationInput & { sector?: string }) {
  return {
    sector: input.sector ? validateSector(input.sector) : undefined,
    pagination: normalizePagination(input),
  };
}

export function validateReportQuery(definition: ReportDefinition, input: QueryReportInput = {}): NormalizedReportQuery {
  const filters = input.filters ?? {};

  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
    throw new ReportQueryValidationError('Filtros devem ser um objeto.');
  }

  const parameterDefinitions = definition.parameters ?? [];
  const normalizedParameters = normalizeSqlParameters(toSqlParameterDefinitions(parameterDefinitions), filters);

  return {
    filters: Object.fromEntries(normalizedParameters.map((parameter) => [parameter.name, parameter.value])),
    pagination: normalizePagination(input),
  };
}

function toSqlParameterDefinitions(parameters: ReportParameterDefinition[]) {
  return parameters.map((parameter) => ({
    name: parameter.name,
    type: parameter.type,
    required: parameter.required,
    maxLength: parameter.maxLength,
  }));
}

function normalizePositiveInteger(value: number | string | undefined, defaultValue: number, label: string): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const numberValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new ReportQueryValidationError(`${label} deve ser um inteiro positivo.`);
  }

  return numberValue;
}
