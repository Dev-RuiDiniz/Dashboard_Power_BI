# SPEC-T01 — Login

**ID:** T01
**Módulo:** Auth
**Fase:** Fase 1
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela pública de login com email + senha, validação de credenciais, emissão de tokens JWT e controle de rate limiting.

## 2. Contexto

Tela inicial do sistema. Acesso público sem autenticação. Todos os demais fluxos dependem do sucesso desta tela. Integra com `auth.service` (bcrypt + JWT) e `login-attempts.service` (rate limiting).

## 3. Regras de Negócio

| Código | Regra                                                              | Status     |
| ------ | ------------------------------------------------------------------ | ---------- |
| RN-001 | Usuário precisa estar autenticado para acessar o painel            | Confirmado |
| RN-002 | Senhas devem ter no mínimo 8 caracteres                            | Confirmado |
| RN-003 | Após 5 tentativas falhas de login, o IP é bloqueado por 15 minutos | Confirmado |
| RN-005 | Access token expira em 15 minutos                                  | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário acessa `/login`.
2. Preenche email e senha.
3. Frontend valida campos obrigatórios.
4. POST /auth/login com email + senha.
5. API valida credenciais com bcrypt.
6. API emite access token (15min) + refresh token (7 dias).
7. Frontend armazena tokens em sessionStorage.
8. Redireciona para `/app`.

### Fluxo alternativo — Credenciais inválidas

1. API retorna 401.
2. Frontend exibe mensagem "Credenciais inválidas".
3. Contador de tentativas incrementado.

### Fluxo alternativo — Rate limit

1. Após 5 tentativas falhas, API retorna 429.
2. Frontend exibe mensagem de bloqueio (15 minutos).

### Fluxo alternativo — Conta inativa

1. API retorna 403 com mensagem "Conta desativada".
2. Frontend exibe mensagem de contato com admin.

## 5. Critérios de Aceite

- [x] Formulário com campos email e senha
- [x] Validação de campos obrigatórios no frontend
- [x] POST /auth/login retorna access + refresh tokens
- [x] Tokens armazenados em sessionStorage (não localStorage)
- [x] Mensagem de erro para credenciais inválidas
- [x] Mensagem de erro para rate limit (429)
- [x] Mensagem de erro para conta inativa (403)
- [x] Responsivo (desktop e mobile)
- [x] ARIA labels e focus states visíveis
- [x] Refresh automático em 401

## 6. Impacto Técnico

| Área           | Impacto                                                |
| -------------- | ------------------------------------------------------ |
| Arquitetura    | Rota pública, sem guard                                |
| Banco de dados | Consulta em users (email + passwordHash)               |
| API            | POST /auth/login                                       |
| Frontend       | /login, login-form.tsx, session.ts                     |
| Testes         | Unit (login-form, session), Integration (auth.service) |
| Infraestrutura | Nenhuma adicional                                      |
| Segurança      | bcrypt, rate limiting, sessionStorage                  |

## 7. Testes Necessários

| Tipo        | Arquivo              | Descrição                                     |
| ----------- | -------------------- | --------------------------------------------- |
| Unit        | login-form.tsx       | Validação de campos, estados loading/erro     |
| Unit        | session.ts           | Persistência, validação de formato, expiry    |
| Integration | auth.service.spec.ts | Login com bcrypt, JWT emissão                 |
| Manual      | —                    | Verificar rate limit após 5 tentativas falhas |

## 8. Riscos

| Risco                 | Impacto                  | Mitigação                          |
| --------------------- | ------------------------ | ---------------------------------- |
| Brute force           | Comprometimento de conta | Rate limiting (5 tentativas/15min) |
| XSS no formulário     | Roubo de credenciais     | CSP headers, sanitização           |
| Token em localStorage | Roubo via XSS            | Usar sessionStorage                |

## 9. Dependências

- `auth.service` (bcrypt + JWT)
- `login-attempts.service` (rate limiting)
- `token.service` (emissão de JWT)
