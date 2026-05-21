# ADR-0005 — Design system base

## Status

Aceita.

## Contexto

O frontend precisa de consistência visual para evoluir telas de relatórios, dashboards e administração sem duplicar estilos ou criar componentes isolados.

## Decisão

Criar um design system inicial em `apps/web` usando Tailwind CSS, tokens semânticos, componentes inspirados em shadcn/ui e uma rota `/design-system` como preview visual.

## Consequências positivas

- Reutilização de componentes desde a Sprint 1.
- Melhor consistência visual.
- Base preparada para estados de interface.
- Testes de componentes com Testing Library.
- Evolução incremental antes da adoção de Storybook.

## Consequências negativas

- Aumenta a superfície de manutenção do frontend.
- A rota `/design-system` é uma solução provisória para preview visual.
- Alguns componentes ainda são mínimos e precisarão evoluir com casos reais.

## Mitigações

- Documentar tokens e variantes.
- Manter componentes simples.
- Adicionar testes junto com novas variantes.
- Revisar acessibilidade nas próximas telas.
