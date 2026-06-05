# DevOps

## Objetivo

Este documento descreve a infraestrutura realmente mantida no repositório para desenvolvimento e deploy.

## O que existe hoje

Arquivos principais:

```text
infra/docker/docker-compose.dev.yml
infra/docker/api.Dockerfile
infra/docker/web.Dockerfile
infra/docker/docker-compose.prod.yml
infra/docker/api.prod.Dockerfile
infra/docker/web.prod.Dockerfile
infra/docker/nginx/default.conf
infra/env/.env.example
infra/env/.env.production.example
scripts/verify-docker-dev.mjs
.github/workflows/deploy-vps.yml
```

Serviços previstos no Compose de desenvolvimento:

- API NestJS;
- Web Next.js;
- Redis.

Serviços previstos no Compose de produção:

- API NestJS;
- Web Next.js;
- Redis;
- Nginx.

O SQL Server continua externo ao Compose em qualquer ambiente.

## Comandos via pnpm

```bash
pnpm verify:docker
pnpm docker:dev
pnpm docker:dev:logs
pnpm docker:dev:down
pnpm docker:prod
pnpm docker:prod:logs
pnpm docker:prod:down
```

## Desenvolvimento local

Com o arquivo `infra/env/.env.example`:

```bash
docker compose --env-file infra/env/.env.example -f infra/docker/docker-compose.dev.yml up --build
```

## Produção via Docker Compose

O compose de produção usa `build:` com Dockerfiles versionados no próprio repositório:

```bash
docker compose --env-file infra/env/.env.production -f infra/docker/docker-compose.prod.yml up --build -d
```

## Validação manual

Em desenvolvimento:

```text
http://localhost:3000
http://localhost:3001/health
http://localhost:3001/docs
```

No ambiente publicado atrás do Nginx, a entrada HTTP fica na porta definida por `NGINX_PORT`.

## Redis

Redis aparece no Compose local e no Compose de produção, mas não está integrado hoje de forma funcional para cache, sessão ou filas de jobs.

## SQL Server externo

O SQL Server não sobe como container neste repositório.
A API depende de variáveis `SQLSERVER_*` apontando para uma instância externa.

## Deploy automatizado

A publicação para VPS via GitHub Actions está documentada em:

```text
docs/deploy-vps.md
```

O workflow atual:

- conecta na VPS por SSH;
- sincroniza o repositório remoto;
- executa `up --build -d` do Compose de produção.

## Troubleshooting

### Docker falhando ao iniciar

Primeiro ponto a verificar:

- presença do arquivo de env correto;
- portas já em uso;
- credenciais externas do SQL Server;
- disponibilidade de Docker e git na VPS.

### Porta em uso

Ajuste `API_PORT`, `WEB_PORT`, `REDIS_PORT` ou `NGINX_PORT` conforme o ambiente.

### Rebuild do ambiente de desenvolvimento

```bash
docker compose --env-file infra/env/.env.example -f infra/docker/docker-compose.dev.yml up --build --force-recreate
```

### Reaplicar ambiente de produção

```bash
docker compose --env-file infra/env/.env.production -f infra/docker/docker-compose.prod.yml up --build -d
```

### Derrubar ambiente

```bash
docker compose -f infra/docker/docker-compose.dev.yml down
```
