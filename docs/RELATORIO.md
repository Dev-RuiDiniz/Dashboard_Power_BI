# RELATORIO.md — Registro Diário de Desenvolvimento

**Projeto:** Dashboard Power BI
**Atualizado em:** 2026-06-28

---

## Como usar este relatório

Este arquivo deve ser atualizado diariamente ou ao final de cada sessão relevante de trabalho.

Cada entrada deve conter:

- Data.
- Resumo do dia.
- Tarefas executadas.
- Arquivos criados/modificados.
- Testes executados.
- Documentação atualizada.
- Bugs encontrados.
- Decisões tomadas.
- Bloqueios.
- Próximos passos.

---

## 2026-06-28 — Registro do Dia (Sessão 2)

### 1. Resumo

Auditoria completa do projeto confrontando documentação com runtime real. Encontradas duas divergências críticas onde a documentação marcava como "pendente" funcionalidades já implementadas no código: BullMQ + Redis (exports) e 2FA/TOTP (auth). Corrigidos 11 arquivos de documentação para refletir o estado real.

### 2. Tarefas Executadas

- [x] Auditoria completa do projeto (leitura de toda documentação canônica + verificação de runtime)
- [x] Correção de divergência: BullMQ + Redis marcado como pendente mas já implementado
  - `exports.service.ts` e `exports.processor.ts` usam `bullmq` (Queue + Worker) com `ioredis` e fallback em memória
  - Atualizado status de "Pendente" para "Concluído" em todos os documentos relevantes
- [x] Correção de divergência: 2FA/TOTP marcado como pendente mas já implementado
  - `totp.service.ts` tem geração de secret, verificação de token (HMAC-SHA1, Base32) e endpoints no controller
  - UI de login e perfil já suportam 2FA (setup, verify, disable, login TOTP)
  - Atualizado status de "Pendente" para "Concluído" em todos os documentos relevantes

### 3. Arquivos Criados ou Modificados

