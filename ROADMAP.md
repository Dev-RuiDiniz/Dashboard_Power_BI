# ROADMAP

Fonte única da direção do projeto Dashboard Power BI.

## Concluído

### Junho 2025 — Onda 1: Fundação de Persistência e Administração

- [x] **docs: documentar configuração do Supabase para persistência**
  - Data: 2026-06-05
  - Arquivo: `docs/supabase-persistence.md`
  - Nota: Documentação guia para ativar persistência real via Supabase (URL + service role key + migrations).

- [x] **feat: criar tela de gestão de relatórios na Web (/app/admin/reports)**
  - Data: 2026-06-05
  - Rota: `/app/admin/reports`
  - Nota: Tela já existia em `admin-reports.tsx`; rota de página Next.js confirmada funcional.

- [x] **feat: implementar tela de perfil do usuário (/app/profile)**
  - Data: 2026-06-05
  - Rotas: `/app/profile`
  - API: `GET /auth/me`, `POST /auth/me/password`
  - Nota: Componente `UserProfile` com dados do usuário, roles, setores e alteração de senha.

- [x] **feat: criar módulo de gestão de permissões com tela UI**
  - Data: 2026-06-05
  - API: `GET/POST/PATCH/DELETE /admin/permissions`
  - Rota Web: `/app/admin/permissions`
  - Migration: `supabase/migrations/20260605200000_005_permissions_table.sql`
  - Nota: CRUD completo de permissões granulares (code, name, resource, action) com repositório híbrido memória/Supabase.

- [x] **feat: criar módulo de logs de auditoria (AuditModule)**
  - Data: 2026-06-05
  - API: `GET /admin/audit`
  - Rota Web: `/app/admin/audit`
  - Migration: `supabase/migrations/20260605210000_006_audit_logs_table.sql`
  - Nota: Repositório híbrido para registrar e consultar logs de auditoria administrativos.

- [x] **feat: adicionar React Query ao frontend**
  - Data: 2026-06-05
  - Dependência: `@tanstack/react-query`
  - Nota: `QueryClientProvider` integrado no layout `/app`, cliente configurado com staleTime de 5 min.

- [x] **security: implementar CSRF middleware e headers de segurança**
  - Data: 2026-06-05
  - Headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS (prod)
  - CSRF: middleware customizado com token em cookie + header `x-csrf-token`
  - Nota: Excluídas rotas públicas de login, health e docs da validação CSRF.

- [x] **chore: instalar recharts para gráficos no dashboard**
  - Data: 2026-06-05
  - Dependência: `recharts`
  - Nota: Biblioteca instalada no `apps/web`; pronta para uso em dashboards e relatórios.

## Em andamento / Pendente

### Média prioridade

- [ ] **feat: adicionar 2FA/TOTP à autenticação**
  - Dependência: `otplib` já instalado no backend
  - Falta: endpoints de ativação/verificação de TOTP e UI de configuração

### Baixa prioridade

- [ ] **feat: implementar export pipeline backend (BullMQ + storage)**
- [ ] **feat: implementar notificações com backend próprio e realtime**
- [ ] **feat: implementar dashboards personalizados**
- [ ] **feat: implementar editor visual de dashboards**

## Notas

- Data de última atualização: 2026-06-09
- Próxima onda planejada: finalizar 2FA/TOTP e iniciar dashboards personalizados
