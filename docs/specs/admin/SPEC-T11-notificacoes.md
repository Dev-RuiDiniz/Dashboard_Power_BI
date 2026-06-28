# SPEC-T11 — Central de Notificações

**ID:** T11
**Módulo:** Admin
**Fase:** Fase 1
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela de notificações do usuário logado com badge de não lidas, marcação individual/em lote e filtros por tipo.

## 2. Contexto

Tela acessível por todos os usuários autenticados. Notificações geradas pelo sistema (exportação concluída, mudança de permissão, alerta admin). Badge no header indica não lidas.

## 3. Regras de Negócio

Nenhuma RN específica.

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário acessa `/app/notifications`.
2. Frontend chama GET /notifications.
3. Lista de notificações ordenadas por data (recentes primeiro).
4. Badge no header mostra contador de não lidas.

### Fluxo — Marcar como lida

1. Usuário clica em notificação ou "Marcar como lida".
2. PATCH /notifications/:id (read: true).
3. Badge decrementa.

### Fluxo — Marcar todas

1. Usuário clica "Marcar todas como lidas".
2. PATCH /notifications/read-all.
3. Badge zerado.

### Fluxo — Filtrar

1. Usuário seleciona filtro por tipo (info, warning, success, error).
2. Lista filtrada.

## 5. Critérios de Aceite

- [x] Lista de notificações do usuário logado
- [x] Badge de não lidas no header
- [x] Marcar como lida individual ou em lote
- [x] Filtros por tipo (info, warning, success, error)
- [x] Ordenação por data (mais recentes primeiro)
- [x] Estados: loading, erro, vazio

## 6. Impacto Técnico

| Área           | Impacto                                                                               |
| -------------- | ------------------------------------------------------------------------------------- |
| Arquitetura    | Módulo Notifications no backend                                                       |
| Banco de dados | api_notifications (Supabase)                                                          |
| API            | GET /notifications, PATCH /notifications/:id, PATCH /notifications/read-all           |
| Frontend       | /app/notifications, notifications-list.tsx, notification-badge.tsx                    |
| Testes         | Unit (notifications-list, notification-badge), Integration (notifications.controller) |
| Infraestrutura | Nenhuma adicional                                                                     |
| Segurança      | JwtAuthGuard, notificações privadas por usuário                                       |

## 7. Testes Necessários

| Tipo        | Arquivo                          | Descrição                                         |
| ----------- | -------------------------------- | ------------------------------------------------- |
| Unit        | notifications-list.tsx           | Listagem, filtros                                 |
| Unit        | notification-badge.tsx           | Contador                                          |
| Integration | notifications.controller.spec.ts | CRUD                                              |
| Manual      | —                                | Verificar badge atualizando após nova notificação |

## 8. Riscos

| Risco               | Impacto     | Mitigação                     |
| ------------------- | ----------- | ----------------------------- |
| Muitas notificações | Performance | Paginação, limpeza automática |

## 9. Dependências

- `notifications.service` (CRUD)
- `notifications.controller` (endpoints)
- Componente de badge no header
