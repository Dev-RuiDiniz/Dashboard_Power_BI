# Deploy na VPS via GitHub Actions

## Objetivo

Publicar o estado atual do projeto na VPS usando:

- GitHub Actions;
- SSH para acionar o deploy remoto;
- Docker Compose na VPS.

## Fluxo implementado

O workflow versionado em:

```text
.github/workflows/deploy-vps.yml
```

faz, em ordem:

1. `checkout` do repositório;
2. `pnpm install`;
3. validações leves de workspace e docs;
4. conexão SSH na VPS;
5. sincronização do repositório remoto;
6. `docker compose up --build -d`.

## Artefatos usados no deploy

```text
infra/docker/api.prod.Dockerfile
infra/docker/web.prod.Dockerfile
infra/docker/docker-compose.prod.yml
infra/docker/nginx/default.conf
infra/env/.env.production.example
```

## Secrets necessários no GitHub

Configurar em `Settings > Secrets and variables > Actions`:

| Secret            | Exemplo                       | Uso                          |
| ----------------- | ----------------------------- | ---------------------------- |
| `VPS_HOST`        | `2.25.168.34`                 | Host da VPS                  |
| `VPS_PORT`        | `22`                          | Porta SSH                    |
| `VPS_USER`        | `root`                        | Usuário SSH                  |
| `VPS_SSH_KEY`     | chave privada OpenSSH         | Acesso SSH do GitHub Actions |
| `VPS_DEPLOY_PATH` | `/opt/dashboard-power-bi/app` | Pasta do projeto na VPS      |

## Variáveis esperadas na VPS

O arquivo real:

```text
infra/env/.env.production
```

fica apenas na VPS.

Base recomendada:

```bash
cp infra/env/.env.production.example infra/env/.env.production
```

Pontos importantes:

- `NEXT_PUBLIC_API_URL=/api`
- `PASSWORD_RESET_PUBLIC_URL` deve apontar para a URL pública real
- `JWT_ACCESS_SECRET` deve ser forte

## Compose de produção

O compose de produção usa `build:` com Dockerfiles versionados no próprio repositório.
Isso permite que o GitHub Actions sincronize o código e mande a VPS rebuildar o estado atual.

## Primeira preparação manual da VPS

Antes da action funcionar sozinha, a VPS precisa ter:

1. Docker e plugin do Compose;
2. pasta do projeto já criada;
3. `git` disponível;
4. `infra/env/.env.production` configurado.

## Comandos úteis na VPS

```bash
docker compose --env-file infra/env/.env.production -f infra/docker/docker-compose.prod.yml ps
docker compose --env-file infra/env/.env.production -f infra/docker/docker-compose.prod.yml logs -f
docker compose --env-file infra/env/.env.production -f infra/docker/docker-compose.prod.yml up --build -d
```

## Observação operacional

Hoje a VPS já tem outro stack ocupando a porta `80`.
Por isso, o exemplo de produção usa `NGINX_PORT=8082`.

Se depois houver um proxy frontal único, `NEXT_PUBLIC_API_URL=/api` continua válido e não exige rebuild específico por porta ou domínio.
