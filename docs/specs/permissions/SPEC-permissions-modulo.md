# SPEC-permissions-modulo — Módulo Permissions (Permissões e Acesso)

**ID:** PERM-MOD
**Módulo:** Permissions
**Fase:** Fase 2 (concluído), pendências em Fase 4
**Status:** Parcial
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Gerenciar roles, setores, grupos, permissões granulares e controle de acesso em todos os endpoints da plataforma.

## 2. Contexto

O módulo Permissions controla quem pode ver, editar, exportar e administrar recursos. Roles fixas (viewer, downloader, admin), setores (financeiro, comercial, operações, diretoria), grupos com roles/setores agregados e permissões granulares no formato `resource:scope:action`.

## 3. Regras de Negócio

| Código | Regra                                                     | Status     |
| ------ | --------------------------------------------------------- | ---------- |
| RN-006 | Usuários só visualizam relatórios do seu setor            | Confirmado |
| RN-007 | Apenas Downloader e Admin podem exportar relatórios       | Confirmado |
| RN-008 | Apenas Admin pode gerenciar usuários, grupos e permissões | Confirmado |
| RN-016 | Usuários herdam permissões dos grupos que pertencem       | Pendente   |

## 4. Fluxo Esperado

### Fluxo principal — Validação de acesso

1. Requisição chega com JWT.
2. JwtAuthGuard extrai payload (userId, roles, sectors).
3. RolesGuard verifica role necessária para a rota.
4. Se permissão granular necessária → checa em permissions.
5. Acesso permitido ou negado (403).

### Fluxo — Herança via grupos (pendente)

1. Usuário pertence a grupo X.
2. Grupo X tem permissões P1, P2.
3. Usuário herda P1 e P2 automaticamente.
4. Validação combina permissões diretas + herdadas.

## 5. Critérios de Aceite

- [x] Roles fixas: viewer, downloader, admin
- [x] Setores: financeiro, comercial, operações, diretoria
- [x] Grupos com roles e setores agregados
- [x] Permissões granulares (resource:scope:action)
- [x] CRUD de permissões com validação de código único
- [x] Auditoria de mudanças de permissão
- [ ] Herança de permissões via grupos
- [ ] Guard combinado JWT + role + permission
- [ ] Regras finas (escopo temporal, escopo de dados)

## 6. Impacto Técnico

| Área           | Impacto                                                                       |
| -------------- | ----------------------------------------------------------------------------- |
| Arquitetura    | RolesGuard em todas as rotas autenticadas                                     |
| Banco de dados | Tabelas: api_permissions, groups, user_groups (Supabase)                      |
| API            | CRUD /admin/permissions, CRUD /admin/groups                                   |
| Frontend       | /app/admin/permissions, /app/admin/users                                      |
| Testes         | Unit (permissions.service, groups.service), Integration (controllers, guards) |
| Infraestrutura | Nenhuma adicional                                                             |
| Segurança      | Validação em todas as rotas, auditoria de mutações                            |

## 7. Testes Necessários

| Tipo        | Arquivo                        | Descrição                                                               |
| ----------- | ------------------------------ | ----------------------------------------------------------------------- |
| Unit        | permissions.service.spec.ts    | CRUD, validações de código único                                        |
| Unit        | permissions.repository.spec.ts | Persistência híbrida, busca por código                                  |
| Unit        | groups.service.spec.ts         | Herança de permissões, agregação                                        |
| Integration | permissions.controller.spec.ts | GET/POST/PATCH/DELETE /admin/permissions                                |
| Integration | admin-users.service.spec.ts    | Associação de grupos a usuários                                         |
| Integration | roles.guard.spec.ts            | Validação combinada role + permission                                   |
| Manual      | —                              | Criar grupo → associar permissões → associar usuário → verificar acesso |

## 8. Riscos

| Risco                        | Impacto                      | Mitigação                         |
| ---------------------------- | ---------------------------- | --------------------------------- |
| Permissão apenas no frontend | Bypass de segurança          | Validação obrigatória no backend  |
| Herança não implementada     | Usuários sem acesso esperado | Implementar DT-003                |
| Guard apenas por role        | Acesso além do necessário    | Guard combinado role + permission |

## 9. Dependências

- `permissions.repository` (persistência híbrida Supabase/memória)
- `groups.service` (agregação de roles e setores)
- `roles.guard` (validação em todas as rotas)
- `audit.service` (auditoria de mutações)
