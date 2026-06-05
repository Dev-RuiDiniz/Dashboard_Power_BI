# Aplicação Web

## Objetivo

Este documento descreve a aplicação `apps/web` como ela funciona hoje.

## Visão geral

A Web é uma aplicação Next.js 14 com App Router.
Hoje ela entrega:

- telas públicas de autenticação;
- área autenticada baseada em sessão local;
- dashboard inicial com KPIs;
- catálogo e execução de relatórios;
- admin básico;
- páginas de exportações, notificações e configurações.

## Rotas reais

### Públicas

```text
/
/login
/forgot-password
/reset-password
/design-system
```

### Autenticadas

```text
/app
/app/reports
/app/exports
/app/notifications
/app/admin
/app/admin/users
/app/admin/groups
/app/admin/settings
```

## Como a Web busca dados

Hoje existem dois fluxos:

### Via API NestJS

- login e recuperação de senha;
- usuários;
- grupos;
- catálogo de relatórios;
- detalhe e execução de relatórios.

### Via Supabase direto

- `kpis`;
- `sectors`;
- `export_jobs`;
- `notifications`;
- `system_settings`.

Isso significa que a Web não opera sobre um backend único.

## Áreas funcionais

### Autenticação

Evidências:

- `apps/web/src/components/auth/*`
- `apps/web/src/lib/auth/api.ts`
- `apps/web/src/lib/auth/session.ts`

O sistema hoje faz:

- login por e-mail e senha;
- recuperação de senha;
- redefinição por token;
- armazenamento da sessão no navegador;
- proteção client-side das rotas sob `/app`.

### Dashboard

Evidências:

- `apps/web/src/app/app/page.tsx`
- `apps/web/src/components/dashboard/dashboard-home.tsx`

O sistema hoje faz:

- busca KPIs e setores no Supabase;
- calcula resumo agregado;
- exibe cards de KPI e tabela por setor;
- usa fallback local quando não encontra dados válidos.

### Relatórios

Evidências:

- `apps/web/src/app/app/reports/page.tsx`
- `apps/web/src/components/reports/*`

O sistema hoje faz:

- lista relatórios autorizados;
- permite filtrar;
- mostra metadados do item selecionado;
- executa consulta via API;
- renderiza resultado em tabela.

### Administração

Evidências:

- `apps/web/src/app/app/admin/*`
- `apps/web/src/components/admin/*`

O sistema hoje faz:

- hub administrativo;
- tela de usuários;
- tela de grupos;
- leitura de configurações do sistema.

### Exportações e notificações

Evidências:

- `apps/web/src/components/exports/exports-list.tsx`
- `apps/web/src/components/notifications/notifications-list.tsx`

O sistema hoje faz:

- consulta exportações no Supabase;
- consulta notificações no Supabase;
- marca notificações como lidas.

## Limitações reais da Web

- não existe `/app/profile`;
- não existe rota dedicada `/app/reports/[id]`;
- não existe tela web para `/admin/reports`;
- não existe editor de dashboards;
- não existe tela de logs;
- não existe gestão de permissões dedicada;
- não há realtime de notificações;
- não há exportação backend disparada a partir da Web.

## Stack realmente usada

- Next.js 14;
- React 18;
- TypeScript;
- Tailwind CSS;
- `@supabase/supabase-js`;
- `zod`;
- `lucide-react`.

Não encontrados em uso real no frontend atual:

- React Query;
- Recharts;
- Chart.js;
- React Hook Form;
- ExcelJS.

## Comandos úteis

```bash
pnpm dev:web
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web build
pnpm --filter @dashboard-power-bi/web typecheck
```
