/*
  # Plataforma BI - Exportações e Configurações

  1. Novas tabelas:
    - `export_jobs` - Fila de exportações (PDF/Excel)
    - `export_history` - Histórico de exportações realizadas
    - `system_settings` - Configurações globais do sistema
    - `notification_preferences` - Preferências de notificações

  2. Security:
    - RLS em exportações (cada usuário vê seus exports)
    - Apenas admins podem ver configurações
    - Log de todas as operações
*/

-- Enum para status de exportação
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE export_format AS ENUM ('pdf', 'excel', 'csv', 'json');
CREATE TYPE notification_type AS ENUM ('report_available', 'access_granted', 'export_ready', 'alert');

-- Tabela de jobs de exportação
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  export_format export_format NOT NULL,
  parameters JSONB,
  status export_status DEFAULT 'pending',
  file_url TEXT,
  file_size_bytes INT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + '7 days'::INTERVAL)
);

-- Tabela de histórico de exportações
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  export_format export_format NOT NULL,
  file_size_bytes INT,
  download_count INT DEFAULT 0,
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de preferências de notificação
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_resource_id TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_export_jobs_user ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_expires ON export_jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_export_history_user ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Habilitar RLS
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para export_jobs
CREATE POLICY "Users can view own export jobs" ON export_jobs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can create export jobs" ON export_jobs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all exports" ON export_jobs
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Políticas para export_history
CREATE POLICY "Users can view own history" ON export_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Políticas para system_settings (apenas admin)
CREATE POLICY "Admin only system settings" ON system_settings
  FOR SELECT TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin manage settings" ON system_settings
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Políticas para notification_preferences
CREATE POLICY "Users manage own preferences" ON notification_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Políticas para notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Inserir configurações padrão
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('smtp_host', '{"value": ""}', 'Host do servidor SMTP'),
  ('smtp_port', '{"value": 587}', 'Porta SMTP'),
  ('sql_server_pool_max', '{"value": 10}', 'Máximo de conexões SQL Server'),
  ('export_retention_days', '{"value": 7}', 'Dias para reter exports'),
  ('report_cache_ttl_minutes', '{"value": 60}', 'TTL do cache de relatórios')
ON CONFLICT (setting_key) DO NOTHING;
