# ROADMAP_FALHAS.md — Roadmap de Correção de Falhas

**Projeto:** Dashboard Power BI
**Criado em:** 2026-06-28
**Origem:** Auditoria completa do projeto (backend, frontend, integrações, infraestrutura)

---

## Legenda

| Severidade | Significado                                     |
| ---------- | ----------------------------------------------- |
| 🔴 CRÍTICO | Bloqueia produção; corrigir primeiro            |
| 🟠 ALTO    | Funciona parcialmente ou sem segurança adequada |
| 🟡 MÉDIO   | Degradação ou riscos não bloqueantes            |
| 🟢 BAIXO   | Questões de escala/performance                  |

---

## 🔴 Críticos (4)

### F-C01 — CSRF Middleware Completamente Quebrado

- **Severidade:** 🔴 CRÍTICO
- **Status:** ✅ Concluído (2026-06-28)
- **Arquivos:**
  - `apps/api/src/common/middleware/csrf.middleware.ts`
  - `apps/api/src/common/common.module.ts`
  - `apps/api/src/main.ts`
- **Descrição:**
  O middleware CSRF está registrado globalmente mas três falhas combinadas o tornam inoperante:
  1. Sem `cookie-parser` instalado/registrado — `req.cookies` é sempre `undefined`
  2. CORS sem `credentials: true` — browser não envia cookies cross-origin (ports 3000 → 3001)
  3. Frontend não envia header `x-csrf-token` em nenhuma requisição
- **Impacto:** TODAS as requisições POST/PATCH/PUT/DELETE recebem `403 Forbidden`. Login funciona (excluído), mas refresh, logout, CRUD, exports, dashboards, settings, permissions — tudo falha.
- **Correção proposta:**
  1. Instalar `cookie-parser` e registrar `app.use(cookieParser())` em `main.ts`
  2. Adicionar `credentials: true` no CORS
  3. Excluir `auth/refresh` do CSRF (ver F-M03)
  4. Adicionar envio do header `x-csrf-token` no frontend (interceptar fetch no `admin-api.ts`)
  5. Alternativamente: desabilitar CSRF temporariamente até resolver a integração completa

### F-C02 — Refresh Token Só Funciona para o Usuário Demo

- **Severidade:** 🔴 CRÍTICO
- **Status:** ✅ Concluído (2026-06-28)
- **Arquivos:**
  - `apps/api/src/auth/auth.service.ts` (linhas 337-346)
- **Descrição:**
  `findValidRefreshSession` busca sessões apenas do usuário configurado em `AUTH_DEMO_USER_EMAIL`. Qualquer outro usuário não consegue renovar seu token.
- **Impacto:** Apenas 1 usuário mantém sessão ativa. Todos os outros perdem acesso após 15 minutos.
- **Correção proposta:**
  Refatorar `findValidRefreshSession` para buscar por hash do token em todos os usuários (ou usar query direta no repositório por `token_hash`).

### F-C03 — Path Traversal no Download de Exports

- **Severidade:** 🔴 CRÍTICO
- **Status:** ✅ Concluído (2026-06-28)
- **Arquivos:**
  - `apps/api/src/platform/exports/exports.service.ts` (linhas 170-204)
  - `apps/api/src/platform/exports/exports.controller.ts` (linhas 32-43)
- **Descrição:**
  O endpoint `GET /exports/files/:fileName` recebe `fileName` do path parameter sem sanitização. O resultado de `file_path` do banco é passado diretamente para `createReadStream()` sem verificar se está dentro do diretório de storage.
