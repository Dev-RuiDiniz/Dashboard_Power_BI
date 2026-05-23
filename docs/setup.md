# Setup local

## Requisitos

- Node.js 20 ou superior
- pnpm 9 ou superior
- Docker e Docker Compose, se usar ambiente containerizado

## Instalação

```bash
pnpm install
```

## Ambiente

Crie o arquivo `.env` local a partir do exemplo versionado:

```bash
cp infra/env/.env.example .env
```

Não versionar `.env` real.

## API e Web

Terminal 1:

```bash
pnpm dev:api
```

Terminal 2:

```bash
pnpm dev:web
```

## SQL Server externo

A TASK-15 adiciona suporte de conexão segura ao SQL Server externo.

Configure no `.env` local:

```bash
SQLSERVER_HOST=
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=
SQLSERVER_USER=
SQLSERVER_PASSWORD=
SQLSERVER_ENCRYPT=true
SQLSERVER_TRUST_SERVER_CERTIFICATE=false
SQLSERVER_CONNECTION_TIMEOUT_MS=5000
SQLSERVER_REQUEST_TIMEOUT_MS=5000
```

Boas práticas:

- usar usuário dedicado e preferencialmente `read-only`;
- não usar usuário `sa` ou administrador;
- não compartilhar strings de conexão em logs, issues, commits ou chats;
- manter `SQLSERVER_ENCRYPT=true`;
- usar `SQLSERVER_TRUST_SERVER_CERTIFICATE=false` em produção.

## Healthchecks

```text
http://localhost:3001/health
http://localhost:3001/health/sql
```

O healthcheck SQL é sanitizado e não retorna credenciais ou erro bruto.

## Qualidade

```bash
pnpm verify:workspace
pnpm verify:docker
pnpm verify:docs
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm quality
```
