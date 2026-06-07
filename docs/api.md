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
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/me/password`
- fluxo de recuperação e redefinição de senha
- CRUD básico administrativo de usuários
- CRUD básico administrativo de grupos
- catálogo, detalhe e execução de relatórios
- dashboard, notificações, exportações e settings no runtime principal
- permissões e auditoria no runtime principal
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
- exportações de relatórios agora geram PDF, XLSX, CSV e JSON com worker, fila, histórico, download autenticado e auditoria, mas a cobertura total do escopo V1 ainda não está fechada.
