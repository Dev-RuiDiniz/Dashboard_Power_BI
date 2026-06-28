# SPEC-DT-003 — Herança de Permissões via Grupos

**ID:** DT-003
**Módulo:** Permissions
**Fase:** Fase 4
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Implementar herança de permissões: usuários herdam automaticamente as permissões dos grupos aos quais pertencem.

## 2. Contexto

Atualmente, grupos associam roles e setores a usuários, mas não herdam permissões granulares. Um usuário em um grupo com permissão `reports:financeiro:read` não recebe essa permissão automaticamente. Esta spec resolve essa lacuna.

## 3. Regras de Negócio

| Código | Regra                                               | Status   |
| ------ | --------------------------------------------------- | -------- |
| RN-016 | Usuários herdam permissões dos grupos que pertencem | Pendente |

## 4. Fluxo Esperado

### Fluxo — Atribuição

1. Admin cria grupo "Financeiro Avançado".
2. Admin associa permissões ao grupo: `reports:financeiro:read`, `reports:financeiro:export`.
3. Admin associa usuário João ao grupo.
4. João automaticamente recebe as permissões do grupo.

### Fluxo — Validação de acesso

1. João tenta acessar relatório financeiro.
2. RolesGuard verifica permissões diretas de João.
3. RolesGuard verifica permissões herdadas dos grupos de João.
4. Combina permissões diretas + herdadas.
5. Acesso permitido se pelo menos uma concede acesso.

### Fluxo — Remoção de grupo

1. Admin remove João do grupo.
2. Permissões herdadas do grupo são revogadas.
3. Permissões diretas de João permanecem.

## 5. Critérios de Aceite

- [x] Grupos podem ter permissões granulares associadas
- [x] Usuários herdam permissões de todos os grupos aos quais pertencem
- [x] Validação combina permissões diretas + herdadas
- [x] Remoção de grupo revoga permissões herdadas
- [x] UI para associar permissões a grupos
- [x] Testes unitários e de integração

## 6. Impacto Técnico

| Área           | Impacto                                                      |
| -------------- | ------------------------------------------------------------ |
| Arquitetura    | Modificação em RolesGuard para combinar permissões           |
| Banco de dados | Tabela de associação group_permissions                       |
| API            | Modificação em /admin/groups para aceitar permissões         |
| Frontend       | UI de associação de permissões em grupos                     |
| Testes         | Unit (groups.service), Integration (roles.guard com herança) |
| Infraestrutura | Nenhuma adicional                                            |
| Segurança      | Validação combinada, auditoria de mudanças                   |

## 7. Testes Necessários

| Tipo        | Arquivo                         | Descrição                                                        |
| ----------- | ------------------------------- | ---------------------------------------------------------------- |
| Unit        | groups.service.spec.ts          | Agregação de permissões herdadas                                 |
| Integration | roles.guard.spec.ts             | Validação com permissões diretas + herdadas                      |
| Integration | admin-groups.controller.spec.ts | Associação de permissões a grupos                                |
| Manual      | —                               | Criar grupo com permissões → associar usuário → verificar acesso |

## 8. Riscos

| Risco                    | Impacto                     | Mitigação                                |
| ------------------------ | --------------------------- | ---------------------------------------- |
| Performance na agregação | Latência em cada requisição | Cache de permissões por usuário          |
| Conflito de permissões   | Comportamento inesperado    | Permissão mais permissiva prevalece (OR) |

## 9. Dependências

- ~~`groups.service` (modificação para agregar permissões)~~ — concluído
- ~~`roles.guard` (modificação para combinar permissões)~~ — concluído (novo `PermissionsGuard`)
- ~~Tabela `group_permissions` (migration pendente)~~ — concluído (migration 009)
- ~~UI de associação em grupos (modificação pendente)~~ — concluído

## 10. Notas de Implementação

- **`EffectivePermissionsService`:** Nova service que calcula permissões efetivas buscando grupos ativos via `groupIds`, agregando `permissionIds` de cada grupo e filtrando apenas permissões ativas.
- **`PermissionsGuard`:** Novo guard com decorator `@RequirePermissions()`. Admin bypassa. Verifica permissões efetivas via `EffectivePermissionsService.hasPermission()`.
- **`GroupsRepository`:** `permissionIds` adicionado ao tipo e inputs. Persistido em memória (Map) e Supabase (tabela `api_group_permissions`).
- **Migration 009:** Tabela `api_group_permissions` com PK composta e RLS.
- **Frontend:** Modal de criação de grupos inclui checkbox selector de permissões. Tabela exibe contagem de permissões.
- **OR lógico:** Permissão mais permissiva prevalece.
