import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  CreateReportDefinitionInput,
  ReportDefinition,
  UpdateReportDefinitionInput,
} from '../entities/report-definition.entity';

@Injectable()
export class ReportDefinitionsRepository {
  private readonly reports = new Map<string, ReportDefinition>();
  private sequence = 0;

  constructor(private readonly configService: ConfigService = new ConfigService()) {
    this.seedDemoReports();
  }

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

  private seedDemoReports(): void {
    if (!isDemoMode(this.configService)) {
      return;
    }

    const seeds: CreateReportDefinitionInput[] = [
      {
        name: 'Resumo Financeiro Mensal',
        description: 'Indicadores financeiros mockados carregados do SQL Server local.',
        sector: 'financeiro',
        sourceType: 'view',
        sourceName: 'reports.vw_financeiro_resumo',
        parameters: [],
        requiredPermissions: [],
      },
      {
        name: 'Pipeline Comercial por Regional',
        description: 'Visao comercial com filtro de regional no ambiente demo.',
        sector: 'comercial',
        sourceType: 'view',
        sourceName: 'reports.vw_comercial_pipeline',
        parameters: [{ name: 'regional', type: 'string', required: false, maxLength: 40 }],
        requiredPermissions: [],
      },
      {
        name: 'Status Operacional',
        description: 'Consulta por stored procedure para validar execucao com parametros.',
        sector: 'operacoes',
        sourceType: 'stored_procedure',
        sourceName: 'reports.sp_operacoes_status',
        parameters: [{ name: 'status', type: 'string', required: false, maxLength: 20 }],
        requiredPermissions: [],
      },
      {
        name: 'Visao Executiva Diretoria',
        description: 'Relatorio reservado para o fluxo administrativo de demonstracao.',
        sector: 'diretoria',
        sourceType: 'view',
        sourceName: 'reports.vw_diretoria_estrategica',
        parameters: [],
        requiredPermissions: [],
      },
    ];

    for (const seed of seeds) {
      const now = new Date().toISOString();
      const report: ReportDefinition = {
        id: this.nextId(),
        ...seed,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      this.reports.set(report.id, report);
    }
  }
}

function isDemoMode(configService: ConfigService): boolean {
  return configService.get<string>('APP_MODE') === 'demo' || configService.get<string>('DATA_MODE') === 'mock';
}
