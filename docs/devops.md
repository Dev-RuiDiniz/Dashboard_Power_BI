# DevOps

## Desenvolvimento local

Os fluxos de desenvolvimento e validação são sustentados por:

- `pnpm verify:workspace`
- `pnpm verify:docker`
- `pnpm verify:docs`
- `pnpm quality`

## Docker

Arquivos principais:

- `infra/docker/docker-compose.dev.yml`
- `infra/docker/docker-compose.prod.yml`
- `infra/docker/api.Dockerfile`
- `infra/docker/web.Dockerfile`

## Produção

Existe estrutura de deploy para VPS via Docker Compose e GitHub Actions, mas a prontidão operacional deve ser lida com cautela porque a cobertura funcional do produto ainda é parcial.

## Observações

- Redis aparece no ambiente local, mas não está integrado hoje como cache, fila ou sessão da aplicação.
- A existência dos artefatos de infraestrutura não implica fechamento do escopo V1.
