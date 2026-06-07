# Analise de Aderencia ao Escopo V1

**Data da analise:** 7 de junho de 2026  
**Projeto:** Dashboard Power BI  
**Objetivo deste documento:** comparar o PDF `ESCOPO_DASHBOARD_Plataforma_BI_V1.pdf` com o estado real atual do repositorio, incluindo o runtime depois das Fases 0 e 1 e as orientacoes do `AGENTS.md`.

**Fontes utilizadas**

- PDF `ESCOPO_DASHBOARD_Plataforma_BI_V1.pdf`
- Codigo do monorepo em `apps/`, `infra/`, `scripts/`, `supabase/` e manifests
- `README.md`
- `SPRINT_STATUS.md`
- `HANDOFF.md`
- `AGENTS.md`

## Resumo Executivo

O projeto evoluiu de forma relevante: o workspace agora esta operacional, os modulos principais de plataforma foram integrados ao runtime, a tela de perfil passou a ter backend real, o frontend deixou de depender de leitura direta do Supabase para dashboard, notifications, exports e settings, as definicoes administrativas de relatorios passaram a ter persistencia real no backend e o pipeline de exportacao de relatorios ganhou geracao real de PDF/XLSX com download autenticado. Mesmo assim, o repositorio **ainda nao entrega o V1 completo do PDF**. A plataforma hoje tem uma base funcional centralizada na API, mas continua com lacunas importantes em BI avancado, 2FA e varios pontos do stack descrito no `AGENTS.md`.

### Quadro consolidado

| Item                                                      | Quantidade | Leitura                                                                   |
| --------------------------------------------------------- | ---------: | ------------------------------------------------------------------------- |
| Telas classificadas como `Feito`                          |         11 | Fluxo principal funcional no runtime atual                                |
| Telas classificadas como `Parcial`                        |          5 | Existem e funcionam, mas ainda abaixo do PDF                              |
| Telas classificadas como `Implementado mas nao integrado` |          0 | Nao ha mais telas relevantes nessa condicao                               |
| Telas classificadas como `Faltando`                       |          2 | Nao ha implementacao funcional aderente                                   |
| Modulos `Feito`                                           |          0 | Nenhum dos 6 modulos fecha integralmente o V1                             |
| Modulos `Parcial`                                         |          6 | Todos evoluiram, mas todos ainda tem lacunas                              |
| Modulos `Faltando`                                        |          0 | Ha base para todos, ainda que incompleta                                  |
| Saude operacional do workspace                            |    Estavel | `pnpm verify:docs`, `pnpm typecheck`, `pnpm test` e `pnpm build` passaram |

## Metodologia e Criterios

Classificacao usada em todo o documento:

- `Feito`: existe rota, tela e comportamento principal funcional no runtime atual.
- `Parcial`: existe implementacao utilizavel, mas com lacunas de escopo, persistencia, seguranca, BI ou aderencia ao PDF.
- `Faltando`: nao existe implementacao funcional aderente ao escopo.
- `Implementado mas nao integrado`: existe codigo, mas ele nao participa do fluxo principal em execucao.

Premissas desta analise:

- codigo presente nao equivale a feature entregue;
- quando ha divergencia entre documentacao historica, `AGENTS.md` e runtime atual, prevalece o runtime atual;
- o `AGENTS.md` e tratado como direcao desejada, nao como descricao confiavel do estado entregue.

## Matriz Das 18 Telas Do PDF

