import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';

type DashboardRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  layout: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type DashboardWidgetRow = {
  id: string;
  dashboard_id: string;
  widget_type: 'chart' | 'kpi' | 'table';
  title: string;
  chart_type: string | null;
  report_id: string | null;
  kpi_id: string | null;
  display_order: number | null;
  config: Record<string, unknown> | null;
  position_x: number | null;
  position_y: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type DashboardWidget = {
  id: string;
  dashboardId: string;
  widgetType: 'chart' | 'kpi' | 'table';
  title: string;
  chartType: string | null;
  reportId: string | null;
  kpiId: string | null;
  displayOrder: number;
  config: Record<string, unknown>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdAt: string;
};

export type UserDashboard = {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  layout: Record<string, unknown>;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
};

export type CreateDashboardInput = {
  name: string;
  description?: string;
  isDefault?: boolean;
  layout?: Record<string, unknown>;
};

export type UpdateDashboardInput = Partial<CreateDashboardInput>;

@Injectable()
export class DashboardsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async listForUser(userId: string): Promise<UserDashboard[]> {
    if (!this.supabaseService.isEnabled()) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('dashboards')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return this.attachWidgets((data ?? []) as DashboardRow[]);
  }

  async createForUser(userId: string, input: CreateDashboardInput): Promise<UserDashboard> {
    this.assertEnabled();

    if (input.isDefault) {
      await this.clearDefaultDashboard(userId);
    }

    const now = new Date().toISOString();
    const { data, error } = await this.supabaseService
      .getClient()
      .from('dashboards')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
        is_default: input.isDefault ?? false,
        layout: input.layout ?? { columns: 12 },
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return this.mapDashboard(data as DashboardRow, []);
  }

  async getByIdForUser(userId: string, id: string): Promise<UserDashboard> {
    this.assertEnabled();

    const { data, error } = await this.supabaseService
      .getClient()
      .from('dashboards')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Dashboard nao encontrado.');
    }

    const [dashboard] = await this.attachWidgets([data as DashboardRow]);

    if (!dashboard) {
      throw new NotFoundException('Dashboard nao encontrado.');
    }

    return dashboard;
  }

  async updateForUser(
    userId: string,
    id: string,
    input: UpdateDashboardInput,
  ): Promise<UserDashboard> {
    this.assertEnabled();

    if (input.isDefault) {
      await this.clearDefaultDashboard(userId);
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('dashboards')
      .update({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isDefault !== undefined ? { is_default: input.isDefault } : {}),
        ...(input.layout !== undefined ? { layout: input.layout } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Dashboard nao encontrado.');
    }

    const [dashboard] = await this.attachWidgets([data as DashboardRow]);

    if (!dashboard) {
      throw new NotFoundException('Dashboard nao encontrado.');
    }

    return dashboard;
  }

  async deleteForUser(userId: string, id: string): Promise<{ deleted: true }> {
    this.assertEnabled();

    const { error } = await this.supabaseService
      .getClient()
      .from('dashboards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { deleted: true };
  }

  private async clearDefaultDashboard(userId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('dashboards')
      .update({ is_default: false })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }

  private async attachWidgets(rows: DashboardRow[]): Promise<UserDashboard[]> {
    if (rows.length === 0) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('dashboard_widgets')
      .select('*')
      .in(
        'dashboard_id',
        rows.map((row) => row.id),
      )
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    const widgetsByDashboard = new Map<string, DashboardWidget[]>();

    for (const row of (data ?? []) as DashboardWidgetRow[]) {
      const items = widgetsByDashboard.get(row.dashboard_id) ?? [];
      items.push(this.mapWidget(row));
      widgetsByDashboard.set(row.dashboard_id, items);
    }

    return rows.map((row) => this.mapDashboard(row, widgetsByDashboard.get(row.id) ?? []));
  }

  private mapDashboard(row: DashboardRow, widgets: DashboardWidget[]): UserDashboard {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      isDefault: row.is_default,
      layout: row.layout ?? { columns: 12 },
      widgets,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapWidget(row: DashboardWidgetRow): DashboardWidget {
    return {
      id: row.id,
      dashboardId: row.dashboard_id,
      widgetType: row.widget_type,
      title: row.title,
      chartType: row.chart_type,
      reportId: row.report_id,
      kpiId: row.kpi_id,
      displayOrder: row.display_order ?? 0,
      config: row.config ?? {},
      position: {
        x: row.position_x ?? 0,
        y: row.position_y ?? 0,
        width: row.width ?? 1,
        height: row.height ?? 1,
      },
      createdAt: row.created_at,
    };
  }

  private assertEnabled(): void {
    if (!this.supabaseService.isEnabled()) {
      throw new NotFoundException('Persistencia de dashboards indisponivel.');
    }
  }
}
