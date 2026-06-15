# Plano Otimizado para Codex — SDD + TDD

**Projeto:** Plataforma Web de Relatórios & BI  
**Versão:** 2.0 — otimizada para Codex  
**Data:** 2026-06-07  
**Escopo base:** Plataforma Web BI V1, com 18 telas, 6 módulos, 3 perfis de acesso, integração SQL Server, dashboards, exportação PDF/Excel, Redis, autenticação, permissões, logs, QA e deploy.  
**Modo de execução:** Codex como agente de desenvolvimento, com tarefas pequenas, revisáveis e orientadas por especificação.  
**Métodos:** SDD — Specification-Driven Development + TDD — Test-Driven Development.

---

## 1. Objetivo deste documento

Este documento foi otimizado para ser usado diretamente no **Codex** como plano de execução do MVP. Ele transforma o escopo em tarefas pequenas, testáveis e seguras, reduzindo retrabalho, custo computacional, alterações fora do escopo e risco de o agente gerar código excessivo ou inconsistente.

O objetivo é construir um MVP funcional da plataforma BI com:

- autenticação segura;
- perfis de acesso: Visualizador, Downloader e Administrador;
- permissões por setor, grupo e relatório;
- integração com SQL Server usando conexão segura e queries parametrizadas;
- relatórios com filtros, visualização inline e exportação PDF/Excel;
- dashboards com KPIs e gráficos;
- área administrativa;
- logs de auditoria;
- cache Redis e filas para exportações;
- testes automatizados;
- documentação técnica;
- deploy containerizado.

---

## 2. Regra principal para o Codex

O Codex **não deve tentar construir o projeto inteiro de uma vez**.

Cada execução deve trabalhar em **uma única tarefa**, seguindo obrigatoriamente o fluxo:

```txt
SPEC -> TEST FAIL -> IMPLEMENT -> TEST PASS -> REFACTOR -> DOCS -> COMMIT MESSAGE
```

Antes de alterar código, o Codex deve:

1. Ler `AGENTS.md`.
2. Ler a tarefa em `/docs/tasks/TASK-XX.md`.
3. Ler a especificação relacionada em `/docs/specs/SPEC-XX.md`, quando existir.
4. Listar os arquivos que pretende criar ou alterar.
5. Implementar a menor mudança possível.
6. Rodar testes/build/lint aplicáveis.
7. Corrigir no máximo 2 ciclos automáticos por falha.
8. Parar e registrar bloqueio se não conseguir resolver com segurança.

---

## 3. Estratégia SDD — Specification-Driven Development

Toda funcionalidade deve nascer como uma especificação pequena em `/docs/specs`.

Modelo obrigatório:

```md
# SPEC-XX — Nome da funcionalidade

## Objetivo

Explique o resultado esperado em linguagem de negócio.

## Escopo incluído

- Item 1
- Item 2

## Fora do escopo

- Item 1
- Item 2

## Regras de negócio

- RN01 — regra objetiva
- RN02 — regra objetiva

## Contratos

### Entrada

Descrever DTO, payload, query params ou props.

### Saída

Descrever retorno esperado, status HTTP, schema ou estado visual.

## Segurança

- Autorização necessária
- Permissões exigidas
- Dados sensíveis protegidos

## Critérios de aceite

- CA01 — Dado/Quando/Então
- CA02 — Dado/Quando/Então

## Testes obrigatórios

- Unitários
- Integração
- E2E, se necessário

## Arquivos esperados

- caminho/arquivo.ts
- caminho/arquivo.test.ts
```

---

## 4. Estratégia TDD

Para cada tarefa:

### 4.1 Backend

Ordem obrigatória:

1. Criar testes unitários de serviços.
2. Criar testes de integração dos controllers.
3. Criar DTOs/schemas.
4. Implementar service/controller/repository.
5. Validar erros e permissões.
6. Rodar testes.
7. Atualizar documentação.

Comandos esperados:

```bash
npm run test --workspace=apps/api
npm run test:e2e --workspace=apps/api
npm run lint --workspace=apps/api
npm run build --workspace=apps/api
```

### 4.2 Frontend

Ordem obrigatória:

1. Criar teste de componente ou página.
2. Criar schema de validação.
3. Implementar componente/página.
4. Integrar com client API tipado.
5. Validar estados: loading, vazio, erro e sucesso.
6. Rodar testes/build/lint.
7. Atualizar documentação.

Comandos esperados:

