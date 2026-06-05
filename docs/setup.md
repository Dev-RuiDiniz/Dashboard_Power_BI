# Setup local

## Objetivo

Este documento descreve o setup local com base no estado atual do repositório.

## Requisitos

- Node.js 20 ou superior
- pnpm 9 ou superior
- Docker e Docker Compose, se for usar o ambiente containerizado
- acesso a um SQL Server externo, se quiser validar execução real de relatórios
- credenciais válidas de Supabase, se quiser validar dashboard, exportações, notificações e settings

## Instalação

```bash
pnpm install
```

## Variáveis de ambiente

Consulte `docs/environment.md` para a referência completa.

Desvio conhecido:

```text
infra/env/.env.example
```

Esse arquivo é citado por scripts e documentação histórica, mas não está presente no clone atual.
Se você for usar Docker ou quiser padronizar um `.env`, precisará recriar esse arquivo localmente ou adaptar os comandos.

## Subida sem Docker

Terminal 1:

```bash
pnpm dev:api
```

Terminal 2:

```bash
pnpm dev:web
```

## URLs úteis

```text
Web: http://localhost:3000
Design system: http://localhost:3000/design-system
API: http://localhost:3001
API health: http://localhost:3001/health
SQL health: http://localhost:3001/health/sql
Swagger: http://localhost:3001/docs
```

## SQL Server externo

Para validar o fluxo de relatórios, configure no ambiente local:

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
- não usar `sa` ou conta administrativa;
- manter `SQLSERVER_ENCRYPT=true`;
- usar `SQLSERVER_TRUST_SERVER_CERTIFICATE=false` em produção.

## Supabase

Partes da Web dependem de:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Sem essas variáveis, as áreas abaixo não funcionam corretamente:

- dashboard inicial;
- exportações;
- notificações;
- configurações do sistema.

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