| Tela | Escopo esperado                                                  | Status   | Evidencia no repositorio                                                                                                                                                                                                                                                                                                                                                                      | Observacoes                                                                                                                               |
| ---- | ---------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| T01  | Login com email, senha, tratamento de erros e acesso autenticado | Feito    | `apps/web/src/app/login/page.tsx`, `apps/web/src/components/auth/login-form.tsx`, `apps/api/src/auth/auth.controller.ts`                                                                                                                                                                                                                                                                      | Fluxo funcional com JWT e refresh token.                                                                                                  |
| T02  | Recuperacao e redefinicao de senha                               | Feito    | `apps/web/src/app/forgot-password/page.tsx`, `apps/web/src/app/reset-password/page.tsx`, `apps/api/src/auth/auth.controller.ts`                                                                                                                                                                                                                                                               | Fluxo publico implementado e testado.                                                                                                     |
| T03  | Dashboard home com KPIs e resumo executivo                       | Feito    | `apps/web/src/app/app/page.tsx`, `apps/web/src/components/dashboard/dashboard-home.tsx`, `apps/api/src/platform/dashboard/*`                                                                                                                                                                                                                                                                  | A home de KPIs funciona via API. Fica abaixo do PDF em BI avancado, mas o fluxo principal esta ativo.                                     |
| T04  | Catalogo de relatorios por setor com busca                       | Feito    | `apps/web/src/app/app/reports/page.tsx`, `apps/web/src/components/reports/*`, `apps/api/src/reports/reports.controller.ts`                                                                                                                                                                                                                                                                    | Catalogo e listagem via API funcionam.                                                                                                    |
| T05  | Visualizacao inline de relatorio com parametros                  | Feito    | `apps/web/src/components/reports/report-detail.tsx`, `apps/api/src/reports/reports.controller.ts`                                                                                                                                                                                                                                                                                             | Fluxo funcional de visualizacao e execucao.                                                                                               |
| T06  | Filtros avancados                                                | Feito    | `apps/web/src/components/reports/report-advanced-filters.tsx`, `apps/web/src/lib/report-filters.ts`                                                                                                                                                                                                                                                                                           | A experiencia principal existe e esta testada.                                                                                            |
| T07  | Dashboard interativo com graficos, drill-down e interacao rica   | Faltando | `apps/web/package.json`, `apps/web/src/components/dashboard/dashboard-home.tsx`                                                                                                                                                                                                                                                                                                               | Nao ha graficos reais, drill-down ou biblioteca de charts ativa.                                                                          |
| T08  | Dashboards personalizados, favoritos e widgets                   | Parcial  | `supabase/migrations/20260604203252_002_create_reports_dashboards.sql`, `supabase/migrations/20260605120000_004_api_platform_tables.sql`                                                                                                                                                                                                                                                      | Ha pistas de modelagem, mas nao ha fluxo funcional completo na web ou na API.                                                             |
| T09  | Exportacao PDF/Excel com confirmacao e historico                 | Parcial  | `apps/web/src/app/app/exports/page.tsx`, `apps/web/src/components/exports/exports-list.tsx`, `apps/web/src/components/reports/report-detail.tsx`, `apps/api/src/platform/exports/*`                                                                                                                                                                                                           | Historico, solicitacao a partir do relatorio e download autenticado existem, com PDF/XLSX reais; ainda falta cobertura mais ampla do PDF. |
| T10  | Meu perfil com dados do usuario e troca de senha                 | Feito    | `apps/web/src/app/app/profile/page.tsx`, `apps/web/src/components/user-profile.tsx`, `apps/api/src/auth/auth.controller.ts`                                                                                                                                                                                                                                                                   | `GET /auth/me` e `PATCH /auth/me/password` existem e o frontend usa esses endpoints reais.                                                |
| T11  | Central de notificacoes                                          | Feito    | `apps/web/src/app/app/notifications/page.tsx`, `apps/web/src/components/notifications/notifications-list.tsx`, `apps/api/src/platform/notifications/*`                                                                                                                                                                                                                                        | Fluxo ativo via API. Continua simples frente ao PDF.                                                                                      |
| T12  | Dashboard administrativo com indicadores de operacao e seguranca | Faltando | `apps/web/src/app/app/admin/page.tsx`                                                                                                                                                                                                                                                                                                                                                         | O hub admin existe, mas nao ha dashboard admin aderente ao escopo.                                                                        |
| T13  | Gestao de usuarios                                               | Feito    | `apps/web/src/app/app/admin/users/page.tsx`, `apps/web/src/components/admin/admin-users.tsx`, `apps/api/src/admin/users/*`                                                                                                                                                                                                                                                                    | CRUD funcional e utilizavel.                                                                                                              |
| T14  | Gestao de permissoes                                             | Feito    | `apps/web/src/app/app/admin/permissions/page.tsx`, `apps/web/src/components/admin/admin-permissions.tsx`, `apps/api/src/permissions/*`, `apps/api/src/app.module.ts`                                                                                                                                                                                                                          | O modulo agora participa do runtime principal e suas mutacoes geram auditoria. A profundidade funcional ainda e menor que a do PDF.       |
| T15  | Gestao de relatorios                                             | Parcial  | `apps/web/src/app/app/admin/reports/page.tsx`, `apps/web/src/components/admin/admin-reports.tsx`, `apps/api/src/reports/report-definitions.admin.controller.ts`, `apps/api/src/reports/repositories/report-definitions.repository.ts`, `supabase/migrations/20260605120000_004_api_platform_tables.sql`, `supabase/migrations/20260607113000_005_report_definitions_unique_source_sector.sql` | Fluxo administrativo existe e persiste em Supabase quando o backend esta configurado, mas ainda falta fechamento funcional do V1.         |
| T16  | Editor visual drag-and-drop de dashboards                        | Faltando | `supabase/migrations/20260604203252_002_create_reports_dashboards.sql`                                                                                                                                                                                                                                                                                                                        | Nao ha implementacao funcional do editor.                                                                                                 |
| T17  | Auditoria com filtros                                            | Feito    | `apps/web/src/app/app/admin/audit/page.tsx`, `apps/web/src/components/admin/admin-audit.tsx`, `apps/api/src/audit/*`, `apps/api/src/app.module.ts`                                                                                                                                                                                                                                            | O modulo esta ligado ao runtime e agora recebe eventos de exports, permissoes e settings. Continua longe do hardening final do PDF.       |
| T18  | Configuracoes do sistema                                         | Feito    | `apps/web/src/app/app/admin/settings/page.tsx`, `apps/web/src/components/admin/admin-settings.tsx`, `apps/api/src/platform/settings/*`                                                                                                                                                                                                                                                        | A tela e a API estao ligadas no runtime atual, com edicao de valores nao sensiveis via API centralizada.                                  |