```bash
npm run test --workspace=apps/web
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```

### 4.3 E2E

Usar Playwright apenas para fluxos críticos:

- login;
- acesso por perfil;
- listagem de relatórios;
- visualização de relatório;
- exportação;
- criação/edição de usuário admin;
- bloqueio de acesso sem permissão.

---

## 5. Estrutura recomendada do repositório

```txt
bi-platform/
├── apps/
│   ├── api/                         # NestJS API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── permissions/
│   │   │   │   ├── reports/
│   │   │   │   ├── dashboards/
│   │   │   │   ├── exports/
│   │   │   │   ├── audit/
│   │   │   │   └── system/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   ├── test/
│   │   └── prisma/
│   └── web/                         # Next.js
│       ├── app/
│       │   ├── (public)/
│       │   ├── (app)/
│       │   └── admin/
│       ├── components/
│       ├── features/
│       ├── lib/
│       └── tests/
├── packages/
│   ├── shared/                      # Tipos, schemas Zod, contratos
│   ├── config/                      # ESLint, TSConfig, Prettier
│   └── ui/                          # Opcional, componentes compartilhados
├── docs/
│   ├── specs/
│   ├── tasks/
│   ├── adr/
│   ├── qa/
│   ├── prompts/
│   └── handoff/
├── docker/
├── scripts/
├── AGENTS.md
├── README.md
├── docker-compose.yml
├── package.json
└── turbo.json
```

---

## 6. Stack alvo do MVP

### Backend

- Node.js LTS.
- NestJS.
- TypeScript strict.
- Prisma ORM.
- SQL Server via Prisma e/ou driver `mssql` para stored procedures e views.
- Redis.
- BullMQ.
- JWT access token + refresh token.
- bcrypt.
- Zod/class-validator.
- Jest + Supertest.

### Frontend

- Next.js 14+ App Router.
- TypeScript strict.
- Tailwind CSS.
- shadcn/ui.
- TanStack Query.
- React Hook Form.
- Zod.
- Recharts ou Chart.js.
- Testing Library.
- Playwright.

### Exportação

- ExcelJS para `.xlsx`.
- Puppeteer ou Playwright server-side para PDF.
- BullMQ para exportações pesadas.

### Infra

- Docker Compose para dev.
- Redis em container.
- SQL Server externo ou container opcional para testes locais.
- GitHub Actions para CI.

---

## 7. Roadmap por tarefas Codex

Cada tarefa abaixo deve virar um arquivo em `/docs/tasks` e ser executada isoladamente.

---

### TASK-00 — Preparar repositório e regras do agente

**Objetivo:** criar base do projeto, documentação inicial e arquivo `AGENTS.md`.

**Entregas:**

- monorepo configurado;
- `AGENTS.md` na raiz;
- `README.md` inicial;
- estrutura `/docs`;
- scripts base;
- `.gitignore`, `.editorconfig`, `.env.example`.

**Testes:**

- `npm install` executa sem erro;
- `npm run lint` existe;
- `npm run build` existe, mesmo que ainda sem apps completas.

**Prompt Codex sugerido:**

```txt
Leia AGENTS.md e execute apenas TASK-00. Crie a estrutura inicial do monorepo para a Plataforma Web BI. Não implemente funcionalidades de negócio. Crie scripts, documentação base e arquivos de configuração mínimos. Rode os comandos possíveis e registre o resultado em docs/qa/TASK-00.md.
```

---

### TASK-01 — Setup backend NestJS

**Objetivo:** criar API NestJS base.

**Entregas:**

- app `apps/api`;
- health check `/health`;
- config service;
- validação de env;
- setup Jest/Supertest;
- logger básico;
- CORS configurável.

**Testes primeiro:**

- health check retorna 200;
- env inválida falha com mensagem clara;
- app inicializa em modo teste.

---

### TASK-02 — Setup frontend Next.js

**Objetivo:** criar app web base.

**Entregas:**

- app `apps/web`;
- Tailwind + shadcn/ui;
- layout principal;
- página inicial protegida placeholder;
- página `/login` placeholder;
- client API base;
- testes de renderização.

**Testes primeiro:**

- login renderiza;
- layout renderiza;
- rota protegida exige sessão mockada.

---

### TASK-03 — Banco e modelos base

**Objetivo:** definir modelos principais e camada de dados.

**Entidades mínimas:**

