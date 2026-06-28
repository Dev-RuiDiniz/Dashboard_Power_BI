/*
  # Tabela de associação grupo ↔ permissão

  Permite que grupos herdem permissões granulares para usuários vinculados.
  Acessada via service role (bypass RLS).
*/

CREATE TABLE IF NOT EXISTS api_group_permissions (
  group_id UUID NOT NULL,
  permission_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_api_group_permissions_group
  ON api_group_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_api_group_permissions_permission
  ON api_group_permissions(permission_id);

ALTER TABLE api_group_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access api_group_permissions"
  ON api_group_permissions FOR ALL TO service_role
  USING (true) WITH CHECK (true);
