# Especificação — Estabilização da VPS e Supabase self-hosted

**Data:** 2026-07-02  
**Status:** Aprovada para planejamento  
**Ambiente alvo:** `2.25.168.34`, publicação temporária em `http://2.25.168.34:8082`

## Objetivo

Restabelecer o Dashboard Power BI em produção, atualizar seus artefatos, substituir os fallbacks em memória por uma instância Supabase self-hosted e tornar o deploy pelo GitHub reproduzível, verificável e isolado dos demais projetos da VPS.

## Contexto

A auditoria de 2026-07-02 encontrou o código da VPS no commit `9699e0d`, mas imagens Docker de 2026-06-11. O frontend responde, enquanto a API reinicia por `Redis is already connecting/connected` em `ExportsProcessor.onModuleInit`. A VPS também hospeda Ilex e TrustCheck, que ficam fora do escopo de alterações funcionais.

## Regras de negócio e operação

- Ilex e TrustCheck não podem ser parados, removidos, reconstruídos ou ter seus dados alterados.
- O Dashboard deve possuir projeto Compose, rede, volumes, nomes e limites de recursos próprios.
- Apenas Nginx na porta `8082` e SSH devem ficar publicados para o Dashboard.
- Redis, PostgreSQL e serviços internos do Supabase não devem publicar portas no host.
- A API deve usar Supabase self-hosted em produção; fallback em memória continua permitido apenas em desenvolvimento/testes.
- SQL Server permanece origem externa e somente leitura para relatórios.
- Secrets ficam somente no ambiente da VPS e em GitHub Actions Secrets; nunca no Git.
- O usuário de teste deve ser administrador, ter senha aleatória forte e ser entregue ao proprietário após a validação.
- Atualizações em `main` só entram em produção após verificações, build, healthcheck e rollback em caso de falha.

## Arquitetura proposta

Um projeto Docker Compose exclusivo do Dashboard conterá:

- Nginx, Web Next.js, API NestJS e Redis;
- stack oficial compatível do Supabase self-hosted, incluindo PostgreSQL, Auth, REST e serviços indispensáveis ao cliente usado pela API;
- volumes nomeados com prefixo exclusivo e rede bridge interna exclusiva;
- healthchecks e limites de recursos para evitar disputa descontrolada com Ilex e TrustCheck.

O Nginx encaminhará `/` para Web e as rotas da API para NestJS. A API acessará Redis e Supabase somente pela rede interna. O GitHub Actions acessará a VPS por chave SSH dedicada, atualizará um checkout limpo, executará Compose e validará `/health` antes de concluir.

## Fluxo esperado

1. Push aprovado em `main` dispara CI/CD.
2. CI executa validações documentais, testes, typecheck e build.
3. Job de deploy conecta com chave dedicada e sincroniza exatamente o SHA aprovado.
4. Imagens são reconstruídas e serviços atualizados pelo Compose exclusivo.
5. Migrations Supabase são aplicadas de forma idempotente.
6. Healthchecks validam Web, API, Redis, Supabase e SQL Server.
7. Falha interrompe o deploy e restaura o SHA/imagens anteriores quando possível.

## Critérios de aceite

- Teste de regressão demonstra que `ExportsProcessor` não conecta duas vezes o mesmo cliente Redis.
- API permanece estável, sem reinícios, por uma janela mínima de observação de 10 minutos.
- `/`, `/login`, `/health` e `/health/sql` retornam respostas esperadas pelo Nginx.
- Login do administrador de teste funciona e uma rota autenticada confirma a sessão.
- Supabase está habilitado no log da API e dados persistem após reinício dos containers.
- Uma exportação de teste conclui ou, se o SQL Server não fornecer relatório elegível, o bloqueio externo fica comprovado e documentado.
- Containers, redes e volumes do Dashboard possuem identificação exclusiva.
- Ilex e TrustCheck mantêm o mesmo estado saudável após o deploy.
- PostgreSQL e Redis do Dashboard não aparecem em portas públicas do host.
- Imagens implantadas correspondem ao SHA de `main` usado pelo workflow.
- Documentação operacional, inventário, rollback e GitHub Secrets necessários estão registrados sem valores secretos.

## Impacto técnico

### Backend

- Ajuste do ciclo de vida Redis/BullMQ no processador de exports.
- Teste unitário de regressão.
- Validação explícita da configuração Supabase em produção.

### Banco de dados

- Provisionamento do Supabase self-hosted.
- Aplicação das migrations versionadas de `supabase/migrations`.
- Volumes persistentes e política de backup documentada.

### Infraestrutura

- Compose de produção isolado, healthchecks, limites e volumes.
- Script idempotente de deploy/rollback.
- Workflow GitHub Actions endurecido e vinculado ao SHA implantado.
- Limpeza apenas de build cache e imagens comprovadamente não utilizadas.

### Segurança

- Chave SSH dedicada sem autenticação root por senha no fluxo automatizado.
- Secrets fora do repositório.
- Serviços de dados não publicados.
- Rotação recomendada da senha root compartilhada durante a auditoria.

## Testes necessários

- RED/GREEN unitário do `ExportsProcessor`.
- Suites API e Web.
- `pnpm verify:docs`, `pnpm typecheck`, `pnpm test` e `pnpm build`.
- Validação do Compose e inspeção de portas/redes/volumes.
- Smoke test HTTP e login autenticado.
- Persistência após restart controlado.
- Observação de logs/restarts e rechecagem dos projetos vizinhos.

## Riscos e mitigação

- **Memória limitada (8 GB):** limites por serviço, medição antes/depois e ativação apenas dos componentes Supabase necessários ao runtime.
- **Disco em 84%:** liberar somente caches Docker não usados antes do build e medir espaço recuperado.
- **Ausência de domínio/HTTPS:** manter porta `8082` temporariamente e registrar HTTPS como pendência obrigatória antes de uso externo amplo.
- **SQL Server externo indisponível:** não alterar credenciais; registrar evidência do healthcheck e manter diagnóstico separado.
- **Rollback de migrations:** migrations serão revisadas antes da aplicação e backup será feito antes de qualquer alteração persistente.

## Dependências

- Repositório GitHub `Dev-RuiDiniz/Dashboard_Power_BI` acessível ao workflow.
- Permissão para configurar GitHub Actions Secrets ou instrução ao proprietário caso a API do GitHub não esteja autenticada.
- DNS não é requisito desta onda; HTTPS fica pendente enquanto o acesso usar IP e porta.
- Conectividade da VPS com o SQL Server externo.

## Fora de escopo

- Mudanças funcionais em Ilex ou TrustCheck.
- Novo domínio, DNS ou certificado TLS nesta onda.
- Alterações de negócio nos relatórios.
- Exposição pública do painel administrativo do Supabase.

## Evidências e documentação de entrega

A entrega atualizará `README.md`, `docs/ROADMAP.md`, `docs/CONTEXTO.md`, `docs/RELATORIO.md`, `docs/ARQUITETURA.md`, `docs/BANCO_DADOS.md`, `docs/api.md` e os runbooks de deploy/rollback pertinentes. Senhas e chaves não serão registradas nesses arquivos.
