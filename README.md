# Dashboard Power BI

Plataforma web de relatórios e BI em formato monorepo.

## Visão geral

Este repositório será a base do produto Dashboard Power BI, uma plataforma web para centralizar relatórios, dashboards interativos, permissões por setor, exportações e administração.

A fundação técnica foi criada como monorepo para separar aplicações, bibliotecas compartilhadas, documentação e infraestrutura desde o início do projeto.

## Objetivo da TASK-01

Criar a estrutura inicial do monorepo com rastreabilidade, comandos mínimos de validação e documentação base para evolução das próximas tarefas da Sprint 1.

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

> Nesta tarefa ainda não há implementação de API, Web ou banco de dados. A stack será inicializada nas próximas tarefas da Sprint 1.

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
infra/                 # Arquivos de infraestrutura e deploy
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

## Validação inicial

```bash
pnpm verify:workspace
pnpm build
pnpm lint
pnpm test
pnpm typecheck
```

Nesta fundação, os comandos apontam para a validação estrutural do workspace. Testes, lint, build real de API/Web e type-check serão evoluídos conforme as aplicações forem inicializadas.

## Documentação

- `docs/architecture.md`: visão arquitetural inicial.
- `docs/decisions/ADR-0001-monorepo.md`: decisão técnica de uso do monorepo.

## Segurança

Não versionar arquivos `.env` reais, secrets, strings de conexão, tokens ou credenciais. Use apenas arquivos de exemplo quando necessário.

## Próximas tarefas da Sprint 1

1. Configurar tooling e qualidade.
2. Inicializar NestJS API.
3. Inicializar Next.js Web.
4. Implementar design system base.
5. Criar Docker Compose de desenvolvimento.
