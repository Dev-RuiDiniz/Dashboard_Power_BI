# SPEC-T15 — Gestão de Relatórios (Admin)

**ID:** T15
**Módulo:** Reports / Admin
**Fase:** Fase 2
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela administrativa de CRUD de definições de relatórios com validação de fonte SQL, parâmetros dinâmicos e teste de conexão.

## 2. Contexto

Tela restrita a admins. Gerencia definições de relatórios: name, description, sector, source_type (table/view/stored_procedure), source_name, parameters. Inclui teste de conexão com SQL Server antes de salvar e gerenciamento de parâmetros (adicionar, editar, remover).

## 3. Regras de Negócio

| Código | Regra                                                     | Status     |
| ------ | --------------------------------------------------------- | ---------- |
| RN-008 | Apenas Admin pode gerenciar usuários, grupos e permissões | Confirmado |
| RN-009 | Queries ao SQL Server devem ser parametrizadas            | Confirmado |
| RN-010 | Somente SELECT e EXEC de stored procedures são permitidos | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Listagem

1. Admin acessa `/app/admin/reports`.
2. Frontend chama GET /admin/reports.
3. Lista de definições com busca.

### Fluxo — Criar definição

1. Admin clica "Novo relatório".
2. Preenche: name, description, sector, source_type, source_name.
3. Adiciona parâmetros (nome, tipo, obrigatório).
4. Clica "Testar conexão" → POST /admin/reports/validate.
5. API valida source_name contra SQL Server.
6. Se válido → admin clica "Salvar".
7. POST /admin/reports → cria definição.

### Fluxo — Editar definição

1. Admin clica em relatório na lista.
2. Edita campos e parâmetros.
3. PATCH /admin/reports/:id.
4. Auditoria registra mudança.

### Fluxo — Desativar

1. Admin clica "Desativar".
2. DELETE /admin/reports/:id (soft delete).
3. Relatório marcado como inativo.

## 5. Critérios de Aceite

- [x] Listagem de definições com busca
- [x] CRUD: name, description, sector, source_type, source_name, parameters
- [x] Validação de source_name contra SQL injection
- [x] Teste de conexão antes de salvar (POST /admin/reports/validate)
- [x] Ativação/desativação
- [x] Gerenciamento de parâmetros (adicionar, editar, remover)
- [x] Edição de relatórios existentes
- [x] Estados: loading, erro, vazio, sucesso

## 6. Impacto Técnico

| Área           | Impacto                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| Arquitetura    | Rota admin com RolesGuard (admin)                                       |
| Banco de dados | CRUD em api_report_definitions, auditoria                               |
| API            | GET/POST/PATCH/DELETE /admin/reports, POST /admin/reports/validate      |
| Frontend       | /app/admin/reports, admin-reports.tsx                                   |
| Testes         | Unit (admin-reports), Integration (report-definitions.admin.controller) |
| Infraestrutura | SQL Server para validação de fonte                                      |
| Segurança      | RolesGuard admin, validação de source_name, auditoria                   |

## 7. Testes Necessários

| Tipo        | Arquivo                                     | Descrição                                           |
| ----------- | ------------------------------------------- | --------------------------------------------------- |
| Unit        | admin-reports.tsx                           | Listagem, formulário, edição, parâmetros            |
| Integration | report-definitions.admin.controller.spec.ts | CRUD + validateSource                               |
| Integration | report-definitions.service.spec.ts          | Validação de fonte SQL                              |
| Manual      | —                                           | Criar, testar conexão, editar, gerenciar parâmetros |

## 8. Riscos

| Risco                 | Impacto          | Mitigação                     |
| --------------------- | ---------------- | ----------------------------- |
| source_name malicioso | SQL injection    | Validação contra whitelist    |
| Parâmetros inválidos  | Erro na execução | Validação de tipos no backend |

## 9. Dependências

- `report-definitions.admin.controller` (CRUD + validate)
- `report-definitions.service` (validação de fonte)
- `sql-server.service` (teste de conexão)
- `roles.guard` (controle admin)
