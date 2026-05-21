# API Backend

## Visão geral

A API do Dashboard Power BI foi inicializada em `apps/api` com NestJS, TypeScript, ConfigModule global, ValidationPipe global, Swagger e testes automatizados.

## Objetivo da TASK-03

Entregar o bootstrap inicial do backend para sustentar as próximas tarefas de autenticação, permissões, relatórios, dashboards, exportações e auditoria.

## Stack

- NestJS
- TypeScript
- Jest
- Supertest
- class-validator
- class-transformer
- Swagger/OpenAPI

## Estrutura

```text
apps/api/
  src/
    app.module.ts
    main.ts
    health/
    validation-test/
  test/
    health.e2e-spec.ts
    validation.e2e-spec.ts
```

## Endpoints iniciais

### GET /health

Retorna o status básico da API.

Resposta esperada:

```json
{
  "status": "ok",
  "service": "dashboard-power-bi-api"
}
```

### POST /validation-test

Endpoint técnico temporário usado para comprovar o funcionamento do `ValidationPipe` global.

Payload válido:

```json
{
  "name": "teste"
}
```

Payloads com campos extras ou `name` menor que 3 caracteres devem retornar HTTP 400.

### GET /docs

Documentação Swagger inicial da API.

## Comandos

```bash
pnpm install
pnpm dev:api
pnpm --filter @dashboard-power-bi/api build
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api test:e2e
pnpm --filter @dashboard-power-bi/api typecheck
```

## Validação manual

```bash
pnpm dev:api
curl http://localhost:3001/health
```

## Observações técnicas

- A porta padrão é `3001`.
- O `ConfigModule` lê `.env.local` e `.env`, mas arquivos reais de ambiente não devem ser versionados.
- O endpoint `validation-test` existe apenas para validar a fundação técnica e pode ser removido ou substituído quando houver endpoints reais com DTOs.
