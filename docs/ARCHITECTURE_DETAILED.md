# Arquitetura Detalhada do Estado Real

## 1. Escopo deste documento

Este documento descreve a arquitetura realmente implementada no repositório em `2026-06-05`.
Ele não descreve a arquitetura-alvo do PDF V1; para isso, consulte `docs/scope-v1-gap-analysis.md`.

Documentos relacionados:

- `docs/system-map.md`: inventário canônico do sistema;
- `docs/architecture.md`: visão resumida da arquitetura atual;
- `SPRINT_STATUS.md`: resumo executivo do estado de entrega;
- `docs/scope-v1-gap-analysis.md`: comparação formal entre escopo e realidade.

## 2. Topologia atual

```text
Browser
  |
  +--> Next.js Web (`apps/web`)
          |
          +--> API NestJS (`apps/api`) para auth, admin e reports
          |
          +--> Supabase direto para dashboard, notifications, export_jobs e system_settings

API NestJS
  |
  +--> SQL Server externo via `mssql`
  |
  +--> memória do processo para parte do domínio administrativo
```

Pontos centrais da arquitetura atual:

- a Web não depende apenas da API própria;
- a API é o ponto central de autenticação e relatórios;
- o Supabase é usado diretamente pela Web em partes relevantes do produto;
- SQL Server é a fonte de dados usada pela API para execução de relatórios;
- parte do domínio da API ainda é sustentada por repositórios em memória.

## 3. Aplicações do monorepo

### `apps/web`

Aplicação Next.js 14 com App Router.

Funções reais:

- login e recuperação de senha;
- dashboard inicial;
- catálogo e execução de relatórios;
- área administrativa básica;
- telas de exportações, notificações e settings.

### `apps/api`

Aplicação NestJS 10 com API REST e Swagger.

Funções reais:

- autenticação com JWT;
- refresh/logout;
- recuperação e redefinição de senha;
- CRUD administrativo de usuários e grupos;
- CRUD administrativo de definições de relatórios;
- listagem, detalhe e execução de relatórios;
- healthcheck da API e do SQL Server.

## 4. Arquitetura da Web

### Rotas

Rotas públicas:

- `/`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/design-system`

Rotas autenticadas:

- `/app`
- `/app/reports`
- `/app/exports`
- `/app/notifications`
- `/app/admin`
- `/app/admin/users`
- `/app/admin/groups`
- `/app/admin/settings`

### Organização funcional

Principais áreas do frontend:

- `components/auth`: formulários e guardas de autenticação;
- `components/dashboard`: KPIs e resumo de dashboard;
- `components/reports`: catálogo, filtros e visualização tabular;
- `components/admin`: usuários, grupos e settings;
- `components/exports`: lista de exportações;
- `components/notifications`: lista e atualização de notificações.

### Estratégia de dados da Web

A Web usa dois caminhos de dados:

1. API própria:
   - auth;
   - usuários;
   - grupos;
   - relatórios;
   - execução de consulta.
2. Supabase direto:
   - `kpis`;
   - `sectors`;
   - `export_jobs`;
   - `notifications`;
   - `system_settings`.

Isso produz uma arquitetura híbrida: parte do domínio é mediada pela API e parte é acessada diretamente no frontend.

## 5. Arquitetura da API

### Módulos reais

| Módulo                 | Papel atual                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `AuthModule`           | login, refresh, logout, recuperação e redefinição de senha     |
| `AdminModule`          | usuários e grupos                                              |
| `ReportsModule`        | catálogo, administração de definições e execução de relatórios |
| `HealthModule`         | status da API e status do SQL Server                           |
| `ValidationTestModule` | endpoint técnico de validação                                  |
| `SqlServerModule`      | conexão, validação e execução segura no SQL Server             |

### Endpoints principais

Autenticação:

- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/refresh`
- `POST /auth/logout`

Admin:

- `GET/POST/PATCH` em `/admin/users`
- `POST /admin/users/:id/reset-password`
- `PUT /admin/users/:id/groups`
- `GET/POST/PATCH/DELETE` em `/admin/groups`
- `GET/POST/PATCH` em `/admin/reports`

Relatórios:

- `GET /reports`
- `GET /reports/:id`
- `POST /reports/:id/query`

Saúde:

- `GET /health`
- `GET /health/sql`

## 6. Persistência e fontes de dados

### SQL Server

Uso real:

- fonte externa para execução de relatórios;
- acesso via `mssql`;
- consultas parametrizadas pela API.

