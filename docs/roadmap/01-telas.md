# ROADMAP — Telas (Escopo V1)

**Metodologia:** SDD + TDD aplicados em cada tela.

---

## Telas Públicas

### T01 — Login

```
Status: ✅ Concluído (Fase 1)

SDD — Especificação:
- Tela pública com formulário de email + senha
- Validação de campos obrigatórios
- Tratamento de erros: credenciais inválidas, rate limit, conta inativa
- Armazenamento de tokens em sessionStorage com refresh automático em 401
- Responsivo e acessível (ARIA labels, focus states)

TDD — Testes:
- Unit: login-form.tsx — validação de campos, estados loading/erro
- Unit: session.ts — persistência, validação de formato, expiry
- Integration: auth.service.spec.ts — login com bcrypt, JWT emissão
- Manual: verificar rate limit após 5 tentativas falhas
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/login/page.tsx
- apps/web/src/components/auth/login-form.tsx
- apps/api/src/auth/auth.controller.ts — POST /auth/login
```

### T02 — Recuperação e Redefinição de Senha

```
Status: ✅ Concluído (Fase 1)

SDD — Especificação:
- Tela "Esqueci minha senha" com campo de email
- Tela "Redefinir senha" com token temporário na URL
- Resposta genérica em forgot-password para evitar enumeração de usuários
- Token de reset com expiração de 15 minutos
- Senha nova com validação de complexidade (mínimo 8 caracteres)

TDD — Testes:
- Unit: forgot-password-form.tsx — validação de email
- Unit: reset-password-form.tsx — validação de token e senha
- Integration: password-reset.service.spec.ts — geração de token, validação de expiração
- Manual: verificar email com link de reset (se SMTP configurado)
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/forgot-password/page.tsx
- apps/web/src/app/reset-password/page.tsx
- apps/api/src/auth/services/password-reset.service.ts
```

---

## Telas Autenticadas — Dashboard e BI

### T03 — Dashboard Home (KPIs)

```
Status: ✅ Concluído (Fase 1)

SDD — Especificação:
- Cards de resumo executivo com valores formatados por setor
- Dados carregados via API (GET /dashboard/home)
- Estados: loading, erro, vazio
- Atualização via React Query (staleTime: 5 min)

TDD — Testes:
- Unit: dashboard-home.tsx — renderização de KPIs, estados
- Integration: dashboard.controller.spec.ts — agregação de KPIs
- Manual: verificar valores reais por setor
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/page.tsx
- apps/web/src/components/dashboard/dashboard-home.tsx
- apps/api/src/platform/dashboard/*
```

### T04 — Catálogo de Relatórios

```
Status: ✅ Concluído (Fase 1)

SDD — Especificação:
- Listagem de relatórios por setor com cards
- Busca por nome ou descrição
- Filtros por setor e tipo
- Estados: loading, erro, vazio

TDD — Testes:
- Unit: reports-catalog.tsx — filtragem, busca
- Integration: reports.controller.spec.ts — GET /reports com filtros
- Manual: verificar busca com termos parciais
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/reports/page.tsx
- apps/web/src/components/reports/*
- apps/api/src/reports/reports.controller.ts
```

### T05 — Visualização Inline de Relatório

```
Status: ✅ Concluído (Fase 1)

SDD — Especificação:
- Detalhe do relatório com parâmetros dinâmicos
- Formulário de parâmetros com validação
- Execução da query no SQL Server via API
- Exibição de resultados em tabela
- Estados: loading, erro, vazio

TDD — Testes:
- Unit: report-detail.tsx — renderização de parâmetros, execução
- Integration: reports.controller.spec.ts — POST /reports/:id/execute
- Integration: sql-server.service.spec.ts — queries parametrizadas, proteção SQL injection
- Manual: verificar relatório com múltiplos parâmetros
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/components/reports/report-detail.tsx
- apps/api/src/reports/reports.controller.ts
- apps/api/src/sql-server/*
```

### T06 — Filtros Avançados

