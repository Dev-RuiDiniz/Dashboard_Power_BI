# SPEC-T14 — Gestão de Permissões

**ID:** T14
**Módulo:** Permissions / Admin
**Fase:** Fase 2
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela administrativa de CRUD de permissões granulares com validação de código único e auditoria de mutações.

## 2. Contexto

Tela restrita a admins. Gerencia permissões no formato `resource:scope:action`. Cada permissão tem code, name, description, resource e action. Integra com `permissions.service` e `permissions.repository` (persistência híbrida Supabase/memória).

## 3. Regras de Negócio

| Código | Regra                                                     | Status     |
| ------ | --------------------------------------------------------- | ---------- |
| RN-008 | Apenas Admin pode gerenciar usuários, grupos e permissões | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Listagem

1. Admin acessa `/app/admin/permissions`.
2. Frontend chama GET /admin/permissions.
3. API retorna lista de permissões.
4. Frontend exibe tabela com busca.

### Fluxo — Criar permissão

1. Admin clica "Nova permissão".
2. Preenche: code (resource:scope:action), name, description, resource, action.
3. POST /admin/permissions.
4. API valida código único e formato.
5. Frontend atualiza lista.

### Fluxo — Editar permissão

1. Admin clica em permissão na lista.
2. Edita name, description.
3. PATCH /admin/permissions/:id.
4. API valida e atualiza.
5. Auditoria registra mudança.

### Fluxo — Excluir permissão

1. Admin clica "Excluir".
2. DELETE /admin/permissions/:id.
3. API valida que não está associada a grupos.
4. Remove e audita.

## 5. Critérios de Aceite

- [x] Listagem de permissões com busca
- [x] CRUD: code, name, description, resource, action
- [x] Validação de código único (formato: resource:scope:action)
- [x] Ativação/desativação
- [x] Auditoria de mutações
- [x] Estados: loading, erro, vazio

## 6. Impacto Técnico

| Área           | Impacto                                                            |
| -------------- | ------------------------------------------------------------------ |
| Arquitetura    | Rota admin com RolesGuard (admin)                                  |
| Banco de dados | CRUD em api_permissions, auditoria em audit_logs                   |
| API            | GET/POST/PATCH/DELETE /admin/permissions                           |
| Frontend       | /app/admin/permissions, admin-permissions.tsx                      |
| Testes         | Unit (admin-permissions.tsx), Integration (permissions.controller) |
| Infraestrutura | Supabase para persistência                                         |
| Segurança      | RolesGuard admin, auditoria, validação de código único             |

## 7. Testes Necessários

| Tipo        | Arquivo                        | Descrição                |
| ----------- | ------------------------------ | ------------------------ |
| Unit        | admin-permissions.tsx          | Listagem, busca, criação |
| Integration | permissions.controller.spec.ts | CRUD /admin/permissions  |
| Integration | permissions.repository.spec.ts | Persistência híbrida     |
| Integration | audit.service.spec.ts          | Auditoria de mutações    |
| Manual      | —                              | Criar, buscar, excluir   |

## 8. Riscos

| Risco                     | Impacto                | Mitigação                            |
| ------------------------- | ---------------------- | ------------------------------------ |
| Código duplicado          | Conflito de permissões | Validação de código único no backend |
| Permissão em uso excluída | Quebra de acesso       | Validar associação antes de excluir  |

## 9. Dependências

- `permissions.service` (CRUD e validações)
- `permissions.repository` (persistência híbrida)
- `audit.service` (auditoria de mutações)
- `roles.guard` (controle de acesso admin)
