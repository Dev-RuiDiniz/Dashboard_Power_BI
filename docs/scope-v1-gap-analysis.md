# Gap Analysis: Escopo V1 x Estado Real

## Referência analisada

Documento de escopo: `ESCOPO_DASHBOARD_Plataforma_BI_V1.pdf`

Critério desta análise:

- o PDF é a referência oficial do escopo V1;
- o código do repositório é a única fonte de verdade para o estado atual;
- cada item abaixo foi classificado como `implementado`, `parcial`, `ausente` ou `divergente`.

## Leitura executiva

Principais divergências já confirmadas:

- o PDF prevê 18 telas; o repositório implementa um subconjunto delas;
- o PDF prevê fluxos completos de BI interativo, dashboards personalizados, perfil, permissões dedicadas, logs de auditoria e editor de dashboards; isso não existe end-to-end hoje;
- o PDF prevê stack com Prisma, React Query, Recharts/Chart.js, BullMQ, S3 e 2FA/TOTP; essas peças não aparecem como implementação real no código atual;
- o PDF prevê Redis funcional para cache/sessão; no repositório atual Redis aparece em docs/infra, mas não há uso efetivo na aplicação.

## Matriz de telas T01-T18

| ID  | Tela prevista no PDF      | Status       | Evidência no repositório                                                                           | Gap observado                                                                                |
| --- | ------------------------- | ------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| T01 | Login                     | implementado | `apps/web/src/app/login/page.tsx`                                                                  | Fluxo existe e consome a API.                                                                |
| T02 | Recuperação de senha      | implementado | `apps/web/src/app/forgot-password/page.tsx`, `apps/web/src/app/reset-password/page.tsx`            | O fluxo existe em duas telas, conforme a implementação web atual.                            |
| T03 | Dashboard Home            | implementado | `apps/web/src/app/app/page.tsx`, `apps/web/src/components/dashboard/dashboard-home.tsx`            | Entrega cards, resumos e tabela por setor, sem BI avançado.                                  |
| T04 | Lista de relatórios       | implementado | `apps/web/src/app/app/reports/page.tsx`                                                            | Catálogo com filtros e seleção de relatório.                                                 |
| T05 | Visualizador de relatório | parcial      | `apps/web/src/components/reports/*`, `apps/api/src/reports/reports.controller.ts`                  | O detalhe e a execução existem dentro da tela de catálogo, não como visualizador dedicado.   |
| T06 | Filtros avançados         | implementado | `apps/web/src/components/reports/report-advanced-filters.tsx`                                      | Filtros existem para o catálogo/consulta.                                                    |
| T07 | Dashboard interativo      | parcial      | `apps/web/src/components/dashboard/dashboard-home.tsx`                                             | Há dashboard inicial, mas sem gráficos interativos, drill-down ou widgets avançados.         |
| T08 | Dashboard personalizado   | ausente      | sem rota ou módulo dedicado                                                                        | Não há criação, persistência ou edição de dashboards do usuário.                             |
| T09 | Exportar relatório        | parcial      | `apps/web/src/app/app/exports/page.tsx`, `apps/web/src/components/exports/exports-list.tsx`        | Há leitura de histórico de exportações, mas não geração/export real pela aplicação.          |
| T10 | Meu perfil                | ausente      | sem `apps/web/src/app/app/profile`                                                                 | Não existe tela dedicada de perfil.                                                          |
| T11 | Notificações              | parcial      | `apps/web/src/app/app/notifications/page.tsx`                                                      | Lista e marca como lida, mas sem backend próprio, sem realtime e sem sino global confirmado. |
| T12 | Dashboard Admin           | implementado | `apps/web/src/app/app/admin/page.tsx`                                                              | Existe como hub administrativo simples.                                                      |
| T13 | Gestão de usuários        | implementado | `apps/web/src/app/app/admin/users/page.tsx`, `apps/api/src/admin/users`                            | CRUD básico disponível.                                                                      |
| T14 | Gestão de permissões      | ausente      | sem rota/tela dedicada                                                                             | Permissões existem de forma parcial em guards e estruturas, mas não há UI/fluxo dedicado.    |
| T15 | Gestão de relatórios      | parcial      | `apps/api/src/reports/report-definitions.admin.controller.ts`                                      | A API expõe endpoints, mas a Web não possui tela administrativa correspondente.              |
| T16 | Editor de dashboard       | ausente      | sem rota, sem módulo, sem componente editor                                                        | Não implementado.                                                                            |
| T17 | Logs de auditoria         | ausente      | sem rota/tela/endpoints dedicados                                                                  | Não há módulo de auditoria exposto.                                                          |
| T18 | Configurações do sistema  | parcial      | `apps/web/src/app/app/admin/settings/page.tsx`, `apps/web/src/components/admin/admin-settings.tsx` | Há leitura de settings no Supabase, sem fluxo completo de gestão via backend.                |

