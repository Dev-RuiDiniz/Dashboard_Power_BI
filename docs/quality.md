# Qualidade de código

## Objetivo

Este documento descreve a base de qualidade realmente mantida no repositório.

## Ferramentas

- ESLint para análise estática;
- Prettier para formatação;
- TypeScript em modo strict;
- Husky para hooks locais;
- lint-staged para validar arquivos alterados antes do commit;
- commitlint para validar mensagens no padrão Conventional Commits.

## Comandos

```bash
pnpm install
pnpm verify:workspace
pnpm verify:docker
pnpm verify:docs
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm quality
```

## Padrão de commits

As mensagens devem seguir Conventional Commits:

```bash
tipo(escopo): descrição curta
```

Exemplos:

```bash
chore(qualidade): ajusta validações do monorepo
docs(readme): atualiza documentação principal
test(api): cobre fluxo de autenticação
```

## Observações

- os hooks do Husky são instalados após `pnpm install`, via script `prepare`;
- o typecheck usa `tsconfig.base.json` como base compartilhada;
- arquivos `.env` reais, tokens e credenciais não devem ser versionados;
- `pnpm quality` consolida as validações estruturais e de código do repositório.
