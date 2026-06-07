# AGENTS.md

Este arquivo orienta agentes que atuam neste repositório.

## Objetivo real do projeto

O projeto e uma plataforma web interna de relatorios e BI em estado **funcional parcial**.

Hoje ele ja entrega base real para:

- autenticacao com JWT e refresh token;
- recuperacao e redefinicao de senha;
- perfil do usuario;
- dashboard home com KPIs;
- catalogo, filtros e visualizacao de relatorios;
- administracao de usuarios e grupos;
- permissoes, auditoria, notifications, exports e settings via API;
- integracao com SQL Server para relatorios;
- integracao com Supabase no backend para partes da plataforma.

Ele **ainda nao representa o V1 completo** descrito no PDF de escopo.

## Regra principal

Trabalhe sempre com base no **estado real do codigo**, nao no escopo historico desejado.

Se houver divergencia entre:

- runtime atual;
- documentacao antiga;
- expectativas do PDF;

prevalece o runtime atual, e a diferenca deve ser documentada.

## Stack atual do repositorio

### Backend

- Node.js 20+
- NestJS
- TypeScript strict
- JWT + refresh token
- `bcrypt`
- SQL Server via `mssql`
- Supabase usado por partes do backend de plataforma
- Jest
- Supertest

### Frontend

- Next.js 14 com App Router
- TypeScript strict
- Tailwind CSS
- componentes locais de UI
- Testing Library
- Jest

### Infra e workspace

- pnpm workspaces
- Docker Compose
- GitHub Actions
- `.env.example` em `infra/env/.env.example`

## O que nao deve ser assumido como pronto

Nao assuma como implementado so porque aparece em docs antigas ou em codigo parcial:

- Prisma
- Redis funcional como dependencia principal da aplicacao
- BullMQ operacional de ponta a ponta
- React Hook Form como padrao do frontend inteiro
- Zod em todos os formularios
- TanStack Query estruturando todos os fluxos
- Recharts ou Chart.js ativos no BI
- dashboard interativo com drill-down
- dashboards personalizados completos
- editor visual drag-and-drop
- 2FA/TOTP
  Se algum desses itens for retomado, trate como trabalho novo ou parcial, nao como algo ja entregue.

## Topologia atual

```text
apps/web -> apps/api -> SQL Server
                    \-> Supabase
                    \-> memoria em partes do dominio
```

## Arquivos canonicos para contexto

Leia primeiro:

- `README.md`
- `HANDOFF.md`
- `SPRINT_STATUS.md`
- `ANALISE_ESCOPO_V1.md`
- `docs/architecture.md`
- `docs/api.md`
- `docs/web.md`

## Modulos reais do sistema

Trabalhe considerando estes blocos como a divisao pratica atual:

1. Auth
2. Admin Users
3. Admin Groups
4. Permissions
5. Reports
6. Dashboard
7. Notifications
8. Exports
9. Audit
10. Settings
11. SQL Server

## Regras de execucao

Antes de editar:

1. leia os arquivos relevantes do dominio;
2. confira o runtime atual, especialmente `apps/api/src/app.module.ts`;
3. identifique se a mudanca afeta API, web, docs ou testes;
4. nao amplie escopo sem necessidade clara.

Durante a implementacao:

1. prefira mudancas pequenas e verificaveis;
2. escreva ou ajuste testes quando a mudanca altera comportamento;
3. evite refatoracao ampla junto com mudanca funcional;
4. nao invente arquitetura nova se a tarefa for de fechamento de lacuna;
5. nao marque como `Feito` nada que continue fora do runtime principal.

Depois da implementacao:

1. rode os comandos aplicaveis;
2. atualize a documentacao relevante;
3. registre riscos ou limites remanescentes;
4. use mensagem de commit clara em pt-BR.

## Regras de seguranca

Nunca:

- commite `.env` real;
- exponha secrets, tokens ou senhas;
- concatene SQL com input do usuario;
- implemente permissao apenas no frontend;
- trate dados do PDF como se fossem dados do runtime.

Sempre:

- use queries parametrizadas;
- valide DTOs no backend;
- mantenha controle de acesso nas rotas administrativas;
- trate erros sem vazar detalhes sensiveis;
- preserve o fluxo de auth existente ao mexer em rotas autenticadas.

## Regras para SQL Server

O SQL Server deve continuar sendo tratado como origem de leitura para relatorios.

Obrigatorio:

- queries parametrizadas;
- validacao de identificadores;
- protecao contra SQL injection;
- isolamento de acesso na camada `apps/api/src/sql-server/*`.

Proibido:

- `DROP`
- `DELETE`
- `UPDATE`
- `INSERT`
- `ALTER`
- `TRUNCATE`
- SQL montado por concatenacao com input externo

## Regras para frontend

Toda tela nova ou ajustada deve tratar, quando fizer sentido:

- loading;
- erro;
- vazio;
- sucesso;
- sem permissao.

Chamadas HTTP devem preferir clients centralizados ja existentes, como:

- `apps/web/src/lib/admin-api.ts`
- `apps/web/src/lib/platform-api.ts`
- `apps/web/src/lib/reports-api.ts`

## Regras para testes

Prioridade atual de cobertura:

### Backend

- services
- controllers
- guards
- autorizacao
- contratos dos endpoints usados pela web

### Frontend

- componentes de tela principais
- estados loading/erro/vazio
- formularios criticos
- integracao com os clients HTTP do projeto

### Workspace

Ao fechar tarefa relevante, valide o que fizer sentido entre:

- `pnpm verify:docs`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Comandos principais

Use o padrao real do monorepo:

```bash
pnpm verify:docs
pnpm typecheck
pnpm test
pnpm build
pnpm dev:api
pnpm dev:web
```

Para execucao isolada:

```bash
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/api build
pnpm --filter @dashboard-power-bi/web build
```

## Documentacao

Atualize documentacao quando a mudanca alterar:

- arquitetura real;
- topologia do runtime;
- contratos API consumidos pela web;
- classificacao de aderencia ao escopo;
- forma de setup ou verificacao do workspace.

Arquivos mais provaveis de ajuste:

- `README.md`
- `HANDOFF.md`
- `ANALISE_ESCOPO_V1.md`
- `docs/architecture.md`
- `docs/api.md`
- `docs/web.md`

## Padrao de commits

Prefira mensagens objetivas em portugues brasileiro, como:

- `test: corrigir suites quebradas do workspace`
- `docs: atualizar analise de escopo v1`
- `feat: implementar endpoints de perfil do usuario`
- `refactor: centralizar telas da plataforma via api`

## Prioridade atual do projeto

As proximas ondas de trabalho devem seguir esta ordem:

1. aprofundar permissoes, auditoria e settings;
2. revisar hardening final de sessao e seguranca;
3. entregar BI interativo e dashboards personalizados;
4. fechar lacunas remanescentes de persistencia e governanca;
5. revalidar aderencia completa das 18 telas e 6 modulos.

## Como lidar com ambiguidade

Se houver ambiguidade:

1. nao invente regra de negocio critica;
2. escolha a implementacao minima e segura;
3. documente a suposicao;
4. se a ambiguidade mudar arquitetura, fluxo de permissao ou persistencia, pare e alinhe antes.

## Definition of Done

Uma tarefa esta pronta quando:

- o escopo pedido foi cumprido;
- os testes aplicaveis foram criados ou atualizados;
- os comandos relevantes passaram, ou a limitacao ficou explicitada;
- a documentacao relevante foi ajustada;
- nao ha segredo no diff;
- nada importante foi descrito como pronto sem estar no runtime real.
