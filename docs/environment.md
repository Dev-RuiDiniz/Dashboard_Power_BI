# Variáveis de ambiente

## Objetivo

Este documento descreve as variáveis necessárias para desenvolvimento local.

O arquivo versionado é:

```text
infra/env/.env.example
```

Arquivos `.env` reais não devem ser versionados.

## Variáveis gerais

| Variável | Exemplo | Descrição |
|---|---|---|
| `NODE_ENV` | `development` | Ambiente de execução. |

## API

| Variável | Exemplo | Descrição |
|---|---|---|
| `API_PORT` | `3001` | Porta exposta localmente para a API. |
| `PORT` | `3001` | Porta lida pela aplicação NestJS. |

## Web

| Variável | Exemplo | Descrição |
|---|---|---|
| `WEB_PORT` | `3000` | Porta exposta localmente para a Web. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL pública da API usada pelo frontend. |

## Redis

| Variável | Exemplo | Descrição |
|---|---|---|
| `REDIS_HOST` | `redis` | Host Redis dentro da rede Docker. |
| `REDIS_PORT` | `6379` | Porta Redis. |

## SQL Server externo

| Variável | Exemplo | Descrição |
|---|---|---|
| `SQLSERVER_HOST` | vazio | Host do SQL Server externo. |
| `SQLSERVER_PORT` | `1433` | Porta do SQL Server. |
| `SQLSERVER_DATABASE` | vazio | Nome do banco. |
| `SQLSERVER_USER` | vazio | Usuário de conexão. |
| `SQLSERVER_PASSWORD` | vazio | Senha de conexão. Nunca versionar valor real. |
| `SQLSERVER_ENCRYPT` | `true` | Define uso de conexão criptografada. |
| `SQLSERVER_TRUST_SERVER_CERTIFICATE` | `false` | Define se certificado do servidor será confiado sem validação. |

## Segurança

- Nunca versionar `.env` real.
- Nunca colar senhas, tokens ou strings de conexão no chat.
- Usar secrets do ambiente de deploy/CI quando houver pipeline.
- Manter `infra/env/.env.example` apenas com placeholders.
