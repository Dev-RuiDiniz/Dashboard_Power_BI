import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { SectorCode } from '../../auth/types/auth.types';
import { SupabaseService } from '../../supabase/supabase.service';
import { getTemplateForSectors } from './dashboard-templates';

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
  widget_type: 'chart' | 'kpi' | 'table' | 'text' | 'iframe';
  title: string;
  chart_type: string | null;
  report_id: string | null;
  kpi_id: string | null;
  display_order: number | null;
  config: Record<string, unknown> | null;
  content: string | null;
  url: string | null;
  position_x: number | null;
  position_y: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type DashboardWidget = {
  id: string;
  dashboardId: string;
  widgetType: 'chart' | 'kpi' | 'table' | 'text' | 'iframe';
  title: string;
  chartType: string | null;
  reportId: string | null;
  kpiId: string | null;
  displayOrder: number;
  config: Record<string, unknown>;
  content: string | null;
  url: string | null;
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

export type CreateWidgetInput = {
  widgetType: 'chart' | 'kpi' | 'table' | 'text' | 'iframe';
  title: string;
  chartType?: string | null;
  reportId?: string | null;
  kpiId?: string | null;
  config?: Record<string, unknown>;
  content?: string | null;
  url?: string | null;
  position?: { x: number; y: number; width: number; height: number };
  displayOrder?: number;
};

export type UpdateDashboardInput = Partial<CreateDashboardInput>;

export type UpdateWidgetInput = Partial<CreateWidgetInput>;

export type BatchUpdateWidgetInput = {
  widgetId: string;
  position?: { x: number; y: number; width: number; height: number };
  displayOrder?: number;
  title?: string;
  chartType?: string | null;
  kpiId?: string | null;
  config?: Record<string, unknown>;
  content?: string | null;
  url?: string | null;
};

@Injectable()
export class DashboardsService {
  private memoryDashboards = new Map<string, DashboardRow>();
  private memoryWidgets = new Map<string, DashboardWidgetRow[]>();

  constructor(private readonly supabaseService: SupabaseService) {}

  private useMemory(): boolean {
    return !this.supabaseService.isEnabled();
  }

  async listForUser(userId: string): Promise<UserDashboard[]> {
    if (this.useMemory()) {
      const rows = Array.from(this.memoryDashboards.values()).filter((d) => d.user_id === userId);
      return this.attachWidgetsFromMemory(rows);
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

  async ensureDefaultDashboardForUser(
    userId: string,
    sectors: SectorCode[],
  ): Promise<UserDashboard> {
    const template = getTemplateForSectors(sectors);

    const dashboard = await this.createForUser(userId, {
      name: template.name,
      description: template.description,
      isDefault: true,
    });

    for (const widget of template.widgets) {
      await this.addWidget(userId, dashboard.id, {
        widgetType: widget.widgetType,
        title: widget.title,
        kpiId: widget.kpiId,
        chartType: widget.chartType,
        position: widget.position,
        displayOrder: widget.displayOrder,
      });
    }

    return this.getByIdForUser(userId, dashboard.id);
  }

  async createForUser(userId: string, input: CreateDashboardInput): Promise<UserDashboard> {
    if (input.isDefault) {
      await this.clearDefaultDashboard(userId);
    }

    const now = new Date().toISOString();
    const id = randomUUID();

    const row: DashboardRow = {
      id,
      user_id: userId,
      name: input.name,
      description: input.description ?? null,
      is_default: input.isDefault ?? false,
      layout: input.layout ?? { columns: 12 },
      created_at: now,
      updated_at: now,
    };

    if (this.useMemory()) {
      this.memoryDashboards.set(id, row);
      this.memoryWidgets.set(id, []);
      return this.mapDashboard(row, []);
    }

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
    if (this.useMemory()) {
      const row = this.memoryDashboards.get(id);
      if (!row || row.user_id !== userId) {
        throw new NotFoundException('Dashboard nao encontrado.');
      }
      const [dashboard] = await this.attachWidgetsFromMemory([row]);
      if (!dashboard) {
        throw new NotFoundException('Dashboard nao encontrado.');
      }
      return dashboard;
    }

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
    if (input.isDefault) {
      await this.clearDefaultDashboard(userId);
    }

    if (this.useMemory()) {
      const row = this.memoryDashboards.get(id);
      if (!row || row.user_id !== userId) {
        throw new NotFoundException('Dashboard nao encontrado.');
      }
      const updated: DashboardRow = {
        ...row,
        name: input.name ?? row.name,
        description: input.description !== undefined ? input.description : row.description,
        is_default: input.isDefault !== undefined ? input.isDefault : row.is_default,
        layout: input.layout !== undefined ? input.layout : row.layout,
        updated_at: new Date().toISOString(),
      };
      this.memoryDashboards.set(id, updated);
      const [dashboard] = await this.attachWidgetsFromMemory([updated]);
      if (!dashboard) {
        throw new NotFoundException('Dashboard nao encontrado.');
      }
      return dashboard;
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
    if (this.useMemory()) {
      const row = this.memoryDashboards.get(id);
      if (!row || row.user_id !== userId) {
        throw new NotFoundException('Dashboard nao encontrado.');
      }
      this.memoryDashboards.delete(id);
      this.memoryWidgets.delete(id);
      return { deleted: true };
    }

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

  async addWidget(
    userId: string,
    dashboardId: string,
    input: CreateWidgetInput,
  ): Promise<DashboardWidget> {
    const dashboard = await this.getByIdForUser(userId, dashboardId);

    const now = new Date().toISOString();
    const widgetId = randomUUID();
    const widgetRow: DashboardWidgetRow = {
      id: widgetId,
      dashboard_id: dashboardId,
      widget_type: input.widgetType,
      title: input.title,
      chart_type: input.chartType ?? null,
      report_id: input.reportId ?? null,
      kpi_id: input.kpiId ?? null,
      display_order: (dashboard.widgets.length + 1) * 10,
      config: input.config ?? {},
      content: input.content ?? null,
      url: input.url ?? null,
      position_x: input.position?.x ?? 0,
      position_y: input.position?.y ?? 0,
      width: input.position?.width ?? 1,
      height: input.position?.height ?? 1,
      created_at: now,
    };

    if (this.useMemory()) {
      const widgets = this.memoryWidgets.get(dashboardId) ?? [];
      widgets.push(widgetRow);
      this.memoryWidgets.set(dashboardId, widgets);
      return this.mapWidget(widgetRow);
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('dashboard_widgets')
      .insert({
        dashboard_id: dashboardId,
        widget_type: input.widgetType,
        title: input.title,
        chart_type: input.chartType ?? null,
        report_id: input.reportId ?? null,
        kpi_id: input.kpiId ?? null,
        display_order: (dashboard.widgets.length + 1) * 10,
        config: input.config ?? {},
        content: input.content ?? null,
        url: input.url ?? null,
        position_x: input.position?.x ?? 0,
        position_y: input.position?.y ?? 0,
        width: input.position?.width ?? 1,
        height: input.position?.height ?? 1,
        created_at: now,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return this.mapWidget(data as DashboardWidgetRow);
  }

  async updateWidget(
    userId: string,
    dashboardId: string,
    widgetId: string,
    input: UpdateWidgetInput,
  ): Promise<DashboardWidget> {
    await this.getByIdForUser(userId, dashboardId);

    if (this.useMemory()) {
      const widgets = this.memoryWidgets.get(dashboardId) ?? [];
      const index = widgets.findIndex((w) => w.id === widgetId);
      if (index === -1) {
        throw new NotFoundException('Widget nao encontrado.');
      }
      const updated: DashboardWidgetRow = {
        ...widgets[index]!,
        widget_type: input.widgetType ?? widgets[index]!.widget_type,
        title: input.title ?? widgets[index]!.title,
        chart_type: input.chartType !== undefined ? input.chartType : widgets[index]!.chart_type,
        report_id: input.reportId !== undefined ? input.reportId : widgets[index]!.report_id,
        kpi_id: input.kpiId !== undefined ? input.kpiId : widgets[index]!.kpi_id,
        config: input.config !== undefined ? input.config : widgets[index]!.config,
        content: input.content !== undefined ? input.content : widgets[index]!.content,
        url: input.url !== undefined ? input.url : widgets[index]!.url,
        position_x: input.position?.x ?? widgets[index]!.position_x,
        position_y: input.position?.y ?? widgets[index]!.position_y,
        width: input.position?.width ?? widgets[index]!.width,
        height: input.position?.height ?? widgets[index]!.height,
        display_order:
          input.displayOrder !== undefined ? input.displayOrder : widgets[index]!.display_order,
      };
      widgets[index] = updated;
      this.memoryWidgets.set(dashboardId, widgets);
      return this.mapWidget(updated);
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('dashboard_widgets')
      .update({
        ...(input.widgetType !== undefined ? { widget_type: input.widgetType } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.chartType !== undefined ? { chart_type: input.chartType } : {}),
        ...(input.reportId !== undefined ? { report_id: input.reportId } : {}),
        ...(input.kpiId !== undefined ? { kpi_id: input.kpiId } : {}),
        ...(input.config !== undefined ? { config: input.config } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.url !== undefined ? { url: input.url } : {}),
        ...(input.position !== undefined
          ? {
              position_x: input.position.x,
              position_y: input.position.y,
              width: input.position.width,
              height: input.position.height,
            }
          : {}),
        ...(input.displayOrder !== undefined ? { display_order: input.displayOrder } : {}),
      })
      .eq('id', widgetId)
      .eq('dashboard_id', dashboardId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return this.mapWidget(data as DashboardWidgetRow);
  }

  async reorderWidgets(
    userId: string,
    dashboardId: string,
    items: { widgetId: string; displayOrder: number }[],
  ): Promise<UserDashboard> {
    await this.getByIdForUser(userId, dashboardId);
    await Promise.all(
      items.map((item) =>
        this.updateWidget(userId, dashboardId, item.widgetId, {
          displayOrder: item.displayOrder,
        }),
      ),
    );
    return this.getByIdForUser(userId, dashboardId);
  }

  async batchUpdateWidgets(
    userId: string,
    dashboardId: string,
    items: BatchUpdateWidgetInput[],
  ): Promise<UserDashboard> {
    await this.getByIdForUser(userId, dashboardId);
    for (const item of items) {
      await this.updateWidget(userId, dashboardId, item.widgetId, item);
    }
    return this.getByIdForUser(userId, dashboardId);
  }

  async removeWidget(
    userId: string,
    dashboardId: string,
    widgetId: string,
  ): Promise<{ removed: true }> {
    await this.getByIdForUser(userId, dashboardId);

    if (this.useMemory()) {
      const widgets = this.memoryWidgets.get(dashboardId) ?? [];
      const filtered = widgets.filter((w) => w.id !== widgetId);
      this.memoryWidgets.set(dashboardId, filtered);
      return { removed: true };
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('dashboard_widgets')
      .delete()
      .eq('id', widgetId)
      .eq('dashboard_id', dashboardId);

    if (error) {
      throw error;
    }

    return { removed: true };
  }

  private async clearDefaultDashboard(userId: string): Promise<void> {
    if (this.useMemory()) {
      for (const [id, row] of this.memoryDashboards) {
        if (row.user_id === userId && row.is_default) {
          this.memoryDashboards.set(id, { ...row, is_default: false });
        }
      }
      return;
    }

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

  private async attachWidgetsFromMemory(rows: DashboardRow[]): Promise<UserDashboard[]> {
    return rows.map((row) => {
      const widgets = (this.memoryWidgets.get(row.id) ?? [])
        .slice()
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((w) => this.mapWidget(w));
      return this.mapDashboard(row, widgets);
    });
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
      content: row.content ?? null,
      url: row.url ?? null,
      position: {
        x: row.position_x ?? 0,
        y: row.position_y ?? 0,
        width: row.width ?? 1,
        height: row.height ?? 1,
      },
      createdAt: row.created_at,
    };
  }
}
