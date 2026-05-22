# Frontend

## TASK-13 — Telas Login e Recuperação

Rotas implementadas no app web:

```text
/login
/forgot-password
/reset-password?token=<token>
/app
```

A integração usa `NEXT_PUBLIC_API_URL`, com fallback local para `http://localhost:3001`.

### Login

`/login` consome `POST /auth/login`.

Estados cobertos:

- validação de e-mail obrigatório e formato inválido;
- validação de senha obrigatória;
- loading durante envio;
- erro de credenciais inválidas;
- erro de limite de tentativas `429`;
- salvamento da sessão em `localStorage`;
- redirecionamento para `/app`.

### Recuperação

`/forgot-password` consome `POST /auth/forgot-password`.

A mensagem de sucesso é genérica para evitar enumeração de usuários.

### Redefinição

`/reset-password?token=<token>` consome `POST /auth/reset-password`.

Valida token obrigatório, senha mínima de 8 caracteres e confirmação igual à nova senha.

### Segurança

A sessão da TASK-13 é persistida em `localStorage` por simplicidade nesta fase. Antes de produção, a recomendação é migrar refresh/access token para cookies `HttpOnly`, `Secure` e `SameSite`, com rotação segura no backend.

### Validação

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web typecheck
pnpm --filter @dashboard-power-bi/web build
```
