import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

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

@Injectable()
export class ReportDefinitionsService {
  constructor(private readonly repository: ReportDefinitionsRepository) {}

  async create(input: CreateReportDefinitionInput): Promise<ReportDefinition> {
    const validatedInput = validateCreateReportDefinition(input);
    await this.ensureUniqueSourceBySector(validatedInput.sourceName, validatedInput.sector);

    return this.repository.create(validatedInput);
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

    const updated = await this.repository.update(id, validatedInput);

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

  private async ensureUniqueSourceBySector(sourceName: string, sector: string, ignoredId?: string): Promise<void> {
    if (await this.repository.existsBySourceAndSector(sourceName, sector, ignoredId)) {
      throw new ConflictException('Já existe relatório cadastrado para esta fonte SQL e setor.');
    }
  }
}
