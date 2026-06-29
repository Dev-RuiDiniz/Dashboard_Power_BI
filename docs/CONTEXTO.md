# CONTEXTO.md — Contexto Vivo do Projeto

**Projeto:** Dashboard Power BI
**Atualizado em:** 2026-06-28
**Responsável pela atualização:** Agente IA / Desenvolvedor

---

## 1. Resumo Executivo

O Dashboard Power BI é uma plataforma web interna de relatórios e BI em estado funcional parcial. O sistema entrega autenticação com JWT, dashboard com KPIs e gráficos Recharts, catálogo e execução de relatórios via SQL Server, administração de usuários/grupos/permissões, auditoria, exportações com pipeline real, notificações, settings e dashboards personalizados com editor visual mínimo. O estado atual está abaixo do escopo V1 completo descrito no PDF original, com lacunas principais em BI avançado (drill-down multi-dimensão, editor visual completo), hardening de segurança (2FA obrigatório para admins, blacklist de tokens) e persistência (BullMQ/Redis, cache de queries). O principal risco técnico é a dependência de fallback em memória quando Supabase não está configurado.

---

## 2. Estado Atual do Projeto

| Área           | Status            | Observações                                                                            |
| -------------- | ----------------- | -------------------------------------------------------------------------------------- |
| Backend        | Funcional parcial | NestJS com 9 módulos ativos no AppModule; repositórios híbridos (Supabase + memória)   |
| Frontend       | Funcional parcial | Next.js 14 com 18 telas implementadas (11 concluídas, 5 parciais, 2 com lacunas)       |
| Banco de dados | Funcional parcial | 8 migrations Supabase aplicadas; SQL Server externo para relatórios                    |
| Testes         | Estável           | `pnpm test`, `pnpm typecheck`, `pnpm build` passando; E2E não configurado              |
| Infraestrutura | Funcional         | Docker Compose dev/prod; GitHub Actions para deploy VPS                                |
| Documentação   | Atualizada        | Governança consolidada na raiz em 2026-06-28                                           |
| Segurança      | Parcial           | JWT, bcrypt, CSRF, headers de segurança, 2FA opcional; hardening final pendente        |
| BI             | Parcial           | KPIs, charts Recharts, drill-down por sector, dashboards personalizados, editor mínimo |

---

## 3. Histórico de Desenvolvimento

### 2026-06-28 — Consolidação de Governança do Repositório

- **O que foi analisado:** Estrutura completa do repositório, runtime real (app.module.ts, migrations, docs existentes), escopo V1 do PDF, análise de aderência, roadmap existente.
- **O que foi decidido:**
  - Consolidar arquivos de governança na raiz como fontes canônicas únicas.
  - Converter `docs/architecture.md` e `HANDOFF.md` em stubs apontando para os novos arquivos.
  - Remover referências a `SPRINT_STATUS.md` (arquivo inexistente).
  - Mesclar estruturas do AGENTS.md (preservar regras atuais + adicionar SDD, TDD, checklist, conduta).
- **O que foi criado:**
  - `ARQUITETURA.md` — arquitetura completa do sistema.
  - `BANCO_DADOS.md` — arquitetura completa do banco de dados.
  - `ESCOPO.md` — escopo consolidado do projeto.
  - `CONTEXTO.md` — contexto vivo do projeto (este arquivo).
  - `RELATORIO.md` — registro diário de desenvolvimento.
- **O que foi alterado:**
  - `AGENTS.md` — mesclagem de estruturas, remoção de referências a SPRINT_STATUS.md e HANDOFF.md.
  - `ROADMAP.md` — adição de convenções de status, backlog geral, matriz SDD/TDD e definição de pronto.
- **O que ficou pendente:**
  - Validar com `pnpm verify:docs`.
- **Evidências no repositório:** Novos arquivos na raiz; AGENTS.md e ROADMAP.md atualizados; docs/architecture.md e HANDOFF.md convertidos em stubs; README.md atualizado.

### 2026-06-10 — Entrega do Dashboard Administrativo e Editor Visual Mínimo

- **O que foi analisado:** Necessidade de dashboard admin com KPIs reais e editor visual de dashboards.
- **O que foi decidido:**
  - Implementar dashboard admin com métricas operacionais reais (total de usuários, ativos, grupos, exportações).
  - Implementar editor visual mínimo com reordenação drag-and-drop via `@dnd-kit/sortable`.