## Matriz Dos 6 Modulos Funcionais

| Modulo   | Status  | Ja entregue                                                                                                                   | Parcial                                                                                                         | Faltando para aderir ao V1                                                      |
| -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| AUTH     | Parcial | Login, refresh, logout, forgot/reset password, rate limit e perfil do usuario                                                 | Sessao web segue em `localStorage`; CSRF existe em codigo, mas a estrategia final de seguranca ainda e limitada | 2FA/TOTP, sessao mais robusta, hardening final do PDF                           |
| PERMISS. | Parcial | Roles, setores, grupos, tela admin e endpoints de permissoes ativos no runtime                                                | Regras mais finas, heranca e validacao mais profunda ainda precisam evoluir                                     | Aderencia completa ao modelo do PDF e cobertura operacional maior               |
| SQL      | Parcial | Camada parametrizada, validacao de identificadores e leitura segura de relatorios                                             | O modulo de SQL atende relatorios, mas nao fecha observabilidade e cache do PDF                                 | Cache, cron, monitoramento e estrategia final pedida no escopo                  |
| RELAT.   | Parcial | Catalogo, visualizacao, filtros, gestao admin basica, persistencia real das definicoes e pipeline de exportacao de relatorios | Favoritos e cobertura mais ampla do PDF ainda nao fecharam                                                      | Favoritos, dashboards/exports mais amplos e demais fluxos do escopo             |
| BI       | Parcial | Dashboard home com KPIs e resumo por setor via API                                                                            | A home funciona, mas sem BI interativo real                                                                     | Graficos, drill-down, personalizacao e editor visual                            |
| ADMIN    | Parcial | Usuarios, grupos, permissoes, auditoria, settings e parte de relatorios                                                       | Existe administracao funcional, mas abaixo do dashboard admin e da profundidade do PDF                          | Dashboard admin, mais hardening, melhor persistencia e fechamento de governanca |

### Pontos explicitos por modulo

- `AUTH`: login, refresh, reset, rate limit e bcrypt existem; `GET /auth/me` e `PATCH /auth/me/password` agora existem; 2FA/TOTP continua ausente; a sessao web segue em `localStorage`.
- `PERMISS.`: roles, setores, grupos e a tela de permissoes agora estao no runtime; create/update/delete de permissoes ja geram auditoria, mas a implementacao continua parcial frente ao nivel esperado no PDF.
- `SQL`: a camada parametrizada continua sendo um dos pontos mais solidos do repositorio.
- `RELAT.`: catalogo, query, definicoes administrativas e exportacao de relatorios agora usam backend real; o modulo continua parcial por causa de favoritos e da aderencia mais ampla ao PDF.
- `BI`: os KPIs do dashboard home foram centralizados na API, mas o BI descrito no PDF ainda nao foi entregue.
- `ADMIN`: ha mais cobertura real no runtime, com settings editaveis pela API e auditoria de mutacoes sensiveis, mas ainda sem dashboard admin aderente e sem fechamento completo de governanca.

