# Arquitetura inicial

## Contexto

O Dashboard Power BI é uma plataforma web para centralizar relatórios, dashboards interativos, permissões por setor, exportações e administração.

## Visão geral

```text
apps/web  ->  apps/api  -> Redis
                       -> SQL Server externo
packages/shared
packages/ui
infra/docker
docs
```

## Monorepo

O projeto usa `pnpm workspaces` para organizar aplicações e pacotes internos.

```text
apps/
  api/
  web/
packages/
  shared/
  ui/
docs/
infra/
scripts/
```

## Aplicações

### API — `apps/api`

Backend NestJS com:

- bootstrap em TypeScript;
- `ConfigModule` global;
- `ValidationPipe` global;
- Swagger em `/docs`;
- healthcheck em `/health`;
- testes unitários e e2e com Jest/Supertest.

### Web — `apps/web`

Frontend Next.js 14 com:

- App Router;
- Tailwind CSS;
- layout global;
- providers;
- home inicial;
- design system base;
- preview visual em `/design-system`.

## Infraestrutura local

A infraestrutura de desenvolvimento fica em `infra/docker`.

Serviços atuais:

- API;
- Web;
- Redis.

SQL Server é externo e configurado por variáveis de ambiente.

## Qualidade

A base de qualidade inclui:

- ESLint;
- Prettier;
- TypeScript strict;
- Husky;
- lint-staged;
- commitlint;
- validações estruturais de workspace, Docker e documentação.

## Decisões

As decisões ficam registradas em ADRs dentro de `docs/decisions`.

## Segurança

- `.env` real não deve ser versionado.
- Secrets devem ficar fora do repositório.
- Logs não devem conter credenciais.
- SQL Server externo deve ser configurado por variáveis seguras.
