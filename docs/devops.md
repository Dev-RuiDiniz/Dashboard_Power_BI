# DevOps local

## Objetivo

A TASK-06 adiciona uma base de Docker Compose para desenvolvimento local do Dashboard Power BI.

O ambiente sobe os serviços principais de desenvolvimento:

- API NestJS;
- Web Next.js;
- Redis;
- placeholders para SQL Server externo.

## Arquivos principais

```text
infra/docker/docker-compose.dev.yml
infra/docker/api.Dockerfile
infra/docker/web.Dockerfile
infra/env/.env.example
scripts/verify-docker-dev.mjs
```

## Subida local

Copie o arquivo de exemplo quando precisar customizar portas ou credenciais locais:

```bash
cp infra/env/.env.example .env
```

Não versionar `.env`.

Subir ambiente usando o exemplo versionado:

```bash
docker compose --env-file infra/env/.env.example -f infra/docker/docker-compose.dev.yml up --build
```

Subir ambiente usando `.env` local:

```bash
docker compose --env-file .env -f infra/docker/docker-compose.dev.yml up --build
```

## Comandos via pnpm

```bash
pnpm verify:docker
pnpm docker:dev
pnpm docker:dev:logs
pnpm docker:dev:down
```

## Validação manual

Após subir os containers:

```text
http://localhost:3000
http://localhost:3001/health
http://localhost:3001/docs
```

## Redis

O Redis usa a imagem `redis:7.4-alpine`, expõe a porta `6379` e possui healthcheck com `redis-cli ping`.

## SQL Server externo

O SQL Server não sobe como container nesta tarefa. A conexão será feita via variáveis de ambiente apontando para um servidor externo.

## Troubleshooting

### Porta em uso

Ajustar `API_PORT`, `WEB_PORT` ou `REDIS_PORT` no `.env` local.

### Dependências desatualizadas

Rebuildar os containers:

```bash
docker compose --env-file .env -f infra/docker/docker-compose.dev.yml up --build --force-recreate
```

### Derrubar ambiente

```bash
docker compose -f infra/docker/docker-compose.dev.yml down
```

Para remover volumes locais:

```bash
docker compose -f infra/docker/docker-compose.dev.yml down -v
```
