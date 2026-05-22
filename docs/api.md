# API Backend

## Autenticação

### POST /auth/login

Autentica usuário e retorna `accessToken`, `refreshToken`, `tokenType` e `expiresIn`.

Erros esperados: `400`, `401` e `429` quando a proteção de brute-force bloquear novas tentativas.

### POST /auth/refresh

Rotaciona refresh token e emite novo par de tokens.

### POST /auth/logout

Invalida o refresh token atual.

## Proteção de login — TASK-09

Política padrão:

- 5 falhas de login em 15 minutos.
- Lockout temporário de 15 minutos.
- Chave de controle baseada em e-mail normalizado + IP.
- Logs sem senha, token ou secrets.

Variáveis:

```env
AUTH_LOGIN_MAX_ATTEMPTS=5
AUTH_LOGIN_WINDOW_SECONDS=900
AUTH_LOGIN_LOCKOUT_SECONDS=900
```

## Recuperação de senha — TASK-10

A recuperação de senha usa fluxo `forgot/reset`, token temporário opaco, expiração configurável e envio de e-mail mockável em testes.

### POST /auth/forgot-password

Solicita instruções de recuperação de senha.

Payload:

```json
{
  "email": "admin@example.com"
}
```

Resposta 200:

```json
{
  "success": true,
  "message": "Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha."
}
```

Regras de segurança:

- Resposta sempre genérica para evitar enumeração de usuários.
- Token temporário opaco.
- Armazenamento interno apenas do hash SHA-256 do token.
- Tokens anteriores ativos são invalidados ao gerar novo token.
- Token nunca é registrado em logs.

### POST /auth/reset-password

Redefine a senha usando token temporário.

Payload:

```json
{
  "token": "<token-temporario>",
  "newPassword": "NovaSenha123!"
}
```

Resposta 200:

```json
{
  "success": true
}
```

Erros esperados:

- `400 Bad Request` para token inválido, expirado ou já utilizado.
- `400 Bad Request` para payload inválido.

Regras de segurança:

- Token de uso único.
- Senha nova armazenada com bcrypt.
- Sessões/refresh tokens ativos do usuário são revogados após reset.
- Token, senha e secrets não são registrados em logs.

Variáveis:

```env
PASSWORD_RESET_TOKEN_EXPIRES_SECONDS=900
PASSWORD_RESET_PUBLIC_URL=http://localhost:3000/reset-password
SMTP_MODE=mock
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
SMTP_SECURE=false
```

## Swagger

```text
http://localhost:3001/docs
```

## Comandos

```bash
pnpm install
pnpm dev:api
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api test:e2e
pnpm --filter @dashboard-power-bi/api typecheck
pnpm --filter @dashboard-power-bi/api build
```

## Validação manual

```bash
curl -i -X POST http://localhost:3001/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'
```

Em `SMTP_MODE=mock`, o envio é capturado pelo adapter em memória usado nos testes automatizados.
