# Web

## Stack

- Next.js 14
- App Router
- Tailwind CSS
- componentes locais em `apps/web/src/components`

## Telas e fluxos já visíveis

- login
- recuperação e reset de senha
- perfil do usuário
- área autenticada com `AuthGuard`
- dashboard inicial
- relatórios
- hub administrativo
- usuários
- grupos
- notificações
- exportações
- configurações do sistema
- página de design system

## Sessão

A sessão do frontend agora fica em `sessionStorage`, remove a dependência operacional do `localStorage`, migra sessões legadas e tenta um refresh automático único quando a API devolve `401`. Ainda não é o hardening final previsto no escopo V1.

## Integração atual

- auth, perfil, dashboard, relatórios, exportações, notificações e settings usam a API NestJS como fonte oficial;
- a Web não depende mais de leituras diretas do Supabase nesses fluxos principais da plataforma.
- a home autenticada agora usa `GET /dashboard/home` e renderiza charts reais com Recharts (BarChart, LineChart, PieChart, AreaChart);
- componentes de gráfico reutilizáveis em `components/charts/` (BarChartWidget, LineChartWidget, PieChartWidget, AreaChartWidget, ChartTooltip);
- cada KPI da home já abre um drill-down completo consumindo `GET /dashboard/kpis/:kpiId/drilldown` + `GET /dashboard/kpis/:kpiId/history`, com resumo, gráfico de evolução de 12 meses e tabela comparativa;
- a tela de detalhe do relatório já consegue solicitar exportações via modal com seleção de formato (PDF, Excel, CSV, JSON);
- a tela de exportações baixa arquivos pela API autenticada, sem depender de link público cru;
- polling automático de status de exportações (atualiza a cada 5s enquanto houver jobs pendentes);
- filtros por formato e status na lista de exportações;
- skeleton loading e empty state ilustrativo na lista de exportações;
- fallback em memória para exportações quando Supabase não configurado;
- a tela de settings já permite editar valores não sensíveis via API centralizada;
- dashboards personalizados com CRUD completo: criar, visualizar (`/app/dashboards/:id`), editar e excluir;
- widgets de dashboard: KPI, Gráfico (bar, line, pie, area) e Tabela (placeholder);
- modal de adicionar widget com seleção de tipo, KPI e tipo de gráfico;
- fallback em memória para dashboards quando Supabase não configurado;
- modo de edição de layout no detalhe do dashboard: botão "Editar layout" ativa drag-and-drop via `@dnd-kit/sortable` para reordenar widgets, botão "Concluir" persiste a nova ordem via `PATCH /dashboards/:id/widgets/reorder`;
- hub administrativo (`/app/admin`) com KPIs operacionais reais: total de usuários, ativos, grupos, exportações e tabela de atividade recente dos logs de auditoria.

## Limitações atuais

- persistências de platform ainda dependem do Supabase no backend atual;
- o drill-down existe em nivel inicial, mas ainda nao cobre exploracao rica por dimensao, navegacao multinivel nem widgets personalizados.
