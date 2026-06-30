# SPEC-T07b — Drill-down Multi-dimensão

**ID:** T07b
**Módulo:** BI
**Fase:** Fase 3
**Status:** Em implementação
**Atualizado em:** 2026-06-29

---

## 1. Objetivo

Expandir o drill-down do dashboard para suportar múltiplas dimensões de análise: tempo, produto, região, além de setor.

## 2. Contexto

Atualmente o drill-down funciona com uma dimensão fixa por KPI (hardcoded em `getDrilldownRows`). Cada KPI agrupa por uma única dimensão (fazenda, cultura, cliente, safra, etc). Esta spec adiciona seletor de dimensão selecionável pelo usuário, permitindo trocar a dimensão de agregação sem voltar ao resumo. As dimensões disponíveis dependem do dataset de cada KPI (plantio, colheita, contratos, embarques) e já estão disponíveis nos dados do Oracle/fallback — **não requer queries SQL Server adicionais**.

## 3. Regras de Negócio

Nenhuma RN específica.

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário clica em KPI/gráfico.
2. Drill-down abre com seletor de dimensão (tabs ou dropdown).
3. Dimensões disponíveis por KPI: fazenda, cultura, variedade, safra, cliente, produto, status, tempo.
4. Usuário seleciona dimensão "tempo".
5. Dados agregados por tempo (mensal).
6. Usuário pode trocar dimensão sem voltar ao resumo.
7. Breadcrumb mostra: Home > KPI > Dimensão atual.

## 5. Critérios de Aceite

- [ ] Seletor de dimensão no drill-down (fazenda, cultura, variedade, safra, cliente, produto, status, tempo)
- [ ] Agregação de dados por dimensão selecionada
- [ ] Breadcrumb de navegação (Home > KPI > Dimensão)
- [ ] Troca de dimensão sem recarregar
- [ ] Estados: loading, erro, vazio
- [ ] Responsivo

## 6. Impacto Técnico

| Área           | Impacto                                                        |
| -------------- | -------------------------------------------------------------- |
| Arquitetura    | Modificação em DashboardKpiDefinition para múltiplas dimensões |
| Banco de dados | Sem migrations — agrega de dataset Oracle/fallback existente   |
| API            | GET /dashboard/kpis/:kpiId/drilldown?dimension=...             |
| Frontend       | Seletor de dimensão, breadcrumb, troca sem recarregar          |
| Testes         | Unit (drill-down com múltiplas dimensões), Integration (API)   |
| Infraestrutura | Nenhuma adicional                                              |
| Segurança      | JwtAuthGuard, filtro por setor                                 |

## 7. Testes Necessários

| Tipo        | Arquivo                      | Descrição                                            |
| ----------- | ---------------------------- | ---------------------------------------------------- |
| Unit        | drill-down-chart.tsx         | Navegação entre níveis de detalhe                    |
| Unit        | dimension-selector.tsx       | Seleção de dimensão                                  |
| Integration | dashboard.controller.spec.ts | Agregação por dimensão                               |
| E2E         | —                            | Acessar → drill-down por tempo → trocar para produto |
| Manual      | —                            | Verificar agregação correta por dimensão             |

## 8. Riscos

| Risco                            | Impacto           | Mitigação                   |
| -------------------------------- | ----------------- | --------------------------- |
| Dados indisponíveis por dimensão | Drill-down vazio  | Estado vazio com mensagem   |
| Query complexa                   | Performance lenta | Agregação no backend, cache |

## 9. Dependências

- T07 (dashboard interativo) — concluído
- `dashboard.controller` (modificação para aceitar query param `dimension`)
- Dados com múltiplas dimensões já disponíveis no dataset Oracle/fallback
