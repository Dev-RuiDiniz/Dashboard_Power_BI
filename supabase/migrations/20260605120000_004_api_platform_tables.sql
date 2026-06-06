/*
  # Tabelas de persistência da API NestJS

  Espelham os modelos em memória usados pela API para usuários, grupos
  e definições de relatórios. Acessadas via service role (bypass RLS).
*/

CREATE TABLE IF NOT EXISTS api_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{}',
  sectors TEXT[] NOT NULL DEFAULT '{}',
  group_ids TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS api_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  roles TEXT[] NOT NULL DEFAULT '{}',
  sectors TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_report_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sector TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('view', 'stored_procedure')),
  source_name TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '[]',
  required_permissions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_users_email ON api_users(email);
CREATE INDEX IF NOT EXISTS idx_api_groups_name ON api_groups(name);
CREATE INDEX IF NOT EXISTS idx_api_report_definitions_sector ON api_report_definitions(sector);
CREATE INDEX IF NOT EXISTS idx_api_report_definitions_active ON api_report_definitions(is_active);

ALTER TABLE api_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_report_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access api_users" ON api_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access api_groups" ON api_groups
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access api_report_definitions" ON api_report_definitions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS api_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_user_id TEXT NOT NULL,
  report_id TEXT,
  export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'excel', 'csv', 'json')),
  parameters JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_path TEXT,
  file_url TEXT,
  file_size_bytes INT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE TABLE IF NOT EXISTS api_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('report_available', 'access_granted', 'export_ready', 'alert')),
  title TEXT NOT NULL,
  message TEXT,
  related_resource_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_export_jobs_user ON api_export_jobs(api_user_id);
CREATE INDEX IF NOT EXISTS idx_api_export_jobs_status ON api_export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_api_notifications_user ON api_notifications(api_user_id);

ALTER TABLE api_export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access api_export_jobs" ON api_export_jobs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access api_notifications" ON api_notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);