- **Impacto:** Leitura de arquivos arbitrários do sistema de arquivos do servidor.
- **Correção proposta:**
  1. Validar `fileName` com regex `^[a-f0-9-]+\.(pdf|excel|csv|json)$` (UUID + extensão)
  2. Usar `path.resolve()` e verificar se o path resultante está dentro de `storageDir`
  3. Rejeitar qualquer `fileName` contendo `..` ou `/` ou `\`

### F-C04 — JWT Customizado Vulnerável a Timing Attack

- **Severidade:** 🔴 CRÍTICO
- **Status:** ✅ Concluído (2026-06-28)
- **Arquivos:**
  - `apps/api/src/auth/services/token.service.ts` (linha 45)
- **Descrição:**
  A comparação de assinatura JWT usa `!==` (non-constant-time). A implementação JWT é totalmente custom e vulnerável a ataques de timing side-channel.
- **Impacto:** Forja de tokens JWT através de análise de tempo de resposta.
- **Correção proposta:**
  Usar `crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))` ou adotar biblioteca `jsonwebtoken`.

---

## 🟠 Altos (8)

### F-A01 — Audit Controller: `getById` Usa `@Query` em Vez de `@Param`

- **Severidade:** 🟠 ALTO
- **Status:** ✅ Concluído (2026-06-29)
- **Arquivos:**
  - `apps/api/src/audit/audit.controller.ts` (linha 56)
- **Descrição:**
  A rota é `@Get(':id')` mas o parâmetro é lido de `@Query('id')` em vez de `@Param('id')`.
- **Impacto:** `GET /admin/audit/abc123` não funciona — é necessário `GET /admin/audit?id=abc123`.
- **Correção proposta:**
  Trocar `@Query('id')` por `@Param('id')`.

### F-A02 — `TwoFactorGuard` Inconsistente Entre Controllers Admin

- **Severidade:** 🟠 ALTO
- **Status:** ✅ Concluído (2026-06-29)
- **Arquivos:**
  - `apps/api/src/platform/settings/settings.controller.ts`
  - `apps/api/src/permissions/permissions.controller.ts`
  - `apps/api/src/audit/audit.controller.ts`
- **Descrição:**
  `AdminUsersController`, `AdminGroupsController` e `ReportDefinitionsAdminController` usam `TwoFactorGuard`. Mas `SettingsController`, `PermissionsController` e `AuditController` não usam.
- **Impacto:** Admins sem 2FA podem acessar settings, permissions e audit logs, mas não podem gerenciar usuários e grupos.
- **Correção proposta:**
  Adicionar `TwoFactorGuard` em `SettingsController`, `PermissionsController` e `AuditController`.

### F-A03 — Dashboards Controller: Inputs Sem Validação DTO

- **Severidade:** 🟠 ALTO
- **Status:** ✅ Concluído (2026-06-29)
- **Arquivos:**
  - `apps/api/src/platform/dashboards/dashboards.controller.ts`
- **Descrição:**
  Os endpoints usam tipos TypeScript brutos em vez de DTOs com `class-validator`. O `ValidationPipe` global não valida tipos sem decorators.
- **Impacto:** Qualquer payload é aceito sem validação.
- **Correção proposta:**
  Criar DTOs com `class-validator` para `CreateDashboardInput`, `UpdateDashboardInput`, `CreateWidgetInput`, `UpdateWidgetInput`, `BatchUpdateWidgetInput`.

### F-A04 — Batch Update Widgets: Contrato Frontend ≠ Backend

- **Severidade:** 🟠 ALTO
- **Status:** ✅ Concluído (2026-06-29)
- **Arquivos:**
  - `apps/api/src/platform/dashboards/dashboards.controller.ts` (linhas 89-96)
  - `apps/web/src/lib/platform-api.ts` (linha 260)
- **Descrição:**
  Backend espera `BatchUpdateWidgetInput[]` (array direto no body). Frontend envia `{ items: [...] }` (objeto com propriedade `items`).
- **Impacto:** Operação de batch update nunca funciona.
- **Correção proposta:**
  Alinhar contrato — ou o backend aceita `{ items: [...] }` via DTO, ou o frontend envia array direto.

### F-A05 — Settings Controller: Body Sem DTO nem Whitelist de Keys

- **Severidade:** 🟠 ALTO
- **Status:** ✅ Concluído (2026-06-29)
- **Arquivos:**
  - `apps/api/src/platform/settings/settings.controller.ts` (linhas 27-39)
- **Descrição:**
  Não há DTO nem validação. Qualquer valor pode ser setado para qualquer key, incluindo settings sensíveis.
- **Impacto:** Modificação não autorizada de configurações sensíveis do sistema.
- **Correção proposta:**
  Criar `UpdateSettingDto` com `class-validator`, whitelist de keys permitidas e validação de tipo de valor.

### F-A06 — Memory Mode: `getFilePathForUser` Retorna URL em Vez de Path

- **Severidade:** 🟠 ALTO
- **Status:** ✅ Concluído (2026-06-29)
- **Arquivos:**
  - `apps/api/src/platform/exports/exports.service.ts` (linha 180)
- **Descrição:**
  Em modo memória, retorna `file_url` (URL relativa) em vez de um path de arquivo. O controller faz `createReadStream('/exports/files/uuid.pdf')` que falha com `ENOENT`.
- **Impacto:** Download de exports quebra em modo memória/desenvolvimento.
- **Correção proposta:**
  Retornar path mockado válido ou gerar arquivo mock em diretório temporário.

### F-A07 — CORS Hardcoded para localhost

- **Severidade:** 🟠 ALTO
- **Status:** ✅ Concluído (2026-06-29)
- **Arquivos:**
  - `apps/api/src/main.ts` (linhas 9-11)
- **Descrição:**
  Origins hardcoded para `localhost:3000` e `127.0.0.1:3000`. Em produção, o frontend terá URL diferente.
- **Impacto:** Frontend não consegue acessar a API em produção.
- **Correção proposta:**
  Ler origins de env var `CORS_ORIGINS` (comma-separated) com fallback para localhost.

### F-A08 — Dashboard Controller Não Filtra por Setor do Usuário

- **Severidade:** 🟠 ALTO
- **Status:** ✅ Concluído (2026-06-29)
- **Arquivos:**
  - `apps/api/src/platform/dashboard/dashboard.controller.ts`
- **Descrição:**
  Nenhum endpoint usa `@CurrentUser()`. Todos os usuários autenticados veem todos os KPIs, drilldowns e setores.
- **Impacto:** Violação de isolamento por setor — usuário de financeiro vê dados de RH.
- **Correção proposta:**
  Injetar `@CurrentUser()` e passar `user.sectors` para o service filtrar.

---

## 🟡 Médios (9)

### F-M01 — `downloadExportFile` Hardcoded localhost

- **Severidade:** 🟡 MÉDIO
- **Status:** Concluído
- **Arquivos:**
  - `apps/web/src/lib/platform-api.ts` (linha 288)
- **Descrição:**
  `new URL(fileUrl, 'http://localhost:3001')` ignora `NEXT_PUBLIC_API_URL`.
- **Impacto:** Downloads quebram em produção.
- **Correção proposta:**
  Usar `getApiUrl()` do `admin-api.ts` como base.

### F-M02 — `reports-api.ts` Não Usa Auth Centralizado

- **Severidade:** 🟡 MÉDIO
- **Status:** Concluído
- **Arquivos:**
  - `apps/web/src/lib/reports-api.ts`
- **Descrição:**
  `fetchReports` recebe `token` como parâmetro e seta header manualmente. Não usa `executeWithAuth`, então não há refresh automático em 401.
- **Impacto:** Token expirado durante navegação no catálogo causa erro em vez de refresh silencioso.
- **Correção proposta:**
  Refatorar para usar `apiGet` do `admin-api.ts`.

### F-M03 — `auth/refresh` Não Excluído do CSRF

- **Severidade:** 🟡 MÉDIO
- **Status:** ✅ Concluído (2026-06-28)
- **Arquivos:**
  - `apps/api/src/common/common.module.ts` (linhas 10-16)
- **Descrição:**
  O middleware exclui `auth/login`, `auth/forgot-password`, `auth/reset-password`, mas não exclui `auth/refresh`.
- **Impacto:** Mesmo após corrigir F-C01, o refresh de token ainda seria bloqueado por CSRF.
- **Correção proposta:**
  Adicionar `{ path: 'auth/refresh', method: RequestMethod.POST }` na lista de exclusões.

### F-M04 — `BCRYPT_SALT_ROUNDS` Default = 10 (não 12)

- **Severidade:** 🟡 MÉDIO
- **Status:** Concluído
- **Arquivos:**
  - `apps/api/src/auth/auth.service.ts` (linhas 349, 355)
  - `infra/env/.env.example` (linha 17)
- **Descrição:**
  O AGENTS.md especifica "salt rounds >= 12", mas o default no código e no `.env.example` é 10.
- **Correção proposta:**
  Alterar default para 12 no código e no `.env.example`.

### F-M05 — TOTP Encryption Salt Hardcoded

- **Severidade:** 🟡 MÉDIO
- **Status:** Concluído
- **Arquivos:**
  - `apps/api/src/auth/services/totp-encryption.service.ts` (linha 7)
- **Descrição:**
  `const SALT = 'dashboard-power-bi-totp-salt'` — salt fixo para `scryptSync`.
- **Impacto:** Reduz entropia da derivação de chave.
- **Correção proposta:**
  Gerar salt aleatório por instalação ou ler de env var.

### F-M06 — Rate Limiting e Token Blacklist em Memória

- **Severidade:** 🟡 MÉDIO
- **Status:** Concluído
- **Arquivos:**
  - `apps/api/src/auth/services/login-attempts.service.ts`
  - `apps/api/src/auth/services/totp-attempts.service.ts`
  - `apps/api/src/auth/services/token-blacklist.service.ts`
- **Descrição:**
  Estado em `Map` em memória. Restart da API limpa rate limiting e blacklist.
- **Impacto:** Após restart, attacker pode tentar infinitas vezes.
- **Correção proposta:**
  Migrar para Redis (já presente na infra) ou persistir em Supabase.

### F-M07 — Export Worker Não Atualiza Status em Falha

- **Severidade:** 🟡 MÉDIO
- **Status:** Concluído
- **Arquivos:**
  - `apps/api/src/platform/exports/exports.processor.ts` (linhas 87-115)
- **Descrição:**
  O bloco `try` atualiza para `completed`, mas o `catch` apenas loga. Jobs que falham ficam presos em `processing`.
- **Correção proposta:**
  No `catch`, atualizar status para `failed` com `error_message`.

### F-M08 — Export Download Sem Content-Type

- **Severidade:** 🟡 MÉDIO
- **Status:** Concluído
- **Arquivos:**
  - `apps/api/src/platform/exports/exports.controller.ts` (linha 41)
- **Descrição:**
  Seta `Content-Disposition` mas não seta `Content-Type`.
- **Correção proposta:**
  Mapear extensão para MIME type (`pdf` → `application/pdf`, `excel` → `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `csv` → `text/csv`, `json` → `application/json`).