- **O que foi criado:**
  - `apps/api/src/admin/dashboard/admin-dashboard.service.ts` e controller.
  - `apps/web/src/components/dashboard/sortable-widget-card.tsx` (wrapper DnD).
  - `apps/api/src/platform/dashboards/dto/reorder-widgets.dto.ts`.
  - Endpoint `PATCH /dashboards/:id/widgets/reorder`.
- **O que foi alterado:**
  - `apps/web/src/components/dashboard/dashboard-detail.tsx` (modo edição + DnD).
  - `apps/web/src/components/dashboard/widget-card.tsx` (card extraído).
- **O que ficou pendente:**
  - Redimensionamento de widgets.
  - Canvas livre / grid de 12 colunas interativo.
  - Versões de dashboard.
  - Gráficos de tendência no dashboard admin.

### 2026-06-07 — Persistência de Definições de Relatórios e Favoritos

- **O que foi decidido:**
  - Garantir unicidade lógica das definições de relatório (source_name + sector).
  - Criar `api_favorite_reports` alinhada ao contrato da API.
- **O que foi criado:**
  - `supabase/migrations/20260607113000_005_report_definitions_unique_source_sector.sql`.
  - `supabase/migrations/20260607183000_006_api_favorite_reports.sql`.

### 2026-06-05 — Centralização da API e Persistência Supabase

- **O que foi decidido:**
  - API NestJS como fonte oficial de todos os fluxos autenticados.
  - Frontend deixa de depender de leituras diretas do Supabase.
  - Sessão web migra de `localStorage` para `sessionStorage`.
  - Persistência de plataforma via Supabase com fallback em memória.
- **O que foi criado:**
  - `PlatformModule`, `PermissionsModule`, `AuditModule`, `CommonModule` integrados ao AppModule.
  - Migrations 004-006 (api_platform_tables, permissions_table, audit_logs_table).
  - Endpoints `GET /auth/me`, `PATCH /auth/me/password`.
  - Middleware CSRF e headers de segurança.
  - Tela de perfil do usuário (`/app/profile`).
  - Tela de gestão de permissões (`/app/admin/permissions`).
  - Tela de auditoria (`/app/admin/audit`).
  - React Query integrado ao frontend.
- **O que foi alterado:**
  - `apps/web/src/lib/auth/session.ts` — sessionStorage + refresh automático único em 401.
  - `apps/api/src/app.module.ts` — novos módulos adicionados.

### 2026-06-04 — Fundação Técnica (Fase 0)

- **O que foi decidido:**
  - Monorepo pnpm com apps/api e apps/web.
  - NestJS como backend, Next.js 14 como frontend.
  - Docker Compose para dev e prod.
  - GitHub Actions para CI/CD.
  - Supabase como persistência de plataforma.
  - SQL Server como origem de leitura para relatórios.
- **O que foi criado:**
  - Estrutura de monorepo, Dockerfiles, docker-compose.
  - Migrations 001-003 (auth, reports/dashboards, exports/settings).
  - API NestJS com auth, admin, reports, health.
  - Web Next.js com login, dashboard, relatórios, admin básico.
  - ADRs em `docs/decisions/`.

---

## 4. Decisões Técnicas e Arquiteturais

