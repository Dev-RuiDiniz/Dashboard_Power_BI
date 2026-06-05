# Design system base

## Objetivo

Este documento descreve a base visual realmente existente na Web.

## Onde está

Arquivos principais:

- `apps/web/tailwind.config.ts`
- `apps/web/src/app/globals.css`
- `apps/web/src/components/ui/*`
- `apps/web/src/app/design-system/page.tsx`

## Tokens

O repositório já define tokens para:

- background e foreground;
- border e muted;
- primary e secondary;
- success, warning e danger;
- radius `sm`, `md`, `lg`, `xl`, `2xl`;
- sombras de card/painel;
- tipografia base.

## Componentes existentes

- `Button`
- `Card`
- `Input`
- `Table`
- `Badge`
- `Header`
- `Sidebar`

Esses componentes sustentam a aplicação atual, especialmente auth, dashboard, relatórios e admin.

## Preview visual

A rota:

```text
/design-system
```

funciona como vitrine dos componentes existentes.

## Estado atual

- a base visual é suficiente para a aplicação já navegável;
- não existe biblioteca compartilhada madura em `packages/ui`;
- o design system ainda é uma base de projeto, não uma camada de produto completa.

## Validação

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web build
```
