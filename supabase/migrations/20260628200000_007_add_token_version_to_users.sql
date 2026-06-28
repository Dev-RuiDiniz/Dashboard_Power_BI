-- Adiciona coluna token_version para invalidação em massa de access tokens
-- Quando token_version é incrementado, todos os JWTs com tv anterior tornam-se inválidos
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0;