## Divergencias Arquiteturais Relevantes

### 1. Topologia real atual

Hoje o fluxo principal e:

```text
apps/web -> apps/api -> SQL Server
                    \-> Supabase
                    \-> memoria em partes do dominio
```

O ponto central da Fase 1 foi bem sucedido: a web passou a usar a API como fonte oficial para dashboard, notifications, exports, settings e profile.

### 2. `AppModule` agora mudou o runtime

`apps/api/src/app.module.ts` hoje importa:

- `AdminModule`
- `AuditModule`
- `AuthModule`
- `CommonModule`
- `HealthModule`
- `PermissionsModule`
- `PlatformModule`
- `ReportsModule`
- `ValidationTestModule`

Isso altera de forma relevante a classificacao das telas T11, T14, T17 e T18, que antes estavam fora do runtime principal.

### 3. O backend esta mais centralizado, mas nao totalmente final

Mesmo com a centralizacao da API:

- `apps/api/src/reports/repositories/report-definitions.repository.ts` agora usa `api_report_definitions` no Supabase quando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estao configurados;
- `apps/api/src/platform/exports/*` agora gera PDF/XLSX/CSV/JSON reais para exportacoes de relatorios, com fila, notificacao e auditoria;
- `apps/api/src/platform/settings/*` agora permite atualizar configuracoes pela API, com trilha de auditoria;
- `apps/api/src/permissions/*` agora registra auditoria em criacao, atualizacao e exclusao;
- parte do dominio administrativo e de platform continua dependente de Supabase e nao de persistencia totalmente internalizada.

### 4. O `AGENTS.md` e aspiracional, nao descritivo

O `AGENTS.md` atual descreve uma plataforma-alvo com:

- Prisma
- Redis funcional
- BullMQ pleno
- React Hook Form
- Zod
- TanStack Query como padrao
- Recharts ou Chart.js
- Playwright
- arquitetura `docs/specs`, `docs/tasks`, `docs/qa`, `docs/adr`

O repositorio atual **nao corresponde integralmente a esse texto**. Alguns exemplos:

- nao ha Prisma em uso;
- Redis nao e dependencia funcional central do produto;
- TanStack Query esta declarada, mas nao estrutura os fluxos principais entregues;
- nao ha BI com charts reais;
- a estrutura de `docs/qa` e `docs/tasks` descrita no AGENTS nao e a base operacional do repositorio hoje.

Leitura correta: o `AGENTS.md` serve como orientacao de engenharia e alvo de maturidade, nao como inventario do que ja esta pronto.

## Saude Tecnica Atual Do Projeto

### Comandos executados

| Comando            | Resultado | Resumo                                        |
| ------------------ | --------- | --------------------------------------------- |
| `pnpm verify:docs` | Passou    | Documentacao obrigatoria validada com sucesso |
| `pnpm typecheck`   | Passou    | API e web tipadas sem erro                    |
| `pnpm test`        | Passou    | Suites de API e web verdes                    |
| `pnpm build`       | Passou    | Build de API e web concluido                  |

### Observacoes tecnicas importantes

- durante a verificacao final apos merge com `main`, o primeiro `pnpm typecheck` falhou no web por falta de arquivos `.next/types`;
- `pnpm build` regenerou esses artefatos;
- o `pnpm typecheck` executado novamente passou em seguida;
- isso nao invalida a estabilidade final, mas mostra uma dependencia operacional da tipagem do Next.js com artefatos de build no clone atual.

### Debitos de qualidade x debitos de escopo

- **Debitos de qualidade**: hoje estao muito mais controlados; o workspace passou nas verificacoes principais.
- **Debitos de escopo**: continuam relevantes, principalmente em BI avancado e seguranca do MVP completo.

## O Que Ja Esta Pronto Para Aproveitar