```
Status: ✅ Concluído (Fase 1)

SDD — Especificação:
- Painel de filtros por tipo: texto, data, número, dropdown
- Composição de múltiplos filtros com operadores AND/OR
- Persistência de filtros na URL (query params)
- Aplicação e limpeza de filtros

TDD — Testes:
- Unit: report-advanced-filters.tsx — composição de filtros
- Unit: report-filters.ts — serialização/deserialização
- Manual: verificar persistência após refresh
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/components/reports/report-advanced-filters.tsx
- apps/web/src/lib/report-filters.ts
```

### T07 — Dashboard Interativo (Gráficos + Drill-down)

```
Status: 🔄 Parcial (Fase 3)

SDD — Especificação:
- Gráficos reais usando Recharts: linha, barra, pizza, área
- Drill-down por KPI: clique abre detalhe por dimensão
- Múltiplas dimensões: tempo, setor, produto
- Interação: hover com tooltip, clique para navegação
- Responsivo

TDD — Testes:
- Unit: dashboard-home.tsx — renderização de gráficos Recharts
- Unit: drill-down-chart.tsx — navegação entre níveis
- Integration: dashboard.controller.spec.ts — endpoints de drill-down
- E2E: fluxo drill-down KPI → detalhes → volta
- Manual: verificar interação com dados reais
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/components/dashboard/dashboard-home.tsx (parcial)
- apps/api/src/platform/dashboard/*
- Dependência: recharts ✅ instalado

Débitos:
- Gráficos Recharts ainda não integrados em telas ativas
- Drill-down rico com múltiplas dimensões pendente
```

### T08 — Dashboards Personalizados e Favoritos

```
Status: 🔄 Parcial (Fase 3)

SDD — Especificação:
- Criação de dashboards personalizados pelo usuário
- Widgets: KPI, gráfico, tabela, texto, iframe
- Salvamento de layouts no backend
- Lista de dashboards favoritos
- Dashboard padrão por setor
- Compartilhamento entre usuários do mesmo grupo

TDD — Testes:
- Unit: dashboard-workspace.tsx — CRUD de dashboards
- Unit: widget-configurator.tsx — configuração de widgets
- Integration: dashboards.controller.spec.ts — CRUD de layouts
- E2E: criar → adicionar widget → salvar → recarregar
- Manual: verificar responsividade
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/dashboards/page.tsx
- apps/web/src/components/dashboard/dashboard-workspace.tsx
- apps/api/src/platform/dashboards/*

Débitos:
- Widgets editáveis ainda não implementados
- Editor drag-and-drop incompleto
- Dashboard padrão por setor pendente
```

### T09 — Exportação PDF/Excel com Histórico

```
Status: 🔄 Parcial (Fase 3)

SDD — Especificação:
- Botão de exportação por relatório (PDF, Excel, CSV, JSON)
- Modal de confirmação com seleção de formato
- Geração assíncrona no backend
- Fila de processamento com notificação
- Histórico de exportações com status
- Download autenticado
- Expiração automática de arquivos (24h)

TDD — Testes:
- Unit: export-modal.tsx — seleção de formato
- Unit: exports-list.tsx — listagem, filtros, download
- Integration: exports.controller.spec.ts — solicitação de exportação
- Integration: exports.service.spec.ts — geração de PDF/XLSX real
- E2E: exportar → verificar notificação → baixar
- Manual: verificar qualidade do arquivo gerado
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/exports/page.tsx
- apps/web/src/components/exports/exports-list.tsx
- apps/api/src/platform/exports/*

Débitos:
- Pipeline backend com BullMQ não implementado
- Worker de fila e polling de job pendente
- Storage S3 ou equivalente pendente
```

---

## Telas Autenticadas — Usuário

### T10 — Meu Perfil

```
Status: ✅ Concluído (Fase 2 — 2026-06-05)

SDD — Especificação:
- Tela de perfil com dados do usuário autenticado
- Exibição: email, roles, setores, status, data de criação
- Formulário de alteração de senha com validação de senha atual
- Estados: loading, erro, sucesso, sem permissão
- Dados via GET /auth/me

TDD — Testes:
- Unit: user-profile.tsx — renderização, estados
- Integration: auth.controller.spec.ts — GET /auth/me, POST /auth/me/password
- Integration: users.repository.spec.ts — busca por ID, update passwordHash
- Manual: alterar senha e verificar login com nova senha
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/profile/page.tsx
- apps/web/src/components/user-profile.tsx
- apps/api/src/auth/auth.controller.ts — GET /auth/me, POST /auth/me/password
- apps/api/src/auth/dto/update-password.dto.ts
```

