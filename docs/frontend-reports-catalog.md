# Frontend de Relatórios

## Objetivo

Este documento detalha o comportamento atual dos filtros e da listagem de relatórios em `/app/reports`.

## O que existe hoje

A rota `/app/reports` consome a Reports API e permite aplicar filtros validados com Zod antes do envio.

Arquivos principais:

- `apps/web/src/components/reports/report-advanced-filters.tsx`
- `apps/web/src/components/reports/report-catalog-container.tsx`
- `apps/web/src/lib/report-filters.ts`
- `apps/web/src/lib/reports-api.ts`
- `apps/web/src/lib/report-filters.test.ts`
- `apps/web/src/components/reports/report-advanced-filters.test.tsx`

## Campos de filtro

| Campo        | Query param               | Regra                                            |
| ------------ | ------------------------- | ------------------------------------------------ |
| Data inicial | `startDate`               | `YYYY-MM-DD`                                     |
| Data final   | `endDate`                 | `YYYY-MM-DD`; não pode ser menor que `startDate` |
| Categoria    | `category`                | texto com `trim`                                 |
| Setor        | `sector`                  | texto com `trim`                                 |
| Competência  | `parameters[competencia]` | parâmetro dinâmico opcional                      |

Campos vazios não são enviados para a API.

## Exemplo de chamada

```http
GET /reports?page=1&pageSize=20&startDate=2026-05-01&endDate=2026-05-31&category=dre&sector=financeiro&parameters[competencia]=2026-05
```

Quando houver token de sessão, o cliente envia:

```http
Authorization: Bearer <token>
Accept: application/json
```

A URL base vem de `NEXT_PUBLIC_API_URL`, com fallback local para `http://localhost:3001`.

## Segurança

A autorização real permanece no backend.
O frontend apenas:

- valida formato;
- normaliza filtros;
- monta query string/payload;
- exibe os dados retornados pela API.

## Limitações atuais

- o detalhe do relatório não é uma rota dedicada;
- a visualização e o catálogo dividem a mesma experiência de página;
- não há exportação backend a partir desse fluxo;
- não há gráficos interativos a partir dos resultados.

## Validação

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web typecheck
pnpm --filter @dashboard-power-bi/web build
pnpm lint
pnpm quality
```
