# SPEC-T05 — Visualização Inline de Relatório

**ID:** T05
**Módulo:** Reports
**Fase:** Fase 1
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela de detalhe do relatório com parâmetros dinâmicos, execução de query no SQL Server e exibição de resultados em tabela.

## 2. Contexto

Tela acessível após clicar em um relatório no catálogo. Exibe formulário de parâmetros dinâmicos, executa query no SQL Server via API e mostra resultados em tabela paginada.

## 3. Regras de Negócio

| Código | Regra                                          | Status     |
| ------ | ---------------------------------------------- | ---------- |
| RN-006 | Usuários só visualizam relatórios do seu setor | Confirmado |
| RN-009 | Queries ao SQL Server devem ser parametrizadas | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário clica em relatório no catálogo → `/app/reports/:id`.
2. Frontend busca definição do relatório (parâmetros).
3. Exibe formulário com parâmetros dinâmicos (texto, data, número, dropdown).
4. Usuário preenche parâmetros e clica "Executar".
5. POST /reports/:id/execute com parâmetros.
6. API executa query parametrizada no SQL Server.
7. Resultados exibidos em tabela.

### Fluxo alternativo — Erro na execução

1. API retorna erro (SQL Server indisponível, query inválida).
2. Frontend exibe estado de erro com mensagem.

### Fluxo alternativo — Sem resultados

1. Query retorna vazio.
2. Frontend exibe estado vazio.

## 5. Critérios de Aceite

- [x] Detalhe do relatório com parâmetros dinâmicos
- [x] Formulário de parâmetros com validação
- [x] Execução da query no SQL Server via API
- [x] Exibição de resultados em tabela
- [x] Estados: loading, erro, vazio

## 6. Impacto Técnico

| Área           | Impacto                                                                    |
| -------------- | -------------------------------------------------------------------------- |
| Arquitetura    | Rota autenticada, integração com SQL Server                                |
| Banco de dados | Consulta em api_report_definitions + SQL Server                            |
| API            | GET /reports/:id, POST /reports/:id/execute                                |
| Frontend       | /app/reports/:id, report-detail.tsx                                        |
| Testes         | Unit (report-detail), Integration (reports.controller, sql-server.service) |
| Infraestrutura | SQL Server                                                                 |
| Segurança      | Queries parametrizadas, validação de parâmetros                            |

## 7. Testes Necessários

| Tipo        | Arquivo                    | Descrição                                    |
| ----------- | -------------------------- | -------------------------------------------- |
| Unit        | report-detail.tsx          | Renderização de parâmetros, execução         |
| Integration | reports.controller.spec.ts | POST /reports/:id/execute                    |
| Integration | sql-server.service.spec.ts | Queries parametrizadas                       |
| Manual      | —                          | Verificar relatório com múltiplos parâmetros |

## 8. Riscos

| Risco                | Impacto               | Mitigação                                    |
| -------------------- | --------------------- | -------------------------------------------- |
| Query lenta          | Timeout, UX degradada | Timeout configurável                         |
| Parâmetros inválidos | Erro ou SQL injection | Validação no backend, queries parametrizadas |

## 9. Dependências

- `reports.controller` (GET /reports/:id, POST /reports/:id/execute)
- `sql-server.service` (execução de queries)
- `report-definitions.repository` (definição de parâmetros)
