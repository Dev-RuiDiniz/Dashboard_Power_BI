# Design system base

## Objetivo

A TASK-05 cria a base visual do Dashboard Power BI para acelerar telas futuras com consistência, acessibilidade e reutilização.

## Tokens

Os tokens iniciais ficam em `apps/web/tailwind.config.ts` e `apps/web/src/app/globals.css`.

Tokens definidos:

- background e foreground;
- border e muted;
- primary e secondary;
- success, warning e danger;
- radius `sm`, `md`, `lg`, `xl`, `2xl`;
- sombras `card` e `panel`;
- família tipográfica base.

## Componentes

Componentes adicionados em `apps/web/src/components`:

- `Button` com variantes `default`, `secondary`, `outline`, `ghost` e tamanhos `sm`, `md`, `lg`;
- `Card`, `CardHeader`, `CardTitle`, `CardDescription` e `CardContent`;
- `Input` com label, helper text, erro e atributos de acessibilidade;
- `Table` com header, body, row, head, cell e estado vazio;
- `Badge` com variantes semânticas;
- `Header`;
- `Sidebar`.

## Preview visual

A rota `/design-system` funciona como preview visual inicial dos componentes e substitui temporariamente um Storybook até a adoção de ferramenta dedicada.

## Testes

Foram adicionados testes de renderização para componentes principais e preview visual usando Jest e Testing Library.

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web build
```

## Critérios de evolução

- Componentes devem ser pequenos, reutilizáveis e acessíveis.
- Novas variantes devem ser documentadas.
- Estados de loading, erro, vazio e sucesso devem ser testados quando aplicável.
- Tokens devem ser semânticos e evitar cores hardcoded em telas.
