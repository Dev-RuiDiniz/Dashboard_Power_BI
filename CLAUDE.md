# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dashboard Power BI is a monorepo-based BI platform with a Next.js 14 frontend and NestJS backend, integrating with SQL Server for data and Supabase for identity/RLS. The project is organized for 30-day delivery across 4 sprints, with Sprint 1-2 complete (authentication, reports API, design system) and Sprints 3-4 pending (exports, dashboards, final hardening).

## Technology Stack

- **Monorepo**: pnpm workspaces (Node.js 20+)
- **Backend API**: NestJS 10.4 with TypeScript, Swagger documentation at `/docs`
- **Frontend**: Next.js 14 with App Router, Tailwind CSS, shadcn/ui design patterns
- **Database**: SQL Server (external) with parametrized queries via `mssql` driver
- **Auth**: Custom JWT + refresh tokens with bcrypt, rate limiting (5 attempts/15min lockout)
- **Local Dev**: Docker Compose with Redis, API, Web services
- **Quality**: ESLint flat config, Prettier, TypeScript strict mode, husky hooks

## Critical Architecture Patterns

### Monorepo Structure

```
apps/api/         # NestJS backend, runs on :3001, Swagger on /docs
apps/web/         # Next.js frontend, runs on :3000
packages/shared/  # Reserved for shared types (currently minimal)
packages/ui/      # Reserved for component library
infra/docker/     # Docker Compose dev environment + env examples
docs/             # Technical docs and ADRs
```

### Key Patterns to Follow

