# Mapeamento Canônico do Sistema

## Objetivo deste documento

Este documento descreve o estado real do repositório em `2026-06-05`.
Ele é a referência canônica para:

- módulos existentes na Web e na API;
- rotas realmente expostas;
- endpoints realmente implementados;
- integrações externas em uso;
- mapa de persistência atual;
- limitações e soluções provisórias confirmadas no código.

Use este arquivo junto com:

- `docs/scope-v1-gap-analysis.md` para comparar código x escopo do PDF V1;
- `SPRINT_STATUS.md` para o resumo executivo do que está implementado, parcial e ausente;
- `docs/ARCHITECTURE_DETAILED.md` para a arquitetura consolidada do que existe hoje.

## Visão geral

O repositório é um monorepo `pnpm` com duas aplicações:

- `apps/web`: frontend em Next.js 14 com App Router;
- `apps/api`: backend em NestJS com API REST e Swagger.

Também existem:

- `supabase/migrations`: esquema e políticas para tabelas usadas pela Web e por integrações futuras;
- `packages/shared`: espaço reservado para tipos/utilitários compartilhados;
- `packages/ui`: espaço reservado para componentes compartilhados;
- `infra/docker`: Dockerfiles e Compose para desenvolvimento local.

## O que o sistema faz hoje

Hoje o projeto entrega um recorte funcional de autenticação, administração básica e consulta de relatórios:

1. A Web autentica usuários via API própria.
2. A Web protege rotas internas com sessão salva em `localStorage`.
3. A Web lista relatórios, exibe detalhes e executa consultas via API.
4. A API gerencia usuários, grupos e definições administrativas de relatórios.
5. A API executa consultas parametrizadas em SQL Server.
6. Partes da Web leem dados diretamente do Supabase para dashboard, exportações, notificações e configurações.

Não há hoje implementação end-to-end de editor de dashboards, exportação backend, 2FA/TOTP, fila assíncrona, auditoria dedicada nem dashboards personalizados persistidos pela aplicação.

## Estrutura real do monorepo

```text
apps/
  api/                    API NestJS
  web/                    Aplicação Next.js
docs/                     Documentação técnica
infra/                    Docker e arquivos de infraestrutura
packages/
  shared/                 Reservado para contratos compartilhados
  ui/                     Reservado para componentes compartilhados
scripts/                  Scripts de verificação
supabase/
  migrations/             Estrutura SQL e políticas do Supabase
```

## Web: módulos e rotas reais

### Rotas públicas

| Rota               | Estado       | Evidência                                   | Observação                                                          |
| ------------------ | ------------ | ------------------------------------------- | ------------------------------------------------------------------- |
| `/`                | implementado | `apps/web/src/app/page.tsx`                 | Página institucional do projeto.                                    |
| `/login`           | implementado | `apps/web/src/app/login/page.tsx`           | Formulário que consome `POST /auth/login`.                          |
| `/forgot-password` | implementado | `apps/web/src/app/forgot-password/page.tsx` | Solicita recuperação de senha via API.                              |
| `/reset-password`  | implementado | `apps/web/src/app/reset-password/page.tsx`  | Redefinição por token via API.                                      |
| `/design-system`   | implementado | `apps/web/src/app/design-system/page.tsx`   | Vitrine de componentes, sem relação direta com escopo funcional V1. |

### Rotas autenticadas

As rotas abaixo ficam sob `apps/web/src/app/app` e dependem de sessão local validada pelo `AuthGuard`.

| Rota                  | Estado       | Evidência                                      | Observação                                                                     |
| --------------------- | ------------ | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `/app`                | implementado | `apps/web/src/app/app/page.tsx`                | Dashboard inicial com KPIs e setores lidos direto do Supabase.                 |
| `/app/reports`        | implementado | `apps/web/src/app/app/reports/page.tsx`        | Catálogo, filtros e execução de relatórios; o detalhe fica na mesma tela.      |
| `/app/exports`        | parcial      | `apps/web/src/app/app/exports/page.tsx`        | Lista histórico de exportações do Supabase, mas não aciona export via backend. |
| `/app/notifications`  | parcial      | `apps/web/src/app/app/notifications/page.tsx`  | Lista e marca notificações como lidas direto no Supabase.                      |
| `/app/admin`          | implementado | `apps/web/src/app/app/admin/page.tsx`          | Hub administrativo com atalhos.                                                |
| `/app/admin/users`    | implementado | `apps/web/src/app/app/admin/users/page.tsx`    | CRUD parcial de usuários via API.                                              |
| `/app/admin/groups`   | implementado | `apps/web/src/app/app/admin/groups/page.tsx`   | CRUD parcial de grupos via API.                                                |
| `/app/admin/settings` | parcial      | `apps/web/src/app/app/admin/settings/page.tsx` | Consulta configurações direto no Supabase; não há edição completa via backend. |

