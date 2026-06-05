# DevOps local

## Objetivo

Este documento descreve a infraestrutura local realmente mantida no repositório.

## O que existe hoje

Arquivos principais:

```text
infra/docker/docker-compose.dev.yml
infra/docker/api.Dockerfile
infra/docker/web.Dockerfile
scripts/verify-docker-dev.mjs
```

Serviços previstos no Compose:

- API NestJS;
- Web Next.js;
- Redis.

O SQL Server continua externo ao Compose.

## Desvio conhecido

Os scripts do projeto usam:

```text
infra/env/.env.example
```

Esse arquivo não está presente no clone atual.
Na prática, isso significa que os comandos Docker existentes dependem de recriação local desse arquivo ou ajuste manual do comando.

## Comandos via pnpm

```bash
pnpm verify:docker
pnpm docker:dev
pnpm docker:dev:logs
pnpm docker:dev:down
```

## Subida manual

Com o arquivo de env ajustado localmente:

```bash
docker compose --env-file infra/env/.env.example -f infra/docker/docker-compose.dev.yml up --build
```

## Validação manual

Após subir os containers:

```text
http://localhost:3000
http://localhost:3001/health
http://localhost:3001/docs
```

## Redis

Redis aparece no ambiente local do Compose, mas não está integrado de forma funcional à aplicação atual para sessão, cache ou filas de jobs.

## SQL Server externo

O SQL Server não sobe como container neste repositório.
A API depende de variáveis `SQLSERVER_*` apontando para uma instância externa.

## Troubleshooting

### Docker falhando ao iniciar

Primeiro ponto a verificar:

- ausência de `infra/env/.env.example`.

### Porta em uso

Ajuste `API_PORT`, `WEB_PORT` ou `REDIS_PORT` no ambiente local.

### Rebuild do ambiente

```bash
docker compose --env-file infra/env/.env.example -f infra/docker/docker-compose.dev.yml up --build --force-recreate
```

### Derrubar ambiente

```bash
docker compose -f infra/docker/docker-compose.dev.yml down
```