### T11 — Central de Notificações

```
Status: ✅ Concluído (Fase 1)

SDD — Especificação:
- Lista de notificações do usuário logado
- Badge de não lidas no header
- Marcar como lida individual ou em lote
- Filtros por tipo (info, warning, success, error)
- Ordenação por data (mais recentes primeiro)

TDD — Testes:
- Unit: notifications-list.tsx — listagem, filtros
- Unit: notification-badge.tsx — contador
- Integration: notifications.controller.spec.ts — CRUD
- Manual: verificar badge atualizando após nova notificação
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/notifications/page.tsx
- apps/web/src/components/notifications/notifications-list.tsx
- apps/api/src/platform/notifications/*
```

---

## Telas Administrativas

### T12 — Dashboard Administrativo

```
Status: 📋 Pendente (Fase 4)

SDD — Especificação:
- Indicadores de operação: usuários ativos, relatórios executados, exportações do dia, erros
- Gráficos de tendência: usuários novos, execuções por período
- Alertas de segurança: tentativas falhas, usuários bloqueados
- Top relatórios mais executados
- Top setores com mais atividade

TDD — Testes:
- Unit: admin-dashboard.tsx — renderização de KPIs administrativos
- Integration: admin-dashboard.controller.spec.ts — agregação de métricas
- Manual: verificar atualização em tempo real
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/admin/page.tsx (existe mas incompleto)
- apps/api/src/admin/dashboard/* (não existe)

Débitos:
- Hub admin existe mas sem dashboard de indicadores reais
- Métricas operacionais ainda não coletadas
```

### T13 — Gestão de Usuários

```
Status: ✅ Concluído (Fase 1)

SDD — Especificação:
- Listagem paginada com busca
- Filtros por status, role, setor
- Criação com validação de email único
- Edição de roles, setores e status
- Desativação (soft delete) com confirmação
- Reset de senha administrativo

TDD — Testes:
- Unit: admin-users.tsx — CRUD, filtros, paginação
- Integration: admin-users.controller.spec.ts — GET/POST/PATCH/DELETE
- Integration: users.repository.spec.ts — persistência híbrida
- Manual: criar, desativar, reativar, resetar senha
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/admin/users/page.tsx
- apps/web/src/components/admin/admin-users.tsx
- apps/api/src/admin/users/*
```

### T14 — Gestão de Permissões

```
Status: ✅ Concluído (Fase 2 — 2026-06-05)

SDD — Especificação:
- Listagem de permissões granulares com busca
- CRUD: code, name, description, resource, action
- Validação de código único (formato: resource:scope:action)
- Ativação/desativação
- Associação a roles (futuro)
- Auditoria de mutações

TDD — Testes:
- Unit: admin-permissions.tsx — listagem, busca, criação
- Integration: permissions.controller.spec.ts — CRUD /admin/permissions
- Integration: permissions.repository.spec.ts — persistência híbrida
- Integration: audit.service.spec.ts — auditoria de mutações
- Manual: criar, buscar, excluir
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/admin/permissions/page.tsx
- apps/web/src/components/admin/admin-permissions.tsx
- apps/api/src/permissions/*
- supabase/migrations/20260605200000_005_permissions_table.sql
```

### T15 — Gestão de Relatórios (Admin)

