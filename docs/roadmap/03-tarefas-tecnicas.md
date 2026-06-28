# ROADMAP — Tarefas Técnicas e Infraestrutura

**Metodologia:** SDD + TDD aplicados em cada tarefa técnica.

---

## Infraestrutura e DevOps

### T01 — Monorepo com pnpm Workspaces

```
Status: ✅ Concluído (Fase 0)

SDD — Especificação:
- Estrutura de monorepo com apps/api, apps/web, packages/shared, packages/ui
- Scripts de lint, format, typecheck, test, build no root
- Docker Compose para desenvolvimento e produção
- GitHub Actions para CI/CD

TDD — Testes:
- pnpm verify:workspace — validação estrutural
- pnpm verify:docker — validação de Dockerfiles
- pnpm verify:docs — documentação obrigatória presente
- pnpm quality — suite completa de qualidade

Entregáveis:
✅ pnpm-workspace.yaml
✅ turbo.json (se usado)
✅ package.json root com scripts
✅ apps/api/Dockerfile, apps/web/Dockerfile
✅ infra/docker/docker-compose.dev.yml
✅ infra/docker/docker-compose.prod.yml
✅ .github/workflows/deploy-vps.yml
```

### T02 — Variáveis de Ambiente e Configuração

```
Status: ✅ Concluído (Fase 0)

SDD — Especificação:
- .env.example com todas as variáveis necessárias
- Separação .env.local (dev) vs .env.production
- Validação de variáveis obrigatórias no startup da API
- Documentação em `infra/env/.env.example`

TDD — Testes:
- pnpm verify:docs — documentação atualizada
- Startup da API falha graceiosamente se variável obrigatória ausente
- Comandos: pnpm dev:api (com .env configurado)

Entregáveis:
✅ infra/env/.env.example
✅ infra/env/.env.production.example
```

### T03 — Supabase como Persistência

```
Status: ✅ Concluído (Fase 2)

SDD — Especificação:
- Migrations para todas as tabelas da plataforma
- Repositórios híbridos: memória (fallback) + Supabase (quando configurado)
- Service role key no backend, anon key no frontend
- RLS policies para segurança
- Documentação de ativação da persistência

TDD — Testes:
- pnpm verify:docs — documentação atualizada
- Testes de repositórios com modo memória
- Testes de repositórios com modo Supabase (quando configurado)
- Comandos: pnpm test

Entregáveis:
✅ supabase/migrations/20260604203236_001_create_auth_and_permissions.sql
✅ supabase/migrations/20260604203252_002_create_reports_dashboards.sql
✅ supabase/migrations/20260604203306_003_create_exports_settings.sql
✅ supabase/migrations/20260605120000_004_api_platform_tables.sql
✅ supabase/migrations/20260605200000_005_permissions_table.sql
✅ supabase/migrations/20260605210000_006_audit_logs_table.sql
✅ supabase/migrations/20260607113000_005_report_definitions_unique_source_sector.sql
✅ supabase/migrations/20260607183000_006_api_favorite_reports.sql
✅ apps/api/src/supabase/supabase.service.ts
```

---

## Frontend — Stack e Bibliotecas

### T04 — React Query (TanStack Query)

```
Status: ✅ Concluído (Fase 2 — 2026-06-05)

SDD — Especificação:
- Instalação de @tanstack/react-query
- QueryClient com staleTime padrão (5 min)
- QueryClientProvider no layout principal (/app)
- Hooks customizados para queries comuns (useAdminReports, useUserProfile, etc.)
- Invalidação de cache após mutações

TDD — Testes:
- Unit: query-client.ts — configuração padrão
- Unit: hooks customizados — loading, erro, sucesso
- Integration: componentes usando React Query — estados corretos
- Manual: verificar que dados não são refetchados desnecessariamente
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
✅ apps/web/src/lib/react-query/query-client.ts
✅ apps/web/src/components/providers/query-client-provider.tsx
✅ apps/web/src/app/app/layout.tsx — integração do provider
✅ @tanstack/react-query em apps/web/package.json
```

### T05 — Recharts para Gráficos

```
Status: 🔄 Parcial (Fase 3)

SDD — Especificação:
- Instalação de recharts em apps/web
- Componentes de gráfico reutilizáveis: LineChart, BarChart, PieChart, AreaChart
- Integração nos dashboards existentes
- Dados via API, não hardcoded
- Responsividade e acessibilidade

TDD — Testes:
- Unit: componentes de gráfico — renderização com dados
- Integration: dashboard-home.tsx — gráficos com dados reais da API
- Manual: verificar interação (hover, clique, tooltip)
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
✅ recharts instalado em apps/web/package.json
📋 Componentes de gráfico reutilizáveis (não criados)
📋 Integração em dashboard-home.tsx (não feita)
```

### T06 — Formulários e Validação

```
Status: 🔄 Parcial

SDD — Especificação:
- Validação de formulários com Zod (ou React Hook Form + Zod)
- Componentes de input reutilizáveis com label, erro, helper text
- Estados de loading, erro, sucesso em todos os formulários
- Validação no frontend e no backend (DTOs)

TDD — Testes:
- Unit: componentes de input — renderização, estados
- Unit: schemas Zod — validação de casos válidos e inválidos
- Integration: formulários — submissão, validação, feedback
- Comandos: pnpm test

Entregáveis:
✅ apps/web/src/components/ui/input.tsx — componente base
✅ Zod em apps/web/package.json
📋 React Hook Form (não instalado)
📋 Schemas Zod centralizados (parcial)
```

---

## Backend — Stack e Serviços

### T07 — NestJS com TypeScript Strict

