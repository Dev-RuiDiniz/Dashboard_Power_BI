# API

A API é implementada com NestJS e expõe endpoints REST documentados via Swagger.

## Healthcheck da API

```http
GET /health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "dashboard-power-bi-api"
}
```

## Healthcheck SQL Server

```http
GET /health/sql
```

A resposta é sanitizada e não expõe senha, usuário, host, database ou string de conexão.

## Catálogo administrativo de relatórios

```http
POST /admin/reports
GET /admin/reports
GET /admin/reports/{id}
PATCH /admin/reports/{id}
PATCH /admin/reports/{id}/deactivate
```

Payload de criação:

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

O catálogo não aceita SQL livre. `sourceName` deve usar o formato seguro `schema.nome`.

## Reports API

A TASK-18 adiciona a API de consumo de relatórios, com paginação, validação de filtros e autorização por setor/permissão.

### Listar relatórios autorizados

```http
GET /reports?sector=financeiro&page=1&pageSize=20
```

Resposta:

```json
{
  "items": [
    {
      "id": "report-1",
      "name": "Relatório Financeiro",
      "description": "Visão consolidada.",
      "sector": "financeiro",
      "sourceType": "view",
      "parameters": [
        {
          "name": "startDate",
          "type": "date",
          "required": true
        }
      ],
      "requiredPermissions": ["reports:financeiro:read"]
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "totalPages": 1
}
```

O contrato público não retorna `sourceName`, evitando expor o nome interno da view ou stored procedure.

### Detalhar relatório autorizado

```http
GET /reports/{id}
```

Retorna os metadados públicos do relatório autorizado, incluindo parâmetros necessários para montagem de filtros no frontend.

### Executar query do relatório

```http
POST /reports/{id}/query
```

Payload:

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

Resposta:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0,
  "totalPages": 0
}
```

Regras:

- a autorização é validada antes da execução;
- filtros são validados contra os parâmetros declarados no catálogo;
- filtros desconhecidos são rejeitados;
- valores são enviados pela camada segura de queries parametrizadas;
- a primeira versão aplica paginação em memória após execução segura;
- erros do SQL Server permanecem sanitizados.

## Execução local

```bash
pnpm dev:api
```

Swagger local:

```text
http://localhost:3001/docs
```

## Validação

```bash
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api typecheck
pnpm --filter @dashboard-power-bi/api build
```
