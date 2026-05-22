# API Backend

## Autenticação

A API usa JWT com `roles` e `sectors` no `accessToken`.

Endpoints principais:

```text
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
```

Regras de segurança já implementadas:

- Login com proteção contra brute-force.
- Refresh token opaco e rotacionável.
- Recuperação de senha com token temporário.
- RBAC com `viewer`, `downloader` e `admin`.
- Permissões por setor com `financeiro`, `comercial`, `operacoes` e `diretoria`.

## Administração — TASK-12

Os endpoints administrativos exigem:

```text
Authorization: Bearer <accessToken>
perfil admin
```

Sem token a API retorna `401 Unauthorized`. Com token válido sem perfil `admin`, retorna `403 Forbidden`.

### Usuários

```text
GET    /admin/users
GET    /admin/users/:id
POST   /admin/users
PATCH  /admin/users/:id
PATCH  /admin/users/:id/deactivate
POST   /admin/users/:id/reset-password
PUT    /admin/users/:id/groups
```

#### POST /admin/users

Payload:

```json
{
  "email": "usuario@example.com",
  "password": "SenhaInicial123!",
  "roles": ["viewer"],
  "sectors": ["financeiro"],
  "groupIds": []
}
```

Regras:

- `email` deve ser válido e único.
- `password` deve ter no mínimo 8 caracteres.
- `roles` aceita `viewer`, `downloader` e `admin`.
- `sectors` aceita `financeiro`, `comercial`, `operacoes` e `diretoria`.
- `groupIds`, quando informado, deve referenciar grupos existentes.
- A resposta nunca expõe `passwordHash`.

#### PATCH /admin/users/:id

Permite editar `email`, `roles`, `sectors` e `groupIds`.

#### PATCH /admin/users/:id/deactivate

Desativa logicamente o usuário e preenche `deactivatedAt`.

#### POST /admin/users/:id/reset-password

Payload:

```json
{
  "newPassword": "NovaSenha123!"
}
```

Atualiza a senha com bcrypt e não retorna a senha.

#### PUT /admin/users/:id/groups

Payload:

```json
{
  "groupIds": ["<group-id>"]
}
```

Vincula o usuário a grupos existentes.

### Grupos

```text
GET    /admin/groups
GET    /admin/groups/:id
POST   /admin/groups
PATCH  /admin/groups/:id
DELETE /admin/groups/:id
```

#### POST /admin/groups

Payload:

```json
{
  "name": "Financeiro - Downloaders",
  "description": "Grupo com permissão de download no setor financeiro.",
  "roles": ["downloader"],
  "sectors": ["financeiro"]
}
```

Regras:

- `name` é obrigatório e único.
- `roles` e `sectors` seguem os mesmos valores permitidos dos usuários.
- `DELETE /admin/groups/:id` remove o grupo em memória nesta versão inicial.

## Validação manual

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: 10.20.30.40" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' | jq -r .accessToken)

curl -i http://localhost:3001/admin/users \
  -H "Authorization: Bearer $TOKEN"

curl -i -X POST http://localhost:3001/admin/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Financeiro - Downloaders","roles":["downloader"],"sectors":["financeiro"]}'
```

## Comandos

```bash
pnpm install
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api test:e2e
pnpm --filter @dashboard-power-bi/api typecheck
pnpm lint
pnpm build
```

## Observações

A persistência de usuários e grupos ainda é em memória. Para produção, a próxima evolução recomendada é persistir usuários, grupos, roles e setores no SQL Server, com auditoria de alterações administrativas.
