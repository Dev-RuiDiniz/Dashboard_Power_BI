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
- `docs/CONTEXTO.md`
- `docs/ARQUITETURA.md`
- `docs/BANCO_DADOS.md`
- `docs/ESCOPO.md`
- `docs/ROADMAP.md`
- `docs/RELATORIO.md`
- `docs/ANALISE_ESCOPO_V1.md`
- `docs/api.md`
- `docs/web.md`
- `docs/specs/` — especificacoes SDD por modulo

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
- `docs/ARQUITETURA.md`
- `docs/BANCO_DADOS.md`
- `docs/ESCOPO.md`
- `docs/ROADMAP.md`
- `docs/CONTEXTO.md`
- `docs/RELATORIO.md`
- `docs/ANALISE_ESCOPO_V1.md`
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

1. entregar BI interativo e dashboards personalizados;
2. fechar lacunas remanescentes de persistencia e governanca;
3. revisar hardening final de sessao, 2FA/TOTP e seguranca operacional;
4. revalidar aderencia completa das 18 telas e 6 modulos.

## Como lidar com ambiguidade

Se houver ambiguidade:

1. nao invente regra de negocio critica;
2. escolha a implementacao minima e segura;
3. documente a suposicao;
4. se a ambiguidade mudar arquitetura, fluxo de permissao ou persistencia, pare e alinhe antes.

## Workflow de entrega

### Commits por tarefa

Cada tarefa concluída deve gerar **pelo menos um commit independente** usando mensagens em **português brasileiro** no padrão Conventional Commits:

```text
<tipo>(escopo opcional): descrição curta em pt-BR

- corpo com detalhes quando necessário
- refs: #<issue ou task id>
```

Tipos permitidos:

- `feat:` — nova funcionalidade
- `fix:` — correção de bug
- `docs:` — documentação
- `style:` — formatação, sem mudança funcional
- `refactor:` — refatoração de código
- `test:` — testes
- `chore:` — tarefas de build, config, dependências
- `security:` — hardening, headers, patches

Exemplos:

- `feat: implementar tela de perfil do usuário (/app/profile)`
- `feat(api): adicionar endpoints GET/POST /auth/me e /auth/me/password`
- `feat: criar módulo de gestão de permissões com CRUD completo`
- `feat: criar módulo de logs de auditoria (AuditModule)`
- `feat: adicionar React Query ao frontend`
- `security: implementar CSRF middleware e headers CSP/HSTS/X-Frame-Options`
- `chore: instalar recharts para gráficos no dashboard`
- `docs: atualizar docs/ROADMAP.md e README.md com estado atual`

### Regra de documentação

**Toda tarefa deve atualizar documentação.** Nunca finalize uma tarefa sem:

1. Atualizar `README.md` se o escopo mudar funcionalidades visíveis;
2. Atualizar `docs/ROADMAP.md` com marcos alcançados;
3. Atualizar `docs/api.md` se novos endpoints foram criados;
4. Atualizar `docs/web.md` se novas telas foram criadas;
5. Registrar em `docs/CONTEXTO.md` qualquer decisão técnica, bloqueio ou mudança importante;
6. Atualizar `docs/RELATORIO.md` ao final da sessão com o que foi feito no dia.

### Regra de docs/RELATORIO.md

**Ao final de cada sessão de implementação, atualize o `docs/RELATORIO.md`** com o que foi feito naquele dia:

- Commits realizados (hash, mensagem, tarefa associada);
- Funcionalidades entregues (backend e frontend);
- Arquivos criados e modificados;
- Correções de bugs ou type errors;
- Métricas de progresso (telas concluídas, módulos avançados);
- Débitos técnicos remanescentes;
- Próximos passos recomendados.

Se o arquivo `docs/RELATORIO.md` ainda não existir para o dia atual, crie-o. Se já existir, apende ou atualize a seção correspondente. Use-o como fonte de acompanhamento diário do projeto.

### Regra de docs/ROADMAP.md

O arquivo `docs/ROADMAP.md` deve ser mantido como fonte única da direção do projeto. A cada tarefa:

- Mova o item de `## Em andamento / Pendente` para `## Concluído`;
- Adicione data de conclusão;
- Registre breve nota sobre o que foi entregue.

