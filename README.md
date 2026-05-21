# Dashboard Power BI

Plataforma web de relatórios e BI em formato monorepo.

## Visão geral

Este repositório será a base do produto Dashboard Power BI, uma plataforma web para centralizar relatórios, dashboards interativos, permissões por setor, exportações e administração.

A fundação técnica foi criada como monorepo para separar aplicações, bibliotecas compartilhadas, documentação e infraestrutura desde o início do projeto.

## Objetivo da Sprint 1

Criar a fundação técnica do produto com estrutura, arquitetura, qualidade, base visual/técnica, CI inicial e documentação.

## Stack planejada

- Node.js 20+
- pnpm 9+
- TypeScript
- NestJS para API
- Next.js para Web
- Tailwind CSS e shadcn/ui
- SQL Server
- Redis e BullMQ
- Testes automatizados por camada

> As aplicações NestJS e Next.js serão inicializadas nas próximas tarefas da Sprint 1.

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
- [`docs/quality.md`](docs/quality.md): comandos e padrões de qualidade.
- [`docs/decisions/ADR-0001-monorepo.md`](docs/decisions/ADR-0001-monorepo.md): decisão pelo monorepo.
- [`docs/decisions/ADR-0002-tooling-qualidade.md`](docs/decisions/ADR-0002-tooling-qualidade.md): decisão sobre tooling de qualidade.

## Segurança

Não versionar arquivos `.env` reais, secrets, strings de conexão, tokens ou credenciais. Use apenas arquivos de exemplo quando necessário.

## Próximas tarefas da Sprint 1

1. Inicializar NestJS API.
2. Inicializar Next.js Web.
3. Implementar design system base.
4. Criar Docker Compose de desenvolvimento.
5. Evoluir documentação técnica.