### Rotas ausentes em relação ao escopo V1

Estas rotas não existem como páginas dedicadas hoje:

- `/app/profile`
- `/app/reports/[id]`
- `/app/admin/reports`
- `/app/admin/dashboards`
- `/app/admin/dashboards/[id]/edit`
- `/app/admin/logs`
- qualquer rota dedicada a permissões finas por relatório/setor

## Web: módulos reais

### Autenticação

Evidências principais:

- `apps/web/src/components/auth/*`
- `apps/web/src/lib/auth/api.ts`
- `apps/web/src/lib/auth/session.ts`

O que faz hoje:

- login;
- recuperação de senha;
- redefinição de senha;
- persistência de sessão em `localStorage`;
- guarda de rotas do lado do cliente.

Limites atuais:

- não usa cookie seguro nem sessão server-side;
- não há 2FA/TOTP;
- não há integração com Supabase Auth;
- a expiração/renovação depende do fluxo JWT da API, mas a Web continua baseada em armazenamento local.

### Dashboard

Evidências principais:

- `apps/web/src/components/dashboard/dashboard-home.tsx`
- `apps/web/src/lib/kpis.ts`

O que faz hoje:

- carrega `kpis` e `sectors` do Supabase;
- calcula resumos e tendências;
- usa fallback local quando a consulta falha ou volta vazia.

Limites atuais:

- não há gráficos com biblioteca dedicada;
- não há drill-down;
- não há dashboards personalizados;
- não há editor visual.

### Relatórios

Evidências principais:

- `apps/web/src/components/reports/*`
- `apps/web/src/lib/reports-api.ts`

O que faz hoje:

- lista relatórios autorizados;
- permite filtrar por setor, categoria e parâmetros;
- exibe metadados do relatório selecionado;
- executa `POST /reports/:id/query`;
- renderiza os resultados em tabela.

Limites atuais:

- não existe rota própria de visualizador por ID;
- não há export PDF/Excel disparado pela API;
- não há visualização em gráfico;
- não há favoritos integrados ao frontend atual.

### Administração

Evidências principais:

- `apps/web/src/components/admin/*`

O que faz hoje:

- lista usuários;
- cria usuários;
- desativa usuários;
- redefine senha;
- lista grupos;
- cria grupos;
- remove grupos;
- lê configurações do sistema no Supabase.

Limites atuais:

- não existe gestão dedicada de permissões;
- não existe gestão administrativa de relatórios na Web, embora a API possua endpoints;
- não existe tela de logs de auditoria;
- não existe editor de dashboards.

### Exportações e notificações

Evidências principais:

- `apps/web/src/components/exports/exports-list.tsx`
- `apps/web/src/components/notifications/notifications-list.tsx`

O que faz hoje:

- lê `export_jobs` diretamente do Supabase;
- lê `notifications` diretamente do Supabase;
- marca notificações individualmente ou em lote como lidas.

Limites atuais:

- não existe pipeline de geração de export no backend;
- não há polling de job iniciado pela aplicação;
- não há realtime;
- o comportamento depende de dados já existentes no Supabase.

## API: módulos e endpoints reais

### Módulos NestJS

| Módulo                 | Evidência                      | Papel real                                                                 |
| ---------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| `AuthModule`           | `apps/api/src/auth`            | Login, refresh, logout, recuperação e redefinição de senha.                |
| `AdminModule`          | `apps/api/src/admin`           | CRUD de usuários e grupos.                                                 |
| `ReportsModule`        | `apps/api/src/reports`         | Catálogo de relatórios, endpoints administrativos e execução de consultas. |
| `HealthModule`         | `apps/api/src/health`          | Healthchecks da API e do SQL Server.                                       |
| `ValidationTestModule` | `apps/api/src/validation-test` | Endpoint técnico para validar pipes e DTOs.                                |
| `SqlServerModule`      | `apps/api/src/sql-server`      | Configuração, healthcheck e execução segura no SQL Server.                 |

Não há hoje módulos reais de:

- auditoria dedicada;
- exportação assíncrona;
- dashboards personalizados;
- notificações via API;
- BullMQ/Redis;
- WebSocket.