| Data       | Decisão                                                      | Motivo                                              | Impacto                                                                                                                   | Status |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------ |
| 2026-06-04 | Monorepo pnpm com apps/api e apps/web                        | Organização e compartilhamento de configs           | Estrutura base do projeto                                                                                                 | Ativa  |
| 2026-06-04 | NestJS como API backend                                      | Framework modular TypeScript com DI                 | ADR-0003                                                                                                                  | Ativa  |
| 2026-06-04 | Next.js 14 App Router como frontend                          | SSR/SSG, SEO, ecossistema React                     | ADR-0004                                                                                                                  | Ativa  |
| 2026-06-04 | Docker Compose para dev e prod                               | Padronização de ambiente                            | ADR-0006                                                                                                                  | Ativa  |
| 2026-06-04 | Supabase como persistência de plataforma                     | PostgreSQL gerenciado com RLS                       | Repositórios híbridos                                                                                                     | Ativa  |
| 2026-06-04 | SQL Server como origem de leitura (somente SELECT/EXEC)      | Segurança e isolamento                              | Camada `sql-server/*`                                                                                                     | Ativa  |
| 2026-06-05 | Centralização na API como fonte oficial                      | Eliminar dependência direta do frontend no Supabase | Frontend consome apenas API                                                                                               | Ativa  |
| 2026-06-05 | Sessão web em sessionStorage                                 | Segurança de sessão                                 | Migração de legado + refresh em 401                                                                                       | Ativa  |
| 2026-06-05 | Recharts para gráficos                                       | Biblioteca React para charts interativos            | Componentes em `components/charts/`                                                                                       | Ativa  |
| 2026-06-05 | React Query para data fetching                               | Cache, sync e refetch automático                    | `@tanstack/react-query` no layout                                                                                         | Ativa  |
| 2026-06-05 | 2FA/TOTP com otplib                                          | Segurança de autenticação                           | Setup, verify, disable, login TOTP                                                                                        | Ativa  |
| 2026-06-11 | BullMQ + Redis para pipeline de exports                      | Fila assíncrona com fallback em memória             | Queue + Worker com ioredis                                                                                                | Ativa  |
| 2026-06-10 | @dnd-kit/sortable para editor visual                         | Drag-and-drop acessível e modular                   | Reordenação de widgets                                                                                                    | Ativa  |
| 2026-06-28 | Consolidação de governança na raiz                           | Fontes canônicas únicas de documentação             | 7 arquivos de governança na raiz                                                                                          | Ativa  |
| 2026-06-28 | Correção do CSRF middleware (F-C01)                          | Desbloquear operações state-changing na API         | cookie-parser, CORS credentials, header x-csrf-token no frontend, exclusões de rotas auth                                 | Ativa  |
| 2026-06-28 | Correção do refresh token para todos os usuários (F-C02)     | Desbloquear renovação de sessão para não-demos      | `findAllActive()` no repositório, remoção de `getUsersWithActiveSessions`                                                 | Ativa  |
| 2026-06-28 | Correção do path traversal no download de exports (F-C03)    | Prevenir leitura arbitrária de arquivos do servidor | Validação de fileName (regex UUID+ext), `path.resolve()` + `relative()` contra storageDir                                 | Ativa  |
| 2026-06-28 | Correção do timing attack no JWT (F-C04)                     | Prevenir forja de tokens via análise de tempo       | `crypto.timingSafeEqual` na comparação de assinatura JWT                                                                  | Ativa  |
| 2026-06-29 | Correção do @Query por @Param no AuditController (F-A01)     | Rota GET /admin/audit/:id funcionar corretamente    | Troca de `@Query('id')` por `@Param('id')`                                                                                | Ativa  |
| 2026-06-29 | TwoFactorGuard inconsistente entre controllers admin (F-A02) | Padronizar exigência de 2FA em todas rotas admin    | `TwoFactorGuard` adicionado em `SettingsController`, `PermissionsController` e `AuditController`                          | Ativa  |
| 2026-06-29 | DTOs com class-validator no dashboards controller (F-A03)    | Validar payload dos endpoints de dashboards         | 5 DTOs criados: `CreateDashboardDto`, `UpdateDashboardDto`, `CreateWidgetDto`, `UpdateWidgetDto`, `BatchUpdateWidgetsDto` | Ativa  |
| 2026-06-29 | Alinhar contrato batch update widgets (F-A04)                | Batch update funcionar entre frontend e backend     | Backend agora aceita `{ items: [...] }` via `BatchUpdateWidgetsDto`                                                       | Ativa  |
| 2026-06-29 | DTO com whitelist de keys no settings (F-A05)                | Prevenir modificação de settings sensíveis          | `UpdateSettingDto` com `@IsIn(ALLOWED_SETTING_KEYS)` e `@IsObject()` no value                                             | Ativa  |
| 2026-06-29 | Correção do memory mode em exports (F-A06)                   | Download funcionar em modo desenvolvimento          | `ensureMockFile()` gera arquivo mock no storageDir com conteúdo válido por extensão                                       | Ativa  |
| 2026-06-29 | CORS via env var (F-A07)                                     | Frontend acessar API em produção                    | `CORS_ORIGINS` env var com fallback para localhost (já implementado na sessão F-C01)                                      | Ativa  |

---

## 5. Decisões de Produto e Escopo

