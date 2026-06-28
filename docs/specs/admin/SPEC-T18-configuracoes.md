# SPEC-T18 — Configurações do Sistema

**ID:** T18
**Módulo:** Admin
**Fase:** Fase 1
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela de configurações do sistema com seções organizadas, edição de valores via API e trilha de auditoria.

## 2. Contexto

Tela restrita a admins. Configurações não-sensíveis editáveis: tempo de expiração de tokens, limite de rate limiting, retenção de logs, etc. Validação de tipos (string, number, boolean, JSON). Toda alteração gera log de auditoria.

## 3. Regras de Negócio

| Código | Regra                                                    | Status     |
| ------ | -------------------------------------------------------- | ---------- |
| RN-013 | Todas as mutações administrativas geram log de auditoria | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Visualização

1. Admin acessa `/app/admin/settings`.
2. Frontend chama GET /settings.
3. API retorna configurações organizadas por seção.
4. Frontend exibe formulários por tipo.

### Fluxo — Editar configuração

1. Admin edita valor.
2. Frontend valida tipo (string, number, boolean, JSON).
3. PUT /settings com chave e valor.
4. API valida e atualiza.
5. Auditoria registra mudança.
6. Frontend exibe sucesso.

## 5. Critérios de Aceite

- [x] Tela com seções organizadas
- [x] Edição de valores não-sensíveis via API
- [x] Trilha de auditoria em alterações
- [x] Validação de tipos: string, number, boolean, JSON
- [x] Estados: loading, erro, sucesso, vazio

## 6. Impacto Técnico

| Área           | Impacto                                                                       |
| -------------- | ----------------------------------------------------------------------------- |
| Arquitetura    | Módulo Settings no backend                                                    |
| Banco de dados | api_settings (Supabase)                                                       |
| API            | GET /settings, PUT /settings                                                  |
| Frontend       | /app/admin/settings, admin-settings.tsx                                       |
| Testes         | Unit (admin-settings), Integration (settings.controller, settings.repository) |
| Infraestrutura | Nenhuma adicional                                                             |
| Segurança      | RolesGuard admin, auditoria, valores não-sensíveis                            |

## 7. Testes Necessários

| Tipo        | Arquivo                     | Descrição                            |
| ----------- | --------------------------- | ------------------------------------ |
| Unit        | admin-settings.tsx          | Renderização, formulários            |
| Integration | settings.controller.spec.ts | GET/PUT /settings                    |
| Integration | settings.repository.spec.ts | Persistência Supabase                |
| Integration | audit.service.spec.ts       | Auditoria de alterações              |
| Manual      | —                           | Alterar configuração → verificar log |

## 8. Riscos

| Risco                         | Impacto              | Mitigação                                |
| ----------------------------- | -------------------- | ---------------------------------------- |
| Configuração sensível exposta | Vazamento de secrets | Apenas valores não-sensíveis editáveis   |
| Tipo inválido                 | Erro de runtime      | Validação de tipos no frontend e backend |

## 9. Dependências

- `settings.service` (CRUD)
- `settings.controller` (endpoints)
- `settings.repository` (persistência Supabase)
- `audit.service` (auditoria de alterações)
- `roles.guard` (controle admin)
