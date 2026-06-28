# SPEC-auth-modulo — Módulo Auth (Autenticação e Segurança)

**ID:** AUTH-MOD
**Módulo:** Auth
**Fase:** Fase 1 (concluído), Fase 4 (pendente)
**Status:** Parcial
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Gerenciar autenticação, sessão, recuperação de senha, perfil do usuário e hardening de segurança para todos os usuários da plataforma.

## 2. Contexto

O módulo Auth é a porta de entrada do sistema. Todas as rotas autenticadas dependem dos guards e tokens emitidos aqui. O módulo cobre login, refresh, logout, recuperação de senha, perfil, rate limiting, CSRF, headers de segurança e 2FA/TOTP (parcial).

Fases:

- **Fase 1:** Login, JWT, refresh, logout, recuperação de senha — concluído.
- **Fase 2:** Perfil do usuário, CSRF, headers de segurança — concluído.
- **Fase 4:** 2FA obrigatório para admins, hardening final de sessão — pendente.

## 3. Regras de Negócio

| Código | Regra                                                              | Status     |
| ------ | ------------------------------------------------------------------ | ---------- |
| RN-001 | Usuário precisa estar autenticado para acessar o painel            | Confirmado |
| RN-002 | Senhas devem ter no mínimo 8 caracteres                            | Confirmado |
| RN-003 | Após 5 tentativas falhas de login, o IP é bloqueado por 15 minutos | Confirmado |
| RN-004 | Refresh token expira em 7 dias                                     | Confirmado |
| RN-005 | Access token expira em 15 minutos                                  | Confirmado |
| RN-014 | 2FA/TOTP é opcional para todos os usuários                         | Confirmado |
| RN-015 | 2FA/TOTP deve ser obrigatório para administradores                 | Pendente   |
| RN-017 | Sessão web deve expirar após inatividade (timeout)                 | Pendente   |

## 4. Fluxo Esperado

### Fluxo principal — Login

1. Usuário acessa `/login` com email + senha.
2. API valida credenciais com bcrypt.
3. API emite access token (15min) + refresh token (7 dias).
4. Frontend armazena tokens em sessionStorage.
5. Refresh automático em caso de 401.

### Fluxo — Recuperação de senha

1. Usuário solicita reset em `/forgot-password`.
2. API gera token temporário (15min) e envia email.
3. Usuário acessa `/reset-password?token=...`.
4. API valida token e permite nova senha.

### Fluxo — 2FA (pendente)

1. Usuário ativa 2FA no perfil → API gera secret + QR code.
2. Usuário escaneia no app autenticador e verifica código.
3. No login, após credenciais válidas, sistema solicita código TOTP.

## 5. Critérios de Aceite

- [x] Login com email + senha funcional
- [x] Refresh token com rotação
- [x] Logout invalida sessão
- [x] Recuperação de senha com token temporário
- [x] Rate limiting no login (5 tentativas/15min)
- [x] Perfil do usuário (GET /auth/me, POST /auth/me/password)
- [x] CSRF protection (cookie + header)
- [x] Headers de segurança (CSP, HSTS, X-Frame-Options, etc.)
- [ ] 2FA obrigatório para administradores
- [ ] Blacklist de tokens revogados
- [ ] Inativação de sessão em massa
- [ ] Timeout de sessão por inatividade

## 6. Impacto Técnico

| Área           | Impacto                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arquitetura    | Guards JWT + Roles em todas as rotas autenticadas                                                                                                    |
| Banco de dados | Tabelas: users, refresh_tokens, login_attempts (Supabase)                                                                                            |
| API            | POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me, POST /auth/me/password, POST /auth/forgot-password, POST /auth/reset-password |
| Frontend       | /login, /forgot-password, /reset-password, /app/profile                                                                                              |
| Testes         | Unit (auth.service, token.service, login-attempts), Integration (auth.controller, guards), Security (CSRF, SQL injection)                            |
| Infraestrutura | Redis para blacklist de tokens (pendente)                                                                                                            |
| Segurança      | bcrypt (salt >= 12), JWT, CSRF, CSP, rate limiting, 2FA/TOTP                                                                                         |

## 7. Testes Necessários

| Tipo        | Arquivo                        | Descrição                                               |
| ----------- | ------------------------------ | ------------------------------------------------------- |
| Unit        | auth.service.spec.ts           | login, refresh, logout, bcrypt                          |
| Unit        | token.service.spec.ts          | emissão e validação de JWT, expiry                      |
| Unit        | login-attempts.service.spec.ts | rate limiting, contagem, bloqueio                       |
| Unit        | csrf.middleware.spec.ts        | validação de token, exclusão de rotas públicas          |
| Integration | auth.controller.spec.ts        | todos os endpoints, códigos HTTP                        |
| Integration | jwt-auth.guard.spec.ts         | validação de token, extração de payload                 |
| Integration | roles.guard.spec.ts            | controle de acesso por role e setor                     |
| Security    | —                              | CSRF com token inválido/ausente → 403                   |
| Security    | —                              | Headers de segurança em todas as respostas              |
| Security    | —                              | SQL injection em campos de login                        |
| Manual      | —                              | Fluxo completo login → ação → logout → refresh expirado |

## 8. Riscos

| Risco                   | Impacto                                        | Mitigação                                   |
| ----------------------- | ---------------------------------------------- | ------------------------------------------- |
| 2FA opcional            | Conta admin comprometida sem 2FA               | Tornar 2FA obrigatório para admins (DT-001) |
| Sem blacklist de tokens | Tokens revogados continuam válidos até expirar | Implementar blacklist com Redis (DT-002)    |
| Sem timeout de sessão   | Sessões eternas em dispositivos compartilhados | Implementar timeout por inatividade         |

## 9. Dependências

- Supabase para persistência de usuários e refresh tokens
- otplib para 2FA/TOTP (instalado, endpoints pendentes)
- Redis para blacklist de tokens (pendente)
- SMTP para envio de emails de recuperação
