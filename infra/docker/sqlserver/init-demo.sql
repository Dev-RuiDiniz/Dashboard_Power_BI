IF DB_ID(N'__DB_NAME__') IS NULL
BEGIN
  CREATE DATABASE [__DB_NAME__];
END
GO

USE [__DB_NAME__];
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'reports')
BEGIN
  EXEC('CREATE SCHEMA reports');
END
GO

IF OBJECT_ID(N'reports.financeiro_resumo', N'U') IS NULL
BEGIN
  CREATE TABLE reports.financeiro_resumo (
    id INT NOT NULL PRIMARY KEY,
    indicador NVARCHAR(120) NOT NULL,
    valor DECIMAL(18,2) NOT NULL,
    competencia DATE NOT NULL
  );
END
GO

IF OBJECT_ID(N'reports.comercial_pipeline', N'U') IS NULL
BEGIN
  CREATE TABLE reports.comercial_pipeline (
    id INT NOT NULL PRIMARY KEY,
    regional NVARCHAR(40) NOT NULL,
    cliente NVARCHAR(120) NOT NULL,
    valor DECIMAL(18,2) NOT NULL,
    etapa NVARCHAR(40) NOT NULL
  );
END
GO

IF OBJECT_ID(N'reports.operacoes_status', N'U') IS NULL
BEGIN
  CREATE TABLE reports.operacoes_status (
    id INT NOT NULL PRIMARY KEY,
    status NVARCHAR(20) NOT NULL,
    fila NVARCHAR(80) NOT NULL,
    sla_percentual DECIMAL(5,2) NOT NULL
  );
END
GO

IF OBJECT_ID(N'reports.diretoria_estrategica', N'U') IS NULL
BEGIN
  CREATE TABLE reports.diretoria_estrategica (
    id INT NOT NULL PRIMARY KEY,
    indicador NVARCHAR(120) NOT NULL,
    valor NVARCHAR(120) NOT NULL
  );
END
GO

DELETE FROM reports.financeiro_resumo;
INSERT INTO reports.financeiro_resumo (id, indicador, valor, competencia) VALUES
  (1, N'Receita recorrente', 120000.00, '2026-06-01'),
  (2, N'Margem operacional', 32.00, '2026-06-01'),
  (3, N'Inadimplencia', 4.50, '2026-06-01');
GO

DELETE FROM reports.comercial_pipeline;
INSERT INTO reports.comercial_pipeline (id, regional, cliente, valor, etapa) VALUES
  (1, N'Sudeste', N'Conta Alfa', 45000.00, N'Proposta'),
  (2, N'Sul', N'Conta Beta', 32000.00, N'Negociacao'),
  (3, N'Sudeste', N'Conta Gama', 15000.00, N'Fechamento');
GO

DELETE FROM reports.operacoes_status;
INSERT INTO reports.operacoes_status (id, status, fila, sla_percentual) VALUES
  (1, N'ativo', N'Onboarding', 94.50),
  (2, N'ativo', N'Suporte', 91.20),
  (3, N'pausado', N'Implantacao', 78.00);
GO

DELETE FROM reports.diretoria_estrategica;
INSERT INTO reports.diretoria_estrategica (id, indicador, valor) VALUES
  (1, N'Projetos ativos', N'18'),
  (2, N'Exportacoes concluidas', N'240'),
  (3, N'SLA medio', N'92%');
GO

CREATE OR ALTER VIEW reports.vw_financeiro_resumo AS
SELECT id, indicador, valor, competencia
FROM reports.financeiro_resumo;
GO

CREATE OR ALTER VIEW reports.vw_comercial_pipeline AS
SELECT id, regional, cliente, valor, etapa
FROM reports.comercial_pipeline;
GO

CREATE OR ALTER VIEW reports.vw_diretoria_estrategica AS
SELECT id, indicador, valor
FROM reports.diretoria_estrategica;
GO

CREATE OR ALTER PROCEDURE reports.sp_operacoes_status
  @status NVARCHAR(20) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, status, fila, sla_percentual
  FROM reports.operacoes_status
  WHERE @status IS NULL OR status = @status
  ORDER BY id;
END
GO
