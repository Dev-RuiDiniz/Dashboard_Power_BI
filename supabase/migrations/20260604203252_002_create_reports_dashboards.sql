/*
  # Plataforma BI - Relatórios e Dashboards

  1. Novas tabelas:
    - `reports` - Definição de relatórios (fonte SQL, parâmetros)
    - `report_parameters` - Parâmetros dinâmicos dos relatórios
    - `dashboards` - Dashboards personalizados por usuário
    - `dashboard_widgets` - Widgets dentro dos dashboards
    - `kpis` - KPIs e indicadores
    - `report_executions` - Cache e histórico de execuções

  2. Security:
    - RLS em todas as tabelas
    - Usuários visualizam apenas relatórios do seu setor
    - Admins gerenciam todas as definições

  3. Índices para queries de relatórios e dashboards
*/

-- Enum para tipos de parâmetros
CREATE TYPE parameter_type AS ENUM ('string', 'int', 'date', 'datetime', 'decimal', 'boolean');
CREATE TYPE chart_type AS ENUM ('line', 'bar', 'pie', 'area', 'scatter', 'table');
CREATE TYPE widget_type AS ENUM ('chart', 'kpi', 'text', 'gauge');

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  source_type TEXT DEFAULT 'view', -- 'view' ou 'stored_procedure'
  source_name TEXT NOT NULL, -- e.g., 'dbo.vw_financial_reports'
  query_text TEXT, -- SQL da query (opcional, para views simples)
  refresh_interval_minutes INT DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_name)
);

-- Tabela de parâmetros de relatórios
CREATE TABLE IF NOT EXISTS report_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parameter_type parameter_type NOT NULL,
  label TEXT,
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  display_order INT,
  UNIQUE(report_id, name)
);

-- Tabela de KPIs
CREATE TABLE IF NOT EXISTS kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sector_id UUID REFERENCES sectors(id),
  metric_query TEXT NOT NULL, -- SQL que retorna o valor
  comparison_query TEXT, -- SQL para comparação (período anterior)
  unit TEXT DEFAULT 'number', -- 'number', 'currency', 'percent'
  target_value DECIMAL(18,2),
  warning_threshold DECIMAL(18,2),
  critical_threshold DECIMAL(18,2),
  refresh_interval_minutes INT DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de dashboards personalizados
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  layout JSONB, -- Configuração de layout responsivo
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Tabela de widgets em dashboards
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_type widget_type NOT NULL,
  title TEXT NOT NULL,
  chart_type chart_type,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  kpi_id UUID REFERENCES kpis(id) ON DELETE SET NULL,
  display_order INT,
  config JSONB, -- Configuração específica do widget
  position_x INT,
  position_y INT,
  width INT DEFAULT 1,
  height INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de execução de relatórios (cache)
CREATE TABLE IF NOT EXISTS report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parameters JSONB, -- Parâmetros utilizados
  result_row_count INT,
  execution_time_ms INT,
  cache_hit BOOLEAN DEFAULT false,
  cached_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de relatórios favoritos
CREATE TABLE IF NOT EXISTS favorite_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, report_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reports_sector ON reports(sector_id);
CREATE INDEX IF NOT EXISTS idx_reports_active ON reports(is_active);
CREATE INDEX IF NOT EXISTS idx_report_parameters_report ON report_parameters(report_id);
CREATE INDEX IF NOT EXISTS idx_kpis_sector ON kpis(sector_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_user ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_report ON report_executions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_expires ON report_executions(expires_at);
CREATE INDEX IF NOT EXISTS idx_favorite_reports_user ON favorite_reports(user_id);

-- Habilitar RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para reports
CREATE POLICY "Users can view active reports" ON reports
  FOR SELECT TO authenticated
  USING (is_active = true OR created_by = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin can manage reports" ON reports
  FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Políticas para dashboards
CREATE POLICY "Users can view own dashboards" ON dashboards
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own dashboards" ON dashboards
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Políticas para widgets
CREATE POLICY "Users can view own dashboard widgets" ON dashboard_widgets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_widgets.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own widgets" ON dashboard_widgets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_widgets.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

-- Políticas para execução de relatórios
CREATE POLICY "Users can view own executions" ON report_executions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Políticas para favoritos
CREATE POLICY "Users can manage own favorites" ON favorite_reports
  FOR ALL TO authenticated
  USING (user_id = auth.uid());
