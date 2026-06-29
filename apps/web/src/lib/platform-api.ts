import { apiDelete, apiGet, apiGetBlob, apiPatch, apiPost } from '@/lib/admin-api';
import type { BusinessArea, KpiItem, SectorKpiSummary } from '@/lib/kpis';
import type { PaginatedReports } from '@/lib/reports-api';

export type DashboardHomeResponse = {
  summary: {
    totalKpis: number;
    totalSectors: number;
    averageDelta: number;
  };
  kpis: KpiItem[];
  businessAreas: Array<{
    businessArea: BusinessArea;
    label: string;
    total: number;
    averageDelta: number;
  }>;
  sectorSummaries: SectorKpiSummary[];
  charts: {
    sectorDistribution: SectorKpiSummary[];
    kpiPerformance: Array<{
      id: string;
      title: string;
      businessArea: BusinessArea;
      sector: string;
      value: number;
      previousValue: number;
      delta: number;
    }>;
  };
  availableDrilldowns: Array<{
    kpiId: string;
    label: string;
    dimension: 'businessArea';
  }>;
};

export type DashboardDrilldownResponse = {
  kpiId: string;
  label: string;
  dimension: 'businessArea';
  series: Array<{
    label: string;
    value: number;
  }>;
  rows: Array<{
    period: string;
    value: number;
    delta: number;
  }>;
};

export type KpiHistoryItem = {
  period: string;
  value: number;
  previousValue: number;
  delta: number;
};

export type KpiHistoryResponse = {
  kpiId: string;
  label: string;
  unit: 'number' | 'currency' | 'percent';
  granularity: 'monthly' | 'annual-comparative';
  rangeMonths: 12;
  periods: KpiHistoryItem[];
};

export type UserDashboard = {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  layout: Record<string, unknown>;
  widgets: Array<{
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
  }>;
  createdAt: string;
  updatedAt: string;
};

export type ExportJob = {
  id: string;
  report_id: string | null;
  export_format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url: string | null;
  file_size_bytes: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
};

