# Dashboard Power BI

Plataforma web de relatórios e BI em formato monorepo.

## Visão geral

O Dashboard Power BI centraliza relatórios, dashboards interativos, permissões por setor, exportações e administração. A Sprint 1 entrega a fundação técnica: monorepo, qualidade, API, Web, design system, Docker Compose dev e documentação de onboarding.

## Stack

- Node.js 20+
- pnpm 9+
- TypeScript
- NestJS para API
- Next.js 14 para Web
- Tailwind CSS e componentes base inspirados em shadcn/ui
- Redis
- SQL Server externo
- Docker Compose para desenvolvimento local

## Setup rápido

```bash
git clone https://github.com/Dev-RuiDiniz/Dashboard_Power_BI.git
cd Dashboard_Power_BI
pnpm install
pnpm verify:workspace
pnpm verify:docker
pnpm verify:docs
pnpm quality
```

Para ambiente com variáveis locais:

```bash
cp infra/env/.env.example .env
```

Não versionar `.env` real.

## Checklist de setup local

- [ ] Instalar Node.js 20 ou superior
- [ ] Instalar pnpm 9 ou superior
- [ ] Instalar Docker e Docker Compose, se usar ambiente containerizado
- [ ] Clonar o repositório
- [ ] Rodar `pnpm install`
- [ ] Rodar `pnpm verify:workspace`
- [ ] Rodar `pnpm verify:docker`
- [ ] Rodar `pnpm verify:docs`
- [ ] Rodar `pnpm quality`
- [ ] Subir API com `pnpm dev:api`
- [ ] Subir Web com `pnpm dev:web`
- [ ] Validar `http://localhost:3000`
- [ ] Validar `http://localhost:3001/health`
- [ ] Validar `http://localhost:3001/docs`
- [ ] Opcionalmente subir tudo com `pnpm docker:dev`

## Desenvolvimento sem Docker

Terminal 1:

```bash
pnpm dev:api
```

Terminal 2:

```bash
pnpm dev:web
```

URLs locais:

```text
Web: http://localhost:3000
Design system: http://localhost:3000/design-system
API: http://localhost:3001
Healthcheck: http://localhost:3001/health
Swagger: http://localhost:3001/docs
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

Validar configuração do Compose:

```bash
docker compose --env-file infra/env/.env.example -f infra/docker/docker-compose.dev.yml config
```

## Arquitetura e monorepo

```text
apps/
  api/      # API NestJS
  web/      # Web Next.js
packages/
  shared/   # tipos, contratos e utilitários compartilhados
  ui/       # pacote reservado para componentes compartilhados futuros
docs/       # documentação técnica, setup e ADRs
infra/      # Docker Compose, Dockerfiles e env examples
scripts/    # validações estruturais
```

Fluxo local atual:

```text
Web Next.js -> API NestJS -> Redis
                       -> SQL Server externo via variáveis
```

Detalhes em [`docs/architecture.md`](docs/architecture.md).

## Comandos principais

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

## Variáveis de ambiente

O exemplo versionado fica em:

```text
infra/env/.env.example
```

A documentação completa fica em [`docs/environment.md`](docs/environment.md).

## Decisões arquiteturais

As ADRs ficam em [`docs/decisions`](docs/decisions/README.md):

- ADR-0001 — Monorepo
- ADR-0002 — Tooling de qualidade
- ADR-0003 — API NestJS
- ADR-0004 — Web Next.js
- ADR-0005 — Design system base
- ADR-0006 — Docker Compose dev

## Documentação complementar

- [`docs/setup.md`](docs/setup.md): passo a passo para novo dev
- [`docs/architecture.md`](docs/architecture.md): arquitetura inicial
- [`docs/api.md`](docs/api.md): backend NestJS
- [`docs/web.md`](docs/web.md): frontend Next.js
- [`docs/design-system.md`](docs/design-system.md): tokens e componentes
- [`docs/devops.md`](docs/devops.md): Docker Compose local
- [`docs/environment.md`](docs/environment.md): variáveis de ambiente
- [`docs/quality.md`](docs/quality.md): qualidade, lint, format e commits

## Troubleshooting

### Porta em uso

Ajuste `API_PORT`, `WEB_PORT` ou `REDIS_PORT` no `.env` local.

### Dependências inconsistentes

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Docker com cache antigo

```bash
docker compose --env-file .env -f infra/docker/docker-compose.dev.yml up --build --force-recreate
```

### Redis indisponível

```bash
docker compose -f infra/docker/docker-compose.dev.yml logs redis
```

## Segurança

- Nunca versionar `.env` real.
- Nunca commitar tokens, senhas, strings de conexão ou secrets.
- Usar `infra/env/.env.example` somente com placeholders.
- Configurar secrets em CI/CD apenas por mecanismos seguros da plataforma.
