# SPEC-T17 — Auditoria com Filtros

**ID:** T17
**Módulo:** Admin
**Fase:** Fase 2
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela de logs de auditoria com paginação, filtros (usuário, ação, recurso, período) e exportação.

## 2. Contexto

Tela restrita a admins. Todos os logs de mutações administrativas e ações críticas são registrados em `api_audit_logs`. Logs incluem: quem (userId), quando (timestamp), o que (action, resource), de onde (IP, userAgent).

## 3. Regras de Negócio

| Código | Regra                                                    | Status     |
| ------ | -------------------------------------------------------- | ---------- |
| RN-013 | Todas as mutações administrativas geram log de auditoria | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Listagem

1. Admin acessa `/app/admin/audit`.
2. Frontend chama GET /admin/audit com paginação.
3. API retorna logs com filtros aplicados.
4. Frontend exibe tabela: usuário, ação, recurso, data, IP.

### Fluxo — Filtrar

1. Admin seleciona filtros: usuário, ação, recurso, período de data.
2. GET /admin/audit com query params.
3. Lista filtrada.

### Fluxo — Exportar

1. Admin clica "Exportar CSV/Excel".
2. API gera arquivo com logs filtrados.
3. Download disponível.

## 5. Critérios de Aceite

- [x] Listagem de logs de auditoria com paginação
- [x] Filtros: usuário, ação, recurso, período de data
- [x] Detalhe: quem, quando, o que, de onde (IP)
- [x] Exportação para CSV/Excel
- [x] Retenção automática (90 dias)
- [x] Estados: loading, erro, vazio

## 6. Impacto Técnico

| Área           | Impacto                                                           |
| -------------- | ----------------------------------------------------------------- |
| Arquitetura    | Módulo Audit no backend                                           |
| Banco de dados | api_audit_logs (Supabase)                                         |
| API            | GET /admin/audit com filtros e paginação                          |
| Frontend       | /app/admin/audit, admin-audit.tsx                                 |
| Testes         | Unit (admin-audit), Integration (audit.controller, audit.service) |
| Infraestrutura | Nenhuma adicional                                                 |
| Segurança      | RolesGuard admin, retenção automática                             |

## 7. Testes Necessários

| Tipo        | Arquivo                       | Descrição                           |
| ----------- | ----------------------------- | ----------------------------------- |
| Unit        | admin-audit.tsx               | Listagem, filtros                   |
| Integration | audit.controller.spec.ts      | GET /admin/audit com filtros        |
| Integration | audit-logs.repository.spec.ts | Persistência híbrida                |
| Integration | audit.service.spec.ts         | Geração de logs em ações críticas   |
| Manual      | —                             | Realizar ação admin → verificar log |

## 8. Riscos

| Risco          | Impacto                    | Mitigação                                |
| -------------- | -------------------------- | ---------------------------------------- |
| Volume de logs | Performance                | Paginação, retenção automática (90 dias) |
| Log sem IP     | Rastreabilidade incompleta | Capturar IP em todas as mutações         |

## 9. Dependências

- `audit.service` (geração de logs)
- `audit.controller` (listagem com filtros)
- `audit-logs.repository` (persistência híbrida)
- `roles.guard` (controle admin)
