import { createClient } from '@supabase/supabase-js';

import type { KpiItem } from '@/lib/kpis';

export type NotificationItem = {
  id: string;
  notification_type: 'report_available' | 'access_granted' | 'export_ready' | 'alert';
  title: string;
  message: string;
  related_resource_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
};

export type ExportJobItem = {
  id: string;
  report_id: string;
  export_format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  file_size_bytes?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  expires_at: string;
};

export type SystemSettingItem = {
  id: string;
  setting_key: string;
  setting_value: unknown;
  description?: string;
  is_sensitive: boolean;
  updated_at: string;
};

export interface AppDataClient {
  listKpis(): Promise<KpiItem[]>;
  listNotifications(): Promise<NotificationItem[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(ids: string[]): Promise<void>;
  listExportJobs(): Promise<ExportJobItem[]>;
  listSystemSettings(): Promise<SystemSettingItem[]>;
}

export const demoKpis: KpiItem[] = [
  { id: 'receita-mensal', title: 'Receita mensal', sector: 'Financeiro', value: 120000, previousValue: 100000, unit: 'currency' },
  { id: 'margem-operacional', title: 'Margem operacional', sector: 'Financeiro', value: 0.32, previousValue: 0.3, unit: 'percent' },
  { id: 'leads-qualificados', title: 'Leads qualificados', sector: 'Comercial', value: 430, previousValue: 400, unit: 'number' },
  { id: 'sla-operacional', title: 'SLA operacional', sector: 'Operacoes', value: 0.92, previousValue: 0.9, unit: 'percent' },
  { id: 'dashboards-ativos', title: 'Dashboards ativos', sector: 'BI', value: 18, previousValue: 16, unit: 'number' },
  { id: 'exportacoes-mensais', title: 'Exportacoes mensais', sector: 'BI', value: 240, previousValue: 220, unit: 'number' },
];

export const demoNotifications: NotificationItem[] = [
  { id: 'notif-1', notification_type: 'export_ready', title: 'Exportacao de receita pronta', message: 'O relatorio financeiro mensal ja pode ser baixado.', related_resource_id: 'export-1', is_read: false, created_at: '2026-06-15T09:00:00.000Z' },
  { id: 'notif-2', notification_type: 'access_granted', title: 'Acesso ao setor Comercial liberado', message: 'Seu perfil agora consegue visualizar o dashboard do time Comercial.', related_resource_id: 'group-2', is_read: false, created_at: '2026-06-14T15:30:00.000Z' },
  { id: 'notif-3', notification_type: 'alert', title: 'Carga de KPI realizada', message: 'Os indicadores mockados da demonstracao foram atualizados nesta manha.', is_read: false, created_at: '2026-06-13T11:10:00.000Z' },
];

export const demoExportJobs: ExportJobItem[] = [
  { id: 'export-1', report_id: 'report-1', export_format: 'pdf', status: 'completed', file_url: '/demo-downloads/financeiro-mensal.pdf', file_size_bytes: 184320, created_at: '2026-06-15T08:35:00.000Z', completed_at: '2026-06-15T08:36:00.000Z', expires_at: '2026-06-22T08:36:00.000Z' },
  { id: 'export-2', report_id: 'report-2', export_format: 'excel', status: 'processing', created_at: '2026-06-15T08:50:00.000Z', expires_at: '2026-06-22T08:50:00.000Z' },
  { id: 'export-3', report_id: 'report-3', export_format: 'csv', status: 'failed', error_message: 'Falha simulada para validacao da interface.', created_at: '2026-06-14T13:15:00.000Z', expires_at: '2026-06-21T13:15:00.000Z' },
];

export const demoSystemSettings: SystemSettingItem[] = [
  { id: 'setting-1', setting_key: 'app.mode', setting_value: 'demo', description: 'Modo de execucao atual da plataforma.', is_sensitive: false, updated_at: '2026-06-15T08:00:00.000Z' },
  { id: 'setting-2', setting_key: 'mail.smtp_mode', setting_value: 'mock', description: 'Entrega de e-mail desabilitada nesta demonstracao.', is_sensitive: false, updated_at: '2026-06-15T08:00:00.000Z' },
  { id: 'setting-3', setting_key: 'sql.connection_string', setting_value: 'Server=sqlserver;Database=DashboardPowerBI;', description: 'Conexao sanitizada do banco local de demonstracao.', is_sensitive: true, updated_at: '2026-06-15T08:00:00.000Z' },
];

type CreateAppDataClientOptions = {
  useMockData?: boolean;
};

let appDataClient: AppDataClient | null = null;

export function createAppDataClient(options: CreateAppDataClientOptions = {}): AppDataClient {
  return options.useMockData ? createMockAppDataClient() : createSupabaseAppDataClient();
}

export function getAppDataClient(): AppDataClient {
  if (!appDataClient) {
    appDataClient = createAppDataClient({
      useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
    });
  }

  return appDataClient;
}

function createMockAppDataClient(): AppDataClient {
  let notifications = clone(demoNotifications);

  return {
    async listKpis() {
      return clone(demoKpis);
    },
    async listNotifications() {
      return clone(notifications);
    },
    async markNotificationAsRead(id: string) {
      notifications = notifications.map((item) =>
        item.id === id ? { ...item, is_read: true, read_at: item.read_at ?? new Date().toISOString() } : item,
      );
    },
    async markAllNotificationsAsRead(ids: string[]) {
      const selected = new Set(ids);
      notifications = notifications.map((item) =>
        selected.has(item.id) ? { ...item, is_read: true, read_at: item.read_at ?? new Date().toISOString() } : item,
      );
    },
    async listExportJobs() {
      return clone(demoExportJobs);
    },
    async listSystemSettings() {
      return clone(demoSystemSettings);
    },
  };
}

function createSupabaseAppDataClient(): AppDataClient {
  const supabase = createSupabaseBrowserClient();

  return {
    async listKpis() {
      const [kpisResult, sectorsResult] = await Promise.all([
        supabase.from('kpis').select('*').eq('is_active', true),
        supabase.from('sectors').select('*').eq('is_active', true),
      ]);

      const sectorMap = new Map<string, { name: string }>();
      for (const sector of sectorsResult.data ?? []) {
        sectorMap.set(sector.id, sector);
      }

      return (kpisResult.data ?? []).map((kpi) => {
        const value = kpi.target_value ?? 0;

        return {
          id: kpi.id,
          title: kpi.name,
          sector: sectorMap.get(kpi.sector_id)?.name ?? kpi.sector_id,
          value,
          previousValue: Math.round(value * 0.9),
          unit: kpi.unit,
        } satisfies KpiItem;
      });
    },
    async listNotifications() {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
    async markNotificationAsRead(id: string) {
      const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    async markAllNotificationsAsRead(ids: string[]) {
      const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).in('id', ids);
      if (error) throw error;
    },
    async listExportJobs() {
      const { data, error } = await supabase.from('export_jobs').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
    async listSystemSettings() {
      const { data, error } = await supabase.from('system_settings').select('*').order('setting_key');
      if (error) throw error;
      return data ?? [];
    },
  };
}

function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase nao configurado para este ambiente.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
