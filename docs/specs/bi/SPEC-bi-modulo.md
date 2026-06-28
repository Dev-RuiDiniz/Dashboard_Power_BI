# SPEC-bi-modulo — Módulo BI (Business Intelligence)

**ID:** BI-MOD
**Módulo:** BI
**Fase:** Fase 3 (em planejamento)
**Status:** Parcial
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Fornecer dashboards interativos com KPIs, gráficos Recharts, drill-down, dashboards personalizados e editor visual drag-and-drop.

## 2. Contexto

O módulo BI é o diferencial competitivo da plataforma. Dashboard home com KPIs consolidados, gráficos interativos (linha, barra, pizza, área), drill-down por dimensão, dashboards personalizados pelo usuário e editor visual. Recharts já instalado e integrado.

## 3. Regras de Negócio

| Código | Regra                                              | Status     |
| ------ | -------------------------------------------------- | ---------- |
| RN-018 | Dashboards personalizados são privados por usuário | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Dashboard Home

1. Usuário acessa `/app` (dashboard home).
2. API agrega KPIs por setor (GET /dashboard/home).
3. Frontend exibe cards de KPI com sparklines.
4. Gráficos Recharts com dados reais.

### Fluxo — Dashboard interativo

1. Usuário clica em KPI ou gráfico.
2. Drill-down abre detalhe por dimensão (setor atual).
3. Navegação entre níveis de detalhe.

### Fluxo — Dashboard personalizado

1. Usuário acessa `/app/dashboards`.
2. Cria novo dashboard.
3. Adiciona widgets (KPI, gráfico, tabela).
4. Reordena via drag-and-drop.
5. Salva layout (PATCH /dashboards/:id).

## 5. Critérios de Aceite

- [x] Dashboard home com KPIs consolidados por setor
- [x] Gráficos Recharts: linha, barra, pizza, área
- [x] Drill-down por KPI (clique abre detalhe)
- [x] Sparkline mini-chart em cada KPI card
- [x] Dashboards personalizados pelo usuário
- [x] Widgets: KPI, gráfico, tabela
- [x] Editor visual mínimo (reordenação drag-and-drop)
- [x] Persistência de layouts no backend
- [ ] Drill-down multi-dimensão (tempo, produto, região)
- [ ] Editor visual completo (redimensionamento, paleta, canvas livre)
- [ ] Exportar dashboard como imagem/PDF
- [ ] Compartilhamento entre usuários do mesmo grupo

## 6. Impacto Técnico

| Área           | Impacto                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| Arquitetura    | Módulo Dashboard + Dashboards no backend, componentes Recharts no frontend          |
| Banco de dados | api_dashboards, api_widgets (Supabase)                                              |
| API            | GET /dashboard/home, CRUD /dashboards, PATCH /dashboards/:id/widgets/reorder        |
| Frontend       | /app, /app/dashboards, dashboard-home.tsx, dashboard-detail.tsx, charts/\*          |
| Testes         | Unit (dashboard-home, charts, dashboard-detail), Integration (dashboard.controller) |
| Infraestrutura | Nenhuma adicional                                                                   |
| Segurança      | Dashboards privados por usuário, JwtAuthGuard                                       |

## 7. Testes Necessários

| Tipo        | Arquivo                       | Descrição                                      |
| ----------- | ----------------------------- | ---------------------------------------------- |
| Unit        | dashboard-home.tsx            | Renderização de KPIs e gráficos                |
| Unit        | bar-chart-widget.test.tsx     | Renderização e interação                       |
| Unit        | line-chart-widget.test.tsx    | Múltiplas séries                               |
| Unit        | pie-chart-widget.test.tsx     | Renderização de setores                        |
| Unit        | area-chart-widget.test.tsx    | FillOpacity                                    |
| Unit        | chart-tooltip.test.tsx        | Formatação de unidades                         |
| Unit        | kpi-card.test.tsx             | Sparkline com dados corretos                   |
| Unit        | dashboard-detail.test.tsx     | Widgets chart com histórico real               |
| Integration | dashboard.controller.spec.ts  | Agregação de KPIs                              |
| Integration | dashboards.controller.spec.ts | CRUD de layouts                                |
| E2E         | —                             | Acessar home → interagir → drill-down → voltar |
| Manual      | —                             | Verificar responsividade em mobile             |

## 8. Riscos

| Risco                          | Impacto                                | Mitigação                   |
| ------------------------------ | -------------------------------------- | --------------------------- |
| Drill-down limitado a sector   | Usuários não exploram outras dimensões | Adicionar dimensões (T07b)  |
| Editor visual incompleto       | Usuários não personalizam totalmente   | Completar editor (T16b)     |
| Performance com muitos widgets | Dashboard lento                        | Lazy loading, virtualização |

## 9. Dependências

- `recharts` (instalado)
- `@dnd-kit/core/sortable/utilities` (instalado, para drag-and-drop)
- `dashboard.controller` (KPIs consolidados)
- `dashboards.controller` (CRUD de layouts)
