# Dashboard Power BI

Monorepo da plataforma Dashboard Power BI em estado funcional parcial.

## Visão geral

Este repositório já entrega uma base real de:

- autenticação com API NestJS;
- dashboard inicial;
- catálogo e execução de relatórios;
- administração básica de usuários e grupos;
- leitura de notificações, exportações e settings no Supabase;
- infraestrutura de desenvolvimento em Docker Compose;
- infraestrutura de produção com imagens Docker e deploy para VPS via GitHub Actions.

Ele ainda não representa a plataforma V1 completa descrita no PDF de escopo.

Documentos canônicos do estado atual:

- `docs/system-map.md`
- `docs/scope-v1-gap-analysis.md`
- `SPRINT_STATUS.md`
- `docs/ARCHITECTURE_DETAILED.md`

## Stack

- Node.js 20+
- pnpm 9+
- TypeScript
- NestJS para API
- Next.js 14 para Web
- Tailwind CSS
- SQL Server externo
- Supabase consumido diretamente em partes da Web
- Docker Compose para desenvolvimento e produção
- GHCR para imagens
- GitHub Actions para deploy na VPS

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

Arquivos de ambiente versionados de referência:

- `infra/env/.env.example`
- `infra/env/.env.production.example`

## Checklist de setup local

- [ ] Instalar Node.js 20 ou superior
- [ ] Instalar pnpm 9 ou superior
- [ ] Instalar Docker e Docker Compose, se usar ambiente containerizado
- [ ] Clonar o repositório
- [ ] Rodar `pnpm install`
- [ ] Rodar `pnpm verify:workspace`
- [ ] Rodar `pnpm verify:docker`
- [ ] Rodar `pnpm verify:docs`
- [ ] Subir API com `pnpm dev:api`
- [ ] Subir Web com `pnpm dev:web`
- [ ] Validar `http://localhost:3000`
- [ ] Validar `http://localhost:3001/health`
- [ ] Validar `http://localhost:3001/docs`
- [ ] Opcionalmente usar `pnpm docker:dev`

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

```bash
pnpm docker:dev
pnpm docker:dev:logs
pnpm docker:dev:down
```

## Produção / VPS

Artefatos de produção:

```text
infra/docker/docker-compose.prod.yml
infra/docker/api.prod.Dockerfile
infra/docker/web.prod.Dockerfile
.github/workflows/deploy-vps.yml
```

O deploy automatizado está descrito em:

- `docs/deploy-vps.md`
- `docs/devops.md`
- `docs/environment.md`

## Arquitetura e monorepo

```text
apps/
  api/      # API NestJS
  web/      # Web Next.js
packages/
  shared/   # reservado para contratos/utilitários compartilhados
  ui/       # reservado para componentes compartilhados
docs/       # documentação técnica e análise de escopo
infra/      # Dockerfiles, Compose e env examples
scripts/    # validações estruturais
supabase/   # migrations e políticas
```

Fluxo real atual:

```text
Web Next.js -> API NestJS -> SQL Server externo
          \-> Supabase direto
```

## Decisões arquiteturais

As ADRs ficam em `docs/decisions`:

- ADR-0001 - Monorepo
- ADR-0002 - Tooling de qualidade
- ADR-0003 - API NestJS
- ADR-0004 - Web Next.js
- ADR-0005 - Design system base
- ADR-0006 - Docker Compose dev

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
pnpm dev:api
pnpm dev:web
pnpm docker:dev
pnpm docker:prod
```

## Variáveis de ambiente

A referência de variáveis está em `docs/environment.md`.

## Documentação complementar

- `docs/system-map.md`: inventário canônico do sistema
- `docs/scope-v1-gap-analysis.md`: comparação formal entre escopo V1 e estado real
- `SPRINT_STATUS.md`: status verificado do projeto
- `docs/ARCHITECTURE_DETAILED.md`: arquitetura real consolidada
- `docs/architecture.md`: resumo arquitetural
- `docs/api.md`: API realmente implementada
- `docs/web.md`: visão da aplicação web
- `docs/frontend.md`: comportamento do frontend
- `docs/reports.md`: módulo de relatórios no estado atual
- `docs/setup.md`: onboarding local
- `docs/design-system.md`: base visual
- `docs/devops.md`: Docker e operações
- `docs/environment.md`: variáveis de ambiente
- `docs/deploy-vps.md`: deploy via GitHub Actions + GHCR + SSH
- `docs/quality.md`: qualidade e validações

## Troubleshooting

### Porta em uso

Ajuste `API_PORT`, `WEB_PORT`, `REDIS_PORT` ou `NGINX_PORT` conforme o ambiente.

### Dependências inconsistentes

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Docker falhando por ambiente incorreto

Valide se o arquivo de ambiente usado corresponde ao contexto:

- `infra/env/.env.example` para desenvolvimento
- `infra/env/.env.production` na VPS

### SQL Server indisponível

Valide:

- credenciais `SQLSERVER_*`;
- conectividade da instância externa;
- `GET http://localhost:3001/health/sql`.

### Supabase indisponível

Partes da Web dependem de:

- `kpis`
- `sectors`
- `export_jobs`
- `notifications`
- `system_settings`

Sem essas integrações, dashboard, notificações, exportações e settings podem degradar ou ficar vazios.

## Segurança

- Nunca versionar `.env` real.
- Nunca commitar tokens, senhas ou strings de conexão.
- A API usa JWT, `bcrypt` e consultas parametrizadas ao SQL Server.
- A Web ainda usa sessão em `localStorage`, o que deve ser tratado como limitação do estado atual.
- O PDF V1 prevê camadas adicionais como 2FA/TOTP, CSRF e CSP, mas elas não estão implementadas hoje.
