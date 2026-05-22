# API Backend

## Autenticação

### POST /auth/login

Autentica usuário e retorna `accessToken`, `refreshToken`, `tokenType` e `expiresIn`.

O `accessToken` carrega as claims de autorização:

```json
{
  "sub": "demo-admin",
  "email": "admin@example.com",
  "roles": ["admin"],
  "sectors": ["diretoria", "financeiro", "comercial", "operacoes"]
}
```

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

Variáveis :

```env
AUTH_LOGIN_MAX_ATTEMPTS=5
AUTH_LOGIN_WINDOW_SECONDS=900
AUTH_LOGIN_LOCKOUT_SECONDS=900
```

## Recuperação de senha — TASK-10

### POST /auth/forgot-password

Solicita instruções de recuperação de senha.

Payload:

```json
{
  "email": "admin@example.com"
}
```

Resposta 200 genérica para evitar enumeração de usuários:

```json
{
  "success": true,
  "message": "Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha."
}
```

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

## RBAC e permissões por setor — TASK-11

A autorização inicial usa RBAC com setores associados ao usuário.

### Perfis

| Perfil | Código | Permissões iniciais |
|---|---|---|
|Visualizador | `viewer` | Visualizar recursos do próprio setor |
| Downloader | `downloader` | Visualizar e baixar recursos do próprio setor |
| Admin | `admin` | Acessar recursos administrativos e qualquer setor |

### Setores iniciais

```text
financeiro
comercial
operacoes
diretoria
```

### Regras de autorização

- Token ausente, inválido ou expirado retorna `401 Unauthorized`.
- Token válido sem perfil necessário retorna `403 Forbidden`.
- Token válido sem setor necessário retorna `403 Forbidden`.
- `admin` tem acesso global a setores nesta primeira versão.
- A API não deve confiar em perfil ou setor enviado pelo cliente fora do JWT validado.

### Guards e decorators

A TASK-11 adiciona:

```ts
`Roles('viewer', 'downloader', 'admin')
@Sectors('financeiro')
@CurrentUser()
JwtAuthGuard
RolesGuard
SectorsGuard
```

`JwtAuthGuard` valida o Bearer token e popula `request.user`.
`RolesGuard` valida perfis exigidos por metadata.
`SectorsGuard` valida setor exigido por metadata ou por parâmetro de rota `:sector`.

### Endpoints técnicos de validação

Endpoints temporários/técnicos usados para validar autorização via e2e:

```text
GET /authz-test/view/:sector
GET /authz-test/download/:sector
GET /authz-test/admin
```

Esses endpoints exigem `Authorization: Bearer <accessToken>`.

### Usuários seed para desenvolvimento/testes

Quando `AUTH_DEMO_USER_EMAIL` e `AUTH_DEMO_USER_PASSWORD` estão configurados, são criados usuários em memória:

| E-mail | Perfil | Setores |
|---|---|---|
| `admin@example.com` ou valor de `AUTH_DEMO_USER_EMAIL` | `admin` | todos |
|`viewer.financeiro@example.com` | `viewer` | financeiro |
| `downloader.financeiro@example.com` | `downloader` | financeiro |
| `viewer.comercial@example.com` | `viewer` | comercial |

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

## Validação manual de autorização

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: 10.20.30.40" \
  -d '{"email":"viewer.financeiro@example.com","password":"Admin123!"}' | jq -r .accessToken)

curl -i http://localhost:3001/authz-test/view/financeiro \
  -H "Authorization: Bearer $TOKEN"

curl -i http://localhost:3001/authz-test/download/financeiro \
  -H "Authorization: Bearer $TOKEN"
```

A primeira chamada deve retornar `200`; a segunda deve retornar `403` para usuário `viewer`.
