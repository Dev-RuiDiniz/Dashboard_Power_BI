# ROADMAP — Módulos Funcionais (6 do Escopo V1)

**Metodologia:** SDD + TDD aplicados em cada módulo.

---

## Módulo AUTH — Autenticação e Segurança

```
Status: 🔄 Parcial (Fase 2 concluída, Fase 4 pendente)

SDD — Especificação Completa:
- Login com JWT access token + refresh token
- Recuperação e redefinição de senha com token temporário
- Rate limiting de tentativas de login (5 tentativas, bloqueio progressivo)
- Sessão web em sessionStorage com refresh automático único em 401
- Perfil do usuário: GET /auth/me, alteração de senha: POST /auth/me/password
- CSRF protection: token em cookie httpOnly + header x-csrf-token
- Headers de segurança: CSP, HSTS (prod), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- 2FA/TOTP para administradores (Time-based One-Time Password)
- Blacklist de tokens revogados
- Auditoria de eventos de auth (login, logout, falha, reset)

TDD — Testes:
- Unit: auth.service.spec.ts — login, refresh, logout, bcrypt comparison
- Unit: token.service.spec.ts — emissão e validação de JWT, expiry
- Unit: login-attempts.service.spec.ts — rate limiting, contagem, bloqueio
- Unit: csrf.middleware.spec.ts — validação de token, exclusão de rotas públicas
- Integration: auth.controller.spec.ts — todos os endpoints, códigos HTTP
- Integration: jwt-auth.guard.spec.ts — validação de token, extração de payload
- Integration: roles.guard.spec.ts — controle de acesso por role e setor
- Security: teste de CSRF com token inválido/ausente → deve retornar 403
- Security: verificação de headers de segurança em todas as respostas
- Security: teste de SQL injection em campos de login
- Manual: fluxo completo login → ação → logout → refresh expirado
- Comandos: pnpm test, pnpm typecheck, pnpm build

Entregáveis Concluídos:
✅ apps/api/src/auth/auth.controller.ts — POST /auth/login, POST /auth/refresh, POST /auth/logout
✅ apps/api/src/auth/auth.service.ts — login, refresh, logout, bcrypt
✅ apps/api/src/auth/services/token.service.ts — JWT emissão/validação
✅ apps/api/src/auth/services/password-reset.service.ts — forgot/reset password
✅ apps/api/src/auth/services/login-attempts.service.ts — rate limiting
✅ apps/api/src/auth/guards/jwt-auth.guard.ts — validação de JWT
✅ apps/api/src/auth/guards/roles.guard.ts — controle por role
✅ apps/api/src/auth/decorators/roles.decorator.ts — metadata de roles
✅ apps/api/src/auth/decorators/current-user.decorator.ts — extração de usuário
✅ apps/api/src/auth/dto/*.dto.ts — validação de entrada
✅ apps/api/src/auth/repositories/users.repository.ts — persistência híbrida
✅ apps/api/src/auth/repositories/refresh-token.repository.ts — sessões
✅ apps/api/src/common/middleware/csrf.middleware.ts — proteção CSRF
✅ apps/web/src/lib/auth/session.ts — sessionStorage, refresh automático
✅ apps/web/src/components/auth/login-form.tsx — UI de login

Débitos / Pendente:
📋 2FA/TOTP — otplib instalado, falta endpoints de ativação/verificação e UI
📋 Blacklist de tokens revogados
📋 Auditoria de eventos de auth (parcial — login já logado via audit)
📋 Hardening final de sessão (stratégia de invalidação em massa)
```

---

## Módulo PERMISSIONS — Permissões e Acesso

```
Status: 🔄 Parcial (Fase 2 concluída)

SDD — Especificação Completa:
- Roles fixas: viewer, downloader, admin
- Setores: financeiro, comercial, operações, diretoria
- Grupos de usuários com roles e setores agregados
- Permissões granulares: resource:scope:action (ex: reports:financeiro:read)
- CRUD de permissões com validação de código único
- Herança de permissões via grupos (usuário herda permissões dos grupos)
- Validação de acesso em cada endpoint (guard combinado: JWT + role + permission)
- Auditoria de alterações em permissões

TDD — Testes:
- Unit: permissions.service.spec.ts — CRUD, validações de código único
- Unit: permissions.repository.spec.ts — persistência híbrida, busca por código
- Unit: groups.service.spec.ts — herança de permissões, agregação
- Integration: permissions.controller.spec.ts — GET/POST/PATCH/DELETE /admin/permissions
- Integration: admin-users.service.spec.ts — associação de grupos a usuários
- Integration: roles.guard.spec.ts — validação combinada role + permission
- Manual: criar grupo → associar permissões → associar usuário → verificar acesso
- Comandos: pnpm test, pnpm typecheck

Entregáveis Concluídos:
✅ apps/api/src/permissions/permissions.controller.ts — CRUD /admin/permissions
✅ apps/api/src/permissions/permissions.service.ts — regras de negócio
✅ apps/api/src/permissions/repositories/permissions.repository.ts — persistência híbrida
✅ apps/api/src/permissions/dto/create-permission.dto.ts — validação
✅ apps/api/src/permissions/dto/update-permission.dto.ts — validação
✅ apps/api/src/permissions/entities/permission.entity.ts — tipos
✅ apps/api/src/permissions/permissions.module.ts — registro no AppModule
✅ apps/api/src/admin/groups/* — CRUD de grupos
✅ apps/web/src/components/admin/admin-permissions.tsx — UI
✅ apps/web/src/app/app/admin/permissions/page.tsx — rota
✅ supabase/migrations/20260605200000_005_permissions_table.sql — tabela

Débitos / Pendente:
📋 Herança de permissões via grupos (usuário herda permissões dos grupos que pertence)
📋 Guard combinado JWT + role + permission (hoje é apenas JWT + role)
📋 Regras mais finas de validação (escopo temporal, escopo de dados)
```

