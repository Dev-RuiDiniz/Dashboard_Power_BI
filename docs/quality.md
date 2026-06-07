# Qualidade

## Guardrails do workspace

- `pnpm verify:workspace`
- `pnpm verify:docker`
- `pnpm verify:docs`
- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Estratégia atual

- Jest para API e Web
- TypeScript estrito
- ESLint e Prettier
- validações estruturais em `scripts/`

## Leitura correta

Passar nos comandos de qualidade significa que o workspace está consistente tecnicamente naquele ponto. Isso não deve ser confundido com aderência completa ao escopo V1 do produto.
