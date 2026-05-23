import { Injectable } from '@nestjs/common';

import {
  CreateReportDefinitionInput,
  ReportDefinition,
  UpdateReportDefinitionInput,
} from '../entities/report-definition.entity';

@Injectable()
export class ReportDefinitionsRepository {
  private readonly reports = new Map<string, ReportDefinition>();
  private sequence = 0;

  async create(input: CreateReportDefinitionInput): Promise<ReportDefinition> {
    const now = new Date().toISOString();
    const report: ReportDefinition = {
      id: this.nextId(),
      ...input,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.reports.set(report.id, report);

    return report;
  }

  async findAll(): Promise<ReportDefinition[]> {
    return [...this.reports.values()];
  }

  async findActive(): Promise<ReportDefinition[]> {
    return this.findByActive(true);
  }

  async findBySector(sector: string, activeOnly = true): Promise<ReportDefinition[]> {
    return [...this.reports.values()].filter((report) => report.sector === sector && (!activeOnly || report.isActive));
  }

  async findById(id: string): Promise<ReportDefinition | undefined> {
    return this.reports.get(id);
  }

  async update(id: string, input: UpdateReportDefinitionInput): Promise<ReportDefinition | undefined> {
    const current = await this.findById(id);

    if (!current) {
      return undefined;
    }

    const updated: ReportDefinition = {
      ...current,
      ...input,
      parameters: input.parameters ?? current.parameters,
      requiredPermissions: input.requiredPermissions ?? current.requiredPermissions,
      updatedAt: new Date().toISOString(),
    };

    this.reports.set(id, updated);

    return updated;
  }

  async deactivate(id: string): Promise<ReportDefinition | undefined> {
    return this.update(id, { isActive: false });
  }

  async existsBySourceAndSector(sourceName: string, sector: string, ignoredId?: string): Promise<boolean> {
    return [...this.reports.values()].some(
      (report) => report.sourceName === sourceName && report.sector === sector && report.id !== ignoredId,
    );
  }

  private async findByActive(isActive: boolean): Promise<ReportDefinition[]> {
    return [...this.reports.values()].filter((report) => report.isActive === isActive);
  }

  private nextId(): string {
    this.sequence += 1;

    return `report-${this.sequence}`;
  }
}
