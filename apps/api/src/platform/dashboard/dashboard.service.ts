import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';

export type DashboardKpi = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue: number;
  unit: 'number' | 'currency' | 'percent';
};

export type DashboardSector = {
  id: string;
  code: string;
  name: string;
};

type DashboardKpiRow = {
  id: string;
  name: string;
  sector_id: string;
  target_value: number | string | null;
  unit: DashboardKpi['unit'] | null;
};

type DashboardSectorRow = {
  id: string;
  name: string;
};

@Injectable()
export class DashboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async listKpis(): Promise<DashboardKpi[]> {
    if (!this.supabaseService.isEnabled()) {
      return this.getFallbackKpis();
    }

    const client = this.supabaseService.getClient();
    const [kpisResult, sectorsResult] = await Promise.all([
      client.from('kpis').select('*').eq('is_active', true),
      client.from('sectors').select('*').eq('is_active', true),
    ]);

    if (kpisResult.error) {
      throw kpisResult.error;
    }

    if (sectorsResult.error) {
      throw sectorsResult.error;
    }

    const sectorMap = new Map<string, { name: string }>();
    for (const sector of (sectorsResult.data ?? []) as DashboardSectorRow[]) {
      sectorMap.set(sector.id, { name: sector.name });
    }

    const items = ((kpisResult.data ?? []) as DashboardKpiRow[]).map((kpi) => {
      const sector = sectorMap.get(kpi.sector_id);
      const value = Number(kpi.target_value ?? 0);

      return {
        id: kpi.id,
        title: kpi.name,
        sector: sector?.name ?? kpi.sector_id,
        value,
        previousValue: Math.round(value * 0.9),
        unit: (kpi.unit ?? 'number') as DashboardKpi['unit'],
      };
    });

    return items.length > 0 ? items : this.getFallbackKpis();
  }

  async listSectors(): Promise<DashboardSector[]> {
    if (!this.supabaseService.isEnabled()) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('sectors')
      .select('id, code, name')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  private getFallbackKpis(): DashboardKpi[] {
    return [
      {
        id: 'receita-mensal',
        title: 'Receita mensal',
        sector: 'Financeiro',
        value: 120000,
        previousValue: 100000,
        unit: 'currency',
      },
      {
        id: 'margem-operacional',
        title: 'Margem operacional',
        sector: 'Financeiro',
        value: 0.32,
        previousValue: 0.3,
        unit: 'percent',
      },
      {
        id: 'leads-qualificados',
        title: 'Leads qualificados',
        sector: 'Comercial',
        value: 430,
        previousValue: 400,
        unit: 'number',
      },
    ];
  }
}