---

## Módulo SQL — Integração SQL Server

```
Status: 🔄 Parcial (Fase 1 concluída)

SDD — Especificação Completa:
- Conexão segura ao SQL Server via mssql
- Queries parametrizadas obrigatórias (nunca concatenar input do usuário)
- Validação de identificadores: whitelist de tabelas, views e stored procedures permitidas
- Proteção contra SQL injection em todos os níveis
- Somente leitura: SELECT e EXEC de SPs permitidas
- Cache de resultados com TTL configurável
- Monitoramento de performance de queries (tempo de execução, timeouts)
- Cron de refresh de dados agendado
- Fallback para memória quando SQL Server indisponível

TDD — Testes:
- Unit: sql-server.service.spec.ts — conexão, query parametrizada
- Unit: sql-query-builder.spec.ts — montagem segura de queries
- Integration: reports.controller.spec.ts — execução de relatórios via SQL Server
- Security: tentativa de SQL injection em parâmetros → deve ser neutralizada
- Security: tentativa de DROP/DELETE/UPDATE → deve ser rejeitada
- Performance: queries > 30s devem retornar timeout apropriado
- Manual: executar relatório com parâmetros complexos
- Comandos: pnpm test, pnpm typecheck

Entregáveis Concluídos:
✅ apps/api/src/sql-server/sql-server.module.ts — módulo NestJS
✅ apps/api/src/sql-server/sql-server.service.ts — conexão e queries
✅ apps/api/src/sql-server/sql-query-builder.ts — montagem segura
✅ apps/api/src/reports/reports.controller.ts — execução de relatórios
✅ Healthcheck: GET /health/sql — verificação de conectividade

Débitos / Pendente:
📋 Cache de resultados com TTL (Redis ou memória)
📋 Monitoramento de performance de queries
📋 Cron de refresh agendado
📋 Observabilidade (logs estruturados de queries)
```

---

## Módulo REPORTS — Relatórios

```
Status: 🔄 Parcial (Fase 1 base, Fase 3 pendente)

SDD — Especificação Completa:
- Catálogo de relatórios por setor com busca e filtros
- Visualização inline com parâmetros dinâmicos
- Execução de relatórios via SQL Server (views e stored procedures)
- Filtros avançados: texto, data, número, dropdown, operadores AND/OR
- Gestão administrativa de definições de relatórios
- Persistência real das definições (Supabase quando configurado)
- Favoritos por usuário
- Exportação: PDF, Excel, CSV, JSON com pipeline assíncrono
- Pipeline de export com fila (BullMQ), worker, polling de status
- Storage de arquivos gerados (S3 ou local)

TDD — Testes:
- Unit: reports-catalog.tsx — listagem, busca, filtros
- Unit: report-detail.tsx — parâmetros, execução, estados
- Unit: admin-reports.tsx — CRUD de definições
- Integration: reports.controller.spec.ts — catálogo, execução
- Integration: report-definitions.admin.controller.spec.ts — CRUD admin
- Integration: report-definitions.repository.spec.ts — persistência híbrida
- Integration: exports.controller.spec.ts — solicitação de exportação
- Integration: exports.service.spec.ts — geração de PDF/XLSX real
- E2E: buscar relatório → filtrar → executar → exportar → baixar
- Manual: verificar qualidade de PDF/Excel gerado
- Comandos: pnpm test, pnpm typecheck

Entregáveis Concluídos:
✅ apps/api/src/reports/reports.controller.ts — catálogo e execução
✅ apps/api/src/reports/repositories/report-definitions.repository.ts — persistência híbrida
✅ apps/api/src/reports/report-definitions.admin.controller.ts — CRUD admin
✅ apps/web/src/components/reports/* — UI de catálogo, detalhe, filtros
✅ apps/web/src/components/admin/admin-reports.tsx — UI admin
✅ apps/api/src/platform/exports/* — exportação de relatórios
✅ supabase/migrations/20260605120000_004_api_platform_tables.sql — tabelas
✅ supabase/migrations/20260607113000_005_report_definitions_unique_source_sector.sql — índices
✅ supabase/migrations/20260607183000_006_api_favorite_reports.sql — favoritos

Débitos / Pendente:
📋 Pipeline de export com BullMQ e fila
📋 Worker de processamento assíncrono
📋 Polling de status de job
📋 Storage S3 ou equivalente para arquivos
📋 Ampliar favoritos (mais funcionalidades)
📋 Preview de parâmetros com tipos na tela admin
```

