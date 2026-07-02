# Estabilização da VPS com Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurar e endurecer o Dashboard Power BI na VPS com Supabase self-hosted isolado e deploy reproduzível pelo GitHub.

**Architecture:** O Compose de produção manterá Web, API, Redis e Nginx em rede exclusiva e adicionará os serviços Supabase necessários em rede interna, sem publicar bancos. A API usará URLs internas e service key; um script idempotente implantará um SHA exato, aplicará migrations, validará saúde e preservará os projetos vizinhos.

**Tech Stack:** NestJS, Next.js 14, BullMQ/ioredis, Docker Compose, Supabase self-hosted/PostgreSQL, GitHub Actions, Bash, Jest e pnpm.

---

### Task 1: Corrigir o ciclo de vida Redis do worker

**Files:**

- Create: `apps/api/src/platform/exports/exports.processor.spec.ts`
- Modify: `apps/api/src/platform/exports/exports.processor.ts`

- [ ] Escrever teste que instancia o processador e comprova que ele entrega ao BullMQ uma conexão não configurada para conexão manual duplicada.
- [ ] Rodar `pnpm --filter @dashboard-power-bi/api test -- exports.processor.spec.ts --runInBand` e confirmar falha pelo estado atual.
- [ ] Remover o conflito de `lazyConnect`/conexão, mantendo fechamento seguro e listener de falha.
- [ ] Repetir o teste focal e a suíte da API.
- [ ] Commitar como `fix(api): corrigir conexão Redis do processador de exports`.

### Task 2: Criar infraestrutura Supabase isolada

**Files:**

- Modify: `infra/docker/docker-compose.prod.yml`
- Modify: `infra/env/.env.production.example`
- Create: `infra/docker/supabase/kong.yml`
- Create: `infra/docker/supabase/init/00-apply-migrations.sh`
- Create: `scripts/deploy-vps.sh`
- Create: `scripts/verify-production-compose.mjs`
- Modify: `package.json`

- [ ] Escrever verificação estrutural que falha se banco/Redis publicarem portas, se redes/volumes não forem exclusivos ou se faltarem healthchecks.
- [ ] Executar o verificador e confirmar RED.
- [ ] Adicionar stack Supabase compatível, volumes, redes internas, limites e healthchecks, usando secrets obrigatórios do `.env.production`.
- [ ] Implementar aplicação idempotente das migrations e script de deploy por SHA com backup lógico, healthcheck e rollback do código.
- [ ] Executar `docker compose config`, verificador e validações de shell.
- [ ] Commitar como `feat(infra): isolar deploy com Supabase self-hosted`.

### Task 3: Endurecer CI/CD do GitHub

**Files:**

- Modify: `.github/workflows/deploy-vps.yml`
- Modify: `.github/workflows/ci.yml`
- Create: `docs/DEPLOY_VPS.md`

- [ ] Adicionar validação que exige testes/typecheck/build antes do deploy e transmite o SHA imutável ao script.
- [ ] Trocar `git reset --hard` inline pelo script versionado, chave SSH dedicada e healthcheck bloqueante.
- [ ] Documentar secrets, rotação, rollback e bootstrap sem registrar valores.
- [ ] Rodar validações YAML/documentais.
- [ ] Commitar como `ci: tornar deploy da VPS verificável e reversível`.

### Task 4: Atualizar documentação SDD e operacional

**Files:**

- Modify: `README.md`
- Modify: `docs/ARQUITETURA.md`
- Modify: `docs/BANCO_DADOS.md`
- Modify: `docs/CONTEXTO.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/api.md`
- Modify: `docs/web.md`
- Modify: `docs/RELATORIO.md`

- [ ] Registrar topologia real, limites, riscos, inventário dos projetos vizinhos e operação do Supabase.
- [ ] Marcar apenas itens comprovados pelo runtime.
- [ ] Executar `pnpm verify:docs` e `git diff --check`.
- [ ] Commitar como `docs: documentar operação isolada da VPS`.

### Task 5: Verificar código antes do deploy

**Files:**

- Modify somente arquivos necessários para corrigir falhas diretamente causadas por esta onda.

- [ ] Executar `pnpm verify:docs`.
- [ ] Executar `pnpm typecheck`.
- [ ] Executar `pnpm test`.
- [ ] Executar `pnpm build`.
- [ ] Revisar diff e confirmar ausência de secrets.

### Task 6: Preparar e implantar na VPS

**Files remotos:**

- `/opt/dashboard-power-bi/app`
- `/opt/dashboard-power-bi/shared/.env.production`
- `/opt/dashboard-power-bi/backups/`

- [ ] Inventariar novamente containers, redes, volumes, portas, uso de disco e estado de Ilex/TrustCheck.
- [ ] Gerar secrets fortes e credencial administrativa de teste sem gravá-los no Git.
- [ ] Fazer backup dos volumes/dados atuais aplicáveis.
- [ ] Limpar somente build cache e imagens sem uso comprovado.
- [ ] Sincronizar o SHA aprovado e executar o script de deploy.
- [ ] Observar API por no mínimo 10 minutos e confirmar contador de reinícios estável.

### Task 7: Configurar GitHub e validar ponta a ponta

**Files:**

- Modify: `docs/RELATORIO.md` com evidências finais e hashes.

- [ ] Criar chave SSH dedicada ao deploy e restringi-la ao fluxo documentado.
- [ ] Configurar `VPS_HOST`, `VPS_USER`, `VPS_PORT`, `VPS_SSH_KEY` e `VPS_DEPLOY_PATH` em GitHub Actions Secrets quando houver autenticação disponível.
- [ ] Validar Web, login, rota autenticada, `/health`, `/health/sql`, Supabase e persistência após restart.
- [ ] Validar export real ou documentar bloqueio externo comprovado.
- [ ] Confirmar que Ilex/TrustCheck mantiveram estado e que bancos/Redis do Dashboard não estão públicos.
- [ ] Atualizar relatório, rodar verificações finais e criar commit de evidências.
- [ ] Criar PR da onda se a autenticação GitHub permitir; caso contrário, entregar comandos exatos e a única ação manual pendente.
