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
- a tela de detalhe do relatório já consegue solicitar exportações em PDF e Excel;
- a tela de exportações baixa arquivos pela API autenticada, sem depender de link público cru.
- a tela de settings já permite editar valores não sensíveis via API centralizada.

## Limitações atuais

- persistências de platform ainda dependem do Supabase no backend atual;
- dashboards personalizados e editor visual ainda não estão entregues;
- o drill-down existe em nivel inicial, mas ainda nao cobre exploracao rica por dimensao, navegacao multinivel nem widgets personalizados.
