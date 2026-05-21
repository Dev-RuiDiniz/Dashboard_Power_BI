# Dashboard Power BI

Plataforma web de relatórios e BI em formato monorepo.

## Visão geral

Este repositório será a base do produto Dashboard Power BI, uma plataforma web para centralizar relatórios, dashboards interativos, permissões por setor, exportações e administração.

## Pré-requisitos

- Node.js 20 ou superior
- pnpm 9 ou superior
- Docker e Docker Compose para ambiente local integrado

## Instalação

```bash
pnpm install
```

## Comandos principais

```bash
pnpm verify:workspace
pnpm verify:docker
pnpm lint
pnpm format:check
pnpm typecheck
pnpm quality
pnpm build
pnpm test
```

## Desenvolvimento sem Docker

```bash
pnpm dev:api
pnpm dev:web
```

## Desenvolvimento com Docker

Subir API, Web e Redis:

```bash
pnpm docker:dev
```

Ver logs:

```bash
pnpm docker:dev:logs
```

Derrubar ambiente:

```bash
pnpm docker:dev:down
```

URLs locais:

```text
Web: http://localhost:3000
API: http://localhost:3001
Healthcheck: http://localhost:3001/health
Swagger: http://localhost:3001/docs
Design system: http://localhost:3000/design-system
```

## Variáveis de ambiente

O arquivo de exemplo fica em:

```text
infra/env/.env.example
```

Para customizar localmente:

```bash
cp infra/env/.env.example .env
```

Não versionar `.env` real.

## Documentação

- [`docs/api.md`](docs/api.md): backend NestJS inicial.
- [`docs/web.md`](docs/web.md): frontend Next.js inicial.
- [`docs/design-system.md`](docs/design-system.md): tokens e componentes visuais.
- [`docs/devops.md`](docs/devops.md): ambiente Docker local.
- [`docs/environment.md`](docs/environment.md): variáveis de ambiente.
- [`docs/quality.md`](docs/quality.md): comandos e padrões de qualidade.
- [`docs/architecture.md`](docs/architecture.md): visão arquitetural inicial.

## Segurança

Não versionar arquivos `.env` reais, secrets, strings de conexão, tokens ou credenciais. Use apenas arquivos de exemplo quando necessário.