```
Status: ✅ Concluído (Fase 0)

SDD — Especificação:
- API NestJS com TypeScript strict
- Módulos organizados por domínio
- DTOs com class-validator para validação de entrada
- Swagger/OpenAPI em /docs
- Healthcheck em /health
- Tratamento global de exceções

TDD — Testes:
- Unit: services — regras de negócio isoladas
- Unit: controllers — mapeamento de rotas
- Unit: guards — autorização
- Integration: supertest — fluxos completos de API
- Comandos: pnpm test, pnpm typecheck

Entregáveis:
✅ apps/api/src/main.ts — bootstrap e configuração
✅ apps/api/src/app.module.ts — módulos principais
✅ apps/api/src/health/* — healthchecks
✅ Swagger em http://localhost:3001/docs
```

### T08 — BullMQ e Pipeline de Exportação

```
Status: 📋 Pendente (Fase 3)

SDD — Especificação:
- Instalação de BullMQ + Redis
- Fila de exportações de relatórios
- Worker para processamento assíncrono de PDF/XLSX/CSV
- Status de job: pending, processing, completed, failed
- Polling de status pelo frontend
- Notificação ao usuário após conclusão
- Expiração automática de jobs antigos

TDD — Testes:
- Unit: export-queue.service.ts — adicionar job, obter status
- Unit: export-worker.ts — processamento de exportação
- Integration: exports.controller.spec.ts — solicitação e polling
- Integration: export completo: solicitar → processar → notificar
- Manual: verificar tempo de processamento de relatório grande
- Comandos: pnpm test

Entregáveis:
📋 BullMQ não instalado
📋 Redis não é dependência funcional central
📋 Worker de exportação não existe
```

### T09 — 2FA/TOTP

```
Status: 📋 Pendente (Fase 4)

SDD — Especificação:
- Instalação de otplib (já feito)
- Endpoint para ativar 2FA: gerar secret, retornar QR code
- Endpoint para verificar TOTP na configuração (validar código)
- Endpoint para desativar 2FA (requer senha atual + TOTP)
- Login com 2FA: após credenciais válidas, solicitar código TOTP
- Armazenamento do secret criptografado no banco
- UI de configuração de 2FA no perfil do usuário
- UI de verificação de código no login

TDD — Testes:
- Unit: totp.service.ts — gerar secret, validar código
- Integration: auth.controller.spec.ts — fluxo de ativação de 2FA
- Integration: auth.controller.spec.ts — login com 2FA
- Security: brute force em TOTP → bloqueio após 3 tentativas
- Manual: escanear QR code no Google Authenticator → verificar códigos
- Comandos: pnpm test

Entregáveis:
✅ otplib instalado em apps/api
📋 TOTPSecret entity/DTO (não criado)
📋 Endpoints de ativação/verificação (não criados)
📋 UI de configuração (não criada)
📋 Fluxo de login com 2FA (não implementado)
```

---

## Qualidade e Testes

### T10 — Testes Unitários e Integração

```
Status: 🔄 Parcial

SDD — Especificação:
- Jest para backend e frontend
- Supertest para testes de API
- Testing Library para componentes React
- Cobertura mínima: services, controllers, guards, componentes principais
- Mocks para dependências externas (Supabase, SQL Server, email)

TDD — Testes:
- pnpm test — suites verdes
- pnpm --filter @dashboard-power-bi/api test
- pnpm --filter @dashboard-power-bi/web test
- Cobertura: > 70% em services e controllers

Entregáveis:
✅ Jest configurado em API e Web
✅ Supertest em API
✅ Testing Library em Web
🔄 Suites existentes passando
📋 Cobertura de novos módulos (permissions, audit) incompleta
```

### T11 — TypeScript Strict

```
Status: ✅ Concluído (Fase 0)

SDD — Especificação:
- tsconfig.json com strict: true em API e Web
- Sem erros de tipagem em todo o projeto
- Tipos compartilhados entre API e Web (packages/shared)

TDD — Testes:
- pnpm typecheck — sem erros
- pnpm --filter @dashboard-power-bi/api typecheck
- pnpm --filter @dashboard-power-bi/web typecheck

Entregáveis:
✅ apps/api/tsconfig.json — strict: true
✅ apps/web/tsconfig.json — strict: true
✅ packages/shared/tsconfig.json — strict: true
```

### T12 — Lint e Formatação

```
Status: ✅ Concluído (Fase 0)

SDD — Especificação:
- ESLint configurado para TypeScript/React
- Prettier para formatação consistente
- Husky + lint-staged para pré-commit
- Regras de importação e organização de código

TDD — Testes:
- pnpm lint — sem erros
- pnpm format:check — sem diferenças
- Pre-commit hook passando

Entregáveis:
✅ .eslintrc.js / .eslintrc.json
✅ .prettierrc
✅ husky + lint-staged configurados
```

---

## Resumo de Progresso Técnico

| Tarefa                  | Status       | Fase     |
| ----------------------- | ------------ | -------- |
| Monorepo pnpm + Docker  | ✅ Concluído | Fase 0   |
| Variáveis de ambiente   | ✅ Concluído | Fase 0   |
| Supabase persistência   | ✅ Concluído | Fase 2   |
| React Query             | ✅ Concluído | Fase 2   |
| Recharts                | 🔄 Parcial   | Fase 3   |
| Formulários (Zod/RHF)   | 🔄 Parcial   | Fase 3   |
| NestJS strict + Swagger | ✅ Concluído | Fase 0   |
| BullMQ + Redis          | 📋 Pendente  | Fase 3   |
| 2FA/TOTP                | 📋 Pendente  | Fase 4   |
| Testes Jest + Supertest | 🔄 Parcial   | Contínuo |
| TypeScript strict       | ✅ Concluído | Fase 0   |
| Lint + Prettier + Husky | ✅ Concluído | Fase 0   |