| Arquivo                               | Ação       | Descrição                                                                                                                              |
| ------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/roadmap/03-tarefas-tecnicas.md` | Modificado | T08 BullMQ e T09 2FA/TOTP marcados como Concluído; tabela de resumo atualizada                                                         |
| `docs/roadmap/02-modulos.md`          | Modificado | Débitos de AUTH e REPORTS corrigidos                                                                                                   |
| `docs/roadmap/01-telas.md`            | Modificado | Débitos de T09 (BullMQ) corrigidos                                                                                                     |
| `docs/ROADMAP.md`                     | Modificado | T09b marcado como CONCLUÍDO no backlog; T09 Exportação de Parcial para Sim na matriz SDD/TDD; progresso de tarefas técnicas atualizado |
| `docs/ARQUITETURA.md`                 | Modificado | Seções 5 (módulos), 7 (pendentes), 12 (débitos e riscos) corrigidas                                                                    |
| `docs/CONTEXTO.md`                    | Modificado | Pendências, riscos e decisões técnicas atualizados                                                                                     |
| `docs/ESCOPO.md`                      | Modificado | BullMQ marcado como implementado no módulo Reports                                                                                     |
| `docs/ANALISE_ESCOPO_V1.md`           | Modificado | 2FA de "ausente" para "implementado"; BullMQ adicionado ao módulo REPORTS                                                              |
| `README.md`                           | Modificado | Linha sobre 2FA/TOTP corrigida de "não implementado" para "implementado e opcional"                                                    |
| `docs/specs/README.md`                | Modificado | Status da SPEC-T09b de Pendente para Concluído                                                                                         |
| `docs/RELATORIO.md`                   | Modificado | Esta entrada adicionada                                                                                                                |

### 4. Testes

| Comando            | Resultado     | Observações                |
| ------------------ | ------------- | -------------------------- |
| `pnpm verify:docs` | Não executado | Será executado após commit |
| `pnpm typecheck`   | Não executado | Não há mudança de código   |
| `pnpm test`        | Não executado | Não há mudança de código   |
| `pnpm build`       | Não executado | Não há mudança de código   |

### 5. Documentação Atualizada

- `docs/roadmap/03-tarefas-tecnicas.md` — T08 e T09 marcados como Concluído
- `docs/roadmap/02-modulos.md` — Débitos de AUTH e REPORTS corrigidos
- `docs/roadmap/01-telas.md` — Débitos de T09 corrigidos
- `docs/ROADMAP.md` — Backlog e matriz SDD/TDD atualizados
- `docs/ARQUITETURA.md` — Módulos, pendentes e débitos corrigidos
- `docs/CONTEXTO.md` — Pendências, riscos e decisões atualizados
- `docs/ESCOPO.md` — Módulo Reports atualizado
- `docs/ANALISE_ESCOPO_V1.md` — Matriz de módulos e pontos por módulo corrigidos
- `README.md` — Seção de segurança corrigida
- `docs/specs/README.md` — Status da SPEC-T09b atualizado

### 6. Bugs Encontrados e Correções

| Bug                                                  | Causa                                                | Correção                                        | Status    |
| ---------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- | --------- |
| BullMQ + Redis marcado como pendente na documentação | Implementação não foi refletida na docs após entrega | Status atualizado para Concluído em 11 arquivos | Resolvido |
| 2FA/TOTP marcado como pendente na documentação       | Implementação não foi refletida na docs após entrega | Status atualizado para Concluído em 11 arquivos | Resolvido |

### 7. Decisões Tomadas

| Decisão                                  | Motivo                                           | Impacto                  |
| ---------------------------------------- | ------------------------------------------------ | ------------------------ |
| Corrigir divergências docs vs runtime    | Documentação deve refletir estado real do código | 11 arquivos atualizados  |
| Manter 2FA como opcional na documentação | 2FA obrigatório para admins é DT-001 separado    | Pendência DT-001 mantida |

### 8. Bloqueios

| Bloqueio | Impacto | Próxima ação |
| -------- | ------- | ------------ |
| Nenhum   | —       | —            |

### 9. Próximos Passos

1. Commit e push das correções
2. Iniciar Fase 3: Editor visual drag-and-drop completo (T16b)
3. Implementar 2FA obrigatório para admins (DT-001)
4. Implementar hardening final de sessão (DT-002)

---

## 2026-06-28 — Registro do Dia (Sessão 1)

### 1. Resumo

Criação e atualização dos 7 arquivos de governança do repositório (AGENTS.md, ARQUITETURA.md, BANCO_DADOS.md, ESCOPO.md, ROADMAP.md, CONTEXTO.md, RELATORIO.md) com base no estado real do runtime, consolidando fontes canônicas e removendo referências a arquivos inexistentes.

### 2. Tarefas Executadas

- [x] AGENTS.md — Mesclar estruturas
  - Detalhes: Preservar todas as regras atuais (SQL Server, segurança, frontend, commits) e adicionar seções novas do prompt (SDD, TDD, checklist de documentação, segurança expandida, conduta para agentes).
  - Resultado: AGENTS.md atualizado com seções novas e referências canônicas corrigidas.
- [x] ARQUITETURA.md — Criar na raiz
  - Detalhes: Documentar arquitetura completa com base no runtime real (app.module.ts, docs, código).
  - Resultado: Arquivo criado com 13 seções (visão geral, stack, estrutura de pastas, arquitetura geral com Mermaid, módulos, funcionalidades, fluxos, integrações, segurança, build, pontos de atenção, decisões).
- [x] BANCO_DADOS.md — Criar na raiz
  - Detalhes: Documentar arquitetura completa do banco com base nas 8 migrations Supabase + SQL Server externo.
  - Resultado: Arquivo criado com 12 seções e documentação de todas as 20+ tabelas com campos, índices, constraints, RLS e relacionamentos.
- [x] ESCOPO.md — Criar na raiz
  - Detalhes: Consolidar escopo do PDF original com análise de aderência e estado real do runtime.
  - Resultado: Arquivo criado com 12 seções (objetivo, problema, público-alvo, escopo funcional por módulo, não funcional, fora do escopo, regras de negócio, critérios de aceite, entregáveis, premissas, restrições, riscos).
- [x] ROADMAP.md — Atualizar
  - Detalhes: Preservar conteúdo existente (fases, telas, módulos, progresso) e adicionar estrutura do prompt (convenções de status, backlog geral, matriz SDD/TDD, definição de pronto).
  - Resultado: ROADMAP.md atualizado com novas seções e data atualizada.
- [x] CONTEXTO.md — Criar na raiz
  - Detalhes: Criar contexto vivo do projeto com histórico de desenvolvimento, decisões técnicas e arquiteturais, pendências, bloqueios, riscos e próximos passos.
  - Resultado: Arquivo criado com 10 seções e histórico desde 2026-06-04.
- [x] RELATORIO.md — Criar na raiz
  - Detalhes: Criar registro diário de desenvolvimento com instruções de uso e primeira entrada.
  - Resultado: Este arquivo.

### 3. Arquivos Criados ou Modificados

| Arquivo          | Ação       | Descrição                                                                                |
| ---------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `AGENTS.md`      | Modificado | Mesclagem de estruturas: SDD, TDD, checklist, conduta, referências canônicas atualizadas |
| `ARQUITETURA.md` | Criado     | Arquitetura completa do sistema (13 seções)                                              |
| `BANCO_DADOS.md` | Criado     | Arquitetura completa do banco de dados (12 seções, 20+ tabelas)                          |
| `ESCOPO.md`      | Criado     | Escopo consolidado do projeto (12 seções)                                                |
| `ROADMAP.md`     | Modificado | Adição de convenções de status, backlog, matriz SDD/TDD, definição de pronto             |
| `CONTEXTO.md`    | Criado     | Contexto vivo do projeto (10 seções, histórico desde 2026-06-04)                         |
| `RELATORIO.md`   | Criado     | Registro diário de desenvolvimento (este arquivo)                                        |

### 4. Testes

| Comando            | Resultado     | Observações                                                    |
| ------------------ | ------------- | -------------------------------------------------------------- |
| `pnpm verify:docs` | Não executado | Será executado após conversão de stubs e atualização do README |
| `pnpm typecheck`   | Não executado | Não há mudança de código nesta sessão                          |
| `pnpm test`        | Não executado | Não há mudança de código nesta sessão                          |
| `pnpm build`       | Não executado | Não há mudança de código nesta sessão                          |

### 5. Documentação Atualizada

- `AGENTS.md` — Mesclagem de estruturas, SDD, TDD, checklist, conduta, referências canônicas
- `ARQUITETURA.md` — Criado do zero com base no runtime real
- `BANCO_DADOS.md` — Criado do zero com base nas 8 migrations
- `ESCOPO.md` — Criado do zero consolidando PDF + análise de aderência
- `ROADMAP.md` — Atualizado com estrutura do prompt
- `CONTEXTO.md` — Criado do zero como contexto vivo
- `RELATORIO.md` — Criado do zero como registro diário

### 6. Bugs Encontrados e Correções

| Bug                                          | Causa                           | Correção                                                | Status    |
| -------------------------------------------- | ------------------------------- | ------------------------------------------------------- | --------- |
| Referências a `SPRINT_STATUS.md` inexistente | Arquivo nunca foi criado        | Removidas de AGENTS.md e README.md                      | Resolvido |
| Referência a `RELATORIO_DIA.md`              | Nome antigo no AGENTS.md        | Substituído por `RELATORIO.md`                          | Resolvido |
| Referências a `HANDOFF.md` como canônico     | Arquivo será convertido em stub | Atualizado em AGENTS.md para apontar para `CONTEXTO.md` | Resolvido |

### 7. Decisões Tomadas

| Decisão                                | Motivo                                        | Impacto                                                |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| Consolidar governança na raiz          | Fontes canônicas únicas                       | 7 arquivos na raiz como referência principal           |
| Converter docs antigos em stubs        | Evitar divergência entre fontes               | docs/architecture.md e HANDOFF.md virarão apontamentos |
| Remover referências a SPRINT_STATUS.md | Arquivo inexistente                           | README.md e AGENTS.md atualizados                      |
| Mesclar estruturas do AGENTS.md        | Preservar regras validadas + adicionar prompt | SDD, TDD e checklist adicionados sem perda de contexto |

### 8. Bloqueios

| Bloqueio | Impacto | Próxima ação |
| -------- | ------- | ------------ |
| Nenhum   | —       | —            |

### 9. Próximos Passos

1. Validar com `pnpm verify:docs`.
2. Commit da onda de governança: `docs(governanca): adiciona documentacao estrutural do repositorio`.
3. Iniciar Fase 3: Editor visual drag-and-drop completo (T16b).
4. Implementar 2FA obrigatório para admins (DT-001).
5. Implementar hardening final de sessão (DT-002).

---

## Template para próximos dias

```markdown
## YYYY-MM-DD — Registro do Dia

