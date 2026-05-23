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

A TASK-15 adiciona o endpoint de verificação da dependência SQL Server.

```http
GET /health/sql
```

A resposta é sanitizada e não expõe senha, usuário, host, database ou string de conexão.

## Catálogo de relatórios

A TASK-17 adiciona o catálogo administrativo de relatórios e a listagem por setor.

### Criar definição de relatório

```http
POST /admin/reports
```

Payload:

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

Regras:

- `sourceType` aceita apenas `view` ou `stored_procedure`.
- `sourceName` deve usar o formato seguro `schema.nome`.
- `parameters` aceita tipos `string`, `int`, `number`, `boolean` e `date`.
- `requiredPermissions` deve conter chaves seguras de permissão.
- Não é permitido SQL livre no catálogo.

### Listar catálogo administrativo

```http
GET /admin/reports
```

### Buscar definição por ID

```http
GET /admin/reports/{id}
```

### Atualizar definição parcialmente

```http
PATCH /admin/reports/{id}
```

### Desativar definição

```http
PATCH /admin/reports/{id}/deactivate
```

A desativação é lógica. A definição permanece cadastrada, mas deixa de aparecer na listagem pública por setor.

### Listar relatórios ativos por setor

```http
GET /reports?sector=financeiro
```

Retorna somente relatórios ativos do setor informado.

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
