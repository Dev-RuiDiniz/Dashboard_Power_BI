import { Injectable } from '@nestjs/common';

import { AuthenticatedRequestUser } from '../../auth/types/auth.types';
import { ReportsApiService } from '../../reports/reports-api.service';
import { ExportFileBuilderService, BuiltExportFile } from './export-file-builder.service';
import { ExportJobPayload } from './exports.queue';

@Injectable()
export class ExportJobRunnerService {
  private readonly pageSize = 100;

  constructor(
    private readonly reportsApiService: ReportsApiService,
    private readonly exportFileBuilderService: ExportFileBuilderService,
  ) {}

  async run(payload: ExportJobPayload): Promise<BuiltExportFile> {
    const requestUser = this.toRequestUser(payload);
    const report = await this.reportsApiService.getReportById(payload.reportId, requestUser);
    const rows = await this.loadAllRows(payload.reportId, payload.parameters, requestUser);

    return this.exportFileBuilderService.build({
      format: payload.exportFormat,
      reportId: payload.reportId,
      reportName: report.name,
      requestedBy: payload.requestContext.email,
      generatedAt: new Date().toISOString(),
      parameters: payload.parameters,
      rows,
    });
  }

  private async loadAllRows(
    reportId: string,
    parameters: Record<string, unknown> | undefined,
    user: AuthenticatedRequestUser & { permissions?: string[] },
  ): Promise<Record<string, unknown>[]> {
    const rows: Record<string, unknown>[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const response = await this.reportsApiService.queryReport(
        reportId,
        {
          filters: parameters,
          page,
          pageSize: this.pageSize,
        },
        user,
      );

      rows.push(...response.items);
      totalPages = response.totalPages;
      page += 1;
    }

    return rows;
  }

  private toRequestUser(
    payload: ExportJobPayload,
  ): AuthenticatedRequestUser & { permissions?: string[] } {
    return {
      sub: payload.requestContext.userId,
      email: payload.requestContext.email,
      roles: payload.requestContext.roles as AuthenticatedRequestUser['roles'],
      sectors: payload.requestContext.sectors as AuthenticatedRequestUser['sectors'],
      jti: '',
      tv: 0,
      permissions: payload.requestContext.permissions,
    };
  }
}