### 1. Resumo

[Resumo do trabalho realizado.]

### 2. Tarefas Executadas

- [ ] [Tarefa]
  - Detalhes:
  - Resultado:

### 3. Arquivos Criados ou Modificados

| Arquivo | Ação | Descrição |
| ------- | ---- | --------- |

### 4. Testes

| Comando | Resultado | Observações |
| ------- | --------- | ----------- |

### 5. Documentação Atualizada

- `[arquivo]` — [descrição]

### 6. Bugs Encontrados e Correções

| Bug | Causa | Correção | Status |
| --- | ----- | -------- | ------ |

### 7. Decisões Tomadas

| Decisão | Motivo | Impacto |
| ------- | ------ | ------- |

### 8. Bloqueios

| Bloqueio | Impacto | Próxima ação |
| -------- | ------- | ------------ |

### 9. Próximos Passos

1. [Próxima ação]
```

---

## 2026-06-28 — Registro do Dia (Sessão 3) — DT-002 Hardening de Sessão

### 1. Resumo

Implementação completa do DT-002: blacklist de tokens revogados e estratégia de invalidação em massa de sessões. Inclui token versioning (`tv`), JTI-based blacklist, `revokeAllSessions`, integração em fluxos críticos (changePassword, resetPassword, admin deactivate/resetPassword), repositório híbrido Supabase para refresh tokens, e atualização do frontend para envio de access token no logout.

### 2. Tarefas Executadas

- [x] Migration + tipos: `tokenVersion` em `AuthUser`, `jti`/`tv` em `AuthTokenPayload`, `jti` em `AuthTokens`, `RevokeSessionsRequest`
- [x] `TokenBlacklistService` com `add`, `isBlacklisted`, `cleanup` automático por threshold
- [x] `JwtAuthGuard` atualizado: verifica blacklist de `jti` e `tv` do usuário
- [x] `AuthService`: `logout` blacklista access token, `revokeAllSessions` incrementa `tokenVersion` e revoga refresh tokens, `changePassword` invalida sessões
- [x] Integração em `PasswordResetService.resetPassword`, `AdminUsersService.deactivate` e `resetPassword`
- [x] `RefreshTokenRepository` híbrido: Supabase quando configurado, fallback em memória
- [x] Frontend: `logout` envia `accessToken` no header `Authorization`, adicionada `revokeAllSessions` na API client
- [x] Endpoint `POST /auth/sessions/revoke-all` com controle de permissão (admin para outros usuários)

### 3. Arquivos Criados

- `supabase/migrations/20260628200000_007_add_token_version_to_users.sql`
- `apps/api/src/auth/services/token-blacklist.service.ts`
- `apps/api/src/auth/services/token-blacklist.service.spec.ts`
- `apps/api/src/auth/guards/jwt-auth.guard.spec.ts`
- `apps/api/src/auth/dto/revoke-sessions.dto.ts`

### 4. Arquivos Modificados

- `apps/api/src/auth/types/auth.types.ts` — `tokenVersion`, `jti`, `tv`, `RevokeSessionsRequest`
- `apps/api/src/auth/services/token.service.ts` — geração de `jti` via `randomUUID`
- `apps/api/src/auth/repositories/users.repository.ts` — `incrementTokenVersion`, `tokenVersion: 0` em seed
- `apps/api/src/auth/services/token-blacklist.service.ts` — implementação completa
- `apps/api/src/auth/guards/jwt-auth.guard.ts` — blacklist + tv check + async
- `apps/api/src/auth/auth.service.ts` — `TokenBlacklistService` injetado, `logout` com blacklist, `revokeAllSessions`, `changePassword` invalida sessões
- `apps/api/src/auth/auth.controller.ts` — extrai `jti`/`exp` do access token no logout, endpoint `revoke-all`
- `apps/api/src/auth/auth.module.ts` — `TokenBlacklistService` provider/export, `SupabaseModule` import, `RefreshTokenRepository` export
- `apps/api/src/auth/repositories/refresh-token.repository.ts` — repositório híbrido Supabase
- `apps/api/src/auth/services/password-reset.service.ts` — `incrementTokenVersion` no reset
- `apps/api/src/admin/users/admin-users.service.ts` — `RefreshTokenRepository` injetado, `deactivate` e `resetPassword` invalidam sessões
- `apps/api/src/platform/exports/export-job-runner.service.ts` — `jti`/`tv` no `toRequestUser`
- `apps/web/src/lib/auth/api.ts` — `jti` em `LoginResponse`, `logout` com `accessToken`, `revokeAllSessions`
- `apps/web/src/components/app/logout-button.tsx` — passa `accessToken` no logout
- Testes: `auth.service.spec.ts`, `auth.controller.spec.ts`, `token.service.spec.ts`, `password-reset.service.spec.ts`, `admin-users.service.spec.ts`, `api.test.ts`, `authenticated-layout.test.tsx`

### 5. Testes Executados

- `npx jest --testPathPattern="auth|admin-users"` — 13 suites, 70 testes, todos passando
- `pnpm --filter @dashboard-power-bi/web typecheck` — passou
- `pnpm --filter @dashboard-power-bi/api typecheck` — apenas erros pré-existentes (oracledb)

### 6. Decisões Tomadas

| Decisão                          | Motivo                                                               | Impacto                                                               |
| -------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Blacklist em memória (Map)       | Simplicidade; access tokens têm TTL curto (15min)                    | Reinício do servidor limpa blacklist, mas tokens expiram naturalmente |
| Token versioning no usuário      | Invalidação em massa sem precisar rastrear cada token emitido        | Incrementar `tv` invalida todos os access tokens anteriores           |
| `RefreshTokenRepository` híbrido | Seguir padrão existente (PermissionsRepository, AuditLogsRepository) | Supabase quando configurado, memória como fallback                    |
| `@Optional()` no SupabaseService | Não quebrar testes e dev sem Supabase                                | Funciona em ambos os modos                                            |

### 7. Próximos Passos

1. Considerar persistência da blacklist em Redis para ambientes multi-instância
2. Adicionar UI para revogar sessões de outros usuários no painel admin
3. Revalidar aderência completa das 18 telas e 6 módulos

---

## 2026-06-28 — Registro do Dia (Sessão 4) — DT-002 Timeout + UI Admin

### 1. Resumo

Implementação do timeout por inatividade (30min configurável) e UI admin para revogar sessões de outros usuários, completando todos os critérios de aceite do DT-002.

### 2. Tarefas Executadas

- [x] Backend: `assertSessionNotInactive` no `AuthService.refresh` — rejeita refresh tokens quando `lastUsedAt` excede `SESSION_INACTIVITY_TIMEOUT_SECONDS`
- [x] Backend: `lastUsedAt` adicionado ao `RefreshSession` e `RefreshTokenRepository` (método `updateLastUsedAt`)
- [x] Backend: Migration `008_add_last_used_at_to_refresh_tokens.sql`
- [x] Backend: Env var `SESSION_INACTIVITY_TIMEOUT_SECONDS=1800` em `.env.example`
- [x] Frontend: Hook `useInactivityTimeout` — rastreia mousedown/keydown/scroll/touchstart, faz logout automático após 30min
- [x] Frontend: Integrado no `AuthenticatedLayout` com redirect para `/login`
- [x] Frontend: Botão "Revogar sessões" na tabela de admin usuários (chama `POST /auth/sessions/revoke-all`)

### 3. Arquivos Criados

- `supabase/migrations/20260628210000_008_add_last_used_at_to_refresh_tokens.sql`
- `apps/web/src/lib/auth/use-inactivity-timeout.ts`
- `apps/web/src/lib/auth/use-inactivity-timeout.test.ts`

### 4. Arquivos Modificados

- `apps/api/src/auth/types/auth.types.ts` — `lastUsedAt` em `RefreshSession`
- `apps/api/src/auth/repositories/refresh-token.repository.ts` — `updateLastUsedAt`, `last_used_at` no row mapping
- `apps/api/src/auth/auth.service.ts` — `assertSessionNotInactive`, `lastUsedAt` em `issueTokens`
- `apps/api/src/auth/auth.service.spec.ts` — testes de inatividade (timeout e disabled)
- `infra/env/.env.example` — `SESSION_INACTIVITY_TIMEOUT_SECONDS`
- `apps/web/src/components/app/authenticated-layout.tsx` — integra `useInactivityTimeout`
- `apps/web/src/components/app/authenticated-layout.test.tsx` — mock do hook
- `apps/web/src/components/admin/admin-users.tsx` — botão "Revogar sessões"
- `docs/specs/auth/SPEC-DT-002-hardening-sessao.md` — status Concluído, critérios atualizados
- `docs/RELATORIO.md` — esta seção

### 5. Testes Executados

- Backend: 49 testes passando (auth.service.spec.ts incluindo 2 novos de inatividade)
- Frontend: 3 testes passando (use-inactivity-timeout.test.ts)
- Web typecheck: passou

### 6. Próximos Passos

1. Considerar persistência da blacklist em Redis para ambientes multi-instância
2. Revalidar aderência completa das 18 telas e 6 módulos
