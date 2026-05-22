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


## Autenticação — TASK-08

A autenticação inicial da API usa login por e-mail e senha, emissão de access token em formato JWT HS256, refresh token opaco, rotação de refresh token e logout com invalidação do refresh token atual.

### POST /auth/login

Autentica o usuário e retorna um par de tokens.

Payload:

```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

Resposta 200:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token-opaco>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

Erros esperados:

- `401 Unauthorized` para credenciais inválidas.
- `400 Bad Request` para payload inválido.

### POST /auth/refresh

Rotaciona o refresh token e retorna novo access token e novo refresh token. O refresh token anterior é invalidado e não deve ser reutilizado.

Payload:

```json
{
  "refreshToken": "<refresh-token-atual>"
}
```

Resposta 200:

```json
{
  "accessToken": "<novo-jwt>",
  "refreshToken": "<novo-refresh-token-opaco>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### POST /auth/logout

Invalida o refresh token atual.

Payload:

```json
{
  "refreshToken": "<refresh-token-atual>"
}
```

Resposta 200:

```json
{
  "success": true
}
```

### Observações de segurança

- Senhas são comparadas com `bcrypt`.
- Refresh tokens são armazenados internamente apenas em formato de hash.
- Access tokens usam assinatura HMAC SHA-256.
- Tokens, senhas e secrets não devem ser registrados em logs.
- O usuário demo só é criado quando `AUTH_DEMO_USER_EMAIL` e `AUTH_DEMO_USER_PASSWORD` estiverem configurados no ambiente.
- A persistência atual de usuários/sessões é em memória e deve ser substituída por persistência segura em banco nas próximas tarefas da Sprint 2.

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
