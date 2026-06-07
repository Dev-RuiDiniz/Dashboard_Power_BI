import { apiGet, apiGetBlob, apiPatch, apiPost } from '@/lib/admin-api';
import type { KpiItem, SectorKpiSummary } from '@/lib/kpis';

export type DashboardHomeResponse = {
  summary: {
    totalKpis: number;
    totalSectors: number;
    averageDelta: number;
  };
  kpis: KpiItem[];
  sectorSummaries: SectorKpiSummary[];
  charts: {
    sectorDistribution: SectorKpiSummary[];
    kpiPerformance: Array<{
      id: string;
      title: string;
      sector: string;
      value: number;
      previousValue: number;
      delta: number;
    }>;
  };
  availableDrilldowns: Array<{
    kpiId: string;
    label: string;
    dimension: 'sector';
  }>;
};

export type DashboardDrilldownResponse = {
  kpiId: string;
  label: string;
  dimension: 'sector';
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
