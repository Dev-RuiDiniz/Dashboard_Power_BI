import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthenticatedRequestUser } from '../auth/types/auth.types';
import { SqlQueryService } from '../sql-server/sql-query.service';
import { ReportDefinition, ReportParameterDefinition } from './entities/report-definition.entity';
import { normalizeListReportsQuery, PaginationInput, QueryReportInput, validateReportQuery } from './report-query.validator';
import { ReportAccessContext, ReportAuthorizationService } from './report-authorization.service';
import { ReportDefinitionsService } from './report-definitions.service';
import { PaginatedResponse, PublicReportDefinition } from './dto/report-query-response.dto';

@Injectable()
export class ReportsApiService {
  constructor(
    private readonly reportDefinitionsService: ReportDefinitionsService,
    private readonly reportAuthorizationService: ReportAuthorizationService,
    private readonly sqlQueryService: SqlQueryService,
  ) {}

  async listReports(
    query: PaginationInput & { sector?: string },
    user?: AuthenticatedRequestUser | ReportAccessContext | null,
  ): Promise<PaginatedResponse<PublicReportDefinition>> {
    const normalizedQuery = normalizeListReportsQuery(query);
    const context = this.reportAuthorizationService.normalizeContext(user);
    const reports = normalizedQuery.sector
      ? await this.reportDefinitionsService.listBySector(normalizedQuery.sector)
      : await this.reportDefinitionsService.list();

    const authorizedReports = reports.filter((report) => report.isActive && this.reportAuthorizationService.canAccessReport(report, context));
    const items = paginate(authorizedReports.map(toPublicReportDefinition), normalizedQuery.pagination.offset, normalizedQuery.pagination.limit);

    return toPaginatedResponse(items, authorizedReports.length, normalizedQuery.pagination.page, normalizedQuery.pagination.pageSize);
  }

  async getReportById(id: string, user?: AuthenticatedRequestUser | ReportAccessContext | null): Promise<PublicReportDefinition> {
    const report = await this.reportDefinitionsService.getById(id);

    if (!report.isActive) {
      throw new NotFoundException('Relatório não encontrado.');
    }

    this.reportAuthorizationService.assertCanAccessReport(report, user);

    return toPublicReportDefinition(report);
  }

  async queryReport(
    id: string,
    input: QueryReportInput,
    user?: AuthenticatedRequestUser | ReportAccessContext | null,
  ): Promise<PaginatedResponse<Record<string, unknown>>> {
    const report = await this.reportDefinitionsService.getById(id);

    if (!report.isActive) {
      throw new NotFoundException('Relatório não encontrado.');
    }

    this.reportAuthorizationService.assertCanAccessReport(report, user);
    const query = validateReportQuery(report, input);

    const rows =
      report.sourceType === 'view'
        ? await this.sqlQueryService.executeView<Record<string, unknown>>({
            viewName: report.sourceName,
            filters: toViewFilters(report.parameters, query.filters),
          })
        : await this.sqlQueryService.executeStoredProcedure<Record<string, unknown>>({
            procedureName: report.sourceName,
            parameters: toProcedureParameters(report.parameters, query.filters),
          });

    const items = paginate(rows, query.pagination.offset, query.pagination.limit);

    return toPaginatedResponse(items, rows.length, query.pagination.page, query.pagination.pageSize);
  }
}

function toPublicReportDefinition(report: ReportDefinition): PublicReportDefinition {
  return {
    id: report.id,
    name: report.name,
    description: report.description,
    sector: report.sector,
    sourceType: report.sourceType,
    parameters: report.parameters.map((parameter) => ({
      name: parameter.name,
      type: parameter.type,
      required: parameter.required ?? false,
      maxLength: parameter.maxLength,
    })),
    requiredPermissions: report.requiredPermissions,
  };
}

function toViewFilters(parameters: ReportParameterDefinition[], filters: Record<string, unknown>) {
  return parameters
    .filter((parameter) => filters[parameter.name] !== undefined && filters[parameter.name] !== null)
    .map((parameter) => ({
      column: parameter.name,
      name: parameter.name,
      type: parameter.type,
      value: filters[parameter.name] as never,
      required: parameter.required,
      maxLength: parameter.maxLength,
    }));
}

function toProcedureParameters(parameters: ReportParameterDefinition[], filters: Record<string, unknown>) {
  return parameters
    .filter((parameter) => filters[parameter.name] !== undefined && filters[parameter.name] !== null)
    .map((parameter) => ({
      name: parameter.name,
      type: parameter.type,
      value: filters[parameter.name] as never,
      required: parameter.required,
      maxLength: parameter.maxLength,
    }));
}

function paginate<TItem>(items: TItem[], offset: number, limit: number): TItem[] {
  return items.slice(offset, offset + limit);
}

function toPaginatedResponse<TItem>(items: TItem[], total: number, page: number, pageSize: number): PaginatedResponse<TItem> {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
