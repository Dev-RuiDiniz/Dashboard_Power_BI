# Dashboard Power BI

Plataforma web de relatórios e BI em formato monorepo.

## Visão geral

Este repositório será a base do produto Dashboard Power BI, uma plataforma web para centralizar relatórios, dashboards interativos, permissões por setor, exportações e administração.

A fundação técnica usa monorepo para separar aplicações, bibliotecas compartilhadas, documentação e infraestrutura desde o início do projeto.

## Objetivo da Sprint 1

Criar a fundação técnica do produto com estrutura, arquitetura, qualidade, backend inicial, frontend inicial e documentação.

## Stack planejada

- Node.js 20+
- pnpm 9+
- TypeScript
- NestJS para API
- Next.js 14 para Web
- Tailwind CSS e shadcn/ui
- SQL Server
- Redis e BullMQ
- Testes automatizados por camada

## Estrutura de pastas

```text
apps/
  api/                 # Aplicação backend NestJS
  web/                 # Aplicação frontend Next.js
packages/
  shared/              # Tipos, contratos e utilitários compartilhados
  ui/                  # Componentes visuais reutilizáveis
docs/
  decisions/           # ADRs e decisões técnicas
infra/                 # Infraestrutura, Docker e deploy
scripts/               # Scripts auxiliares do workspace
.github/               # Configurações futuras de GitHub Actions
```

## Pré-requisitos

- Node.js 20 ou superior
- pnpm 9 ou superior

## Instalação

```bash
pnpm install
```

## Comandos principais

```bash
pnpm verify:workspace
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm quality
pnpm build
pnpm test
pnpm test:e2e
```

## Backend API

```bash
pnpm dev:api
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api test:e2e
pnpm --filter @dashboard-power-bi/api build
```

API local:

```text
http://localhost:3001
```

Healthcheck:

```text
GET http://localhost:3001/health
```

Swagger:

```text
http://localhost:3001/docs
```

## Frontend Web

```bash
pnpm dev:web
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web build
pnpm --filter @dashboard-power-bi/web typecheck
```

Web local:

```text
http://localhost:3000
```

## Qualidade

A base de qualidade usa:

- ESLint para análise estática.
- Prettier para formatação.
- TypeScript strict.
- Husky para hooks locais.
- lint-staged para validar arquivos alterados.
- commitlint para validar Conventional Commits.

Mais detalhes em [`docs/quality.md`](docs/quality.md).

## Documentação

- [`docs/architecture.md`](docs/architecture.md): visão arquitetural inicial.
- [`docs/api.md`](docs/api.md): backend NestJS inicial.
- [`docs/web.md`](docs/web.md): frontend Next.js inicial.
- [`docs/quality.md`](docs/quality.md): comandos e padrões de qualidade.
- [`docs/decisions/ADR-0001-monorepo.md`](docs/decisions/ADR-0001-monorepo.md): decisão pelo monorepo.
- [`docs/decisions/ADR-0002-tooling-qualidade.md`](docs/decisions/ADR-0002-tooling-qualidade.md): tooling de qualidade.
- [`docs/decisions/ADR-0003-nestjs-api.md`](docs/decisions/ADR-0003-nestjs-api.md): decisão sobre NestJS.
- [`docs/decisions/ADR-0004-nextjs-web.md`](docs/decisions/ADR-0004-nextjs-web.md): decisão sobre Next.js.

## Segurança

Não versionar arquivos `.env` reais, secrets, strings de conexão, tokens ou credenciais. Use apenas arquivos de exemplo quando necessário.

## Próximas tarefas da Sprint 1

1. Implementar design system base.
2. Criar Docker Compose de desenvolvimento.
3. Evoluir documentação técnica.
4. Preparar CI inicial.
