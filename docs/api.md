# API

## Stack

- NestJS 10
- TypeScript estrito
- JWT + refresh token
- `bcrypt`
- Swagger em `/docs`

## Capacidades confirmadas

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout` — revoga refresh token e blacklista access token (jti)
- `POST /auth/sessions/revoke-all` — revoga todas as sessões do usuário (access + refresh)
- `GET /auth/me`
- `PATCH /auth/me/password`
- `PATCH /admin/settings/:key`
- `GET /dashboard/home`
- `GET /dashboard/kpis/:kpiId/drilldown`
- `GET /dashboard/kpis/:kpiId/history` — serie historica de 12 meses do KPI
- `GET /dashboards` — lista dashboards personalizados do usuario; cria dashboard padrão por setor automaticamente quando lista vazia (retorna `{ dashboards, seededViaApi }`)
- `POST /dashboards` — cria dashboard personalizado
- `GET /dashboards/:id` — retorna dashboard especifico
- `PATCH /dashboards/:id` — atualiza dashboard
- `DELETE /dashboards/:id` — remove dashboard
- `POST /dashboards/:id/widgets` — adiciona widget ao dashboard
- `PATCH /dashboards/:id/widgets/:widgetId` — atualiza widget
- `DELETE /dashboards/:id/widgets/:widgetId` — remove widget
- `PATCH /dashboards/:id/widgets/reorder` — reordena widgets do dashboard (batch)
- `PATCH /dashboards/:id/widgets/batch` — atualização em lote de widgets (posição, título, chartType, kpiId, config, content, url)
- `GET /admin/dashboard` — métricas operacionais do painel administrativo
- `GET /admin/dashboard/trends` — agregações temporais de tendências (usuários por mês, atividade por semana, exports por semana, top 5 relatórios, top 5 setores)
- `POST /admin/reports/validate` — valida se fonte SQL (view ou stored_procedure) existe e é acessível
- `POST /admin/cache/invalidate` — invalida todas as entradas do cache de queries (admin apenas)
- `GET /admin/cache/stats` — retorna estatísticas de hit/miss/evictions do cache de queries (admin apenas)
- fluxo de recuperação e redefinição de senha
- 2FA/TOTP: setup (`POST /auth/totp/setup`), verificação (`POST /auth/totp/verify`), desativação (`POST /auth/totp/disable` — exige `code` + `password`, proibido para admin), login TOTP (`POST /auth/totp/login`) — quando ativo, login retorna `requiresTwoFactor: true` + `tempToken`. Rate limiting: 3 tentativas, bloqueio 15min. Secret criptografado com AES-256-GCM (`TOTP_ENCRYPTION_KEY`). Admin sem 2FA ativo recebe 403 em rotas admin (`TwoFactorGuard`).
- CRUD básico administrativo de usuários
- CRUD básico administrativo de grupos
- catálogo, detalhe e execução de relatórios
- dashboard, notificações, exportações e settings no runtime principal
- permissões e auditoria no runtime principal
- retenção LGPD: `GET /admin/retention/status` (config), `POST /admin/retention/run` (execução manual), cron diário às 03:00
- LGPD direitos do titular: `POST /admin/users/:id/anonymize` (anonimização irreversível), `GET /admin/users/:id/data-export` (portabilidade JSON)
- healthchecks da API e do SQL Server

## Padrões importantes

- validação por DTOs
- guards para JWT, roles e setores
- acesso ao SQL Server com queries parametrizadas
- erros HTTP via `HttpException` e `HttpStatus`

## Limitações atuais

- parte do domínio administrativo ainda usa fallbacks em memória quando dependências de persistência não estão disponíveis;
- definições administrativas de relatórios persistem em `api_report_definitions` via Supabase no runtime principal quando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configurados;
- parte desses fluxos ainda usa Supabase e memória como persistência real por trás da API;
- a home de BI agora expõe payload consolidado em `GET /dashboard/home`, mantendo `GET /dashboard/kpis` por compatibilidade;
- o primeiro drill-down funcional do dashboard está disponível em `GET /dashboard/kpis/:kpiId/drilldown`, retornando série e tabela de comparação do KPI selecionado;
- exportações de relatórios agora geram PDF, XLSX, CSV e JSON com worker, fila, histórico, download autenticado e auditoria, mas a cobertura total do escopo V1 ainda não está fechada.
- settings administrativos podem ser atualizados pela API e geram evento de auditoria;
- permissões administrativas geram auditoria em create, update e delete, mas a matriz fina de herança e governança ainda é parcial.
