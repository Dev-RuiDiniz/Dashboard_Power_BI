# ADR-0002 — Tooling de qualidade do monorepo

## Status

Aceita.

## Contexto

O projeto precisa de uma base técnica consistente para evoluir com múltiplas aplicações e pacotes no mesmo repositório. Sem lint, formatação, type-check e convenção de commits desde o início, o risco de divergência de padrões aumenta conforme novas tarefas forem implementadas.

## Decisão

Adotar as seguintes ferramentas na raiz do monorepo:

- ESLint com flat config.
- Prettier.
- TypeScript strict em `tsconfig.base.json`.
- Husky.
- lint-staged.
- commitlint com Conventional Commits.

## Consequências positivas

- Padronização de código desde a fundação.
- Menos divergência entre frontend, backend e pacotes internos.
- Commits mais rastreáveis.
- Base pronta para CI/CD nas próximas tarefas.
- Melhor manutenção em Pull Requests pequenos e frequentes.

## Consequências negativas

- Requer instalação local para hooks funcionarem.
- Pode exigir ajustes futuros conforme NestJS, Next.js e pacotes internos forem inicializados.
- A configuração inicial ainda é genérica porque as aplicações reais serão criadas em tarefas posteriores.

## Mitigações

- Documentar comandos no README e em `docs/quality.md`.
- Manter configuração simples e evolutiva.
- Atualizar regras conforme cada aplicação for inicializada.
- Validar mudanças por PR.
