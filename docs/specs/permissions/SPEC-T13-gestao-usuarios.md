# SPEC-T13 — Gestão de Usuários

**ID:** T13
**Módulo:** Permissions / Admin
**Fase:** Fase 1
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela administrativa de CRUD de usuários com busca, filtros, paginação, desativação e reset de senha.

## 2. Contexto

Tela restrita a admins. Gerencia todos os usuários da plataforma: criação, edição de roles/setores/status, desativação (soft delete) e reset de senha administrativo. Integra com `admin-users.service` e `users.repository`.

## 3. Regras de Negócio

| Código | Regra                                                     | Status     |
| ------ | --------------------------------------------------------- | ---------- |
| RN-008 | Apenas Admin pode gerenciar usuários, grupos e permissões | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Listagem

1. Admin acessa `/app/admin/users`.
2. Frontend chama GET /admin/users com paginação.
3. API retorna lista paginada com busca e filtros.
4. Frontend exibe tabela com colunas: nome, email, role, setor, status.

### Fluxo — Criar usuário

1. Admin clica "Novo usuário".
2. Preenche: nome, email, role, setor, senha inicial.
3. POST /admin/users.
4. API valida email único.
5. API cria usuário com bcrypt.
6. Frontend atualiza lista.

### Fluxo — Editar usuário

1. Admin clica em usuário na lista.
2. Edita roles, setores, status.
3. PATCH /admin/users/:id.
4. API valida e atualiza.
5. Auditoria registra mudança.

### Fluxo — Desativar usuário

1. Admin clica "Desativar".
2. Confirmação modal.
3. DELETE /admin/users/:id (soft delete).
4. Usuário marcado como inativo.

### Fluxo — Reset de senha

1. Admin clica "Resetar senha".
2. API gera nova senha temporária.
3. API atualiza passwordHash.
4. Admin recebe nova senha para repassar.

## 5. Critérios de Aceite

- [x] Listagem paginada com busca
- [x] Filtros por status, role, setor
- [x] Criação com validação de email único
- [x] Edição de roles, setores e status
- [x] Desativação (soft delete) com confirmação
- [x] Reset de senha administrativo
- [x] Estados: loading, erro, vazio
- [x] Auditoria de mutações

## 6. Impacto Técnico

| Área           | Impacto                                                      |
| -------------- | ------------------------------------------------------------ |
| Arquitetura    | Rota admin com RolesGuard (admin)                            |
| Banco de dados | CRUD em users, auditoria em audit_logs                       |
| API            | GET/POST/PATCH/DELETE /admin/users                           |
| Frontend       | /app/admin/users, admin-users.tsx                            |
| Testes         | Unit (admin-users.tsx), Integration (admin-users.controller) |
| Infraestrutura | Nenhuma adicional                                            |
| Segurança      | RolesGuard admin, auditoria, bcrypt                          |

## 7. Testes Necessários

| Tipo        | Arquivo                        | Descrição                                 |
| ----------- | ------------------------------ | ----------------------------------------- |
| Unit        | admin-users.tsx                | CRUD, filtros, paginação                  |
| Integration | admin-users.controller.spec.ts | GET/POST/PATCH/DELETE                     |
| Integration | users.repository.spec.ts       | Persistência híbrida                      |
| Manual      | —                              | Criar, desativar, reativar, resetar senha |

## 8. Riscos

| Risco                  | Impacto                 | Mitigação                                            |
| ---------------------- | ----------------------- | ---------------------------------------------------- |
| Email duplicado        | Conflito de identidade  | Validação de email único no backend                  |
| Reset de senha exposto | Senha temporária vazada | Exibir apenas uma vez, forçar troca no próximo login |

## 9. Dependências

- `admin-users.service` (CRUD)
- `users.repository` (persistência híbrida)
- `audit.service` (auditoria de mutações)
- `roles.guard` (controle de acesso admin)