```
Status: 🔄 Parcial (Fase 2)

SDD — Especificação:
- Listagem de definições de relatórios com busca
- CRUD: name, description, sector, source_type, source_name, parameters
- Validação de source_name contra SQL injection
- Teste de conexão com SQL Server antes de salvar
- Ativação/desativação
- Preview de parâmetros com tipos

TDD — Testes:
- Unit: admin-reports.tsx — listagem, formulário
- Integration: report-definitions.admin.controller.spec.ts — CRUD
- Integration: report-definitions.repository.spec.ts — persistência híbrida
- Integration: sql-server.service.spec.ts — validação de identificadores
- Manual: criar, testar conexão, executar preview
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/admin/reports/page.tsx
- apps/web/src/components/admin/admin-reports.tsx
- apps/api/src/reports/report-definitions.admin.controller.ts

Débitos:
- Preview de parâmetros com tipos não implementado
- Teste de conexão com SQL Server antes de salvar pendente
```

### T16 — Editor Visual Drag-and-Drop

```
Status: ✅ Concluído (mínimo) (Fase 3 — 2026-06-10)

SDD — Especificação (mínimo entregue):
- Modo de edição no detalhe do dashboard com toggle "Editar layout" / "Concluir"
- Reordenação de widgets via drag-and-drop com @dnd-kit/sortable
- Grid responsivo mantido (md:grid-cols-2)
- Persistência da ordem via PATCH /dashboards/:id/widgets/reorder (batch)
- Fallback em memória funcional

SDD — Especificação (fora do escopo desta entrega):
- Paleta de widgets, redimensionamento, preview em tempo real, versões de dashboard

TDD — Testes:
- Unit: dashboard-detail.tsx — modo edição, drag-and-drop
- Unit: sortable-widget-card.tsx — eventos DnD
- Integration: dashboards.controller.spec.ts — endpoint reorderWidgets
- Manual: reordenar widgets → concluir → recarregar → ordem mantida
- Comandos: pnpm test, pnpm typecheck, pnpm build

Entregáveis:
- apps/web/src/components/dashboard/dashboard-detail.tsx (modo edição + DnD)
- apps/web/src/components/dashboard/widget-card.tsx (card extraído)
- apps/web/src/components/dashboard/sortable-widget-card.tsx (wrapper DnD)
- apps/api/src/platform/dashboards/dto/reorder-widgets.dto.ts
- apps/api/src/platform/dashboards/dashboards.service.ts — reorderWidgets
- apps/api/src/platform/dashboards/dashboards.controller.ts — PATCH /reorder
- Requer: recharts ✅, @dnd-kit/core/sortable/utilities ✅

Débitos:
- Redimensionamento de widgets
- Canvas livre / grid de 12 colunas interativo
- Versões de dashboard
```

### T17 — Auditoria com Filtros

```
Status: ✅ Concluído (Fase 2 — 2026-06-05)

SDD — Especificação:
- Listagem de logs de auditoria com paginação
- Filtros: usuário, ação, recurso, período de data
- Detalhe: quem, quando, o que, de onde (IP)
- Exportação para CSV/Excel
- Retenção automática (90 dias)

TDD — Testes:
- Unit: admin-audit.tsx — listagem, filtros
- Integration: audit.controller.spec.ts — GET /admin/audit com filtros
- Integration: audit-logs.repository.spec.ts — persistência híbrida
- Integration: audit.service.spec.ts — geração de logs em ações críticas
- Manual: realizar ação admin → verificar log
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/admin/audit/page.tsx
- apps/web/src/components/admin/admin-audit.tsx
- apps/api/src/audit/*
- supabase/migrations/20260605210000_006_audit_logs_table.sql
```

### T18 — Configurações do Sistema

```
Status: ✅ Concluído (Fase 1)

SDD — Especificação:
- Tela com seções organizadas
- Edição de valores não-sensíveis via API
- Trilha de auditoria em alterações
- Validação de tipos: string, number, boolean, JSON
- Estados: loading, erro, sucesso, vazio

TDD — Testes:
- Unit: admin-settings.tsx — renderização, formulários
- Integration: settings.controller.spec.ts — GET/PUT /settings
- Integration: settings.repository.spec.ts — persistência Supabase
- Integration: audit.service.spec.ts — auditoria de alterações
- Manual: alterar configuração → verificar log
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
- apps/web/src/app/app/admin/settings/page.tsx
- apps/web/src/components/admin/admin-settings.tsx
- apps/api/src/platform/settings/*
```
