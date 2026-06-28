# SPEC-T10 — Meu Perfil

**ID:** T10
**Módulo:** Auth
**Fase:** Fase 2
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela de perfil do usuário autenticado com dados pessoais e alteração de senha.

## 2. Contexto

Tela acessível por todos os usuários autenticados. Exibe dados do usuário logado e permite alteração de senha com validação da senha atual. Integra com endpoints GET /auth/me e POST /auth/me/password.

## 3. Regras de Negócio

| Código | Regra                                                   | Status     |
| ------ | ------------------------------------------------------- | ---------- |
| RN-001 | Usuário precisa estar autenticado para acessar o painel | Confirmado |
| RN-002 | Senhas devem ter no mínimo 8 caracteres                 | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Visualização

1. Usuário acessa `/app/profile`.
2. Frontend chama GET /auth/me.
3. API retorna dados: email, roles, setores, status, data de criação.
4. Frontend exibe dados em formato de cartão.

### Fluxo principal — Alteração de senha

1. Usuário preenche senha atual, nova senha, confirmação.
2. Frontend valida: nova senha >= 8 chars, confirmação igual.
3. POST /auth/me/password com senha atual + nova senha.
4. API valida senha atual com bcrypt.
5. API atualiza passwordHash.
6. Frontend exibe mensagem de sucesso.

### Fluxo alternativo — Senha atual incorreta

1. API retorna 401.
2. Frontend exibe "Senha atual incorreta".

## 5. Critérios de Aceite

- [x] Exibição de email, roles, setores, status, data de criação
- [x] Formulário de alteração de senha com 3 campos
- [x] Validação de senha atual no backend
- [x] Validação de complexidade (mínimo 8 caracteres)
- [x] Confirmação de senha (campos iguais)
- [x] Estados: loading, erro, sucesso
- [x] Estado: sem permissão (se não autenticado)
- [x] Mensagem de sucesso após alteração
- [x] Responsivo e acessível

## 6. Impacto Técnico

| Área           | Impacto                                                              |
| -------------- | -------------------------------------------------------------------- |
| Arquitetura    | Rota autenticada com JwtAuthGuard                                    |
| Banco de dados | Consulta em users (ID do token), update passwordHash                 |
| API            | GET /auth/me, POST /auth/me/password                                 |
| Frontend       | /app/profile, user-profile.tsx                                       |
| Testes         | Unit (user-profile), Integration (auth.controller, users.repository) |
| Infraestrutura | Nenhuma adicional                                                    |
| Segurança      | Validação de senha atual, bcrypt                                     |

## 7. Testes Necessários

| Tipo        | Arquivo                  | Descrição                                      |
| ----------- | ------------------------ | ---------------------------------------------- |
| Unit        | user-profile.tsx         | Renderização, estados                          |
| Integration | auth.controller.spec.ts  | GET /auth/me, POST /auth/me/password           |
| Integration | users.repository.spec.ts | Busca por ID, update passwordHash              |
| Manual      | —                        | Alterar senha e verificar login com nova senha |

## 8. Riscos

| Risco                    | Impacto                   | Mitigação                                       |
| ------------------------ | ------------------------- | ----------------------------------------------- |
| Senha atual não validada | Alteração sem autorização | Validar senha atual no backend                  |
| Senha fraca              | Comprometimento de conta  | Validação de complexidade no frontend e backend |

## 9. Dependências

- `auth.controller` (GET /auth/me, POST /auth/me/password)
- `users.repository` (busca e update)
- `update-password.dto` (validação de entrada)
