# Dashboard Home e KPIs

## Objetivo

A TASK-22 inaugura a Sprint 4 com uma Home de BI para exibir os principais KPIs da plataforma Dashboard Power BI.

A tela fica disponível em `/app` e apresenta:

- cards principais de KPIs;
- delta percentual em relação ao período anterior;
- tendência positiva, negativa ou neutra;
- resumo total de KPIs monitorados;
- total de setores cobertos;
- média de delta dos indicadores;
- agrupamento de KPIs por setor;
- estado vazio quando não houver indicadores.

## Arquivos principais

- `apps/web/src/app/app/page.tsx`
- `apps/web/src/lib/kpis.ts`
- `apps/web/src/lib/kpis.test.ts`
- `apps/web/src/components/dashboard/kpi-card.tsx`
- `apps/web/src/components/dashboard/kpi-card.test.tsx`
- `apps/web/src/components/dashboard/dashboard-home.tsx`
- `apps/web/src/components/dashboard/dashboard-home.test.tsx`

## Contrato de KPI

```ts
type KpiItem = {
  id: string;
  title: string;
  sector: string;
  value: number;
  previousValue?: number;
  unit: 'number' | 'currency' | 'percent';
};
```

## Fórmula de delta

Quando há valor anterior:

```text
((valorAtual - valorAnterior) / abs(valorAnterior)) * 100
```

Quando `previousValue` é zero:

- se `value` também for zero, o delta é `0`;
- se `value` for diferente de zero, o delta é tratado como `100`.

Essa decisão evita divisão por zero e mantém uma leitura operacional segura para indicadores novos.

## Unidades suportadas

| Unidade | Formatação |
|---|---|
| `number` | `1.250` |
| `currency` | `R$ 1.200,00` |
| `percent` | `82%` |

Valores percentuais entre `-1` e `1` são exibidos como proporção. Por exemplo, `0.82` é exibido como `82%`.

## Tendências

| Delta | Tendência |
|---:|---|
| `> 0` | positiva |
| `< 0` | negativa |
| `0` | neutra |

## TDD aplicado

Foram criados testes antes da implementação para:

- cálculo de delta percentual;
- tratamento de `previousValue = 0`;
- classificação de tendência;
- agregação de KPIs por setor;
- formatação de número, moeda e percentual;
- resumo geral da Home;
- renderização dos cards;
- renderização da Home com dados;
- estado vazio.

## Validação esperada

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web typecheck
pnpm --filter @dashboard-power-bi/web build
pnpm lint
pnpm quality
```

## Próximos passos

- Criar endpoint de KPIs no backend.
- Substituir dados controlados do frontend por consumo autenticado de API.
- Permitir filtros por período e setor na Home.
- Adicionar gráficos resumidos para evolução temporal.
