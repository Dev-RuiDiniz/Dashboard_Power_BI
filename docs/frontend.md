# Frontend

## TASK-13 — Telas Login e Recuperação

Rotas de autenticação implementadas no app web:

```text
/login
/forgot-password
/reset-password?token=<token>
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

## TASK-14 — Base da área autenticada

A área autenticada foi estruturada a partir de `/app`.

Rotas iniciais:

```text
/app
/app/reports
/app/admin
```

### Layout autenticado

A base autenticada usa:

```text
AuthenticatedLayout
AuthGuard
AppSidebar
AppHeader
LogoutButton
NavLink
```

Composição:

- sidebar lateral em desktop;
- header com status de sessão e botão `Sair`;
- conteúdo principal com espaçamento consistente;
- placeholders para visão geral, relatórios e administração.

### Guarda de rotas

`AuthGuard` é client-side e valida a presença de uma sessão local válida.

Comportamento:

- sem sessão: redireciona para `/login`;
- sessão ausente, corrompida ou com formato inválido: limpa storage e bloqueia conteúdo;
- sessão válida: renderiza o conteúdo protegido;
- durante verificação: exibe estado de loading.

A sessão é considerada válida quando contém:

```text
accessToken
refreshToken
tokenType = Bearer
expiresIn > 0
```

### Logout

O botão `Sair` executa:

```text
clearAuthSession()
router.replace('/login')
```

Nesta fase, o logout limpa apenas a sessão local. Em produção, o fluxo deve chamar o backend para revogar refresh token antes de limpar a sessão local.

### Segurança

A sessão ainda é persistida em `localStorage` por simplicidade nesta fase. Antes de produção, a recomendação é migrar refresh/access token para cookies `HttpOnly`, `Secure` e `SameSite`, com proteção server-side/middleware e rotação segura no backend.

A guarda client-side melhora a experiência, mas não substitui autorização no backend.

### Validação

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web typecheck
pnpm --filter @dashboard-power-bi/web build
```

### Teste manual

1. Acesse `/app` sem login.
2. Confirme redirecionamento para `/login`.
3. Faça login em `/login`.
4. Confirme redirecionamento para `/app`.
5. Confirme sidebar, header e botão `Sair`.
6. Clique em `Sair`.
7. Confirme limpeza da sessão e retorno para `/login`.
