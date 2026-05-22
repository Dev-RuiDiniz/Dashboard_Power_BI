# API Backend

## Visão geral

A API do Dashboard Power BI usa NestJS, TypeScript, validação global com `ValidationPipe`, Swagger e testes automatizados.

## Endpoints iniciais

### GET /health

Retorna o status básico da API.

```json
{
  "status": "ok",
  "service": "dashboard-power-bi-api"
}
```

### POST /validation-test

Endpoint técnico temporário usado para validar o funcionamento do `ValidationPipe` global.

## Autenticação — TASK-08

A autenticação inicial usa login por e-mail e senha, emissão de access token em formato JWT HS256, refresh token opaco, rotação de refresh token e logout com invalidação do refresh token atual.

### POST /auth/login

Autentica o usuário e retorna um par de tokens.

Payload:

```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

Resposta 200:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token-opaco>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

Erros esperados:

- `400 Bad Request` para payload inválido.
- `401 Unauthorized` para credenciais inválidas.
- `429 Too Many Requests` quando a proteção de brute-force bloquear novas tentativas.

### POST /auth/refresh

Rotaciona o refresh token e retorna novo par de tokens. O refresh token anterior é invalidado e não deve ser reutilizado.

Payload:

```json
{
  "refreshToken": "<refresh-token-atual>"
}
```

### POST /auth/logout

Invalida o refresh token atual.

Payload:

```json
{
  "refreshToken": "<refresh-token-atual>"
}
```

Resposta 200:

```json
{
  "success": true
}
```

## Proteção de login — TASK-09

O endpoint `POST /auth/login` possui proteção contra brute-force.

Política padrão:

- Máximo de 5 falhas de login.
- Janela de 15 minutos.
- Lockout temporário de 15 minutos.
- Chave de controle baseada em e-mail normalizado + IP.
- Login bem-sucedido limpa as falhas registradas para a chave.
- Durante o lockout, a API retorna `429 Too Many Requests`.

Variáveis relacionadas:

```env
AUTH_LOGIN_MAX_ATTEMPTS=5
AUTH_LOGIN_WINDOW_SECONDS=900
AUTH_LOGIN_LOCKOUT_SECONDS=900
```

Resposta esperada em lockout:

```json
{
  "statusCode": 429,
  "message": {
    "message": "Muitas tentativas de login. Tente novamente mais tarde.",
    "retryAfterSeconds": 900
  },
  "error": "Too Many Requests"
}
```

Observações de segurança:

- Senhas nunca são registradas em logs.
- Tokens nunca são registrados em logs.
- E-mails são mascarados nos logs de falha.
- IPs são mascarados nos logs.
- Eventos técnicos registrados: `login_failed`, `login_rate_limited` e `login_success`.
- A implementação atual usa memória local; em produção com múltiplas instâncias, o recomendado é evoluir para Redis.

## Swagger

A documentação Swagger fica disponível em:

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

## Validação manual de brute-force

```bash
for i in 1 2 3 4 5 6; do
  curl -i -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -H "x-forwarded-for: 10.10.10.10" \
    -d '{"email":"admin@example.com","password":"SenhaErrada123!"}'
done
```

A tentativa que exceder `AUTH_LOGIN_MAX_ATTEMPTS` deve retornar HTTP `429`.
