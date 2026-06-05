# Frontend

## Escopo deste documento

Este documento complementa `docs/web.md` com foco em comportamento do frontend e experiência atual do usuário.

## Sessão e autenticação no navegador

A sessão do usuário é salva em `localStorage`.
Arquivos centrais:

- `apps/web/src/lib/auth/session.ts`
- `apps/web/src/components/auth/auth-guard.tsx`
- `apps/web/src/components/auth/logout-button.tsx`

Comportamento atual:

- login bem-sucedido salva access token e refresh token localmente;
- `AuthGuard` valida a presença e o formato básico da sessão;
- logout limpa a sessão local e redireciona para `/login`.

Limites atuais:

- a proteção de rota é client-side;
- não há cookie `HttpOnly`;
- não há middleware server-side de autenticação;
- a maturidade de sessão ainda é inferior ao que seria esperado para produção.

## Rotas de autenticação

```text
/login
/forgot-password
/reset-password
```

### `/login`

- consome `POST /auth/login`;
- valida e-mail e senha;
- trata erro de credenciais inválidas e bloqueio por tentativas;
- redireciona para `/app` quando a sessão é criada.

### `/forgot-password`

- consome `POST /auth/forgot-password`;
- usa mensagem genérica de sucesso para evitar enumeração.

### `/reset-password`

- consome `POST /auth/reset-password`;
- exige token, nova senha e confirmação.

## Área autenticada

Rotas centrais:

```text
/app
/app/reports
/app/exports
/app/notifications
/app/admin
```

Componentes estruturais:

- `AuthenticatedLayout`
- `AppSidebar`
- `AppHeader`
- `NavLink`
- `LogoutButton`

O sistema hoje entrega navegação autenticada funcional, mas ainda sem o conjunto completo de telas do escopo V1.

## Dashboard

O dashboard inicial:

- lê `kpis` e `sectors` direto do Supabase;
- calcula tendências e agregações localmente;
- mostra fallback local quando a integração não responde.

Consequência prática:

- a tela permanece navegável mesmo sem dados reais;
- isso ajuda em desenvolvimento, mas pode esconder falhas de integração.

## Relatórios

O frontend de relatórios:

- busca catálogo via API;
- monta filtros a partir dos metadados;
- envia a consulta para a API;
- mostra os resultados em tabela;
- mantém detalhe e visualização na mesma experiência de página.

O que ainda não existe:

- visualizador dedicado por rota;
- gráfico interativo;
- exportação completa;
- favoritos integrados de ponta a ponta.

## Administração

O frontend administrativo hoje cobre:

- hub de admin;
- usuários;
- grupos;
- configurações.

O que ainda não existe:

- gestão de relatórios na Web;
- gestão de permissões;
- logs de auditoria;
- editor de dashboards.

## Integrações diretas no frontend

Partes do sistema consultam Supabase sem passar pela API:

- dashboard;
- exportações;
- notificações;
- configurações.

Essa decisão já está refletida no código e precisa ser considerada em qualquer evolução arquitetural.

## Validação

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web typecheck
pnpm --filter @dashboard-power-bi/web build
```