- auth principal com login, refresh, logout, reset, profile e troca de senha;
- guards por role e setor;
- camada SQL parametrizada;
- catalogo, visualizacao e filtros de relatorios;
- CRUD de usuarios e grupos;
- tela e backend de permissoes;
- tela e backend de auditoria;
- centralizacao da API para dashboard, notifications, exports e settings;
- pipeline real de exportacoes de relatorios com PDF/XLSX e download autenticado;
- base visual da web e conjunto amplo de testes;
- migrations Supabase como pista de modelagem futura.

## Roadmap Recomendado Para Fechar O V1

### Fase 2 - Fechar aderencia funcional que segue parcial

Entregas:

- aprofundar permissoes, auditoria e settings alem do minimo atual;
- revisar a sessao do frontend e seguranca operacional.

Dependencias:

- Fases 0 e 1 concluidas, como ja estao.

### Fase 3 - BI real e dashboards personalizados

Entregas:

- graficos reais com biblioteca de charts;
- drill-down e interacao;
- dashboards personalizados e favoritos;
- base mais proxima do que o PDF pede para T07, T08 e T16.

Dependencias:

- persistencia e contratos de dados mais estaveis.

### Fase 4 - Hardening, operacao e fechamento

Entregas:

- 2FA/TOTP para administradores, se mantido como requisito;
- estrategia final de sessao, CSRF e demais controles escolhidos;
- testes E2E criticos;
- documentacao final de handoff e checklist objetivo de aceite do V1.

Dependencias:

- fases anteriores resolvidas.

### Ordem recomendada

1. Consolidar permissoes, auditoria, settings e persistencias restantes de platform.
2. Revisar hardening de sessao e seguranca operacional.
3. Entregar BI interativo e dashboards personalizados.
4. Revisar hardening final e operacao.
5. Validar de novo a matriz das 18 telas e dos 6 modulos.

## Checklist Final De Conclusao Do V1

### Telas

- [ ] T07 entregue com BI interativo real
- [ ] T08 entregue com dashboards personalizados
- [ ] T12 entregue como dashboard admin real
- [ ] T16 entregue com editor visual funcional
- [ ] T09 e T15 deixaram de ser parciais

### Backend

- [x] `AppModule` reflete a arquitetura centralizada da Fase 1
- [x] Rotas usadas pelo frontend existem de fato
- [x] Definicoes de relatorios deixaram de depender de memoria no runtime principal
- [x] Export pipeline de relatorios ganhou backend real com PDF/XLSX, fila, auditoria e download autenticado

### Frontend

- [x] O frontend nao depende mais de `/auth/me` e `/auth/me/password` inexistentes
- [x] Dashboard, notifications, exports e settings usam a API como fonte oficial
- [ ] BI avancado e dashboards personalizados foram entregues

### Seguranca

- [x] Login com rate limit e JWT existe
- [ ] Sessao web saiu de `localStorage` ou foi assumida conscientemente como limite do V1
- [ ] 2FA/TOTP e hardening final foram definidos e implementados, se continuarem no escopo

### Dados e persistencia

- [x] Relatorios administrativos tem persistencia real
- [ ] Dashboards e favoritos tem persistencia real
- [x] Exports de relatorios e auditoria ja operam no runtime principal

### Qualidade

- [x] `pnpm verify:docs` passa
- [x] `pnpm typecheck` passa
- [x] `pnpm test` passa
- [x] `pnpm build` passa

### Documentacao

- [x] O repositorio voltou a ter documentacao estrutural valida
- [x] README, handoff e analise de escopo estao alinhados ao runtime atual
- [ ] O `AGENTS.md` ainda precisa ser lido como alvo aspiracional e pode merecer alinhamento futuro com a realidade do repo

## Conclusao

Em 7 de junho de 2026, o repositorio esta **mais proximo do V1 do que estava no inicio da analise original**, com ganhos concretos de runtime, testes, documentacao e arquitetura. Ainda assim, **ele segue abaixo do escopo V1 do PDF**.

A leitura correta do estado atual e:

- existe base funcional reutilizavel e operacional;
- a API foi centralizada para os fluxos principais da plataforma;
- permissoes, auditoria, settings, notifications, exports e profile passaram a existir de forma real no runtime;
- o que falta agora esta menos em "ligar codigo solto" e mais em "fechar produto", especialmente BI avancado, exportacao aderente, persistencia final e hardening.
