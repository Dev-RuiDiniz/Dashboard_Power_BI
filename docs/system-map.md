# Mapeamento do Sistema

## Visão geral

O Dashboard Power BI é um monorepo com duas aplicações principais:

- `apps/web`: frontend em Next.js 14 com App Router;
- `apps/api`: backend em NestJS com endpoints REST e documentação Swagger.

Além disso, o repositório contém:

- `packages/shared`: espaço reservado para contratos e utilitários compartilhados;
- `packages/ui`: espaço reservado para componentes compartilhados futuros;
- `supabase/migrations`: estrutura de banco e permissões para as entidades da plataforma;
- `infra/docker`: ambiente local com Compose e Dockerfiles.

## Arquitetura funcional atual

Hoje, o sistema funciona em três frentes principais:

1. **Frontend autenticado e administrativo**
   - navegação protegida por sessão local;
   - dashboard inicial;
   - catálogo e detalhe de relatórios;
   - telas administrativas;
   - histórico de exportações e central de notificações.

2. **API de autenticação, administração e relatórios**
   - login, refresh, logout, recuperação e redefinição de senha;
   - gestão de usuários e grupos;
   - catálogo administrativo de relatórios;
   - listagem, detalhamento e execução de relatórios autorizados;
   - healthchecks da API e do SQL Server.

3. **Camada de dados híbrida**
   - a **API** conversa com SQL Server e também mantém estruturas em memória para fluxos de autenticação e administração;
   - a **Web** consome a API para autenticação, administração e relatórios;
   - a **Web** também consulta o Supabase diretamente para KPIs, notificações, exportações e configurações do sistema.

## Rotas da aplicação web

### Rotas públicas

- `/`
  - home institucional da plataforma;
  - apresenta proposta do produto, pilares do sistema e status da base técnica.

- `/login`
  - formulário de autenticação com e-mail e senha;
  - consome `POST /auth/login`;
  - salva a sessão no `localStorage`.

- `/forgot-password`
  - solicitação de recuperação de senha;
  - consome `POST /auth/forgot-password`.

- `/reset-password`
  - redefinição de senha com token;
  - consome `POST /auth/reset-password`.

- `/design-system`
  - vitrine de componentes visuais base da aplicação.

### Rotas autenticadas

As rotas sob `/app` usam `AuthGuard`, que redireciona para `/login` quando não existe sessão local válida.

- `/app`
  - dashboard inicial;
  - carrega KPIs e setores do Supabase;
  - se os dados não estiverem disponíveis, usa KPIs de fallback para manter a experiência funcional.

- `/app/reports`
  - catálogo de relatórios autorizados;
  - filtros avançados;
  - detalhe do relatório selecionado;
  - execução de consulta parametrizada;
  - consome a Reports API.

- `/app/exports`
  - histórico das últimas exportações;
  - consulta a tabela `export_jobs` no Supabase;
  - exibe status, formato, tamanho, expiração e link de download quando disponível.

- `/app/notifications`
  - central de notificações;
  - consulta a tabela `notifications` no Supabase;
  - permite marcar uma notificação ou todas como lidas.

- `/app/admin`
  - hub administrativo com atalhos para usuários, grupos e configurações.

- `/app/admin/users`
  - lista usuários;
  - filtra por nome ou e-mail;
  - cria usuários;
  - desativa usuários;
  - redefine senha;
  - consome a API administrativa.

- `/app/admin/groups`
  - lista grupos;
  - cria grupos;
  - remove grupos;
  - consome a API administrativa.

- `/app/admin/settings`
  - lista configurações globais do sistema;
  - consulta diretamente a tabela `system_settings` no Supabase.

## Funcionalidades já implementadas na Web

### Autenticação

- formulário de login com validação básica;
- armazenamento da sessão autenticada em `localStorage`;
- proteção de rotas autenticadas por `AuthGuard`;
- fluxo de esqueci a senha;
- fluxo de redefinição por token.

### Dashboard

- cards de KPI com tendência;
- resumo com quantidade de KPIs, setores cobertos e delta médio;
- agrupamento por setor;
- fallback visual quando o Supabase não devolve dados.

### Relatórios

- listagem paginada via API;
- filtros avançados;
- estados de carregamento e erro;
- visualização de metadados do relatório;
- montagem dinâmica de parâmetros;
- execução de consulta e renderização tabular dos resultados.

