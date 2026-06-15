import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service';
import { PublicReportDefinition } from './dto/report-query-response.dto';
import { ReportDefinitionsService } from './report-definitions.service';

type FavoriteReportRow = {
  id: string;
  user_id: string;
  report_id: string;
  added_at: string;
};

@Injectable()
export class ReportFavoritesService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly reportDefinitionsService: ReportDefinitionsService,
  ) {}

  async listForUser(userId: string): Promise<PublicReportDefinition[]> {
    if (!this.supabaseService.isEnabled()) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('api_favorite_reports')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      throw error;
    }

    const reportIds = new Set(((data ?? []) as FavoriteReportRow[]).map((row) => row.report_id));
    const reports = await this.reportDefinitionsService.list();

    return reports
      .filter((report) => report.isActive && reportIds.has(report.id))
      .map((report) => ({
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
      }));
  }

  async favorite(userId: string, reportId: string): Promise<{ ok: true }> {
    this.assertEnabled();
    const report = await this.reportDefinitionsService.getById(reportId);

    if (!report.isActive) {
      throw new NotFoundException('Relatorio nao encontrado.');
    }

    const { error } = await this.supabaseService.getClient().from('api_favorite_reports').insert({
      user_id: userId,
      report_id: reportId,
    });

    if (error) {
      throw error;
    }

    return { ok: true };
  }

  async unfavorite(userId: string, reportId: string): Promise<{ ok: true }> {
    this.assertEnabled();

    const { error } = await this.supabaseService
      .getClient()
      .from('api_favorite_reports')
      .delete()
      .eq('user_id', userId)
      .eq('report_id', reportId);

    if (error) {
      throw error;
    }

    return { ok: true };
  }

  private assertEnabled(): void {
    if (!this.supabaseService.isEnabled()) {
      throw new NotFoundException('Persistencia de favoritos indisponivel.');
    }
  }
}
