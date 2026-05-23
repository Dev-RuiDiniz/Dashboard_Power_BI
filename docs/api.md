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

### Resposta saudável

```json
{
  "status": "ok",
  "dependency": "sql-server",
  "details": {
    "configured": {
      "serverConfigured": true,
      "port": 1433,
      "databaseConfigured": true,
      "userConfigured": true,
      "encrypt": true,
      "trustServerCertificate": false,
      "connectionTimeout": 5000,
      "requestTimeout": 5000
    },
    "latencyMs": 12
  }
}
```

### Resposta indisponível

```json
{
  "status": "unavailable",
  "dependency": "sql-server",
  "details": {
    "configured": {
      "serverConfigured": true,
      "port": 1433,
      "databaseConfigured": true,
      "userConfigured": true,
      "encrypt": true,
      "trustServerCertificate": false,
      "connectionTimeout": 5000,
      "requestTimeout": 5000
    },
    "message": "SQL Server indisponível ou configuração inválida."
  }
}
```

### Regras de segurança

- A resposta não expõe senha, usuário, host, database ou string de conexão.
- Erros brutos do driver não são retornados ao cliente.
- O teste usa mock/fixture e não depende de SQL Server real.
- Em produção, usar usuário SQL dedicado e preferencialmente `read-only`.

## Execução local

```bash
pnpm dev:api
```

Swagger local:

```text
http://localhost:3001/docs
```

Healthcheck local:

```text
http://localhost:3001/health
http://localhost:3001/health/sql
```

## Validação

```bash
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api typecheck
pnpm --filter @dashboard-power-bi/api build
```
