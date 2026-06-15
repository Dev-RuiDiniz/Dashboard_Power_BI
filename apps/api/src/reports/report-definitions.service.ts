import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { SqlQueryService } from '../sql-server/sql-query.service';
import {
  CreateReportDefinitionInput,
  ReportDefinition,
  UpdateReportDefinitionInput,
} from './entities/report-definition.entity';
import { ReportDefinitionsRepository } from './repositories/report-definitions.repository';
import {
  validateCreateReportDefinition,
  validateSector,
  validateUpdateReportDefinition,
} from './report-definition.validator';

export type ValidateSourceResult = {
  valid: boolean;
  message?: string;
};

@Injectable()
export class ReportDefinitionsService {
  constructor(
    private readonly repository: ReportDefinitionsRepository,
    private readonly sqlQueryService: SqlQueryService,
  ) {}

  async create(input: CreateReportDefinitionInput): Promise<ReportDefinition> {
    const validatedInput = validateCreateReportDefinition(input);
    await this.ensureUniqueSourceBySector(validatedInput.sourceName, validatedInput.sector);

    try {
      return await this.repository.create(validatedInput);
    } catch (error) {
      this.rethrowDuplicateSourceConflict(error);
      throw error;
    }
  }

  async list(): Promise<ReportDefinition[]> {
    return this.repository.findAll();
  }

  async listBySector(sector: string): Promise<ReportDefinition[]> {
    return this.repository.findBySector(validateSector(sector), true);
  }

  async getById(id: string): Promise<ReportDefinition> {
    const report = await this.repository.findById(id);

    if (!report) {
      throw new NotFoundException('Relatório não encontrado.');
    }

    return report;
  }

  async update(id: string, input: UpdateReportDefinitionInput): Promise<ReportDefinition> {
    const current = await this.getById(id);
    const validatedInput = validateUpdateReportDefinition(current, input);

    await this.ensureUniqueSourceBySector(validatedInput.sourceName, validatedInput.sector, id);

    let updated: ReportDefinition | undefined;

    try {
      updated = await this.repository.update(id, validatedInput);
    } catch (error) {
      this.rethrowDuplicateSourceConflict(error);
      throw error;
    }

    if (!updated) {
      throw new NotFoundException('Relatório não encontrado.');
    }

    return updated;
  }

  async deactivate(id: string): Promise<ReportDefinition> {
    const deactivated = await this.repository.deactivate(id);

    if (!deactivated) {
      throw new NotFoundException('Relatório não encontrado.');
    }

    return deactivated;
  }

  async validateSource(
    sourceType: 'view' | 'stored_procedure',
    sourceName: string,
  ): Promise<ValidateSourceResult> {
    try {
      if (sourceType === 'view') {
        await this.sqlQueryService.executeView({
          viewName: sourceName,
          columns: ['*'],
          filters: [],
        });
      } else {
        await this.sqlQueryService.executeStoredProcedure({
          procedureName: sourceName,
          parameters: [],
        });
      }
      return { valid: true };
    } catch {
      return { valid: false, message: 'Fonte SQL não encontrada ou indisponível.' };
    }
  }

  private async ensureUniqueSourceBySector(
    sourceName: string,
    sector: string,
    ignoredId?: string,
  ): Promise<void> {
    if (await this.repository.existsBySourceAndSector(sourceName, sector, ignoredId)) {
      throw new ConflictException('Já existe relatório cadastrado para esta fonte SQL e setor.');
    }
  }

  private rethrowDuplicateSourceConflict(error: unknown): void {
    if (!this.isUniqueViolation(error)) {
      return;
    }

    throw new ConflictException('Já existe relatório cadastrado para esta fonte SQL e setor.');
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const databaseError = error as { code?: string; message?: string };

    return (
      databaseError.code === '23505' ||
      databaseError.message?.includes('idx_api_report_definitions_source_sector_unique') === true
    );
  }
}
