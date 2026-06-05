# API

## Objetivo

Este documento descreve a API realmente implementada em `apps/api`.
Para visão geral do sistema, consulte `docs/system-map.md`.

## Visão geral

A API é uma aplicação NestJS que hoje concentra:

- autenticação;
- recuperação e redefinição de senha;
- CRUD administrativo de usuários e grupos;
- administração de definições de relatórios;
- listagem, detalhe e execução de relatórios;
- healthchecks da aplicação e do SQL Server.

Swagger local:

```text
http://localhost:3001/docs
```

## Módulos reais

| Módulo                 | Evidência                      | Papel atual                                   |
| ---------------------- | ------------------------------ | --------------------------------------------- |
| `AuthModule`           | `apps/api/src/auth`            | login, refresh, logout, forgot/reset password |
| `AdminModule`          | `apps/api/src/admin`           | usuários e grupos                             |
| `ReportsModule`        | `apps/api/src/reports`         | catálogo, definição administrativa e execução |
| `HealthModule`         | `apps/api/src/health`          | status da API e do SQL Server                 |
| `ValidationTestModule` | `apps/api/src/validation-test` | endpoint técnico                              |
| `SqlServerModule`      | `apps/api/src/sql-server`      | conexão e execução segura no SQL Server       |

## Endpoints reais

### Health

```http
GET /health
GET /health/sql
```

`/health/sql` retorna diagnóstico sanitizado, sem expor host, senha, database ou string de conexão.

### Auth

```http
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/refresh
POST /auth/logout
```

Comportamentos reais:

- login gera sessão JWT para a Web;
- forgot/reset password existem e dependem do fluxo implementado na API;
- logout integra com o backend, mas a Web continua limpando sessão localmente;
- há controle de tentativas de login.

### Autorização de teste

```http
GET /authz-test/view/{sector}
GET /authz-test/download/{sector}
GET /authz-test/admin
```

Esses endpoints existem para validar guards e regras de autorização.

### Administração de usuários

```http
GET /admin/users
GET /admin/users/{id}
POST /admin/users
PATCH /admin/users/{id}
PATCH /admin/users/{id}/deactivate
POST /admin/users/{id}/reset-password
PUT /admin/users/{id}/groups
```

### Administração de grupos

```http
GET /admin/groups
GET /admin/groups/{id}
POST /admin/groups
PATCH /admin/groups/{id}
DELETE /admin/groups/{id}
```

### Administração de relatórios

```http
POST /admin/reports
GET /admin/reports
GET /admin/reports/{id}
PATCH /admin/reports/{id}
PATCH /admin/reports/{id}/deactivate
```

Observação importante:

- a API já tem esse conjunto administrativo;
- a Web ainda não tem tela dedicada equivalente para gestão de relatórios.

### Reports API

```http
GET /reports
GET /reports/{id}
POST /reports/{id}/query
```

O sistema hoje faz:

- lista relatórios autorizados;
- retorna o detalhe público do relatório;
- executa consultas parametrizadas com paginação da resposta.

## Exemplo de payloads

### Criar definição administrativa de relatório

```json
{
  "name": "Relatório Financeiro",
  "description": "Visão consolidada do setor financeiro.",
  "sector": "financeiro",
  "sourceType": "view",
  "sourceName": "reports.vw_financial_reports",
  "parameters": [
    {
      "name": "startDate",
      "type": "date",
      "required": true
    }
  ],
  "requiredPermissions": ["reports:financeiro:read"],
  "isActive": true
}
```

### Consultar relatório

```json
{
  "filters": {
    "startDate": "2026-05-01",
    "sectorId": "financeiro"
  },
  "page": 1,
  "pageSize": 20
}
```

## Regras reais de segurança e comportamento

- `sourceName` deve seguir o formato seguro `schema.nome`;
- a API não aceita SQL livre vindo do cliente;
- filtros só são aceitos quando declarados nos parâmetros do relatório;
- a autorização roda antes da execução no SQL Server;
- a resposta pública evita expor `sourceName`;
- erros de SQL são sanitizados.

## Persistência real da API

Estado atual confirmado:

- execução dos relatórios: SQL Server externo;
- definições administrativas de relatórios: repositório em memória;
- usuários e grupos administrativos: repositórios em memória;
- autenticação: fluxo próprio da API, sem Supabase Auth como base principal.

Implicação:

- reiniciar a API afeta partes do estado administrativo que ainda não estão persistidas em banco pela própria aplicação.

## O que a API não faz hoje

- não possui módulo de exportação com `POST /reports/{id}/export`;
- não possui fila BullMQ;
- não possui Redis funcional na camada de aplicação;
- não possui módulo dedicado de auditoria;
- não possui notificações via API;
- não possui 2FA/TOTP;
- não usa Prisma.

## Execução local

```bash
pnpm dev:api
```

## Validação

```bash
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api typecheck
pnpm --filter @dashboard-power-bi/api build
```
