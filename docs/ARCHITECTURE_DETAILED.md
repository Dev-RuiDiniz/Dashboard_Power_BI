# Arquitetura Detalhada - Plataforma BI

## 1. Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                               │
│                    Next.js 14 + React 18 + Recharts                     │
│              Tailwind CSS + shadcn/ui + React Query                     │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ HTTPS + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      API LAYER (NestJS)                                 │
│          REST API + Middleware + Guards + Rate Limiting                 │
│  - Auth Service (JWT + bcrypt + TOTP)                                   │
│  - Permission Service (RBAC + Setor)                                    │
│  - Report Service (SQL Query Execution)                                 │
│  - Export Service (PDF/Excel via BullMQ)                                │
│  - Audit Service (Logging)                                              │
└────────────────────────────┬────────────────────────────────────────────┘
                    ┌────────┴────────┬──────────┐
                    ▼                 ▼          ▼
        ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
        │  Supabase DB     │  │  Redis Cache │  │ SQL Server   │
        │  (Auth + BI Meta)│  │  (Sessions)  │  │  (Raw Data)  │
        └──────────────────┘  └──────────────┘  └──────────────┘
```

## 2. Camadas da Aplicação

### 2.1 Frontend (Next.js 14)
- **Layout**: `app/layout.tsx` com providers globais (Supabase client, React Query)
- **Rotas Autenticadas**: `app/app/*` protegido por `AuthGuard`
- **Rotas Públicas**: `app/login`, `app/forgot-password`, `app/reset-password`
- **Componentes UI**: `components/ui/*` (Button, Card, Input, Table, etc.)
- **Features**: 
  - `components/dashboard/*` - KPIs e gráficos interativos
  - `components/reports/*` - Catálogo e visualizador
  - `components/admin/*` - Gestão de usuários e relatórios

### 2.2 Backend (NestJS)
```
apps/api/src/
├── auth/                      # Autenticação e JWT
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/               # JWT, Role, Sector
│   ├── decorators/           # @CurrentUser(), @Roles(), @Sectors()
│   └── dto/                  # LoginDto, ResetPasswordDto, etc
├── reports/                   # Relatórios e consultas
│   ├── reports.controller.ts
│   ├── reports-api.service.ts
│   ├── sql-query.service.ts  # Queries parametrizadas
│   └── entities/
├── dashboards/               # Dashboards personalizados
├── admin/                    # Gestão (usuários, grupos, relatórios)
├── exports/                  # Fila de exportação (BullMQ)
├── audit/                    # Logs de auditoria
└── sql-server/              # Conexão pooled + validação SQL
```

### 2.3 Banco de Dados (Supabase)
- **Autenticação**: Tabela `users` com JWT native (Supabase Auth)
- **Autorização**: Tabelas `user_sectors`, `report_permissions`, `access_logs`
- **Metadados BI**: `reports`, `dashboards`, `kpis`, `export_jobs`
- **RLS**: Todas as tabelas com políticas restritivas

### 2.4 SQL Server (Externo)
- **Fonte de Dados**: Views e stored procedures com nomes no padrão `schema.nome`
- **Integração**: NestJS executa queries via conexão pooled (mssql/tedious)
- **Segurança**: 100% parametrizado; usuário dedicado read-only

---

## 3. Fluxo de Autenticação

```
1. Usuário acessa /login
2. Submete email + senha via LoginForm
3. API executa authService.login(email, password)
4. Valida credenciais contra users (bcrypt compare)
5. Gera JWT de curta duração (15min) + refresh token (7 dias)
6. Retorna { accessToken, refreshToken, expiresIn }
7. Frontend salva em localStorage
8. Frontend redireciona para /app
9. Cada requisição envia Authorization: Bearer <accessToken>
10. API verifica JWT e carrega user context via @CurrentUser()
```

### 3.1 Rate Limiting & Brute Force
- Login: máx 5 tentativas a cada 15min por IP
- Bloqueia por 15min após exceder limite
- Limpa histórico após login bem-sucedido
- Registra todos os eventos em access_logs

### 3.2 2FA (Opcional → Obrigatório para Admins)
- TOTP via Google Authenticator
- QR code gerado no primeiro acesso
- Backup codes salvos criptografados
- Obrigatório para role "admin"

---

## 4. Autorização & Permissões

### 4.1 Modelo RBAC + Sector-Based
```
User
├── Role: visualizador | downloader | admin
├── Sectors: [financeiro, RH, vendas, ...]
└── Report-Level: Permissões específicas por relatório

Relatório
├── Sector: financeiro (por exemplo)
├── Required Permissions: [reports:financeiro:read]
└── Access Rules: Usuario deve estar em setor + ter permissão
```

### 4.2 Guards em Cascade
```typescript
@UseGuards(JwtAuthGuard, RolesGuard, SectorsGuard)
@Roles('downloader', 'admin')
@Sectors('financeiro')
getReportData(@Param('id') reportId: string) {
  // 1. JwtAuthGuard verifica token válido
  // 2. RolesGuard verifica role (downloader ou admin)
  // 3. SectorsGuard verifica setor (financeiro)
}
```

### 4.3 RLS em Banco de Dados
Cada SELECT/UPDATE/DELETE passa por políticas Supabase:
```sql
CREATE POLICY "Users can view reports in their sectors"
  ON reports FOR SELECT
  TO authenticated
  USING (
    sector_id IN (
      SELECT sector_id FROM user_sectors
      WHERE user_id = auth.uid()
    )
    OR auth.jwt()->>'role' = 'admin'
  );
```

---

## 5. Execução de Relatórios (Report Flow)

```
┌──────────────────────────────────────────────────────────────────────┐
│ FRONTEND: Usuário seleciona relatório e filtros                      │
└─────────────┬──────────────────────────────────────────────────────┘
              │ POST /reports/{id}/query { filters, page, pageSize }
              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ API: ReportsController.queryReport()                                 │
│   1. Carrega definição do relatório                                  │
│   2. Valida autorização (ReportAuthorizationService)                 │
│   3. Valida filtros contra parâmetros declarados                     │
│   4. Chama SqlQueryService.executeView/Procedure                     │
└─────────────┬──────────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ SQL Server (Parametrizado)                                           │
│ SELECT * FROM dbo.vw_financial_reports                               │
│ WHERE sector_id = @sector_id AND date >= @startDate                 │
│                                                                       │
│ Valores sent via mssql.input(paramName, type, value)                │
│ Nenhuma concatenação de strings                                      │
└─────────────┬──────────────────────────────────────────────────────┘
              │ Resultados retornam (raw rows)
              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ API: Paginação em memória + retorna JSON                             │
│ { items: [...], page, pageSize, total, totalPages }                 │
└─────────────┬──────────────────────────────────────────────────────┘
              │ Resposta HTTP
              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ FRONTEND: React Query caches resultado                               │
│   Renderiza tabela ou gráfico (Recharts)                             │
│   Usuário pode exportar, filtrar, ou voltar                          │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.1 Caching Strategy
- **Redis**: Armazena resultados de queries por TTL (padrão 60min)
- **Frontend**: React Query cache automático (5min)
- **Invalidation**: Ao atualizar filtros ou manualmente via `queryClient.invalidateQueries()`

---

## 6. Pipeline de Exportação (PDF/Excel)

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: Usuário clica "Exportar PDF"                          │
│   Escolhe formato + intervalo de dados                          │
└──────────────┬──────────────────────────────────────────────────┘
               │ POST /reports/{id}/export { format, parameters }
               ▼
┌─────────────────────────────────────────────────────────────────┐
│ API: ExportsController.exportReport()                           │
│   1. Valida autorização (role: downloader ou admin)             │
│   2. Cria ExportJob com status='pending'                        │
│   3. Enfileira no BullMQ                                        │
│   4. Retorna jobId + URL de polling                             │
└──────────────┬──────────────────────────────────────────────────┘
               │ Frontend polls GET /exports/{jobId}
               ▼
┌─────────────────────────────────────────────────────────────────┐
│ BullMQ Worker: Processa export_jobs da fila                     │
│   1. Fetch dados do relatório (mesma query de execução)         │
│   2. Renderiza HTML template (Handlebars)                       │
│   3. PDF: Puppeteer / WeasyPrint → arquivo                      │
│   4. Excel: ExcelJS → arquivo .xlsx                             │
│   5. Upload para S3 (ou storage local)                          │
│   6. Atualiza ExportJob: status='completed', file_url=...       │
└──────────────┬──────────────────────────────────────────────────┘
               │ Frontend detects completion
               ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: Oferece download do arquivo                           │
│   Link válido por 7 dias (default), depois auto-expira          │
│   Auditoria: Registra IP + user_agent + timestamp               │
└─────────────────────────────────────────────────────────────────┘
```

### 6.1 Async Jobs com BullMQ
- **Queue**: `export-jobs` processor
- **Worker**: NestJS background job processor
- **Retry**: 3 tentativas com backoff exponencial
- **Timeout**: 5min máximo por export
- **Storage**: S3 ou local `/tmp` (auto-cleanup 7 dias)

---

## 7. Segurança em Camadas

### 7.1 Frontend
- **XSS Prevention**: DOMPurify sanitização de inputs
- **CSRF**: Double-submit cookie pattern (SameSite=Strict)
- **CSP**: Content-Security-Policy header (NestJS middleware)
- **HTTPS Only**: Força TLS 1.3 em produção

### 7.2 Network
- **TLS 1.3 Obrigatório**
- **HSTS Header**: Força HTTPS por 1 ano
- **CORS**: Whitelist de domínios (não `*`)

### 7.3 API (NestJS)
- **JWT Validation**: Assinatura + expiração
- **Rate Limiting**: Login (5/15min), API global (100/min per IP)
- **Input Validation**: Class-validator + Zod schema
- **Output Sanitization**: Nunca retorna hash de senha, error details, SQL schema

### 7.4 SQL Server
- **100% Parametrizado**: Sem concatenação
- **Usuário Read-Only**: Credenciais dedicadas, sem permissão DDL
- **Connection Pooling**: Máx 10 conexões, timeout 5s
- **Query Monitoring**: Timeout 5s, logging de queries lentas

### 7.5 Banco de Dados (Supabase)
- **RLS**: Todas as tabelas com políticas restrictivas
- **auth.uid() Checks**: Obrigatório em toda política
- **No Public Data**: Nenhuma tabela acessível sem autenticação
- **Audit Trail**: access_logs completo de quem acessa o quê

---

## 8. Decisões de Design

### 8.1 Por que Monorepo?
- Compartilhamento de tipos TypeScript (API ↔ Web)
- Single git history para related changes
- Simplifica CI/CD (build once, deploy separately)

### 8.2 Por que Supabase?
- Auth nativa + RLS built-in (não reinventar roda)
- PostgreSQL confiável + migrations versionadas
- Real-time capabilities (futura notificação de updates)
- Suporta JWT JWT próprio (não depende de Supabase SDK)

### 8.3 Por que NestJS para API?
- Modular architecture (fácil de escalar)
- TypeScript + DI framework (injeção de dependência)
- Guards + Interceptors + Pipes (middleware robusto)
- Swagger auto-generated (documentação live)

### 8.4 Por que Next.js 14 (App Router)?
- SSR + SSG nativo (melhor SEO)
- File-based routing (automático)
- Server components (segurança: API keys server-side)
- Middleware support (auth check antes de renderizar)

---

## 9. Padrões de Código

### 9.1 Services (NestJS)
```typescript
@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly sqlQuery: SqlQueryService,
    private readonly auth: AuthorizationService
  ) {}

  async getReportData(reportId: string, filters: ReportFilters, user: AuthUser) {
    const report = await this.reportRepo.findById(reportId);
    this.auth.assertCanAccess(report, user); // Fail-secure
    
    const query = this.buildQuery(report, filters);
    const rows = await this.sqlQuery.execute(query); // Safe execution
    
    return this.paginate(rows, filters.page, filters.pageSize);
  }
}
```

### 9.2 Validators (SQL Injection Prevention)
```typescript
export function validateSqlObjectName(name: string): string {
  // Rejeita: "dbo.table; DROP TABLE", "dbo].[users", etc
  const SAFE_PATTERN = /^[A-Za-z][A-Za-z0-9_]*\.[A-Za-z][A-Za-z0-9_]*$/;
  
  if (!SAFE_PATTERN.test(name.trim())) {
    throw new Error(`Invalid SQL object name: ${name}`);
  }
  
  return name;
}
```

### 9.3 RLS Policies (Supabase)
```sql
-- Restrictive by default
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    sector_id IN (
      SELECT sector_id FROM user_sectors
      WHERE user_id = auth.uid()
    )
  );

-- Admin override
CREATE POLICY "Admin can view all"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');
```

---

## 10. Performance & Scalability

### 10.1 Database Indexing
- `idx_user_sectors_user` - Query rápida de setores de um user
- `idx_access_logs_created` - Paginação de logs por data
- `idx_reports_sector` - Listagem por setor
- Cardinality matters: evita índices em colunas booleanas com baixa cardinalidade

### 10.2 Redis Caching
- Sessions: Armazenar refresh tokens + user context (TTL 7 dias)
- Report results: Cache de queries SQL (TTL configurável por relatório)
- Invalidation: Manual ou time-based
- Monitor: Redis CLI `INFO memory` para detectar vazamento

### 10.3 BullMQ for Heavy Operations
- Exports (PDF/Excel) enfileirados (não bloqueiam API)
- Scheduled jobs (refresh de KPIs)
- Email notifications
- Retry automático + dead-letter queue

---

## 11. Sprint 1 Deliverables (Dias 1-10)

- [ ] Monorepo setup + CI/CD pipelines
- [ ] Supabase schema (users, sectors, permissions, access_logs)
- [ ] Auth completo (login, JWT, bcrypt, recuperação de senha)
- [ ] CRUD de usuários e grupos (Admin)
- [ ] Permission system (sector + report-level)
- [ ] SQL Server integração (pool + parametrized queries)
- [ ] Report listing com filtros básicos
- [ ] Design system tokens + componentes base
- [ ] Docker Compose dev environment
- [ ] Testes unitários (Auth + Permission + SQL)

---

## 12. Glossário

| Termo | Significado |
|-------|------------|
| RLS | Row Level Security (Supabase) - Filtra dados por política por linha |
| JWT | JSON Web Token - Token stateless para autenticação |
| RBAC | Role-Based Access Control - Permissões por role (visualizador, etc) |
| Sector | Departamento/área (financeiro, RH, vendas) |
| KPI | Key Performance Indicator - Métrica de negócio |
| Parametrized Query | Query com placeholders (`@param`) em vez de string concat |
| BullMQ | Job queue library para Redis |
| TLS | Transport Layer Security (HTTPS) |
| CSP | Content Security Policy - Header de proteção contra XSS |
| Middleware | Função que processa requisição antes de chegar ao controller |

