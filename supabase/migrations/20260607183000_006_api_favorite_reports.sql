/*
  # Favoritos da API centralizada

  A runtime atual de relatórios usa `api_report_definitions`, não a tabela histórica `reports`.
  Esta migration cria `api_favorite_reports` para permitir favoritos alinhados ao contrato real
  sem depender do FK legado de `favorite_reports`.
*/

CREATE TABLE IF NOT EXISTS api_favorite_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  report_id TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, report_id)
);

CREATE INDEX IF NOT EXISTS idx_api_favorite_reports_user ON api_favorite_reports(user_id);

ALTER TABLE api_favorite_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access api_favorite_reports" ON api_favorite_reports
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
