# ADR-0006 — Docker Compose de desenvolvimento

## Status

Aceita.

## Contexto

O projeto precisa de um ambiente local previsível para rodar API, Web e dependências auxiliares durante o desenvolvimento.

A Sprint 1 prevê Docker Compose dev para API, Web, Redis e placeholders para SQL Server externo.

## Decisão

Criar `infra/docker/docker-compose.dev.yml` com serviços:

- `api`;
- `web`;
- `redis`.

O SQL Server será tratado como dependência externa configurada por variáveis de ambiente. Não será criado container de SQL Server nesta tarefa.

## Consequências positivas

- Ambiente local mais simples de subir.
- Redis disponível para próximas tarefas.
- API e Web executam no mesmo fluxo.
- Variáveis documentadas desde a fundação.
- Menor risco de expor credenciais reais.

## Consequências negativas

- O ambiente Docker de dev não representa produção.
- Containers instalam dependências localmente e podem ter build inicial mais lento.
- SQL Server externo pode não estar disponível para todos os devs.

## Mitigações

- Documentar comandos de subida e troubleshooting.
- Versionar apenas `.env.example`.
- Manter scripts de verificação estrutural.
- Evoluir para imagens otimizadas e CI/CD em tarefas futuras.
