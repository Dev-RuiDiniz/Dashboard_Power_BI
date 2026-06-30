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
- dashboards personalizados com seed automático por setor e banner de boas-vindas
- dashboard admin com gráficos de tendência (usuários por mês, atividade por semana, exports por semana, top relatórios, top setores)

## Sessão

A sessão do frontend agora fica em `sessionStorage`, remove a dependência operacional do `localStorage`, migra sessões legadas e tenta um refresh automático único quando a API devolve `401`. Ainda não é o hardening final previsto no escopo V1.

## Integração atual

- auth, perfil, dashboard, relatórios, exportações, notificações e settings usam a API NestJS como fonte oficial;
- a Web não depende mais de leituras diretas do Supabase nesses fluxos principais da plataforma.
- a home autenticada agora usa `GET /dashboard/home` e renderiza charts reais com Recharts (BarChart, LineChart, PieChart, AreaChart);
- componentes de gráfico reutilizáveis em `components/charts/` (BarChartWidget, LineChartWidget, PieChartWidget, AreaChartWidget, ChartTooltip);
- cada KPI da home já abre um drill-down completo consumindo `GET /dashboard/kpis/:kpiId/drilldown?dimension=...` + `GET /dashboard/kpis/:kpiId/history`, com seletor de dimensão, breadcrumb, resumo, gráfico de evolução de 12 meses e tabela comparativa;
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
- editor visual de dashboards: botão "Editar layout" ativa modo de edição com paleta de widgets (KPI, Gráfico, Tabela, Texto, Iframe), grid responsivo de 12 colunas com drag-and-drop e redimensionamento via `react-grid-layout`, painel lateral de configuração inline (título, KPI, tipo de gráfico, conteúdo, URL), e persistência em lote via `PATCH /dashboards/:id/widgets/batch`;
- hub administrativo (`/app/admin`) com KPIs operacionais reais: total de usuários, ativos, grupos, exportações e tabela de atividade recente dos logs de auditoria;
- gestão de relatórios admin (`/app/admin/reports`) com CRUD completo, edição de definições, gerenciamento de parâmetros (nome, tipo, obrigatório), seleção de fonte SQL (view ou stored_procedure) e teste de conexão antes de salvar;
- login com suporte a 2FA/TOTP: quando ativado, o fluxo exibe input de código de 6 dígitos após credenciais válidas (`/login`);
- perfil do usuário (`/app/profile`) com gestão de 2FA/TOTP: ativar (setup com QR code/otpauthUrl e secret), verificar código e ativar, desativar com verificação de código.

## Limitações atuais

- persistências de platform ainda dependem do Supabase no backend atual;