### Pull Request ao final de onda

Ao final de cada onda de trabalho (conjunto de tarefas relacionadas):

1. Garanta que todos os commits da onda estão na branch;
2. Crie um PR com título descritivo em pt-BR:
   ```text
   feat: entrega de <tema da onda> — <data>
   ```
3. Descrição do PR deve conter:
   - Resumo do que foi implementado (lista de tarefas);
   - Arquivos/rotas novos ou modificados;
   - Comandos de validação que passaram;
   - Limitações ou débitos técnicos remanescentes;
   - Screenshots ou evidências quando houver UI.

## SDD — Specification-Driven Development

Toda funcionalidade deve comecar por especificacao.

Antes de codificar, o agente deve:

1. Ler documentacao existente.
2. Confirmar o requisito.
3. Criar ou atualizar especificacao em documentacao.
4. Definir criterios de aceite.
5. Mapear impacto em:
   - arquitetura
   - banco de dados
   - API
   - frontend
   - testes
   - infraestrutura
   - seguranca
6. Registrar decisoes relevantes em `docs/CONTEXTO.md`.
7. Atualizar `docs/ROADMAP.md` se a tarefa fizer parte de fase, epico ou historia.

Toda especificacao deve conter:

- Objetivo
- Contexto
- Regras de negocio
- Fluxo esperado
- Criterios de aceite
- Impacto tecnico
- Testes necessarios
- Riscos
- Dependencias

## TDD — Test-Driven Development

Fluxo obrigatorio:

1. **RED** — escrever ou ajustar teste que falha.
2. **GREEN** — implementar o minimo necessario para passar.
3. **REFACTOR** — melhorar mantendo testes verdes.

Regras:

- Toda feature nova precisa de teste.
- Todo bug corrigido precisa de teste de regressao.
- Toda regra de negocio critica precisa de teste.
- Toda migration relevante precisa ser validada.
- Nao reduzir cobertura sem justificativa em `docs/RELATORIO.md`.
- Se a stack nao tiver testes configurados, registrar isso e propor configuracao inicial.

Comandos de teste do projeto:

```bash
pnpm test
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/web test
pnpm typecheck
pnpm build
```

## Checklist obrigatorio por tarefa

```markdown
- [ ] Requisito compreendido
- [ ] Especificacao criada/atualizada
- [ ] Teste criado/atualizado
- [ ] Implementacao validada
- [ ] Documentacao atualizada
- [ ] Arquitetura atualizada, se aplicavel
- [ ] Banco de dados atualizado, se aplicavel
- [ ] Roadmap atualizado, se aplicavel
- [ ] Contexto atualizado
- [ ] Relatorio do dia atualizado
```

## Seguranca e integridade

Regras adicionais de seguranca:

- Nunca expor `.env`, tokens, senhas, chaves privadas ou credenciais.
- Nunca copiar secrets para documentacao.
- Antes de registrar exemplos, usar valores ficticios seguros.
- Nao criar backdoors, bypass de autenticacao ou desativar validacoes sem autorizacao.
- Validar entradas de usuario.
- Documentar riscos de seguranca encontrados.
- Registrar pendencias criticas em `docs/CONTEXTO.md`.

## Conduta para agentes

- Ser conservador em mudancas.
- Priorizar consistencia com padroes existentes.
- Nao reescrever o projeto sem necessidade.
- Nao substituir bibliotecas principais sem justificativa.
- Nao remover testes.
- Nao apagar historico de documentacao.
- Em caso de duvida, investigar antes de perguntar.
- Se ainda houver duvida, registrar como `A CONFIRMAR`.

## Definition of Done

Uma tarefa esta pronta quando:

- o escopo pedido foi cumprido;
- os testes aplicaveis foram criados ou atualizados;
- os comandos relevantes passaram, ou a limitacao ficou explicitada;
- a documentacao relevante foi ajustada (README, docs/ROADMAP, docs/ARQUITETURA, docs/BANCO_DADOS, docs/ESCOPO, docs/CONTEXTO, docs/RELATORIO, docs/api.md, docs/web.md);
- o commit foi feito com mensagem em pt-BR no padrão Conventional Commits;
- nao ha segredo no diff;
- nada importante foi descrito como pronto sem estar no runtime real.
