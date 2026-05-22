# Variáveis de ambiente

## Objetivo

Este documento descreve as variáveis necessárias para desenvolvimento local. O arquivo versionado é:

```text
infra/env/.env.example
```

Arquivos `.env` reais não devem ser versionados.

## Variáveis gerais

| Variável | Exemplo | Descrição |
|---|---:|---|
| `NODE_ENV` | `development` | Ambiente de execução. |

## API

| Variável | Exemplo | Descrição |
|---|---:|---|
| `API_PORT` | `3001` | Porta exposta localmente para a API. |
| `PORT` | `3001` | Porta lida pela aplicação NestJS. |

## Web

| Variável | Exemplo | Descrição |
|---|---:|---|
| `WEB_PORT` | `3000` | Porta local da Web. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL pública da API usada pelo frontend. |

## Redis

| Variável | Exemplo | Descrição |
|---|---:|---|
| `REDIS_HOST` | `redis` | Host Redis no Docker Compose. |
| `REDIS_PORT` | `6379` | Porta Redis. |

## SQL Server externo

| Variável | Exemplo | Descrição |
|---|---:|---|
| `SQLSERVER_HOST` | vazio | Host do SQL Server externo. |
| `SQLSERVER_PORT` | `1433` | Porta do SQL Server. |
| `SQLSERVER_DATABASE` | vazio | Nome do banco. |
| `SQLSERVER_USER` | vazio | Usuário de conexão. |
| `SQLSERVER_PASSWORD` | vazio | Senha de conexão. Nunca versionar valor real. |
| `SQLSERVER_ENCRYPT` | `true` | Define uso de conexão criptografada. |
| `SQLSERVER_TRUST_SERVER_CERTIFICATE` | `false` | Define se certificado será confiado sem validação. |

## Auth

| Variável | Exemplo | Descrição |
|---|---:|---|
| `AUTH_DEMO_USER_EMAIL` | vazio | E-mail do usuário demo usado apenas em desenvolvimento/testes locais. |
| `AUTH_DEMO_USER_PASSWORD` | vazio | Senha do usuário demo. Nunca versionar valor real. |
| `JWT_ACCESS_SECRET` | vazio | Secret forte usado para assinar access tokens. Deve ser diferente por ambiente. |
| `JWT_ACCESS_EXPIRES_IN_SECONDS` | `900` | Expiração do access token, em segundos. |
| `JWT_REFRESH_EXPIRES_IN_SECONDS` | `604800` | Expiração do refresh token, em segundos. |
| `BCRYPT_SALT_ROUNDS` | `10` | Custo de hash bcrypt para senhas e refresh tokens. |
| `AUTH_LOGIN_MAX_ATTEMPTS` | `5` | Quantidade máxima de falhas de login antes do lockout. |
| `AUTH_LOGIN_WINDOW_SECONDS` | `900` | Janela de contagem das falhas de login, em segundos. |
| `AUTH_LOGIN_LOCKOUT_SECONDS` | `900` | Tempo de bloqueio após exceder tentativas, em segundos. |

## Segurança

- Nunca versionar `.env` real.
- Nunca colar senhas, tokens ou strings de conexão no chat.
- Usar secrets do ambiente de deploy/CI quando houver pipeline.
- Manter `infra/env/.env.example` apenas com placeholders.
- `JWT_ACCESS_SECRET` deve ser forte, exclusivo por ambiente e rotacionável.
- A política de login padrão bloqueia brute-force após 5 falhas em 15 minutos.