- User;
- Group;
- Sector;
- Permission;
- Report;
- ReportParameter;
- Dashboard;
- DashboardWidget;
- AuditLog;
- RefreshToken;
- ExportJob.

**Regras:**

- não armazenar senha em texto puro;
- usuário pertence a grupos e setores;
- relatório pertence a setor;
- permissões podem ser herdadas por grupo e sobrescritas individualmente.

**Testes primeiro:**

- criação de usuário com hash;
- relacionamento usuário/grupo/setor;
- relatório com setor;
- audit log criado com metadados obrigatórios.

---

### TASK-04 — Autenticação JWT + refresh token

**Objetivo:** implementar login, refresh, logout e sessão.

**Entregas:**

- endpoint `POST /auth/login`;
- endpoint `POST /auth/refresh`;
- endpoint `POST /auth/logout`;
- endpoint `GET /auth/me`;
- hash bcrypt;
- refresh token com rotação;
- rate limit no login;
- logs de autenticação.

**Testes primeiro:**

- login válido retorna access token e refresh token;
- login inválido falha;
- usuário desativado não loga;
- refresh token antigo não pode ser reutilizado após rotação;
- logout invalida refresh token;
- eventos são auditados.

---

### TASK-05 — Recuperação de senha

**Objetivo:** implementar recuperação por e-mail com token temporário.

**Entregas:**

- request reset;
- reset via token;
- SMTP adapter mockável;
- token com expiração;
- template simples de e-mail;
- tela de solicitação e redefinição.

**Testes primeiro:**

- request reset não vaza se e-mail existe;
- token expirado falha;
- senha nova é gravada com hash;
- evento é auditado.

---

### TASK-06 — RBAC e permissões por setor/relatório

**Objetivo:** controlar acesso por perfil, setor, grupo e relatório.

**Perfis:**

- Visualizador: apenas leitura;
- Downloader: leitura + exportação;
- Administrador: gestão completa.

**Entregas:**

- guards NestJS;
- decorators de permissão;
- service de autorização;
- tela admin básica de permissões;
- testes de acesso.

**Testes primeiro:**

- Visualizador não exporta;
- Downloader exporta relatório permitido;
- Admin gerencia usuários;
- usuário sem setor não vê relatório;
- permissão individual pode liberar relatório específico.

---

### TASK-07 — Gestão de usuários e grupos

**Objetivo:** CRUD admin de usuários e grupos.

**Entregas:**

- listagem;
- criação;
- edição;
- desativação;
- reset de senha;
- associação com grupos/setores;
- telas admin.

**Testes primeiro:**

- admin cria usuário;
- admin desativa usuário;
- usuário comum não acessa CRUD;
- reset de senha gera fluxo seguro;
- alterações são auditadas.

---

### TASK-08 — Conector SQL Server seguro

**Objetivo:** criar camada segura para consultar views/stored procedures/queries parametrizadas.

**Entregas:**

- connection pool;
- timeout configurável;
- parametrização obrigatória;
- bloqueio de comandos destrutivos;
- suporte a views e stored procedures;
- adapter mockável para testes.

**Testes primeiro:**

- query parametrizada recebe params corretamente;
- tentativa de comando proibido falha;
- timeout retorna erro tratado;
- erro do SQL Server não expõe credenciais;
- service pode ser testado sem SQL Server real.

---

### TASK-09 — Gestão de relatórios

**Objetivo:** permitir cadastrar fontes SQL, parâmetros, descrição, setor e nível de acesso.

**Entregas:**

- CRUD de relatórios;
- cadastro de parâmetros;
- preview limitado;
- validação de query/fonte;
- tela admin.

**Testes primeiro:**

- admin cadastra relatório;
- relatório exige setor;
- query inválida é recusada;
- parâmetros obrigatórios são validados;
- alteração é auditada.

---

### TASK-10 — Listagem e filtros de relatórios

**Objetivo:** usuário visualiza relatórios disponíveis conforme permissão.

**Entregas:**

- tela lista de relatórios;
- busca;
- filtros por setor/categoria;
- favoritos;
- estados loading/empty/error.

**Testes primeiro:**

- lista mostra apenas relatórios permitidos;
- busca filtra corretamente;
- usuário sem relatórios vê estado vazio;
- favorito persiste.

---

### TASK-11 — Visualizador inline de relatório

**Objetivo:** exibir resultado em tabela/grid responsivo com filtros dinâmicos.

**Entregas:**

