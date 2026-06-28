# SPEC-sql-server-modulo — Módulo SQL Server (Integração)

**ID:** SQL-MOD
**Módulo:** SQL Server
**Fase:** Fase 1 (concluído), pendências em Fase 3+
**Status:** Parcial
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Fornecer camada segura de leitura ao SQL Server corporativo para execução de relatórios, com queries parametrizadas, validação de identificadores e proteção contra SQL injection.

## 2. Contexto

O SQL Server é a origem dos dados de relatórios. A plataforma conecta via `mssql` com pool de conexões. Acesso é somente leitura (SELECT e EXEC de stored procedures). Queries são montadas por `sql-query-builder` com validação de identificadores.

## 3. Regras de Negócio

| Código | Regra                                                        | Status     |
| ------ | ------------------------------------------------------------ | ---------- |
| RN-009 | Queries ao SQL Server devem ser parametrizadas               | Confirmado |
| RN-010 | Somente SELECT e EXEC de stored procedures são permitidos    | Confirmado |
| RN-011 | DROP, DELETE, UPDATE, INSERT, ALTER e TRUNCATE são proibidos | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Execução de relatório

1. Usuário seleciona relatório e parâmetros.
2. POST /reports/:id/execute com parâmetros.
3. API busca definição do relatório (source_type, source_name).
4. `sql-query-builder` monta query com parâmetros parametrizados.
5. `sql-server.service` executa query via pool.
6. API retorna resultados em JSON.

### Fluxo — Validação de identificadores

1. source_name (tabela/view/SP) é validado contra whitelist.
2. Se identificador não está na whitelist → rejeita.
3. Parâmetros são sempre passados como valores, nunca concatenados.

### Fluxo — Fallback

1. SQL Server indisponível.
2. API retorna erro graceful com mensagem.
3. Healthcheck /health/sql reflete status.

## 5. Critérios de Aceite

- [x] Conexão via pool com SQL Server (mssql)
- [x] Queries parametrizadas (prevenção SQL injection)
- [x] Suporte a stored procedures e views
- [x] Validação de identificadores (whitelist)
- [x] Healthcheck GET /health/sql
- [x] Fallback graceful quando indisponível
- [ ] Cache de resultados configurável por relatório
- [ ] Monitoramento de lentidão e timeout de queries
- [ ] Cron de refresh de dados agendado

## 6. Impacto Técnico

| Área           | Impacto                                                            |
| -------------- | ------------------------------------------------------------------ |
| Arquitetura    | Camada isolada em apps/api/src/sql-server/\*                       |
| Banco de dados | SQL Server (origem de leitura)                                     |
| API            | POST /reports/:id/execute, GET /health/sql                         |
| Frontend       | Nenhum direto (via reports)                                        |
| Testes         | Unit (sql-server.service, sql-query-builder), Security (injection) |
| Infraestrutura | SQL Server acessível na rede interna ou VPN                        |
| Segurança      | Queries parametrizadas, whitelist, somente leitura                 |

## 7. Testes Necessários

| Tipo        | Arquivo                    | Descrição                                   |
| ----------- | -------------------------- | ------------------------------------------- |
| Unit        | sql-server.service.spec.ts | Conexão, query parametrizada                |
| Unit        | sql-query-builder.spec.ts  | Montagem segura de queries                  |
| Integration | reports.controller.spec.ts | Execução de relatórios via SQL Server       |
| Security    | —                          | SQL injection em parâmetros → neutralizado  |
| Security    | —                          | DROP/DELETE/UPDATE → rejeitado              |
| Performance | —                          | Queries > 30s → timeout apropriado          |
| Manual      | —                          | Executar relatório com parâmetros complexos |

## 8. Riscos

| Risco                   | Impacto                       | Mitigação                              |
| ----------------------- | ----------------------------- | -------------------------------------- |
| SQL Server indisponível | Relatórios não carregam       | Healthcheck + fallback graceful        |
| Query lenta             | Timeout, UX degradada         | Timeout configurável, cache (pendente) |
| SQL injection           | Vazamento/destruição de dados | Queries parametrizadas, whitelist      |

## 9. Dependências

- `mssql` (driver SQL Server)
- Credenciais de leitura no SQL Server (variáveis de ambiente)
- `sql-query-builder` (montagem segura)
- `reports.controller` (execução de relatórios)
