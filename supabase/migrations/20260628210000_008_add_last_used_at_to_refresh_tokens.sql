-- Adiciona coluna last_used_at para tracking de inatividade de sessao
ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS last_used_at timestamptz DEFAULT now();