- execução de relatório;
- filtros por data/categoria/parâmetros;
- tabela paginada;
- ordenação;
- limite máximo de linhas;
- tratamento de erro.

**Testes primeiro:**

- parâmetros obrigatórios são exigidos;
- usuário sem permissão não executa;
- paginação funciona;
- erro SQL é tratado;
- dados sensíveis não aparecem no log.

---

### TASK-12 — Exportação PDF e Excel

**Objetivo:** permitir exportação conforme permissão.

**Entregas:**

- ExcelJS `.xlsx`;
- PDF server-side;
- fila BullMQ para exportações pesadas;
- status de exportação;
- download seguro;
- audit log de download.

**Testes primeiro:**

- Visualizador não exporta;
- Downloader exporta;
- arquivo gerado tem colunas esperadas;
- job pesado entra na fila;
- download é auditado.

---

### TASK-13 — Dashboard Home e KPIs

**Objetivo:** exibir KPIs e gráficos principais por setor.

**Entregas:**

- cards de KPI;
- gráficos linha/barra/pizza;
- delta percentual;
- filtros de período;
- dados mockáveis quando SQL real não existir.

**Testes primeiro:**

- KPIs renderizam;
- delta é calculado corretamente;
- gráfico lida com dados vazios;
- usuário vê apenas dados do setor permitido.

---

### TASK-14 — Dashboard personalizado

**Objetivo:** usuário salva layout de widgets e visualizações favoritas.

**Entregas:**

- CRUD de dashboard do usuário;
- widgets configuráveis;
- persistência de layout;
- tela de edição simples;
- validação de widgets.

**Testes primeiro:**

- usuário cria dashboard;
- widget inválido é recusado;
- layout salvo é restaurado;
- usuário não acessa dashboard de outro usuário.

---

### TASK-15 — Editor administrativo de dashboards

**Objetivo:** admin configura dashboards globais por setor.

**Entregas:**

- editor de widgets;
- seleção de fonte SQL/relatório;
- agrupamento/período;
- preview;
- publicação por setor.

**Testes primeiro:**

- admin cria dashboard global;
- usuário comum não cria;
- dashboard publicado aparece para setor correto;
- alteração é auditada.

---

### TASK-16 — Notificações internas

**Objetivo:** centro de avisos para relatório disponível, alerta de acesso e eventos relevantes.

**Entregas:**

- model Notification;
- listagem;
- marcar como lida;
- badge no frontend;
- eventos básicos.

**Testes primeiro:**

- usuário vê próprias notificações;
- marca como lida;
- não acessa notificação de outro usuário.

---

### TASK-17 — Logs de auditoria

**Objetivo:** registrar e consultar histórico de ações.

**Entregas:**

- audit middleware/interceptor;
- filtros por usuário, ação, data e recurso;
- exportação CSV;
- tela admin.

**Testes primeiro:**

- login gera log;
- download gera log;
- alteração de permissão gera log;
- admin filtra logs;
- usuário comum não acessa logs globais.

---

### TASK-18 — Segurança final

**Objetivo:** endurecer segurança do MVP.

**Entregas:**

- Helmet/CSP;
- CORS restritivo;
- CSRF quando aplicável;
- rate limit;
- sanitização de inputs;
- 2FA TOTP obrigatório para admins;
- timeout de sessão.

**Testes primeiro:**

- admin sem 2FA configurado é forçado ao setup;
- rate limit bloqueia tentativas excessivas;
- headers de segurança existem;
- sessão expira por inatividade.

---

### TASK-19 — Cache Redis e refresh agendado

**Objetivo:** reduzir carga no SQL Server.

**Entregas:**

- cache por relatório;
- TTL configurável;
- invalidação manual;
- refresh por cron;
- métricas básicas de cache hit/miss.

**Testes primeiro:**

- segunda execução usa cache;
- TTL expira;
- admin invalida cache;
- erro no refresh não quebra relatório anterior.

---

### TASK-20 — QA E2E e testes de carga leves

**Objetivo:** validar fluxos críticos.

**Entregas:**

- Playwright para login;
- permissões;
- relatórios;
- exportação;
- admin;
- relatório de QA em `/docs/qa`.

**Testes obrigatórios:**

- login admin;
- login usuário visualizador;
- tentativa de exportação negada;
- exportação permitida;
- CRUD usuário;
- visualização de relatório.

---

### TASK-21 — Docker, CI/CD e deploy

**Objetivo:** preparar entrega técnica.

