# SPEC-T07 — Dashboard Interativo (Gráficos + Drill-down)

**ID:** T07
**Módulo:** BI
**Fase:** Fase 3
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Dashboard com gráficos Recharts interativos (linha, barra, pizza, área), drill-down por KPI e navegação entre níveis de detalhe.

## 2. Contexto

Componente central do BI. Gráficos reais com dados da API, tooltips customizados, drill-down por setor (dimensão única atualmente). Multi-dimensão é pendência (T07b).

## 3. Regras de Negócio

Nenhuma RN específica.

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário acessa dashboard home.
2. Gráficos Recharts renderizam com dados reais.
3. Hover exibe tooltip com valores formatados.
4. Clique em KPI/gráfico → drill-down por setor.
5. Detalhe abre com dados do setor selecionado.

### Fluxo alternativo — Sem dados para drill-down

1. Setor sem dados detalhados.
2. Exibe estado vazio no detalhe.

## 5. Critérios de Aceite

- [x] Gráficos reais usando Recharts: linha, barra, pizza, área
- [x] Drill-down por KPI: clique abre detalhe por dimensão
- [x] Interação: hover com tooltip, clique para navegação
- [x] Responsivo
- [x] Sparkline mini-chart em cada KPI card
- [x] Widgets de gráfico em dashboards personalizados com dados reais
- [ ] Múltiplas dimensões: tempo, produto, região (T07b)

## 6. Impacto Técnico

| Área           | Impacto                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| Arquitetura    | Componentes de chart reutilizáveis                                        |
| Banco de dados | Consulta de KPIs e histórico                                              |
| API            | GET /dashboard/home, endpoints de drill-down                              |
| Frontend       | charts/\* (5 tipos + sparkline), dashboard-home.tsx, dashboard-detail.tsx |
| Testes         | Unit (charts, dashboard-home, dashboard-detail)                           |
| Infraestrutura | Nenhuma adicional                                                         |
| Segurança      | JwtAuthGuard                                                              |

## 7. Testes Necessários

| Tipo        | Arquivo                      | Descrição                           |
| ----------- | ---------------------------- | ----------------------------------- |
| Unit        | bar-chart-widget.test.tsx    | Renderização e interação            |
| Unit        | line-chart-widget.test.tsx   | Múltiplas séries                    |
| Unit        | pie-chart-widget.test.tsx    | Renderização de setores             |
| Unit        | area-chart-widget.test.tsx   | FillOpacity                         |
| Unit        | chart-tooltip.test.tsx       | Formatação de unidades              |
| Unit        | dashboard-detail.test.tsx    | Widgets chart com histórico real    |
| Integration | dashboard.controller.spec.ts | Endpoints de drill-down             |
| Manual      | —                            | Verificar interação com dados reais |

## 8. Riscos

| Risco                        | Impacto                                | Mitigação             |
| ---------------------------- | -------------------------------------- | --------------------- |
| Drill-down limitado a sector | Usuários não exploram outras dimensões | T07b (multi-dimensão) |
| Performance com muitos dados | Gráfico lento                          | Agregação no backend  |

## 9. Dependências

- `recharts` (instalado)
- `dashboard.controller` (dados e drill-down)
- `dashboard-home.tsx` (integração)
