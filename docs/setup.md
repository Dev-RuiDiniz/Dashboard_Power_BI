# Setup

## Objetivo

Este guia descreve o onboarding real do monorepo no estado atual do repositório.

## Pré-requisitos

- Node.js 20.11 ou superior
- pnpm 9 ou superior
- Docker Desktop opcional
- acesso a um SQL Server válido para os fluxos de relatórios
- credenciais do Supabase para as telas que ainda leem dados direto no frontend

## Instalação

```bash
pnpm install
pnpm verify:workspace
pnpm verify:docker
pnpm verify:docs
pnpm quality
```

## Desenvolvimento sem Docker

Terminal 1:

```bash
pnpm dev:api
```

Terminal 2:

```bash
pnpm dev:web
```

## Desenvolvimento com Docker

```bash
pnpm docker:dev
pnpm docker:dev:logs
pnpm docker:dev:down
```

## URLs locais

- Web: `http://localhost:3000`
- Design system: `http://localhost:3000/design-system`
- API: `http://localhost:3001`
- Health: `http://localhost:3001/health`
- Swagger: `http://localhost:3001/docs`

## Observações

- O arquivo `infra/env/.env.example` existe neste clone e é a base para `docker:dev`.
- O projeto ainda depende de uma arquitetura híbrida: API NestJS para auth, admin e relatórios; Supabase direto em partes da Web.