**Entregas:**

- Dockerfiles;
- docker-compose;
- GitHub Actions;
- scripts de build/test;
- `.env.example` completo;
- documentação de deploy.

**Testes primeiro:**

- build local dos containers;
- CI roda lint/test/build;
- app sobe com compose;
- health check responde.

---

### TASK-22 — Documentação final e handoff

**Objetivo:** entregar documentação técnica e operacional.

**Entregas:**

- README completo;
- guia de instalação;
- guia de variáveis de ambiente;
- guia de permissões;
- guia de relatórios SQL;
- guia de deploy;
- lista de pendências V2.

---

## 8. Ordem recomendada de execução no Codex

Para reduzir retrabalho:

```txt
00 -> 01 -> 02 -> 03 -> 04 -> 06 -> 07 -> 08 -> 09 -> 10 -> 11 -> 12 -> 13 -> 17 -> 18 -> 19 -> 20 -> 21 -> 22
```

A tarefa `05` pode entrar depois da autenticação. As tarefas `14`, `15` e `16` podem ser adiadas caso o MVP precise ser mais enxuto.

### MVP enxuto recomendado

Para uma primeira entrega mais rápida:

```txt
00, 01, 02, 03, 04, 06, 07, 08, 09, 10, 11, 12, 13, 17, 21, 22
```

### MVP completo V1

```txt
00 até 22
```

---

## 9. Tarefas que podem ser adiadas para economizar tempo

Se o objetivo for gerar o MVP mais rápido possível, adiar:

- dashboard personalizado por usuário;
- editor visual drag-and-drop avançado;
- notificações internas completas;
- 2FA para todos os perfis, mantendo obrigatório apenas para admin;
- exportação de dashboard como imagem;
- testes de carga profundos;
- WebSocket/live updates.

---

## 10. Prompts prontos para usar no Codex

### 10.1 Prompt padrão de execução de tarefa

```txt
Leia AGENTS.md, depois leia docs/tasks/TASK-XX.md e docs/specs/SPEC-XX.md, se existirem.

Execute somente a TASK-XX.

Regras obrigatórias:
1. Antes de editar, liste os arquivos que pretende alterar.
2. Use TDD: crie ou atualize testes antes da implementação.
3. Altere o mínimo possível.
4. Não reescreva arquivos inteiros sem necessidade.
5. Não implemente funcionalidades fora do escopo da tarefa.
6. Rode lint, testes e build aplicáveis.
7. Atualize docs/qa/TASK-XX.md com comandos executados, resultado e pendências.
8. Ao final, gere uma mensagem de commit em pt-BR no padrão: TASK-XX: descrição curta.
```

### 10.2 Prompt para corrigir falha

```txt
A execução da TASK-XX falhou no comando abaixo:

[cole o comando]

Erro resumido:
[cole somente as linhas relevantes]

Corrija apenas a causa da falha. Não refatore outras áreas. Rode novamente o comando. Se falhar de novo, registre bloqueio em docs/qa/TASK-XX.md e pare.
```

### 10.3 Prompt para revisão de PR

```txt
Revise as alterações da TASK-XX como Tech Lead.

Verifique:
- aderência à SPEC;
- testes criados antes da implementação;
- segurança;
- tipagem TypeScript;
- permissões;
- risco de quebra;
- documentação atualizada.

Não altere código inicialmente. Primeiro entregue uma lista objetiva de problemas encontrados e recomendações.
```

### 10.4 Prompt para documentação de handoff

```txt
Com base no estado atual do repositório, atualize docs/handoff com:
- visão geral da arquitetura;
- como rodar localmente;
- variáveis de ambiente;
- comandos de teste;
- fluxo de autenticação;
- fluxo de permissões;
- como cadastrar relatórios SQL;
- limitações conhecidas;
- pendências para V2.

Não altere código funcional.
```

---

## 11. Controle de contexto para reduzir erro do Codex

O Codex deve receber contexto nesta ordem:

1. `AGENTS.md`.
2. Tarefa específica.
3. Spec específica.
4. Arquivos diretamente relacionados.
5. Erro de teste, se houver.

Não enviar:

- escopo inteiro em toda tarefa;
- PDF completo;
- dumps de banco;
- logs gigantes;
- múltiplas tarefas ao mesmo tempo;
- arquivos `.env` reais;
- secrets ou credenciais.

---

## 12. Políticas de segurança para o MVP

