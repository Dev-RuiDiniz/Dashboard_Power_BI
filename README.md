# Dashboard Power BI

Monorepo da plataforma Dashboard Power BI em estado funcional parcial.

## Visão geral

Este repositório já entrega uma base real de:

- autenticação com API NestJS;
- dashboard inicial;
- catálogo e execução de relatórios;
- administração básica de usuários e grupos;
- leitura de notificações, exportações e settings no Supabase.

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

Observação importante:

- scripts e docs históricas referenciam `infra/env/.env.example`;
- o arquivo não está presente no clone atual;
- use variáveis locais compatíveis com `docs/environment.md` até esse exemplo ser recriado no repositório.

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
- [ ] Opcionalmente tentar `pnpm docker:dev` se o ambiente local de env estiver compatível

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

O repositório mantém comandos Docker:

```bash
pnpm docker:dev
pnpm docker:dev:logs
pnpm docker:dev:down
```

Mas hoje existe um desvio conhecido:

- os scripts usam `infra/env/.env.example`;
- esse arquivo não está versionado no clone atual.

Se esse arquivo não for recriado localmente, os comandos de Docker exigirão ajuste manual.

## Arquitetura e monorepo

```text
apps/
  api/      # API NestJS
  web/      # Web Next.js
packages/
  shared/   # reservado para contratos/utilitários compartilhados
  ui/       # reservado para componentes compartilhados
docs/       # documentação técnica e análise de escopo
infra/      # Dockerfiles e Compose
scripts/    # validações estruturais
supabase/   # migrations e políticas
```

Fluxo real atual:

```text
Web Next.js -> API NestJS -> SQL Server externo
          \-> Supabase direto
```

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
pnpm dev:api
pnpm dev:web
pnpm docker:dev
```

## Variáveis de ambiente

A referência de variáveis está em `docs/environment.md`.

Desvio conhecido:

```text
infra/env/.env.example
```

Esse caminho é citado por scripts e documentação histórica, mas o arquivo não está presente no clone atual.

## Decisões arquiteturais

As ADRs ficam em `docs/decisions`:

- ADR-0001 — Monorepo
- ADR-0002 — Tooling de qualidade
- ADR-0003 — API NestJS
- ADR-0004 — Web Next.js
- ADR-0005 — Design system base
- ADR-0006 — Docker Compose dev

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
- `docs/devops.md`: Docker e operações locais
- `docs/environment.md`: variáveis de ambiente
- `docs/quality.md`: qualidade e validações

## Troubleshooting

### Porta em uso

Ajuste `API_PORT` e `WEB_PORT` nas variáveis locais.

### Dependências inconsistentes

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Docker falhando por arquivo de env ausente

O primeiro ponto a verificar é a ausência de:

```text
infra/env/.env.example
```

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
