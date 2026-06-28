ESCOPO TÉCNICO · VERSÃO 1.0
Plataforma Web
de Relatórios & BI
Acesso seguro a relatórios, dashboards interativos e controle de permissões por setor
Integração com SQL Server · Web Responsivo · Exportação PDF & Excel
| | Tipo | Plataforma | | Telas | | Módulos | | | Prazo |
| ----------------- | ------------ | -------------- | ------- | -------- | ---------------- | --------- | --- | --- | ------------- |
| Web SaaS Internal | | Web Responsivo | | 18 telas | | 6 módulos | | | 30 dias |
| | 18 | | 6 | | 3 | | | | 30 |
| | telas totais | | módulos | | perfis de acesso | | | | dias de prazo |
Objetivo: centralizar relatórios do sistema desktop em uma interface web segura, com dashboards e controle de acesso por setor
PERFIS DE ACESSO
| | Visualizador | | | Downloader | | | | Administrador | |
| --- | ----------------------- | --- | -------- | ------------------- | ------- | --- | ----------------------- | ------------------ | --- |
| | Read Only | | | Read + Export | | | | Full Admin | |
| | Acessa e visualiza | | | Visualiza + exporta | | | | Gerencia usuários, | |
| | relatórios do seu setor | | | PDF e Excel | | | permissões e relatórios | | |
| | SQL SERVER | | REST API | | NEXT.JS | | | EXPORT PDF/XLS | |
Plataforma Web BI · Escopo Técnico V1.0 · Confidencial Página 1

TELAS DA PLATAFORMA — 18 TELAS
ÁREA PÚBLICA / AUTH ÁREA DO USUÁRIO (cont.)
Login Meu Perfil
T01 T10
E-mail e senha, link de recuperação, mensagens de erro Dados pessoais, troca de senha, preferências de notificação
Recuperação de Senha Notificações
T02 T11
Formulário de e-mail + página de redefinição via token Centro de avisos: relatório disponível, alerta de acesso
ÁREA DO USUÁRIO PAINEL ADMINISTRATIVO
Dashboard Home Dashboard Admin
T03 T12
KPIs do setor, gráficos de destaque, atalhos rápidos Visão geral: usuários ativos, acessos/dia, erros de login
Lista de Relatórios Gestão de Usuários
T04 T13
Relatórios disponíveis por setor com filtros e busca Listar, criar, editar, desativar usuários e resetar senha
Visualizador de Relatório Gestão de Permissões
T05 T14
Exibição inline do relatório com filtros de parâmetros Atribuir setores e níveis de acesso por usuário ou grupo
Filtros Avançados Gestão de Relatórios
T06 T15
Filtro por data, categoria, setor e parâmetros customizados Cadastrar fontes SQL, parâmetros, descrição e setor
Dashboard Interativo Editor de Dashboard
T07 T16
Gráficos (linha, barra, pizza) com drill-down e zoom Criar e configurar dashboards com widgets e queries
Dashboard Personalizado Logs de Auditoria
T08 T17
Salvar layout de widgets e visualizações favoritas Histórico de acessos, downloads e ações com filtros
Exportar Relatório Configurações do Sistema
T09 T18
Escolha de formato (PDF/Excel), intervalo e confirmação Conexão SQL Server, SMTP, segurança, backup e integrações
Plataforma Web BI · Escopo Técnico V1.0 · Confidencial Página 2

MÓDULOS FUNCIONAIS
Autenticação & Acesso Controle de Acesso
AUTH PERMISS.
› Login por e-mail + senha (bcrypt) › Perfis: Visualizador · Downloader · Admin
› Recuperação por e-mail com token JWT temporário › Permissões por setor (financeiro, RH, vendas…)
› Sessão com JWT de curta duração + refresh token › Permissão individual por relatório específico
› Rate limiting no login (anti brute-force) › Grupo de acesso com herança de permissões
› 2FA opcional via TOTP (Authenticator App) › Bloqueio automático após inatividade (timeout)
› Log de todos os eventos de autenticação › Auditoria de mudanças de permissão com log
Integração SQL Server Relatórios
SQL RELAT.
› Conexão via pool com SQL Server (mssql / tedious) › Listagem por setor com busca e filtros
› Queries parametrizadas (prevenção SQL Injection) › Filtros: data, categoria e parâmetros customizados
› Suporte a stored procedures e views › Visualização inline no navegador (tabela/grid)
› Cache de resultados configurável por relatório › Exportação para PDF (via Puppeteer/WeasyPrint)
› Atualização em tempo real ou por agendamento (cron) › Exportação para Excel (.xlsx via ExcelJS)
› Monitoramento de lentidão e timeout de queries › Relatórios favoritos por usuário
Dashboards & Gráficos Administração & Segurança
BI ADMIN
› Gráficos interativos: linha, barra, pizza, área › CRUD completo de usuários e grupos
› KPIs com indicadores de variação (delta %) › Gestão de relatórios: fonte SQL, parâmetros, setor
› Drill-down em gráficos para dados detalhados › Editor visual de dashboards (drag-and-drop)
› Salvar layouts de dashboard personalizados › Logs de acesso e download com filtro e exportação
› Widgets configuráveis: período, fonte, agrupamento › Proteção: XSS (sanitização), CSRF (tokens), HTTPS
› Exportar dashboard como imagem/PDF › Configuração de conexão SQL Server e SMTP
Plataforma Web BI · Escopo Técnico V1.0 · Confidencial Página 3

