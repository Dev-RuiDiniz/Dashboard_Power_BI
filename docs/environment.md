# Variáveis de ambiente

## Escopo

Esta referência descreve as variáveis relevantes para o estado atual do projeto.

## Arquivos versionados de referência

O repositório inclui:

```text
infra/env/.env.example
infra/env/.env.production.example
```

Eles são apenas modelos.
O arquivo real de produção continua fora do Git.

## API básica

| Variável         | Exemplo               | Uso                                           |
| ---------------- | --------------------- | --------------------------------------------- |
| `API_PORT`       | `3001`                | Porta da API                                  |
| `NODE_ENV`       | `development`         | Ambiente da aplicação                         |
| `GHCR_NAMESPACE` | `ghcr.io/devruidiniz` | Namespace das imagens de produção             |
| `IMAGE_TAG`      | `main`                | Tag das imagens usadas no Compose de produção |

## Auth

| Variável                         | Exemplo             | Uso                             |
| -------------------------------- | ------------------- | ------------------------------- |
| `AUTH_DEMO_USER_EMAIL`           | `admin@example.com` | Usuário demo de desenvolvimento |
| `AUTH_DEMO_USER_PASSWORD`        | `Admin123!`         | Senha do usuário demo           |
| `JWT_ACCESS_SECRET`              | vazio               | Secret do access token          |
| `JWT_ACCESS_EXPIRES_IN_SECONDS`  | `900`               | Expiração do access token       |
| `JWT_REFRESH_EXPIRES_IN_SECONDS` | `604800`            | Expiração do refresh token      |
| `BCRYPT_SALT_ROUNDS`             | `10`                | Custo do bcrypt                 |
| `AUTH_LOGIN_MAX_ATTEMPTS`        | `5`                 | Tentativas antes do lockout     |
| `AUTH_LOGIN_WINDOW_SECONDS`      | `900`               | Janela de contagem              |
| `AUTH_LOGIN_LOCKOUT_SECONDS`     | `900`               | Duração do bloqueio             |

## Recuperação de senha

| Variável                               | Exemplo                                | Uso                         |
| -------------------------------------- | -------------------------------------- | --------------------------- |
| `PASSWORD_RESET_TOKEN_EXPIRES_SECONDS` | `900`                                  | Expiração do token de reset |
| `PASSWORD_RESET_PUBLIC_URL`            | `http://localhost:3000/reset-password` | URL usada no link de reset  |
| `SMTP_MODE`                            | `mock`                                 | Modo de e-mail              |
| `SMTP_HOST`                            | vazio                                  | Host SMTP                   |
| `SMTP_PORT`                            | `587`                                  | Porta SMTP                  |
| `SMTP_USER`                            | vazio                                  | Usuário SMTP                |
| `SMTP_PASSWORD`                        | vazio                                  | Senha SMTP                  |
| `SMTP_FROM`                            | vazio                                  | Remetente padrão            |
| `SMTP_SECURE`                          | `false`                                | Conexão SMTP segura         |

## SQL Server

| Variável                             | Exemplo | Uso                               |
| ------------------------------------ | ------- | --------------------------------- |
| `SQLSERVER_HOST`                     | vazio   | Host do SQL Server                |
| `SQLSERVER_PORT`                     | `1433`  | Porta do SQL Server               |
| `SQLSERVER_DATABASE`                 | vazio   | Banco consultado pela API         |
| `SQLSERVER_USER`                     | vazio   | Usuário dedicado de leitura       |
| `SQLSERVER_PASSWORD`                 | vazio   | Senha do usuário SQL              |
| `SQLSERVER_ENCRYPT`                  | `true`  | Criptografia da conexão           |
| `SQLSERVER_TRUST_SERVER_CERTIFICATE` | `false` | Aceitar certificado não confiável |
| `SQLSERVER_CONNECTION_TIMEOUT_MS`    | `5000`  | Timeout de conexão                |
| `SQLSERVER_REQUEST_TIMEOUT_MS`       | `5000`  | Timeout de consulta               |
| `SQLSERVER_POOL_MAX`                 | `5`     | Máximo do pool                    |
| `SQLSERVER_POOL_MIN`                 | `0`     | Mínimo do pool                    |
| `SQLSERVER_POOL_IDLE_TIMEOUT_MS`     | `30000` | Tempo ocioso do pool              |

## Frontend

| Variável                        | Exemplo                 | Uso                                |
| ------------------------------- | ----------------------- | ---------------------------------- |
| `NEXT_PUBLIC_API_URL`           | `http://localhost:3001` | Base URL da API consumida pela Web |
| `NEXT_PUBLIC_SUPABASE_URL`      | vazio                   | URL do projeto Supabase            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | vazio                   | Chave pública do Supabase          |

Observação:

- em produção atrás do Nginx, a opção preferencial agora é `NEXT_PUBLIC_API_URL=/api`;
- isso permite que a Web use a API no mesmo host sem rebuild por domínio.

## Redis e Docker

| Variável     | Exemplo | Uso                                         |
| ------------ | ------- | ------------------------------------------- |
| `WEB_PORT`   | `3000`  | Porta da Web no ambiente local              |
| `REDIS_PORT` | `6379`  | Porta do Redis local                        |
| `NGINX_PORT` | `8082`  | Porta HTTP publicada pelo Nginx em produção |

Observação:

- Redis existe no Compose local e no Compose de produção;
- o aplicativo não usa Redis funcionalmente hoje para cache, sessão ou fila.

## Segurança

- Nunca versionar `.env` real.
- Nunca colar segredos, tokens ou strings de conexão em docs, issues ou commits.
- `JWT_ACCESS_SECRET` deve ser forte e exclusivo por ambiente.
- Credenciais do SQL Server devem pertencer a usuário dedicado, preferencialmente `read-only`.
- Variáveis de Supabase usadas pela Web devem ser tratadas como configuração de ambiente, não como conteúdo fixo no código.
