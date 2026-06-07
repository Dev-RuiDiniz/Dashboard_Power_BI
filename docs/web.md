# Web

## Stack

- Next.js 14
- App Router
- Tailwind CSS
- componentes locais em `apps/web/src/components`

## Telas e fluxos já visíveis

- login
- recuperação e reset de senha
- área autenticada com `AuthGuard`
- dashboard inicial
- relatórios
- hub administrativo
- usuários
- grupos
- notificações
- exportações
- configurações do sistema
- página de design system

## Sessão

A sessão do frontend permanece em `localStorage`. Isso sustenta o fluxo atual, mas não representa o hardening final previsto no escopo V1.

## Limitações atuais

- parte da aplicação ainda lê Supabase diretamente;
- perfil do usuário não está completo;
- BI avançado, dashboards personalizados e editor visual ainda não estão entregues.
