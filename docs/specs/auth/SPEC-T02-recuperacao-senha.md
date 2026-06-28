# SPEC-T02 — Recuperação e Redefinição de Senha

**ID:** T02
**Módulo:** Auth
**Fase:** Fase 1
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Permitir que usuários recuperem acesso à conta via email, com token temporário e redefinição de senha segura.

## 2. Contexto

Fluxo de duas telas: "Esqueci minha senha" (solicitação) e "Redefinir senha" (execução). O token temporário tem expiração de 15 minutos. A resposta de forgot-password é genérica para evitar enumeração de usuários.

## 3. Regras de Negócio

| Código | Regra                                   | Status     |
| ------ | --------------------------------------- | ---------- |
| RN-002 | Senhas devem ter no mínimo 8 caracteres | Confirmado |
| RN-004 | Refresh token expira em 7 dias          | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Solicitação

1. Usuário acessa `/forgot-password`.
2. Preenche email.
3. POST /auth/forgot-password com email.
4. API gera token temporário (15min) e envia email com link.
5. API retorna resposta genérica (200) independente de email existir.
6. Frontend exibe mensagem "Se o email existir, você receberá instruções".

### Fluxo principal — Redefinição

1. Usuário clica no link do email (`/reset-password?token=...`).
2. Frontend extrai token da URL.
3. Usuário digita nova senha + confirmação.
4. POST /auth/reset-password com token + nova senha.
5. API valida token (não expirado, não usado).
6. API atualiza passwordHash com bcrypt.
7. Frontend redireciona para `/login`.

### Fluxo alternativo — Token expirado

1. API retorna 401 "Token expirado".
2. Frontend exibe mensagem e link para solicitar novamente.

### Fluxo alternativo — Token inválido

1. API retorna 401 "Token inválido".
2. Frontend exibe mensagem de erro.

## 5. Critérios de Aceite

- [x] Tela /forgot-password com campo de email
- [x] Tela /reset-password com token na URL
- [x] Resposta genérica em forgot-password (anti-enumeração)
- [x] Token de reset com expiração de 15 minutos
- [x] Validação de complexidade (mínimo 8 caracteres)
- [x] Confirmação de senha (campos iguais)
- [x] Redirecionamento para /login após sucesso
- [x] Mensagens de erro para token expirado/inválido
- [x] Responsivo e acessível

## 6. Impacto Técnico

| Área           | Impacto                                                |
| -------------- | ------------------------------------------------------ |
| Arquitetura    | Rotas públicas, sem guard                              |
| Banco de dados | Consulta em users (email), atualização de passwordHash |
| API            | POST /auth/forgot-password, POST /auth/reset-password  |
| Frontend       | /forgot-password, /reset-password                      |
| Testes         | Unit (forms), Integration (password-reset.service)     |
| Infraestrutura | SMTP para envio de email                               |
| Segurança      | Token temporário, resposta genérica, bcrypt            |

## 7. Testes Necessários

| Tipo        | Arquivo                        | Descrição                                               |
| ----------- | ------------------------------ | ------------------------------------------------------- |
| Unit        | forgot-password-form.tsx       | Validação de email                                      |
| Unit        | reset-password-form.tsx        | Validação de token e senha                              |
| Integration | password-reset.service.spec.ts | Geração de token, validação de expiração                |
| Manual      | —                              | Verificar email com link de reset (se SMTP configurado) |

## 8. Riscos

| Risco                  | Impacto                      | Mitigação                            |
| ---------------------- | ---------------------------- | ------------------------------------ |
| Enumeração de usuários | Descoberta de emails válidos | Resposta genérica em forgot-password |
| Token interceptado     | Redefinição por atacante     | Expiração curta (15min), uso único   |
| SMTP indisponível      | Usuário não recebe email     | Logar falha, permitir reenvio        |

## 9. Dependências

- `password-reset.service` (geração e validação de token)
- SMTP configurado para envio de emails
- `users.repository` (atualização de passwordHash)
