# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Dashboard Power BI is a pnpm monorepo with a Next.js 14 frontend and a NestJS backend.
The current codebase implements a functional partial platform: auth, admin basics, report querying, an initial dashboard, and direct Supabase reads in parts of the web app.

Do not treat the repository as a full implementation of the V1 PDF scope.

Canonical docs for the current state:

- `docs/system-map.md`
- `docs/scope-v1-gap-analysis.md`
- `SPRINT_STATUS.md`
- `docs/ARCHITECTURE_DETAILED.md`

## Technology Stack

- **Monorepo**: pnpm workspaces (Node.js 20+)
- **Backend API**: NestJS 10.4 with TypeScript and Swagger at `/docs`
- **Frontend**: Next.js 14 with App Router, Tailwind CSS and custom UI components
- **Data**: SQL Server via `mssql`, Supabase used directly by parts of the frontend
- **Auth**: custom JWT + refresh tokens with `bcrypt`
- **Local Dev**: Docker Compose files for API, Web and Redis
- **Quality**: ESLint, Prettier, TypeScript strict mode, husky hooks

## Architecture Notes

### Real topology

```text
apps/web -> apps/api -> SQL Server
       \-> Supabase direct reads
```

### Important reality checks

1. The frontend uses the API for auth, admin and reports, but reads Supabase directly for dashboard KPIs, notifications, export history and system settings.
2. Parts of the API domain still use in-memory repositories, especially admin data and report definitions.
3. Redis appears in local infrastructure, but is not a functional application dependency for sessions, jobs or caching today.
4. The repository does not currently implement Prisma, BullMQ, React Query, 2FA/TOTP or a backend export pipeline.

## Key Patterns to Follow

1. **HTTP exception handling**: Use `HttpException` and `HttpStatus` from `@nestjs/common`.
2. **SQL injection prevention**: All SQL access goes through the SQL Server layer with validated identifiers and parameterized values.
3. **Type safety in DTOs**: Keep DTO defaults explicit when services expect arrays or structured values.
4. **Report filters**: Preserve the expected `parameters` shape in frontend helpers and state.
5. **Defensive null handling**: Prefer `?.` and `??` when dealing with optional headers, session data and external responses.

## Common Commands

```bash
pnpm install
pnpm quality
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm dev:api
pnpm dev:web
pnpm docker:dev
pnpm docker:dev:logs
pnpm docker:dev:down
```

## Important Files

### Backend

- `apps/api/src/main.ts`
- `apps/api/src/auth/`
- `apps/api/src/admin/`
- `apps/api/src/reports/`
- `apps/api/src/sql-server/`

### Frontend

- `apps/web/src/app/`
- `apps/web/src/app/app/`
- `apps/web/src/components/auth/`
- `apps/web/src/components/dashboard/`
- `apps/web/src/components/reports/`
- `apps/web/src/lib/auth/session.ts`
- `apps/web/src/lib/supabase.ts`

## Environment Caveat

Scripts and older docs reference:

```text
infra/env/.env.example
```

That file is not present in the current clone.
Do not assume it exists unless it has been recreated locally.

## Debugging Notes

### API unavailable from the frontend

- verify `NEXT_PUBLIC_API_URL`;
- verify API is running on `http://localhost:3001`;
- check Swagger and `/health`.

### SQL Server issues

- verify `SQLSERVER_*` variables;
- use `/health/sql` for sanitized diagnostics.

### Supabase-driven pages are empty

Check:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Affected areas:

- dashboard
- notifications
- exports
- admin settings

## Code Quality Standards

1. No commented dead code.
2. Keep comments minimal and useful.
3. Maintain TypeScript strictness.
4. Keep error messages sanitized.
5. Use conventional commit messages.

## Testing Strategy

- **Unit/integration**: Jest across API and Web
- **Workspace validation**: `pnpm verify:workspace`
- **Docs validation**: `pnpm verify:docs`
- **Docker validation**: `pnpm verify:docker`

## Practical Guidance

When updating docs or architecture-related code, keep the wording grounded in the current repository state, not in the intended V1 scope.
