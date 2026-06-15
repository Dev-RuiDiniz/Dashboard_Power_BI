/*
  # Tabela de logs de auditoria

  Registra todas as ações administrativas e de usuário para rastreabilidade.
*/

CREATE TABLE IF NOT EXISTS api_audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_audit_logs_user_id ON api_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_audit_logs_action ON api_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_api_audit_logs_resource ON api_audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_api_audit_logs_resource_id ON api_audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_api_audit_logs_created_at ON api_audit_logs(created_at DESC);

ALTER TABLE api_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access api_audit_logs" ON api_audit_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
