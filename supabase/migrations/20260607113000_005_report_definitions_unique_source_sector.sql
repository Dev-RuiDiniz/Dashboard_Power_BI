/*
  # Garante unicidade lógica das definições de relatório

  Remove duplicatas legadas preservando o registro mais recente por
  combinação de fonte SQL + setor e, em seguida, cria um índice único
  para blindar concorrência entre instâncias da API.
*/

WITH ranked_duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY source_name, sector
      ORDER BY updated_at DESC, created_at DESC, id DESC
    ) AS row_number
  FROM api_report_definitions
)
DELETE FROM api_report_definitions
WHERE id IN (
  SELECT id
  FROM ranked_duplicates
  WHERE row_number > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_report_definitions_source_sector_unique
  ON api_report_definitions(source_name, sector);