Obrigatório:

- senha com bcrypt e salt rounds configurável, mínimo recomendado 12;
- access token curto;
- refresh token com rotação;
- logs sem senha, token ou credencial;
- queries SQL parametrizadas;
- bloqueio de comandos destrutivos no executor SQL;
- rate limit no login;
- CORS restritivo por env;
- headers de segurança;
- autorização em backend, não apenas frontend;
- 2FA obrigatório para admin no MVP completo.

Proibido:

- salvar senha em texto puro;
- concatenar SQL com entrada do usuário;
- expor stack trace para o frontend;
- commitar `.env` real;
- ignorar testes quebrados;
- liberar exportação sem checar permissão.

---

## 13. Definition of Done geral

Uma tarefa só está concluída quando:

- SPEC foi respeitada;
- testes relevantes foram criados ou atualizados;
- testes passam;
- lint passa;
- build passa quando aplicável;
- documentação foi atualizada;
- logs de QA foram registrados;
- não existem secrets no diff;
- não houve alteração fora do escopo;
- mensagem de commit foi sugerida.

---

## 14. Checklist de PR por tarefa

```md
## Checklist TASK-XX

- [ ] Li o AGENTS.md
- [ ] Li a SPEC/TASK correspondente
- [ ] Listei arquivos antes de editar
- [ ] Escrevi/atualizei testes primeiro
- [ ] Implementei somente o escopo da tarefa
- [ ] Rodei lint
- [ ] Rodei testes
- [ ] Rodei build quando aplicável
- [ ] Atualizei docs/qa/TASK-XX.md
- [ ] Atualizei documentação funcional/técnica
- [ ] Não incluí secrets
- [ ] Gere uma mensagem de commit em pt-BR
```

---

## 15. Padrão de commits

Usar mensagens em português brasileiro:

```txt
TASK-04: implementar autenticação JWT com refresh token
TASK-06: adicionar controle de permissões por setor
TASK-12: implementar exportação de relatórios em PDF e Excel
TASK-17: adicionar logs de auditoria com filtros
```

---

## 16. Estratégia de branch e PR

Para cada tarefa:

```txt
branch: task/XX-descricao-curta
commit: TASK-XX: descrição curta
PR: [TASK-XX] Descrição curta
```

Exemplo:

```txt
branch: task/04-auth-jwt-refresh
commit: TASK-04: implementar autenticação JWT com refresh token
PR: [TASK-04] Implementa autenticação JWT com refresh token
```

---

## 17. Arquivos iniciais que o Codex deve criar

Na TASK-00, criar:

```txt
AGENTS.md
README.md
.env.example
.gitignore
.editorconfig
package.json
turbo.json
docker-compose.yml
docs/specs/README.md
docs/tasks/README.md
docs/adr/README.md
docs/qa/README.md
docs/handoff/README.md
```

---

## 18. Pendências de validação com cliente

Antes de integrar com produção, validar:

- endereço e método de acesso ao SQL Server;
- VPN ou rede interna;
- usuário dedicado de leitura;
- lista inicial de setores;
- lista inicial de relatórios;
- queries/views/stored procedures aprovadas;
- layout visual desejado;
- domínio e ambiente de hospedagem;
- política de retenção de logs;
- necessidade real de 2FA obrigatório;
- volume estimado de usuários e relatórios.

---

## 19. Escopo fora da V1

Manter fora do MVP inicial:

- aplicativo mobile;
- multi-tenancy para múltiplas empresas;
- data warehouse/ETL/OLAP;
- integração com Oracle, MySQL ou outros bancos;
- relatórios live em tempo real;
- assinatura digital ICP-Brasil;
- BI avançado com modelagem semântica;
- chat com IA para análise dos relatórios.

---

## 20. Recomendação final de execução

Para o Codex, o melhor caminho é:

1. Rodar `TASK-00` para criar estrutura e regras.
2. Rodar `TASK-01` e `TASK-02` separadamente.
3. Criar modelos e contratos compartilhados antes de telas complexas.
4. Implementar autenticação e permissões antes dos relatórios.
5. Criar SQL connector mockável antes de depender de banco real.
6. Usar dados mockados para frontend até o backend estabilizar.
7. Priorizar relatórios e exportação antes de dashboards avançados.
8. Só fazer hardening e deploy depois dos fluxos principais estarem cobertos por testes.

Este plano deve ser usado como o documento principal de execução do MVP no Codex.
