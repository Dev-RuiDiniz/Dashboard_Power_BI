# SPEC-admin-modulo — Módulo Admin (Administração)

**ID:** ADM-MOD
**Módulo:** Admin
**Fase:** Fase 2 (concluído), Fase 4 (pendente)
**Status:** Parcial
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Gerenciar administração da plataforma: dashboard admin, usuários, grupos, permissões, relatórios, auditoria, configurações e notificações.

## 2. Contexto

O módulo Admin centraliza todas as funções administrativas. Acesso restrito a role admin. Inclui dashboard com KPIs operacionais, CRUD de usuários/grupos/permissões/relatórios, logs de auditoria, configurações do sistema e notificações.

## 3. Regras de Negócio

| Código | Regra                                                     | Status     |
| ------ | --------------------------------------------------------- | ---------- |
| RN-008 | Apenas Admin pode gerenciar usuários, grupos e permissões | Confirmado |
| RN-013 | Todas as mutações administrativas geram log de auditoria  | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Hub admin

1. Admin acessa `/app/admin`.
2. Dashboard exibe KPIs operacionais (usuários, grupos, exportações).
3. Atividade recente com últimos logs de auditoria.
4. Cards de navegação para usuários, grupos, permissões, relatórios, auditoria, configurações.

### Fluxo — Mutação administrativa

1. Admin realiza mutação (criar usuário, alterar permissão, etc).
2. API executa mutação.
3. API gera log de auditoria (quem, quando, o que, IP).
4. Log visível em /app/admin/audit.

## 5. Critérios de Aceite

- [x] Dashboard administrativo com KPIs operacionais
- [x] CRUD completo de usuários e grupos
- [x] Gestão de permissões granulares
- [x] Gestão de relatórios (definições)
- [x] Logs de auditoria com filtros
- [x] Configurações do sistema editáveis
- [x] Notificações
- [x] Auditoria de todas as mutações
- [ ] Gráficos de tendência no dashboard admin
- [ ] Alertas de segurança em tempo real
- [ ] Governança completa

## 6. Impacto Técnico

| Área           | Impacto                                                                                 |
| -------------- | --------------------------------------------------------------------------------------- |
| Arquitetura    | Módulos Admin, Audit, Settings, Notifications no backend                                |
| Banco de dados | api_users, api_groups, api_permissions, api_audit_logs, api_settings, api_notifications |
| API            | /admin/_, /audit/_, /settings/_, /notifications/_                                       |
| Frontend       | /app/admin/_, componentes admin/_                                                       |
| Testes         | Unit (admin-\*), Integration (controllers)                                              |
| Infraestrutura | Nenhuma adicional                                                                       |
| Segurança      | RolesGuard admin em todas as rotas, auditoria                                           |

## 7. Testes Necessários

| Tipo        | Arquivo                         | Descrição                                           |
| ----------- | ------------------------------- | --------------------------------------------------- |
| Unit        | admin-dashboard.tsx             | Renderização de KPIs, loading, erro, vazio          |
| Unit        | admin-users.tsx                 | CRUD, filtros, paginação                            |
| Unit        | admin-permissions.tsx           | Listagem, busca, criação                            |
| Unit        | admin-audit.tsx                 | Listagem, filtros                                   |
| Unit        | admin-settings.tsx              | Renderização, formulários                           |
| Integration | admin-dashboard.service.spec.ts | getMetrics() com dados, vazio e erro                |
| Integration | admin-users.controller.spec.ts  | CRUD /admin/users                                   |
| Integration | admin-groups.controller.spec.ts | CRUD /admin/groups                                  |
| Integration | audit.controller.spec.ts        | GET /admin/audit com filtros                        |
| Integration | settings.controller.spec.ts     | GET/PUT /settings                                   |
| Manual      | —                               | Realizar mutação admin → verificar log de auditoria |

## 8. Riscos

| Risco                 | Impacto                  | Mitigação                          |
| --------------------- | ------------------------ | ---------------------------------- |
| Mutação sem auditoria | Falta de rastreabilidade | Audit.service em todas as mutações |
| Acesso admin sem 2FA  | Conta comprometida       | DT-001 (2FA obrigatório)           |

## 9. Dependências

- `admin-dashboard.service` (KPIs operacionais)
- `audit.service` (logs de auditoria)
- `settings.service` (configurações)
- `notifications.service` (notificações)
- `roles.guard` (controle admin)
