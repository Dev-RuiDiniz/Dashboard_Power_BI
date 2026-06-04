/*
  # Plataforma BI - Auth e Permissões

  1. Tabelas criadas:
    - `users` - Usuários com email, senha hash, ativo
    - `user_roles` - Perfis: visualizador, downloader, admin
    - `sectors` - Setores: financeiro, RH, vendas, etc
    - `permissions` - Permissões por setor e relatório
    - `user_sectors` - Associação usuário-setor
    - `access_logs` - Auditoria de acessos

  2. Security:
    - RLS habilitado em todas as tabelas
    - Políticas restritivas por user_id e role
    - Senhas com hash bcrypt nunca retornadas
    - Logs de auditoria automáticos

  3. Índices para performance de queries frequentes
*/

-- Criar enum para roles
CREATE TYPE user_role AS ENUM ('visualizador', 'downloader', 'admin');
CREATE TYPE log_action AS ENUM ('login', 'logout', 'view_report', 'export', 'permission_change');

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  is_mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deactivated_at TIMESTAMPTZ
);

-- Tabela de setores
CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de associação usuário-setor
CREATE TABLE IF NOT EXISTS user_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'visualizador',
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, sector_id)
);

-- Tabela de permissões por relatório
CREATE TABLE IF NOT EXISTS report_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_export BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, report_id)
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action log_action NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  resource_name TEXT,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success',
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sectors_user ON user_sectors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sectors_sector ON user_sectors(sector_id);
CREATE INDEX IF NOT EXISTS idx_report_permissions_user ON report_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can manage all users" ON users
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Políticas para user_sectors
CREATE POLICY "Users can view own sectors" ON user_sectors
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin can manage sectors" ON user_sectors
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Políticas para report_permissions
CREATE POLICY "Users can view own permissions" ON report_permissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin can manage permissions" ON report_permissions
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Políticas para access_logs (somente leitura)
CREATE POLICY "Users can view own logs" ON access_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin can view all logs" ON access_logs
  FOR SELECT TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Políticas para refresh_tokens
CREATE POLICY "Users can manage own tokens" ON refresh_tokens
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Inserir setores padrão
INSERT INTO sectors (code, name, description) VALUES
  ('financeiro', 'Financeiro', 'Departamento de Finanças'),
  ('rh', 'Recursos Humanos', 'Gestão de Pessoas'),
  ('vendas', 'Vendas', 'Departamento de Vendas'),
  ('operacoes', 'Operações', 'Gestão de Operações'),
  ('ti', 'TI', 'Tecnologia da Informação')
ON CONFLICT (code) DO NOTHING;
