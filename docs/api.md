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

- parte do domínio administrativo ainda usa repositórios em memória;
- definições de relatórios ainda não estão em persistência final;
- parte desses fluxos ainda usa Supabase e memória como persistência real por trás da API;
- exportações ainda não configuram um pipeline de produção completo só por terem rotas ativas.
