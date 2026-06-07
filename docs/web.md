# Web

## Stack

- Next.js 14
- App Router
- Tailwind CSS
- componentes locais em `apps/web/src/components`

## Telas e fluxos já visíveis

- login
- recuperação e reset de senha
- perfil do usuário
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

## Integração atual

- auth, perfil, dashboard, relatórios, exportações, notificações e settings usam a API NestJS como fonte oficial;
- a Web não depende mais de leituras diretas do Supabase nesses fluxos principais da plataforma.
- a tela de detalhe do relatório já consegue solicitar exportações em PDF e Excel;
- a tela de exportações baixa arquivos pela API autenticada, sem depender de link público cru.

## Limitações atuais

- persistências de platform ainda dependem do Supabase no backend atual;
- BI avançado, dashboards personalizados e editor visual ainda não estão entregues.