### Administração

- listagem e busca de usuários;
- criação de novos usuários;
- desativação de usuários;
- redefinição de senha;
- listagem e criação de grupos;
- exclusão de grupos;
- visualização de configurações globais.

### Exportações e notificações

- leitura de exportações recentes pelo Supabase;
- download de arquivos concluídos;
- leitura de notificações;
- marcação individual e em lote como lidas.

## Endpoints da API

### Autenticação

- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/refresh`
- `POST /auth/logout`

### Autorização de teste

- `GET /authz-test/view/:sector`
- `GET /authz-test/download/:sector`
- `GET /authz-test/admin`

### Saúde da aplicação

- `GET /health`
- `GET /health/sql`

### Administração de usuários

- `GET /admin/users`
- `GET /admin/users/:id`
- `POST /admin/users`
- `PATCH /admin/users/:id`
- `PATCH /admin/users/:id/deactivate`
- `POST /admin/users/:id/reset-password`
- `PUT /admin/users/:id/groups`

### Administração de grupos

- `GET /admin/groups`
- `GET /admin/groups/:id`
- `POST /admin/groups`
- `PATCH /admin/groups/:id`
- `DELETE /admin/groups/:id`

### Administração de relatórios

- `POST /admin/reports`
- `GET /admin/reports`
- `GET /admin/reports/:id`
- `PATCH /admin/reports/:id`
- `PATCH /admin/reports/:id/deactivate`

### Consumo de relatórios

- `GET /reports`
- `GET /reports/:id`
- `POST /reports/:id/query`

### Endpoint técnico

- `POST /validation-test`

## Como a API funciona hoje

### Estrutura

A API é organizada em módulos:

- `AuthModule`
- `AdminModule`
- `ReportsModule`
- `HealthModule`
- `ValidationTestModule`
- `SqlServerModule`

### Comportamentos principais

- usa `ConfigModule` global com leitura de `.env.local` e `.env`;
- usa `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e `transform`;
- publica Swagger em `/docs`;
- já está configurada com CORS para o frontend local em `http://localhost:3000` e `http://127.0.0.1:3000`.

### Autenticação

- o login gera access token e refresh token;
- a proteção de rotas usa `JwtAuthGuard`, `RolesGuard` e `SectorsGuard`;
- o fluxo de recuperação de senha usa token temporário e serviço de e-mail em modo `mock` para desenvolvimento;
- há controle de tentativas de login com bloqueio temporário.

### Administração

- usuários e grupos são manipulados por serviços dedicados;
- a API expõe CRUD administrativo para usuários, grupos e definições de relatórios;
- mensagens de erro retornam textos de domínio, em português.

### Relatórios

- o catálogo administrativo não aceita SQL livre;
- `sourceName` deve seguir formato seguro;
- a execução de relatórios aplica validação de parâmetros antes da consulta;
- a autorização é validada antes da execução;
- as respostas públicas evitam expor detalhes internos do SQL Server.

### SQL Server

- conexão via pool com `mssql`;
- configuração validada por utilitário próprio;
- healthcheck sanitizado;
- erros de conexão e execução são mascarados para o cliente.

## Dependências externas e estado atual

### API

- depende de variáveis de ambiente para autenticação;
- pode subir sem SQL Server válido, mas o healthcheck específico do SQL reflete indisponibilidade;
- usa SQL Server externo para consultas de relatórios.

### Web

- depende da API para autenticação, administração e relatórios;
- depende de credenciais válidas do Supabase para dados de dashboard, notificações, exportações e configurações;
- quando o dashboard não encontra dados, usa fallback local;
- exportações, notificações e configurações não têm fallback equivalente e mostram erro ou vazio quando a integração não responde.

## Limites e pontos provisórios já visíveis

- o repositório documenta `infra/env/.env.example`, mas esse arquivo não está presente no clone atual;
- a Web mistura duas estratégias de dados: parte via API própria e parte via Supabase direto;
- o dashboard inicial já possui fallback local, mas exportações, notificações e configurações ainda dependem mais fortemente do Supabase;
- há funcionalidades planejadas no histórico da sprint que ainda não estão concluídas, mas a base principal de autenticação, administração e relatórios já está implementada.
