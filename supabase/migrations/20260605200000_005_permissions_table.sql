/*
  # Tabela de permissões granulares

  Permite gestão dedicada de permissões por recurso e ação.
*/

CREATE TABLE IF NOT EXISTS api_permissions (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_permissions_code ON api_permissions(code);
CREATE INDEX IF NOT EXISTS idx_api_permissions_resource ON api_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_api_permissions_active ON api_permissions(is_active);

ALTER TABLE api_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access api_permissions" ON api_permissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