1. **HTTP Exception Handling**: Use `HttpException` and `HttpStatus` from `@nestjs/common`, NOT `TooManyRequestsException` (doesn't exist in NestJS 10.4). For rate limiting, throw `new HttpException(message, HttpStatus.TOO_MANY_REQUESTS)`.

2. **SQL Injection Prevention**: All SQL queries go through `SqlQueryService` which enforces:
   - Qualified identifiers only (`schema.name` format)
   - No raw SQL from user input
   - All values sent via parametrized `.input()` calls
   - Rejected identifiers logged, never returned to client

3. **Type Safety in DTOs**: When DTOs are used as inputs to service constructors, ensure array properties have default empty arrays (`= []`), not optional (`?`). The service layer expects non-optional types.

4. **ReportFilters Type**: This type requires a `parameters` property (can be `undefined` but must be present). When initializing empty filters, use `{ parameters: undefined }` not `{}`. This affects:
   - `useState<ReportFilters>()` initial values
   - Function parameter defaults
   - Return statements from helper functions

5. **Optional Chaining & Nullish Coalescing**: Use `?.` and `??` for IP extraction and similar defensive patterns. Example: `forwardedFor.split(',')[0]?.trim() ?? 'unknown'`.

6. **Type Casting for External Libraries**: When `mssql` driver properties are typed as `unknown` but incompatible with function parameters, cast to `as any` to satisfy TypeScript. This is acceptable for third-party library constraints.

7. **RLS and Authorization**: Every table has `auth.uid()` checks in policies. Login view is public; authenticated pages use `AuthGuard` client-side + backend JWT validation.

## Common Commands

```bash
# Install dependencies
pnpm install

# Quality checks
pnpm quality          # Run all checks: lint, format, typecheck, verify workspace/docker/docs
pnpm lint             # ESLint analysis
pnpm lint:fix         # ESLint with auto-fix
pnpm format:check     # Prettier check
pnpm format           # Prettier write
pnpm typecheck        # TypeScript strict validation
pnpm test             # Jest tests all workspaces
pnpm build            # Build all (NestJS to dist/, Next.js to .next/)

# Development (without Docker)
pnpm dev:api          # NestJS dev server on :3001 (watch mode)
pnpm dev:web          # Next.js dev server on :3000 (watch mode)

# Development (with Docker)
pnpm docker:dev       # Start all services (api, web, redis)
pnpm docker:dev:logs  # Tail logs
pnpm docker:dev:down  # Stop containers

# Workspace-specific
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/web build
```

## Important Files & Patterns

### Backend (NestJS)

- **`apps/api/src/main.ts`**: Bootstrap, configures `ValidationPipe` (whitelist, forbidNonWhitelisted, transform), Swagger at `/docs`
- **`apps/api/src/auth/`**: Login/logout, JWT generation, refresh tokens, password reset with email adapter (mock mode)
- **`apps/api/src/sql-server/`**: Parametrized query execution, identifier validation, prevents SQL injection
- **`apps/api/src/reports/`**: Report catalog CRUD, Reports API with authorization by sector/permission
- **Controllers**: Use `@Req()` to extract client IP from `x-forwarded-for` header for rate limiting

### Frontend (Next.js)

- **`apps/web/src/app/`**: Public pages (home, login, forgot-password, reset-password)
- **`apps/web/src/app/app/`**: Protected routes (home, reports, admin) wrapped in `AuthenticatedLayout`
- **`apps/web/src/components/reports/`**: `ReportCatalog` displays items, `ReportAdvancedFilters` validates with Zod, `ReportCatalogContainer` loads from API
- **`apps/web/src/lib/report-filters.ts`**: Zod schema validation, `toReportFiltersPayload()` normalizes form state to API payload
- **Session**: Stored in `localStorage` as JSON (access/refresh tokens). `AuthGuard` validates on protected routes.

### Type Definitions

- **`ReportFilters`**: `{ parameters?: Record<string, string|number|boolean>, startDate?: string, ... }`. Must always include `parameters` property (even if undefined).
- **`ReportDefinition`**: Catalog entry with `sourceName` (`schema.view`), `sourceType` (`view`|`stored_procedure`), parameters array, required permissions.
- **`AuthUser`**: Internal user model with roles, sectors, passwordHash (never exposed in responses).

## Debugging & Troubleshooting

### Build Failures

1. **`Cannot find module '@nestjs/...'`**: Run `pnpm install` again; pnpm links may be stale.
2. **`Type error: Object possibly 'undefined'`**: Use optional chaining (`?.`) or non-null assertion (`!.`).
3. **`Property 'X' is missing in type '{}'`**: Object types with required properties must be explicitly initialized. For `ReportFilters`, use `{ parameters: undefined }`.
4. **`Argument type 'unknown' not assignable to ISqlType`**: Cast to `as any` (e.g., `parameter.driverType as any`).

### Runtime Issues

1. **Rate limiting not triggering**: Check `AUTH_LOGIN_MAX_ATTEMPTS`, `AUTH_LOGIN_WINDOW_SECONDS`, `AUTH_LOGIN_LOCKOUT_SECONDS` in `.env`.
2. **SQL Server connection fails**: Verify `SQLSERVER_*` env vars; use `/health/sql` endpoint for sanitized diagnostics.
3. **Frontend can't reach API**: Check `NEXT_PUBLIC_API_URL`; defaults to `http://localhost:3001`. In Docker, update to container hostname.

## Code Quality Standards

1. **No commented code**: Delete unused code, don't comment it.
2. **Minimal comments**: Only explain *why*, not *what*. Names should be self-documenting.
3. **TypeScript strict**: No `any` unless forced by external libraries.
4. **Error messages**: Sanitized (no credentials, host, database names, raw SQL errors). Log internals with masking (email: `ad***@example.com`, IP: `10.0.***.***`).
5. **Commit messages**: Conventional Commits format (e.g., `feat(auth): add rate limiting`, `fix(sql): sanitize identifiers`).

## Workspace Verification

Run `pnpm verify:workspace` to check:
- Directory structure (`apps/`, `packages/`, `docs/`, etc.)
- Monorepo config (`pnpm-workspace.yaml`)
- README sections and commands
- All required ADRs in `docs/decisions/`

## ADRs (Architectural Decision Records)

Located in `docs/decisions/`:
- **ADR-0001**: Monorepo with pnpm workspaces
- **ADR-0002**: ESLint, Prettier, TypeScript, Husky, commitlint
- **ADR-0003**: NestJS backend with ConfigModule, ValidationPipe
- **ADR-0004**: Next.js 14 App Router with Tailwind + shadcn/ui patterns
- **ADR-0005**: Design system with tokens (colors, radius, shadows) and base components
- **ADR-0006**: Docker Compose dev (API, Web, Redis; SQL Server external)

## Environment Variables

See `infra/env/.env.example` for full list. Key vars:
- **API**: `API_PORT` (default 3001), `NODE_ENV`
- **Auth**: `JWT_ACCESS_SECRET` (required, strong), `AUTH_LOGIN_MAX_ATTEMPTS`, `AUTH_LOGIN_LOCKOUT_SECONDS`
- **SQL Server**: `SQLSERVER_HOST`, `SQLSERVER_PORT`, `SQLSERVER_DATABASE`, `SQLSERVER_USER`, `SQLSERVER_PASSWORD`, `SQLSERVER_ENCRYPT=true`
- **Frontend**: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001`)

Never commit `.env` files with real credentials. Use `.env.example` as template.

## Testing Strategy

- **Unit**: Jest for service logic, repositories, utilities
- **Integration**: e2e tests via Supertest for controllers
- **Type**: `pnpm typecheck` enforces strict TypeScript across all workspaces
- **Lint**: `pnpm lint` catches style and naming issues

Run `pnpm test` to execute all Jest suites across workspaces.

## Next Steps (Sprints 3-4)

- Implement exports (PDF via Puppeteer, Excel via ExcelJS) with BullMQ async jobs
- Build admin dashboard editor (drag-and-drop widget customization)
- Add audit logs UI with filtering and pagination
- Harden security: CSP headers, CORS refinement, 2FA, more rate limiting
- E2E tests with Playwright, load testing
- Production deployment documentation and final hardening
