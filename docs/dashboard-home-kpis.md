# Dashboard Home e KPIs

## Objetivo

Este documento descreve a tela inicial em `/app` no estado atual do projeto.

## O que a tela faz hoje

A Home autenticada apresenta:

- cards principais de KPI;
- delta percentual em relação ao período anterior;
- tendência positiva, negativa ou neutra;
- resumo total de KPIs monitorados;
- total de setores cobertos;
- média de delta dos indicadores;
- agrupamento de KPIs por setor;
- estado vazio e fallback local quando a integração não entrega dados.

## Arquivos principais

- `apps/web/src/app/app/page.tsx`
- `apps/web/src/lib/kpis.ts`
- `apps/web/src/lib/kpis.test.ts`
- `apps/web/src/components/dashboard/kpi-card.tsx`
- `apps/web/src/components/dashboard/kpi-card.test.tsx`
- `apps/web/src/components/dashboard/dashboard-home.tsx`
- `apps/web/src/components/dashboard/dashboard-home.test.tsx`

## Fonte de dados

Hoje a tela lê:

- `kpis`
- `sectors`

diretamente do Supabase.

Se a leitura falha ou retorna vazia, a interface usa fallback local para continuar renderizando.

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

## Unidades suportadas

| Unidade    | Formatação    |
| ---------- | ------------- |
| `number`   | `1.250`       |
| `currency` | `R$ 1.200,00` |
| `percent`  | `82%`         |

Valores percentuais entre `-1` e `1` são exibidos como proporção.

## Tendências

| Delta | Tendência |
| ----: | --------- |
| `> 0` | positiva  |
| `< 0` | negativa  |
|   `0` | neutra    |

## Limitações atuais

- não há endpoint próprio de KPIs na API;
- não há gráficos com biblioteca dedicada;
- não há filtros avançados por período e setor na Home;
- não há dashboard personalizado do usuário.

## Validação

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web typecheck
pnpm --filter @dashboard-power-bi/web build
pnpm lint
pnpm quality
```