export type Notification = {
  id: string;
  notification_type: 'report_available' | 'access_granted' | 'export_ready' | 'alert';
  title: string;
  message: string | null;
  related_resource_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type SystemSetting = {
  id: string;
  setting_key: string;
  setting_value: unknown;
  description: string | null;
  is_sensitive: boolean;
  updated_at: string;
};

export type AdminReportDefinition = {
  id: string;
  name: string;
  description: string;
  sector: string;
  sourceType: 'view' | 'stored_procedure';
  sourceName: string;
  parameters: Array<{ name: string; type: string; required?: boolean }>;
  requiredPermissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchDashboardHome(): Promise<DashboardHomeResponse> {
  return apiGet<DashboardHomeResponse>('/dashboard/home');
}

export async function fetchDashboardKpis(): Promise<KpiItem[]> {
  return apiGet<KpiItem[]>('/dashboard/kpis');
}

export async function fetchDashboardDrilldown(kpiId: string): Promise<DashboardDrilldownResponse> {
  return apiGet<DashboardDrilldownResponse>(`/dashboard/kpis/${kpiId}/drilldown`);
}

export async function fetchKpiHistory(kpiId: string): Promise<KpiHistoryResponse> {
  return apiGet<KpiHistoryResponse>(`/dashboard/kpis/${kpiId}/history`);
}

export async function fetchDashboards(): Promise<UserDashboard[]> {
  return apiGet<UserDashboard[]>('/dashboards');
}

export async function getDashboardById(id: string): Promise<UserDashboard> {
  return apiGet<UserDashboard>(`/dashboards/${id}`);
}

export async function createDashboard(input: {
  name: string;
  description?: string;
  isDefault?: boolean;
}): Promise<UserDashboard> {
  return apiPost<UserDashboard>('/dashboards', input);
}

export async function updateDashboard(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    isDefault: boolean;
    layout: Record<string, unknown>;
  }>,
): Promise<UserDashboard> {
  return apiPatch<UserDashboard>(`/dashboards/${id}`, input);
}

export async function deleteDashboard(id: string): Promise<{ deleted: true }> {
  return apiDelete<{ deleted: true }>(`/dashboards/${id}`);
}

export async function addDashboardWidget(
  dashboardId: string,
  input: {
    widgetType: 'chart' | 'kpi' | 'table' | 'text' | 'iframe';
    title: string;
    chartType?: string | null;
    reportId?: string | null;
    kpiId?: string | null;
    config?: Record<string, unknown>;
    content?: string | null;
    url?: string | null;
    position?: { x: number; y: number; width: number; height: number };
  },
): Promise<UserDashboard['widgets'][number]> {
  return apiPost<UserDashboard['widgets'][number]>(`/dashboards/${dashboardId}/widgets`, input);
}

export async function updateDashboardWidget(
  dashboardId: string,
  widgetId: string,
  input: Partial<{
    widgetType: 'chart' | 'kpi' | 'table' | 'text' | 'iframe';
    title: string;
    chartType: string | null;
    reportId: string | null;
    kpiId: string | null;
    config: Record<string, unknown>;
    content: string | null;
    url: string | null;
    position: { x: number; y: number; width: number; height: number };
  }>,
): Promise<UserDashboard['widgets'][number]> {
  return apiPatch<UserDashboard['widgets'][number]>(
    `/dashboards/${dashboardId}/widgets/${widgetId}`,
    input,
  );
}

export async function removeDashboardWidget(
  dashboardId: string,
  widgetId: string,
): Promise<{ removed: true }> {
  return apiDelete<{ removed: true }>(`/dashboards/${dashboardId}/widgets/${widgetId}`);
}

export async function reorderDashboardWidgets(
  dashboardId: string,
  items: { widgetId: string; displayOrder: number }[],
): Promise<UserDashboard> {
  return apiPatch<UserDashboard>(`/dashboards/${dashboardId}/widgets/reorder`, { items });
}

export async function batchUpdateDashboardWidgets(
  dashboardId: string,
  items: Array<{
    widgetId: string;
    position?: { x: number; y: number; width: number; height: number };
    displayOrder?: number;
    title?: string;
    chartType?: string | null;
    kpiId?: string | null;
    config?: Record<string, unknown>;
    content?: string | null;
    url?: string | null;
  }>,
): Promise<UserDashboard> {
  return apiPatch<UserDashboard>(`/dashboards/${dashboardId}/widgets/batch`, { items });
}

export async function fetchFavoriteReports(): Promise<PaginatedReports['items']> {
  return apiGet<PaginatedReports['items']>('/reports/favorites');
}

export async function favoriteReport(reportId: string): Promise<{ ok: true }> {
  return apiPost<{ ok: true }>(`/reports/${reportId}/favorite`);
}

export async function unfavoriteReport(reportId: string): Promise<{ ok: true }> {
  return apiDelete<{ ok: true }>(`/reports/${reportId}/favorite`);
}

export async function fetchExports(): Promise<ExportJob[]> {
  return apiGet<ExportJob[]>('/exports');
}

export async function createExport(input: {
  reportId?: string;
  exportFormat: ExportJob['export_format'];
  parameters?: Record<string, unknown>;
}): Promise<ExportJob> {
  return apiPost<ExportJob>('/exports', input);
}

export async function downloadExportFile(fileUrl: string): Promise<Blob> {
  const url = new URL(fileUrl, 'http://localhost:3001');
  return apiGetBlob(`${url.pathname}${url.search}`);
}

export async function fetchNotifications(): Promise<Notification[]> {
  return apiGet<Notification[]>('/notifications');
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  return apiPatch<Notification>(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsAsRead(): Promise<{ updated: number }> {
  return apiPatch<{ updated: number }>('/notifications/read-all', {});
}

export async function fetchSystemSettings(): Promise<SystemSetting[]> {
  return apiGet<SystemSetting[]>('/admin/settings');
}

export async function updateSystemSetting(key: string, value: unknown): Promise<SystemSetting> {
  return apiPatch<SystemSetting>(`/admin/settings/${encodeURIComponent(key)}`, { value });
}

export async function fetchAdminReports(): Promise<AdminReportDefinition[]> {
  return apiGet<AdminReportDefinition[]>('/admin/reports');
}

export async function createAdminReport(
  input: Omit<AdminReportDefinition, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>,
): Promise<AdminReportDefinition> {
  return apiPost<AdminReportDefinition>('/admin/reports', input);
}

export async function updateAdminReport(
  id: string,
  input: Partial<Omit<AdminReportDefinition, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<AdminReportDefinition> {
  return apiPatch<AdminReportDefinition>(`/admin/reports/${id}`, input);
}

export async function deactivateAdminReport(id: string): Promise<AdminReportDefinition> {
  return apiPatch<AdminReportDefinition>(`/admin/reports/${id}/deactivate`, {});
}

export type ValidateSourceResult = {
  valid: boolean;
  message?: string;
};

export async function validateAdminReportSource(
  sourceType: 'view' | 'stored_procedure',
  sourceName: string,
): Promise<ValidateSourceResult> {
  return apiPost<ValidateSourceResult>('/admin/reports/validate', { sourceType, sourceName });
}
