# SPEC-T03 — Dashboard Home (KPIs)

**ID:** T03
**Módulo:** BI
**Fase:** Fase 1
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela inicial do painel com cards de KPIs consolidados por setor, gráficos e sparklines.

## 2. Contexto

Primeira tela após login. Exibe resumo executivo com KPIs do setor do usuário (ou todos para admin). Dados via GET /dashboard/home. Usa React Query com staleTime 5min.

## 3. Regras de Negócio

Nenhuma RN específica. Aplica RN-006 (filtro por setor no backend).

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário faz login → redireciona para `/app`.
2. Frontend chama GET /dashboard/home.
3. API agrega KPIs por setor.
4. Frontend exibe cards com valores formatados + sparklines.
5. Gráficos Recharts com dados reais.

### Fluxo alternativo — Vazio

1. Sem dados disponíveis.
2. Frontend exibe estado vazio.

### Fluxo alternativo — Erro

1. API indisponível.
2. Frontend exibe estado de erro com retry.

## 5. Critérios de Aceite

- [x] Cards de resumo executivo com valores formatados por setor
- [x] Dados carregados via API (GET /dashboard/home)
- [x] Estados: loading, erro, vazio
- [x] Atualização via React Query (staleTime: 5 min)
- [x] Sparkline mini-chart em cada KPI card

## 6. Impacto Técnico

| Área           | Impacto                                                             |
| -------------- | ------------------------------------------------------------------- |
| Arquitetura    | Rota autenticada, React Query                                       |
| Banco de dados | Agregação em api_kpis ou SQL Server                                 |
| API            | GET /dashboard/home                                                 |
| Frontend       | /app, dashboard-home.tsx, kpi-card.tsx                              |
| Testes         | Unit (dashboard-home, kpi-card), Integration (dashboard.controller) |
| Infraestrutura | Nenhuma adicional                                                   |
| Segurança      | JwtAuthGuard, filtro por setor                                      |

## 7. Testes Necessários

| Tipo        | Arquivo                      | Descrição                         |
| ----------- | ---------------------------- | --------------------------------- |
| Unit        | dashboard-home.tsx           | Renderização de KPIs, estados     |
| Unit        | kpi-card.test.tsx            | Sparkline com dados corretos      |
| Integration | dashboard.controller.spec.ts | Agregação de KPIs                 |
| Manual      | —                            | Verificar valores reais por setor |

## 8. Riscos

| Risco               | Impacto         | Mitigação                 |
| ------------------- | --------------- | ------------------------- |
| Dados indisponíveis | Dashboard vazio | Estado vazio com mensagem |
| Performance lenta   | UX degradada    | React Query com cache     |

## 9. Dependências

- `dashboard.controller` (GET /dashboard/home)
- `react-query` (cache e refresh)
- `recharts` (sparklines)
