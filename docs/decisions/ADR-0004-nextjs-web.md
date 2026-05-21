# ADR-0004 — Inicialização da Web com Next.js 14

## Status

Aceita.

## Contexto

O produto precisa de uma aplicação frontend moderna, responsiva, testável e compatível com evolução incremental de telas, autenticação, dashboards, relatórios e administração.

## Decisão

Inicializar `apps/web` com Next.js 14, App Router, React 18, TypeScript, Tailwind CSS, base compatível com shadcn/ui e testes com Jest/Testing Library.

## Consequências positivas

- Estrutura frontend moderna desde a fundação.
- Separação clara entre layout, providers, componentes e páginas.
- Base preparada para design system e componentes reutilizáveis.
- Teste de renderização inicial garantindo que a home seja validável.
- Build web independente por workspace.

## Consequências negativas

- Adiciona dependências frontend ao monorepo antes das telas reais.
- ESLint e TypeScript podem exigir ajustes conforme componentes client-side forem adicionados.
- shadcn/ui ainda está representado por configuração e componentes mínimos, não por biblioteca completa.

## Mitigações

- Manter a implementação inicial simples e incremental.
- Documentar comandos e estrutura em `docs/web.md`.
- Evoluir componentes reutilizáveis apenas quando surgirem necessidades reais.
- Validar cada nova tela com testes e build.