STACK TECNOLÓGICO · ARQUITETURA
BACKEND & INFRAESTRUTURA FRONTEND
Node.js + NestJS Next.js 14 + TypeScript
Framework modular · REST API · WebSocket SSR/SSG · App Router · SEO otimizado
TypeScript Tailwind CSS + shadcn
Tipagem estática end-to-end Design system · componentes acessíveis
Prisma ORM Recharts / Chart.js
Acesso ao SQL Server com queries tipadas Gráficos interativos e dashboards
SQL Server (mssql) React Query (TanStack)
Conexão pool + stored procedures + views Cache, sync e refetch automático
Redis React Hook Form + Zod
Cache de queries e sessões Formulários validados com schema
JWT + bcrypt ExcelJS
Auth segura · refresh tokens · hash de senhas Geração de .xlsx no cliente
BullMQ Puppeteer / WeasyPrint
Filas para exportações pesadas (PDF/Excel) Geração de PDF no servidor
Docker + CI/CD
Containers · GitHub Actions · deploy automático
DIAGRAMA DE ARQUITETURA (SIMPLIFICADO)
BROWSER / CLIENTE Next.js SSR · React · Recharts · TailwindCSS
t
API LAYER NestJS REST API · JWT Middleware · Rate Limiter · CORS
t
SERVIÇOS ReportService · DashboardService · AuthService · ExportService
t
DADOS SQL Server (sistema desktop) · Redis (cache) · S3 (exports)
RESUMO DE SEGURANÇA
bcrypt Senhas com salt rounds ‡ 12 JWT Access token 15min · Refresh token 7 dias · rotação
SQL Params Queries 100% parametrizadas · sem concatenação de strings XSS Sanitização de inputs (DOMPurify) · Content-Security-Policy
CSRF Token CSRF duplo cookie · SameSite=Strict Rate Limit Login: 5 tentativas/15min por IP · reset automático
2FA Opcional via TOTP · obrigatório para admins HTTPS TLS 1.3 obrigatório · HSTS · certificado gerenciado
Plataforma Web BI · Escopo Técnico V1.0 · Confidencial Página 4

CRONOGRAMA 30 DIAS · PREMISSAS · FORA DO ESCOPO V1
CRONOGRAMA — 30 DIAS (3 SPRINTS DE 10 DIAS)
Sprint 1 Dias 1–10 Sprint 2 Dias 11–20 Sprint 3 Dias 21–30
› Setup: repositório, CI/CD, ambientes dev/staging › Visualizador de relatório inline (tabela/grid responsiva›) Logs de auditoria com filtros e exportação CSV
› Design system: tokens, componentes base, layout › Filtros avançados: data, categoria, parâmetros dinâm›ic oEsditor de dashboards admin (drag-and-drop widgets)
› Auth completo: login, JWT, bcrypt, recuperação de se›n hEaxportação PDF (Puppeteer/WeasyPrint) + Excel (Ex›c e GlJeSs)tão de relatórios: fonte SQL, parâmetros, setor
› CRUD de usuários e grupos (Admin) › Dashboard com gráficos interativos (Recharts) › Cache de queries (Redis) + agendamento de refresh (cron)
› Sistema de permissões por setor e nível › KPIs por setor com delta percentual › Proteção final: CSP, CORS, rate limiting, 2FA admin
› Conexão segura ao SQL Server (pool + parametrizaç›ã oS)alvar dashboards personalizados por usuário › QA · testes E2E (Playwright) · testes de carga
› Listagem de relatórios por setor com filtros básicos › Push de notificações internas (relatório disponível) › Deploy produção · documentação técnica · handoff
PREMISSAS TÉCNICAS
n O SQL Server do sistema desktop está acessível na rede interna ou via VPN segura.
n O cliente fornece credenciais de leitura no banco (usuário dedicado com permissão SELECT).
n O ambiente de hospedagem (VPS ou cloud) será provisionado pelo cliente antes do Sprint 1.
n Credenciais SMTP para envio de e-mails (recuperação de senha, notificações) serão fornecidas.
n O design system e identidade visual serão aprovados até o final do dia 3 do Sprint 1.
n Requisitos de relatórios (queries SQL base) serão documentados e entregues na semana 1.
FORA DO ESCOPO V1
5 App Mobile (iOS / Android) Portal mobile pode ser adicionado n5a VB2I caovma nPçWaAd oou c Roemac Et NTaLtive. Pipeline de dados / Data Warehouse / OLAP — roadmap V2.
5 Integração com outros bancos V1 conecta apenas ao SQL Server;5 O rRacelela, tMóyrSioQsL enma Vt2e.mpo real (live) V1 usa refresh agendado; streaming via WebSocket na V2.
5 Multi-tenancy (múltiplas empresas) V1 é single-tenant; arquitetura mult5i-te nAasnst innaa Vtu2.ras digitais em relatórios Assinatura com certificado ICP-Brasil — fora do MVP.
Plataforma Web BI · Escopo Técnico V1.0 · Confidencial Página 5
