# Arquitetura Atual

## Objetivo

Esta é a visão resumida da arquitetura realmente existente no repositório.
Para detalhes completos, consulte `docs/ARCHITECTURE_DETAILED.md`.

## Visão geral

```text
apps/web  -->  apps/api  --> SQL Server externo
    |
    +-------> Supabase direto
```

Leitura correta do desenho atual:

- a Web usa a API NestJS para autenticação, administração e relatórios;
- a Web também acessa o Supabase diretamente para dashboard, exportações, notificações e settings;
- a API usa SQL Server para executar relatórios;
- parte do domínio administrativo da API ainda está em memória.

## Componentes

### Web (`apps/web`)

- Next.js 14 com App Router;
- telas públicas de auth;
- área autenticada sob `/app`;
- dashboard inicial, relatórios, exportações, notificações e admin.

### API (`apps/api`)

- NestJS 10 com Swagger;
- módulos reais: auth, admin, reports, health, validation-test e sql-server;
- endpoints REST para auth, usuários, grupos e relatórios.

### Dados

- SQL Server: consultas de relatórios executadas pela API;
- Supabase: KPIs, setores, notifications, export_jobs e system_settings lidos direto pela Web;
- memória do processo: usuários, grupos e definições de relatórios em partes da API;
- `localStorage`: sessão do frontend.

## Divergências relevantes em relação ao escopo V1

Não fazem parte da arquitetura implementada hoje:

- Prisma;
- React Query;
- Recharts/Chart.js;
- BullMQ;
- S3;
- cache Redis funcional;
- editor de dashboards;
- exportação backend PDF/Excel;
- 2FA/TOTP;
- módulo dedicado de auditoria.

## Implicações

- o sistema não deve ser documentado como plataforma BI completa;
- a arquitetura atual é híbrida e fragmentada;
- parte do produto já é navegável e funcional;
- a comparação formal com o escopo está em `docs/scope-v1-gap-analysis.md`.