### Endpoints implementados

#### Autenticação

| Método e rota                | Evidência                              |
| ---------------------------- | -------------------------------------- |
| `POST /auth/login`           | `apps/api/src/auth/auth.controller.ts` |
| `POST /auth/forgot-password` | `apps/api/src/auth/auth.controller.ts` |
| `POST /auth/reset-password`  | `apps/api/src/auth/auth.controller.ts` |
| `POST /auth/refresh`         | `apps/api/src/auth/auth.controller.ts` |
| `POST /auth/logout`          | `apps/api/src/auth/auth.controller.ts` |

#### Testes de autorização

| Método e rota                      | Evidência                                    |
| ---------------------------------- | -------------------------------------------- |
| `GET /authz-test/view/:sector`     | `apps/api/src/auth/authz-test.controller.ts` |
| `GET /authz-test/download/:sector` | `apps/api/src/auth/authz-test.controller.ts` |
| `GET /authz-test/admin`            | `apps/api/src/auth/authz-test.controller.ts` |

#### Saúde

| Método e rota     | Evidência                                  |
| ----------------- | ------------------------------------------ |
| `GET /health`     | `apps/api/src/health/health.controller.ts` |
| `GET /health/sql` | `apps/api/src/health/health.controller.ts` |

#### Administração de usuários

| Método e rota                          | Evidência                                            |
| -------------------------------------- | ---------------------------------------------------- |
| `GET /admin/users`                     | `apps/api/src/admin/users/admin-users.controller.ts` |
| `GET /admin/users/:id`                 | `apps/api/src/admin/users/admin-users.controller.ts` |
| `POST /admin/users`                    | `apps/api/src/admin/users/admin-users.controller.ts` |
| `PATCH /admin/users/:id`               | `apps/api/src/admin/users/admin-users.controller.ts` |
| `PATCH /admin/users/:id/deactivate`    | `apps/api/src/admin/users/admin-users.controller.ts` |
| `POST /admin/users/:id/reset-password` | `apps/api/src/admin/users/admin-users.controller.ts` |
| `PUT /admin/users/:id/groups`          | `apps/api/src/admin/users/admin-users.controller.ts` |

#### Administração de grupos

| Método e rota              | Evidência                                              |
| -------------------------- | ------------------------------------------------------ |
| `GET /admin/groups`        | `apps/api/src/admin/groups/admin-groups.controller.ts` |
| `GET /admin/groups/:id`    | `apps/api/src/admin/groups/admin-groups.controller.ts` |
| `POST /admin/groups`       | `apps/api/src/admin/groups/admin-groups.controller.ts` |
| `PATCH /admin/groups/:id`  | `apps/api/src/admin/groups/admin-groups.controller.ts` |
| `DELETE /admin/groups/:id` | `apps/api/src/admin/groups/admin-groups.controller.ts` |

#### Administração de definições de relatórios

| Método e rota                         | Evidência                                                     |
| ------------------------------------- | ------------------------------------------------------------- |
| `POST /admin/reports`                 | `apps/api/src/reports/report-definitions.admin.controller.ts` |
| `GET /admin/reports`                  | `apps/api/src/reports/report-definitions.admin.controller.ts` |
| `GET /admin/reports/:id`              | `apps/api/src/reports/report-definitions.admin.controller.ts` |
| `PATCH /admin/reports/:id`            | `apps/api/src/reports/report-definitions.admin.controller.ts` |
| `PATCH /admin/reports/:id/deactivate` | `apps/api/src/reports/report-definitions.admin.controller.ts` |

#### Consumo de relatórios

| Método e rota             | Evidência                                    |
| ------------------------- | -------------------------------------------- |
| `GET /reports`            | `apps/api/src/reports/reports.controller.ts` |
| `GET /reports/:id`        | `apps/api/src/reports/reports.controller.ts` |
| `POST /reports/:id/query` | `apps/api/src/reports/reports.controller.ts` |

#### Endpoint técnico

| Método e rota           | Evidência                                                    |
| ----------------------- | ------------------------------------------------------------ |
| `POST /validation-test` | `apps/api/src/validation-test/validation-test.controller.ts` |

## Dependências externas reais

### API

Dependências confirmadas no código:

- `mssql` para SQL Server;
- `bcrypt` para hash de senha;
- `@nestjs/swagger` para Swagger;
- `class-validator` e `class-transformer` para DTOs;
- JWT via stack NestJS de autenticação.

Ausências relevantes no código atual:

- Prisma;
- BullMQ;
- Redis client em uso de aplicação;
- WebSocket;
- S3;
- fila assíncrona para export.

### Web

Dependências confirmadas no código:

- `next`, `react`, `react-dom`;
- `@supabase/supabase-js`;
- `zod`;
- `lucide-react`;
- Tailwind CSS.

Ausências relevantes no código atual:

- React Query;
- Recharts;
- Chart.js;
- React Hook Form;
- ExcelJS;
- Puppeteer;
- WeasyPrint.

## Mapa de persistência real

| Recurso                             | Onde persiste hoje           | Evidência                                                            | Observação                                                     |
| ----------------------------------- | ---------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| Sessão do frontend                  | `localStorage`               | `apps/web/src/lib/auth/session.ts`                                   | Persistência local no navegador.                               |
| Access token e refresh token da API | memória e fluxo JWT da API   | `apps/api/src/auth/*`                                                | Não há Redis funcional para sessão.                            |
| Usuários e grupos da API            | memória do processo          | `apps/api/src/admin/**/repositories`                                 | Repositórios em memória no backend atual.                      |
| Definições de relatórios da API     | memória do processo          | `apps/api/src/reports/repositories/report-definitions.repository.ts` | Catálogo administrativo não está persistido em banco pela API. |
| Dados de execução de relatórios     | SQL Server                   | `apps/api/src/sql-server/*` e `apps/api/src/reports/*`               | Consultas parametrizadas em fonte externa.                     |
| KPIs do dashboard                   | Supabase                     | `apps/web/src/components/dashboard/dashboard-home.tsx`               | Leitura direta pela Web.                                       |
| Setores do dashboard                | Supabase                     | `apps/web/src/components/dashboard/dashboard-home.tsx`               | Leitura direta pela Web.                                       |
| Histórico de exportações            | Supabase (`export_jobs`)     | `apps/web/src/components/exports/exports-list.tsx`                   | Apenas leitura no frontend.                                    |
| Notificações                        | Supabase (`notifications`)   | `apps/web/src/components/notifications/notifications-list.tsx`       | Leitura e update direto no frontend.                           |
| Configurações do sistema            | Supabase (`system_settings`) | `apps/web/src/components/admin/admin-settings.tsx`                   | Leitura direta no frontend.                                    |

## Limitações, desvios e soluções provisórias

### Mistura de estratégias de dados

Hoje a aplicação usa dois caminhos de dados:

- Web -> API NestJS para auth, admin e relatórios;
- Web -> Supabase direto para dashboard, exportações, notificações e settings.

Isso significa que não existe uma camada única de backend para toda a plataforma.

### Persistência parcial e em memória

Parte importante do domínio ainda está em memória no processo da API:

- usuários e grupos usados pelos fluxos administrativos;
- definições de relatórios.

Isso impede considerar essas funções como persistência consolidada de produção.

### Dashboard com fallback local

O dashboard inicial possui fallback de KPIs locais quando o Supabase não responde ou retorna vazio.
Esse comportamento mantém a tela utilizável, mas pode mascarar ausência de dados reais.

### Exportações sem pipeline de geração

A tela de exportações consulta registros no Supabase, porém:

- a API não expõe `POST /reports/:id/export`;
- a API não processa filas;
- a aplicação não gera arquivos PDF/Excel no backend.

Na prática, o módulo atual é um histórico/leitor, não um fluxo completo de export.

### Notificações sem backend próprio

As notificações existem apenas como leitura e atualização direta no Supabase.
Não há serviço dedicado na API nem emissão em tempo real.

### Arquivo de ambiente citado e ausente

A documentação histórica menciona `infra/env/.env.example`, mas o clone atual não contém esse arquivo.
Esse desvio precisa ser tratado como documentação desatualizada até que o arquivo seja recriado ou as docs sejam ajustadas.

## Resumo executivo do estado real

O projeto já possui base funcional para:

- autenticação com JWT;
- recuperação e redefinição de senha;
- administração básica de usuários e grupos;
- catálogo e execução de relatórios via SQL Server;
- dashboard inicial com KPIs do Supabase;
- leitura de notificações, exportações e settings no Supabase.

O projeto ainda não possui implementação end-to-end para partes centrais do escopo V1, como:

- 18 telas completas;
- dashboards personalizados e editor visual;
- exportação backend PDF/Excel;
- gestão dedicada de permissões;
- logs de auditoria;
- 2FA/TOTP;
- arquitetura prevista com Prisma, React Query, BullMQ, S3 e cache Redis funcional.
