import { Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { SupabaseService } from '../../supabase/supabase.service';
import {
  CreateReportDefinitionInput,
  ReportDefinition,
  UpdateReportDefinitionInput,
} from '../entities/report-definition.entity';

type ApiReportDefinitionRow = {
  id: string;
  name: string;
  description: string;
  sector: string;
  source_type: 'view' | 'stored_procedure';
  source_name: string;
  parameters: ReportDefinition['parameters'];
  required_permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class ReportDefinitionsRepository {
  private readonly reports = new Map<string, ReportDefinition>();
  private sequence = 0;

  constructor(@Optional() private readonly supabaseService?: SupabaseService) {}

  async create(input: CreateReportDefinitionInput): Promise<ReportDefinition> {
    const now = new Date().toISOString();
    const report: ReportDefinition = {
      id: this.useSupabase() ? `report-${randomUUID()}` : this.nextId(),
      ...input,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    if (this.useSupabase()) {
      const { error } = await this.supabaseService!.getClient()
        .from('api_report_definitions')
        .insert(this.reportToRow(report));

      if (error) {
        throw error;
      }

      return report;
    }

    this.reports.set(report.id, report);

    return report;
  }

  async findAll(): Promise<ReportDefinition[]> {
    if (this.useSupabase()) {
      const { data, error } = await this.supabaseService!.getClient()
        .from('api_report_definitions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return (data as ApiReportDefinitionRow[]).map((row) => this.rowToReport(row));
    }

    return [...this.reports.values()];
  }

  async findActive(): Promise<ReportDefinition[]> {
    return this.findByActive(true);
  }

  async findBySector(sector: string, activeOnly = true): Promise<ReportDefinition[]> {
    if (this.useSupabase()) {
      let query = this.supabaseService!.getClient()
        .from('api_report_definitions')
        .select('*')
        .eq('sector', sector)
        .order('created_at', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data as ApiReportDefinitionRow[]).map((row) => this.rowToReport(row));
    }

    return [...this.reports.values()].filter(
      (report) => report.sector === sector && (!activeOnly || report.isActive),
    );
  }

  async findById(id: string): Promise<ReportDefinition | undefined> {
    if (this.useSupabase()) {
      const { data, error } = await this.supabaseService!.getClient()
        .from('api_report_definitions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? this.rowToReport(data as ApiReportDefinitionRow) : undefined;
    }

    return this.reports.get(id);
  }

  async update(
    id: string,
    input: UpdateReportDefinitionInput,
  ): Promise<ReportDefinition | undefined> {
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

    if (this.useSupabase()) {
      const { error } = await this.supabaseService!.getClient()
        .from('api_report_definitions')
        .update(this.reportToRow(updated))
        .eq('id', id);

      if (error) {
        throw error;
      }

      return updated;
    }

    this.reports.set(id, updated);

    return updated;
  }

  async deactivate(id: string): Promise<ReportDefinition | undefined> {
    return this.update(id, { isActive: false });
  }

  async existsBySourceAndSector(
    sourceName: string,
    sector: string,
    ignoredId?: string,
  ): Promise<boolean> {
    if (this.useSupabase()) {
      let query = this.supabaseService!.getClient()
        .from('api_report_definitions')
        .select('id', { count: 'exact', head: true })
        .eq('source_name', sourceName)
        .eq('sector', sector);

      if (ignoredId) {
        query = query.neq('id', ignoredId);
      }

      const { error, count } = await query;

      if (error) {
        throw error;
      }

      return (count ?? 0) > 0;
    }

    return [...this.reports.values()].some(
      (report) =>
        report.sourceName === sourceName && report.sector === sector && report.id !== ignoredId,
    );
  }

  private async findByActive(isActive: boolean): Promise<ReportDefinition[]> {
    if (this.useSupabase()) {
      const { data, error } = await this.supabaseService!.getClient()
        .from('api_report_definitions')
        .select('*')
        .eq('is_active', isActive)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return (data as ApiReportDefinitionRow[]).map((row) => this.rowToReport(row));
    }

    return [...this.reports.values()].filter((report) => report.isActive === isActive);
  }

  private nextId(): string {
    this.sequence += 1;

    return `report-${this.sequence}`;
  }

  private useSupabase(): boolean {
    return this.supabaseService?.isEnabled() ?? false;
  }

  private rowToReport(row: ApiReportDefinitionRow): ReportDefinition {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      sector: row.sector,
      sourceType: row.source_type,
      sourceName: row.source_name,
      parameters: row.parameters ?? [],
      requiredPermissions: row.required_permissions ?? [],
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private reportToRow(report: ReportDefinition): ApiReportDefinitionRow {
    return {
      id: report.id,
      name: report.name,
      description: report.description,
      sector: report.sector,
      source_type: report.sourceType,
      source_name: report.sourceName,
      parameters: report.parameters,
      required_permissions: report.requiredPermissions,
      is_active: report.isActive,
      created_at: report.createdAt,
      updated_at: report.updatedAt,
    };
  }
}
