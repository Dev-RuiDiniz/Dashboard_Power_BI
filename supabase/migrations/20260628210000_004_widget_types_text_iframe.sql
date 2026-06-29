-- Adicionar colunas content e url em dashboard_widgets
ALTER TABLE dashboard_widgets ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE dashboard_widgets ADD COLUMN IF NOT EXISTS url TEXT;

-- Adicionar novos tipos ao enum widget_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'widget_type') THEN
    CREATE TYPE widget_type AS ENUM ('chart', 'kpi', 'table', 'text', 'iframe');
  ELSE
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'text' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'widget_type')) THEN
      ALTER TYPE widget_type ADD VALUE 'text';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'iframe' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'widget_type')) THEN
      ALTER TYPE widget_type ADD VALUE 'iframe';
    END IF;
  END IF;
END $$;