---

## Módulo BI — Business Intelligence

```
Status: 🔄 Parcial (Fase 3 em planejamento)

SDD — Especificação Completa:
- Dashboard home com KPIs consolidados por setor
- Gráficos reais: linha, barra, pizza, área, usando Recharts
- Drill-down por KPI: clique abre detalhes por dimensão
- Múltiplas dimensões de análise: tempo, setor, produto, região
- Interação rica: hover com tooltip, clique para navegação, zoom
- Dashboards personalizados pelo usuário
- Widgets: KPI, gráfico, tabela, texto, iframe
- Editor visual drag-and-drop de dashboards
- Layout responsivo para desktop e mobile
- Favoritos e compartilhamento entre usuários do mesmo grupo

TDD — Testes:
- Unit: dashboard-home.tsx — renderização de KPIs e gráficos
- Unit: drill-down-chart.tsx — navegação entre níveis de detalhe
- Unit: dashboard-workspace.tsx — CRUD de dashboards personalizados
- Unit: widget-* — renderização e configuração de cada tipo de widget
- Integration: dashboard.controller.spec.ts — agregação de KPIs
- Integration: dashboards.controller.spec.ts — CRUD de layouts
- E2E: acessar home → interagir com gráfico → drill-down → voltar
- E2E: criar dashboard → adicionar widgets → configurar → salvar
- Manual: verificar responsividade em mobile
- Comandos: pnpm test, pnpm typecheck

Entregáveis Concluídos:
✅ apps/api/src/platform/dashboard/* — KPIs consolidados
✅ apps/api/src/platform/dashboards/* — dashboards personalizados (base)
✅ apps/web/src/components/dashboard/dashboard-home.tsx — home com KPIs
✅ apps/web/src/app/app/dashboards/page.tsx — rota de dashboards
✅ recharts ✅ instalado em apps/web

Débitos / Pendente:
📋 Gráficos Recharts integrados em telas ativas
📋 Drill-down rico com múltiplas dimensões
📋 Widgets editáveis
📋 Editor visual drag-and-drop
📋 Compartilhamento entre usuários
📋 Layout responsivo avançado
```

---

## Módulo ADMIN — Administração

```
Status: 🔄 Parcial (Fase 2 concluída, Fase 4 pendente)

SDD — Especificação Completa:
- Dashboard administrativo com indicadores de operação
- Gestão de usuários: CRUD, filtros, paginação, desativação, reset de senha
- Gestão de grupos: CRUD, associação de roles e setores
- Gestão de permissões: CRUD granulado, auditoria
- Gestão de relatórios: CRUD de definições, validação de SQL
- Auditoria: logs de todas as ações administrativas, filtros, exportação
- Configurações do sistema: edição via API, trilha de auditoria
- Notificações administrativas
- Métricas operacionais em tempo real

TDD — Testes:
- Unit: admin-*.tsx — renderização, CRUD, filtros, estados
- Unit: admin-page.tsx — layout administrativo
- Integration: admin-users.controller.spec.ts — CRUD /admin/users
- Integration: admin-groups.controller.spec.ts — CRUD /admin/groups
- Integration: permissions.controller.spec.ts — CRUD /admin/permissions
- Integration: audit.controller.spec.ts — GET /admin/audit com filtros
- Integration: settings.controller.spec.ts — GET/PUT /settings
- Integration: audit.service.spec.ts — geração de logs em mutações
- Manual: realizar mutação admin → verificar log de auditoria
- Comandos: pnpm test, pnpm typecheck

Entregáveis Concluídos:
✅ apps/web/src/app/app/admin/users/page.tsx — gestão de usuários
✅ apps/web/src/app/app/admin/permissions/page.tsx — gestão de permissões
✅ apps/web/src/app/app/admin/reports/page.tsx — gestão de relatórios
✅ apps/web/src/app/app/admin/audit/page.tsx — auditoria
✅ apps/web/src/app/app/admin/settings/page.tsx — configurações
✅ apps/api/src/admin/users/* — backend de usuários
✅ apps/api/src/admin/groups/* — backend de grupos
✅ apps/api/src/permissions/* — backend de permissões
✅ apps/api/src/audit/* — backend de auditoria
✅ apps/api/src/platform/settings/* — backend de configurações
✅ apps/web/src/components/admin/* — componentes admin

Débitos / Pendente:
📋 Dashboard administrativo com indicadores reais (T12)
📋 Notificações administrativas
📋 Métricas operacionais em tempo real
📋 Governança completa (dashboard de operação)
```