## Módulos funcionais do PDF

| Módulo     | Status  | Evidência                                                                | Gap observado                                                                                                                                         |
| ---------- | ------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth       | parcial | `apps/api/src/auth`, `apps/web/src/components/auth/*`                    | Login, refresh e reset existem; faltam 2FA/TOTP, logs de autenticação consolidados e sessão madura.                                                   |
| Permissões | parcial | `apps/api/src/auth/guards`, `apps/api/src/auth/authz-test.controller.ts` | Há guards por role/setor, mas falta gestão dedicada, grupos de permissão completos e trilha de auditoria.                                             |
| SQL        | parcial | `apps/api/src/sql-server`, `apps/api/src/reports`                        | Existe execução parametrizada em SQL Server; faltam cache real, refresh agendado, monitoramento de lentidão e persistência mais robusta de metadados. |
| Relatórios | parcial | `apps/web/src/components/reports/*`, `apps/api/src/reports/*`            | Catálogo e execução existem; export, favoritos e viewer completo ainda não.                                                                           |
| BI         | parcial | `apps/web/src/components/dashboard/*`                                    | KPIs e agregações existem, mas sem stack de gráficos prevista, drill-down, layouts personalizados ou editor.                                          |
| Admin      | parcial | `apps/web/src/components/admin/*`, `apps/api/src/admin/*`                | Usuários e grupos existem; faltam permissões dedicadas, logs, gestão web de relatórios e editor/dashboard admin completos.                            |

## Arquitetura prevista x arquitetura real

| Tema                      | Previsto no PDF                                   | Estado real                                                   | Status     | Observação                                  |
| ------------------------- | ------------------------------------------------- | ------------------------------------------------------------- | ---------- | ------------------------------------------- |
| Frontend                  | Next.js 14 + Tailwind + shadcn/ui + React Query   | Next.js 14 + Tailwind + componentes próprios + `lucide-react` | divergente | Não há React Query no código.               |
| Gráficos                  | Recharts/Chart.js                                 | Sem biblioteca dedicada de gráficos                           | divergente | Dashboard usa cards e tabelas.              |
| Backend                   | NestJS + Prisma ORM + SQL Server                  | NestJS + `mssql` + SQL Server                                 | divergente | Prisma não está implementado.               |
| Cache/sessão              | Redis funcional                                   | Redis citado em docs/infra, sem uso real na aplicação         | divergente | Não há sessão/caching efetivo com Redis.    |
| Jobs                      | BullMQ                                            | inexistente                                                   | ausente    | Não há worker nem fila.                     |
| Export                    | ExcelJS + Puppeteer/WeasyPrint + pipeline backend | histórico lido do Supabase pela Web                           | divergente | O fluxo completo não foi implementado.      |
| Armazenamento de arquivos | S3 ou equivalente                                 | inexistente                                                   | ausente    | Sem upload/storage de arquivos de export.   |
| Persistência de metadados | Prisma + banco central da plataforma              | híbrido entre memória, Supabase e SQL Server                  | divergente | Estado atual é fragmentado.                 |
| Web consumindo backend    | API NestJS central                                | Web consome API e também Supabase direto                      | divergente | Arquitetura híbrida fora do desenho do PDF. |

## Segurança prevista x segurança real