### F-M09 — Swagger Exposto Sem Auth em Produção

- **Severidade:** 🟡 MÉDIO
- **Status:** Concluído
- **Arquivos:**
  - `apps/api/src/main.ts` (linha 39)
- **Descrição:**
  `/docs` (Swagger) disponível sem autenticação em qualquer ambiente.
- **Correção proposta:**
  Desabilitar Swagger em produção (`NODE_ENV === 'production'`) ou proteger com auth básica.

---

## 🟢 Baixos (3)

### F-B01 — `UsersRepository.findById` O(n)

- **Severidade:** 🟢 BAIXO
- **Status:** Concluído
- **Arquivos:**
  - `apps/api/src/auth/repositories/users.repository.ts` (linhas 47-49)
- **Descrição:**
  Itera todos os usuários para encontrar por ID.
- **Correção proposta:**
  Manter um segundo `Map<string, AuthUser>` indexado por ID.

### F-B02 — Sem Limite de Tamanho de Body Explicito

- **Severidade:** 🟢 BAIXO
- **Status:** Concluído
- **Arquivos:**
  - `apps/api/src/main.ts`
- **Descrição:**
  Não configura limite de body size.
- **Correção proposta:**
  Configurar `app.use(express.json({ limit: '10mb' }))` ou similar.

