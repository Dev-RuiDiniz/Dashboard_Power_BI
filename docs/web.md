# Aplicação Web

## Visão geral

A aplicação web do Dashboard Power BI foi inicializada em `apps/web` com Next.js 14, App Router, TypeScript, Tailwind CSS, estrutura base de shadcn/ui, layout global, providers e testes de renderização.

## Objetivo da TASK-04

Entregar a fundação frontend para sustentar as próximas telas do produto, preservando qualidade, responsividade e documentação técnica desde o início.

## Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Jest
- Testing Library
- shadcn/ui como referência de organização visual

## Estrutura

```text
apps/web/
  src/
    app/
      globals.css
      layout.tsx
      page.tsx
      page.test.tsx
      providers.tsx
    components/
      ui/
        button.tsx
        card.tsx
    lib/
      utils.ts
```

## Comandos

```bash
pnpm install
pnpm dev:web
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web build
pnpm --filter @dashboard-power-bi/web typecheck
```

## Rota inicial

### GET /

Renderiza a home institucional inicial com:

- nome do produto;
- descrição da plataforma;
- cards de Relatórios, Dashboards e Administração;
- status da fundação técnica;
- base responsiva com Tailwind CSS.

## Testes

O teste inicial fica em `apps/web/src/app/page.test.tsx` e valida a renderização da home com Testing Library.

## Observações técnicas

- O arquivo `components.json` define a base de organização compatível com shadcn/ui.
- Os componentes `Button` e `Card` são mínimos e poderão evoluir para o design system do produto.
- Nenhum arquivo `.env` real, token ou credencial deve ser versionado.
