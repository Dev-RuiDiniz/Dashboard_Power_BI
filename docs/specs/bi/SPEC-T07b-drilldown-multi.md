# SPEC-T07b — Drill-down Multi-dimensão

**ID:** T07b
**Módulo:** BI
**Fase:** Fase 3
**Status:** Pendente
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Expandir o drill-down do dashboard para suportar múltiplas dimensões de análise: tempo, produto, região, além de setor.

## 2. Contexto

Atualmente o drill-down funciona apenas por dimensão setor. Usuários precisam explorar dados por outras dimensões (tempo/diário/mensal, produto/categoria, região/estado). Esta spec adiciona navegação entre dimensões no drill-down.

## 3. Regras de Negócio

Nenhuma RN específica.

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário clica em KPI/gráfico.
2. Drill-down abre com seletor de dimensão.
3. Dimensões disponíveis: setor, tempo, produto, região.
4. Usuário seleciona dimensão "tempo".
5. Dados agregados por tempo (diário/mensal/anual).
6. Usuário pode trocar dimensão sem voltar.

### Fluxo — Drill-down aninhado

1. Usuário está em drill-down por setor.
2. Clica em um setor específico.
3. Sub-drill-down por tempo dentro daquele setor.
4. Navegação breadcrumb para voltar.

## 5. Critérios de Aceite

- [ ] Seletor de dimensão no drill-down (setor, tempo, produto, região)
- [ ] Agregação de dados por dimensão selecionada
- [ ] Drill-down aninhado (dimensão dentro de dimensão)
- [ ] Breadcrumb de navegação
- [ ] Troca de dimensão sem recarregar
- [ ] Responsivo

## 6. Impacto Técnico

| Área           | Impacto                                                      |
| -------------- | ------------------------------------------------------------ |
| Arquitetura    | Modificação em dashboard.controller para aceitar dimensão    |
| Banco de dados | Queries de agregação por dimensão (SQL Server)               |
| API            | GET /dashboard/drill-down?dimension=...&sector=...           |
| Frontend       | Seletor de dimensão, breadcrumb, navegação aninhada          |
| Testes         | Unit (drill-down com múltiplas dimensões), Integration (API) |
| Infraestrutura | Nenhuma adicional                                            |
| Segurança      | JwtAuthGuard, filtro por setor                               |

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
- `dashboard.controller` (modificação para aceitar dimensão)
- Queries SQL de agregação por dimensão (pendentes)