### F-B03 — `reorderWidgets` Faz N Requests Sequenciais

- **Severidade:** 🟢 BAIXO
- **Status:** Concluído
- **Arquivos:**
  - `apps/api/src/platform/dashboards/dashboards.service.ts` (linhas 442-453)
- **Descrição:**
  Faz um `updateWidget` por item em loop sequencial.
- **Correção proposta:**
  Usar `Promise.all` ou query SQL batch update.

---

## Ordem Sugerida de Correção

### Sprint 1 — Desbloqueio (Críticos)

1. **F-C01** + **F-M03** — Corrigir CSRF middleware (ou desabilitar temporariamente)
2. **F-C02** — Corrigir refresh token para todos os usuários
3. **F-C03** — Sanitizar path traversal no download de exports
4. **F-C04** — Corrigir timing attack no JWT

### Sprint 2 — Consistência (Altos)

5. **F-A01** — Corrigir `@Query` → `@Param` no audit controller
6. **F-A02** — Adicionar `TwoFactorGuard` nos controllers admin faltantes
7. **F-A04** — Alinhar contrato de batch update widgets
8. **F-A07** — CORS configurável via env
9. **F-A08** — Dashboard filtra por setor do usuário
10. **F-A05** — DTO para settings
11. **F-A03** — DTOs para dashboards
12. **F-A06** — Corrigir path mock em modo memória

### Sprint 3 — Robustez (Médios)

13. **F-M01** — Base URL dinâmica no download
14. **F-M02** — Reports API com auth centralizado
15. **F-M04** — BCRYPT_SALT_ROUNDS = 12
16. **F-M07** — Export worker atualiza status em falha
17. **F-M08** — Content-Type no download
18. **F-M09** — Swagger em produção
19. **F-M05** — Salt dinâmico para TOTP
20. **F-M06** — Rate limiting persistente

### Sprint 4 — Performance (Baixos)

21. **F-B01** — Index por ID no UsersRepository
22. **F-B02** — Limite de body size
23. **F-B03** — Reorder widgets em paralelo

---

## Métricas

| Métrica                       | Valor                                                       |
| ----------------------------- | ----------------------------------------------------------- |
| Total de falhas               | 24                                                          |
| Críticas                      | 4                                                           |
| Altas                         | 8                                                           |
| Médias                        | 9                                                           |
| Baixas                        | 3                                                           |
| Bloqueiam produção            | 4 (C01, C02, C03, C04)                                      |
| Funcionalidades quebradas     | 3 (CSRF global, refresh não-demo, batch update)             |
| Vulnerabilidades de segurança | 3 (path traversal, timing attack, dashboard sem isolamento) |