| Item                    | Previsto no PDF                  | Estado real                                            | Status       | Gap observado                                                                                          |
| ----------------------- | -------------------------------- | ------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| Hash de senha           | `bcrypt`                         | `bcrypt` presente na API                               | implementado | Confirmado em `apps/api/package.json` e módulo auth.                                                   |
| JWT access/refresh      | 15min / 7d                       | fluxo JWT implementado                                 | implementado | O fluxo existe; a Web persiste sessão localmente.                                                      |
| SQL parametrizado       | obrigatório                      | implementado                                           | implementado | Execução via camada SQL Server da API.                                                                 |
| Rate limit              | login e API global               | parcial                                                | parcial      | Há controle de tentativas no auth; não há evidência clara de política global completa para toda a API. |
| 2FA/TOTP                | opcional/obrigatório para admins | inexistente                                            | ausente      | Sem endpoints ou UI.                                                                                   |
| CSRF                    | proteção explícita               | inexistente                                            | ausente      | Não há implementação confirmada.                                                                       |
| CSP                     | cabeçalhos de segurança          | inexistente                                            | ausente      | Não há middleware/configuração confirmada.                                                             |
| DOMPurify/XSS hardening | previsto                         | não confirmado no código                               | ausente      | Não há dependência/uso de DOMPurify encontrado.                                                        |
| HTTPS/HSTS              | previsto para produção           | não documentado como comportamento implementado no app | parcial      | Pode existir via ambiente de deploy futuro, não no código atual.                                       |
| Logs de auditoria       | previstos                        | inexistentes como módulo exposto                       | ausente      | Há menções de tabelas/migrações, mas não fluxo funcional consolidado.                                  |

## Cronograma do PDF x estágio real do código

| Bloco do PDF                                                                                  | Status real     | Evidência                                                           | Observação                                                                      |
| --------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Sprint 1: setup, auth, users, groups, permissions, SQL, listing                               | parcial         | módulos Auth/Admin/Reports/SqlServer + páginas web iniciais         | Base foi entregue em parte, mas permissões completas e persistência madura não. |
| Sprint 2: viewer inline, filtros avançados, export, dashboards, notificações                  | parcial         | viewer simplificado, filtros, dashboard inicial, notifications page | Export backend e dashboards personalizados não existem.                         |
| Sprint 3: auditoria, editor admin, cache Redis, cron refresh, 2FA, testes E2E, deploy/handoff | ausente/parcial | algumas docs e testes existem; recursos centrais não                | O bloco mais avançado do PDF não está implementado como produto.                |

## Divergências confirmadas por tema

### Telas e fluxos

- O escopo V1 fala em 18 telas.
- O repositório possui menos telas concluídas e parte dos fluxos está condensada em páginas únicas.
- O visualizador de relatório existe como composição dentro de `/app/reports`, não como tela dedicada.

### BI e dashboards

- O PDF prevê dashboard interativo, dashboards personalizados e editor de dashboards.
- O código atual entrega apenas um dashboard inicial com cards e agregações.
- Não há persistência funcional de layout do usuário na experiência atual.

### Permissões e auditoria

- O PDF prevê gestão dedicada de permissões, grupos, auditoria e timeout de inatividade.
- O código atual tem guards de autorização e algumas estruturas administrativas, mas não oferece gestão dedicada nem trilha auditável completa via UI/API.

### Exportação

- O PDF prevê exportação backend com fila, geração de arquivo e histórico.
- O código atual só lê registros de `export_jobs` no Supabase.
- Não há endpoint de export, worker, storage nem geração de PDF/Excel.

### Stack e componentes arquiteturais

- Prisma não está implementado.
- React Query não está implementado.
- Recharts/Chart.js não estão implementados.
- BullMQ não está implementado.
- S3 não está implementado.
- 2FA/TOTP não está implementado.
- Redis não está funcionalmente integrado na aplicação.

## Conclusão

O repositório já materializa uma base útil de plataforma BI, mas ainda está abaixo do escopo V1 descrito no PDF em cobertura funcional, consistência arquitetural e maturidade operacional.

A leitura correta é:

- o PDF descreve a meta de produto;
- o repositório descreve uma implementação parcial dessa meta;
- as docs principais do projeto devem tratar o código atual como fonte de verdade e o PDF apenas como referência de escopo.