| Data       | Decisão                                    | Motivo                     | Impacto                                     |
| ---------- | ------------------------------------------ | -------------------------- | ------------------------------------------- |
| 2026-06-04 | V1 é single-tenant                         | Simplificação do MVP       | Sem multi-tenancy nesta versão              |
| 2026-06-04 | V1 conecta apenas ao SQL Server            | Foco no banco do cliente   | Oracle/MySQL no roadmap V2                  |
| 2026-06-04 | App mobile fora do V1                      | Foco no web responsivo     | Mobile no roadmap V2 (PWA ou React Native)  |
| 2026-06-05 | 2FA opcional (não obrigatório para admins) | Facilitar adoção inicial   | Risco de segurança a ser revisado na Fase 4 |
| 2026-06-10 | Editor visual mínimo (apenas reordenação)  | Entregar valor incremental | Redimensionamento e paleta como débito      |

---

## 6. Pendências Atuais

| Pendência                                                  | Área           | Prioridade | Próxima ação                                          |
| ---------------------------------------------------------- | -------------- | ---------- | ----------------------------------------------------- |
| Editor visual completo (redimensionamento, paleta, canvas) | BI             | Alta       | Especificar T16b com SDD                              |
| Drill-down multi-dimensão                                  | BI             | Média      | Adicionar dimensões de tempo, produto, região         |
| 2FA obrigatório para admins                                | Segurança      | Alta       | 2FA/TOTP opcional já implementado; forçar para admins |
| Hardening final de sessão                                  | Segurança      | Alta       | Blacklist de tokens + invalidação em massa            |
| Herança de permissões via grupos                           | Permissões     | Média      | Implementar agregação de permissões                   |
| Cache de queries SQL Server                                | SQL Server     | Média      | Implementar cache com TTL                             |
| BullMQ + Redis para exports                                | Exports        | Concluído  | Implementado com fallback em memória                  |
| Testes E2E (Playwright)                                    | Qualidade      | Média      | Configurar Playwright para fluxos críticos            |
| Política de retenção de logs (LGPD)                        | Segurança/LGPD | Alta       | Definir retenção e job de limpeza                     |
| Storage S3 para exports                                    | Exports        | Baixa      | Avaliar necessidade de storage externo                |

---

## 7. Bloqueios

| Bloqueio              | Severidade | Descrição                              | Dependência |
| --------------------- | ---------- | -------------------------------------- | ----------- |
| Nenhum bloqueio ativo | —          | O projeto está operacional e evoluindo | —           |

---

## 8. Riscos Técnicos

| Risco                                                    | Impacto | Mitigação                                    |
| -------------------------------------------------------- | ------- | -------------------------------------------- |
| Fallback em memória perde dados ao reiniciar             | Alto    | Garantir Supabase configurado em produção    |
| Fila em memória não suporta múltiplas instâncias         | Baixo   | BullMQ + Redis já implementados com fallback |
| `pnpm typecheck` falha sem artefatos de build do Next.js | Baixo   | Rodar `pnpm build` antes do typecheck        |
| LGPD não tratada explicitamente                          | Alto    | Definir política de retenção e exclusão      |
| 2FA opcional para admins                                 | Médio   | Forçar 2FA para admins (DT-001)              |
| Sem testes E2E                                           | Médio   | Implementar Playwright                       |

---

## 9. Próximos Passos

1. Validar com `pnpm verify:docs`.
2. Commit da onda de governança: `docs(governanca): adiciona documentacao estrutural do repositorio`.
3. Iniciar Fase 3: Editor visual drag-and-drop completo (T16b).
4. Implementar 2FA obrigatório para admins (DT-001).
5. Implementar hardening final de sessão (DT-002).

---

## 10. Notas Importantes para Próximos Agentes

- Sempre ler este arquivo antes de trabalhar.
- Sempre atualizar este arquivo ao final da sessão.
- Não remover histórico antigo.
- Registrar decisões, bloqueios e mudanças de direção.
- O `AGENTS.md` é a fonte de regras de execução; este arquivo é a fonte de contexto e histórico.
- O `ROADMAP.md` é a fonte única de direção do projeto.
- O `RELATORIO.md` é o registro diário do que foi feito.
- Prevalece sempre o runtime atual sobre documentação antiga ou expectativas do PDF.
