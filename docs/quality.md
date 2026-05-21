# Qualidade de Código

## Objetivo

Este documento define a base de qualidade da Sprint 1 para o monorepo do Dashboard Power BI.

A TASK-02 configura lint, formatação, TypeScript strict, hooks locais e validação de mensagens de commit para manter o projeto consistente desde a fundação técnica.

## Ferramentas

- ESLint para análise estática.
- Prettier para formatação.
- TypeScript com configuração strict compartilhada.
- Husky para hooks locais.
- lint-staged para validar arquivos alterados antes do commit.
- commitlint para validar mensagens no padrão Conventional Commits.

## Comandos

```bash
pnpm install
pnpm verify:workspace
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm quality
```

## Fluxo TDD da tarefa

### Red

A validação de qualidade parte de comandos inexistentes ou incompletos na TASK-01.

### Green

As configurações foram adicionadas para permitir a execução dos comandos de qualidade.

### Refactor

A configuração foi centralizada na raiz do monorepo para ser reutilizada pelas aplicações e pacotes que serão inicializados nas próximas tarefas.

## Padrão de commits

As mensagens devem seguir Conventional Commits:

```bash
tipo(escopo): descrição curta em português
```

Exemplos:

```bash
chore(qualidade): configura tooling base do monorepo
docs(readme): atualiza comandos de qualidade
test(workspace): valida estrutura do monorepo
```

## Observações

- Os hooks do Husky são instalados após `pnpm install`, por meio do script `prepare`.
- O type-check usa `tsconfig.base.json` como configuração base. As aplicações futuras poderão criar `tsconfig.json` próprios estendendo esse arquivo.
- Não versionar secrets, arquivos `.env` reais, tokens ou credenciais.