O SQL Server hoje não é o banco de persistência de usuários, grupos ou settings da própria plataforma.

### Supabase

Uso real confirmado pela Web:

- KPIs (`kpis`);
- setores (`sectors`);
- exportações (`export_jobs`);
- notificações (`notifications`);
- configurações (`system_settings`).

As migrations do Supabase descrevem um domínio maior, mas nem tudo está conectado à experiência real da aplicação.

### Memória do processo

Uso real na API:

- usuários e grupos administrativos;
- definições de relatórios.

Isso significa que parte do estado do backend não está persistida em um banco controlado pela própria API.

### `localStorage`

Uso real na Web:

- persistência da sessão autenticada no navegador.

## 7. Fluxos reais do sistema

### Login

```text
1. Usuário acessa `/login`
2. Web envia credenciais para `POST /auth/login`
3. API valida credenciais
4. API retorna tokens
5. Web persiste sessão no `localStorage`
6. Usuário acessa rotas sob `/app`
```

### Consulta de relatório

```text
1. Usuário acessa `/app/reports`
2. Web lista relatórios via `GET /reports`
3. Usuário seleciona filtros e um relatório
4. Web envia `POST /reports/:id/query`
5. API valida acesso e parâmetros
6. API consulta o SQL Server
7. Web renderiza os resultados em tabela
```

### Dashboard inicial

```text
1. Usuário acessa `/app`
2. Web lê `kpis` e `sectors` direto do Supabase
3. Se a consulta falha ou volta vazia, usa fallback local
4. Renderiza cards de KPI, resumo e agregação por setor
```

### Notificações e exportações

```text
1. Usuário acessa `/app/notifications` ou `/app/exports`
2. Web consulta tabelas do Supabase diretamente
3. A UI exibe os dados existentes
4. Não há backend próprio coordenando esses fluxos
```

## 8. Segurança realmente presente

Implementado ou claramente visível:

- hash de senha com `bcrypt`;
- JWT para autenticação;
- validação de DTOs com `ValidationPipe`;
- guards de autorização na API;
- consultas parametrizadas em SQL Server;
- CORS configurado para frontend local;
- mascaramento/sanitização de erros de SQL em partes do backend.

Parcial ou dependente de interpretação:

- controle de tentativas no login;
- autorização por role/setor em relatórios e endpoints administrativos.

Ausente no código atual:

- 2FA/TOTP;
- CSRF;
- CSP;
- sessão em cookie seguro;
- auditoria dedicada de ações sensíveis;
- HSTS/forçar HTTPS como comportamento do app;
- proteção via DOMPurify confirmada no frontend.

## 9. Componentes previstos no PDF e ausentes na arquitetura real

Os itens abaixo aparecem no PDF V1, mas não estão implementados como parte da arquitetura atual:

- Prisma ORM;
- React Query;
- Recharts ou Chart.js;
- BullMQ;
- S3 ou storage equivalente para exports;
- WebSocket/realtime da aplicação;
- pipeline de exportação PDF/Excel no backend;
- editor visual de dashboards;
- cache Redis funcional;
- cron/refresh agendado.

## 10. Consequências práticas da arquitetura atual

### Pontos positivos

- a base web/api está de pé e navegável;
- autenticação, admin básico e consulta de relatórios já funcionam;
- existe integração real com SQL Server;
- a documentação Swagger permite inspecionar a API.

### Riscos e restrições

- parte importante do domínio depende de memória do processo;
- a aplicação mistura API própria e Supabase direto;
- exportações e notificações não passam por backend central;
- o dashboard pode parecer funcional mesmo sem dados reais por causa do fallback local;
- o desenho arquitetural do PDF não corresponde ao que está rodando hoje.

## 11. Leitura recomendada para novos contribuidores

Ordem sugerida:

1. `README.md`
2. `docs/system-map.md`
3. `docs/scope-v1-gap-analysis.md`
4. `SPRINT_STATUS.md`
5. `docs/api.md` e `docs/web.md`

## 12. Conclusão

A arquitetura real do projeto hoje é:

- Next.js + NestJS;
- Web consumindo API e, em partes, Supabase direto;
- SQL Server usado pela API para relatórios;
- persistência fragmentada entre memória, Supabase, SQL Server e `localStorage`.

Essa arquitetura já suporta uma base funcional de produto, mas ainda diverge da arquitetura prevista no escopo V1 e não deve ser descrita como plataforma completa de BI pronta para produção.
