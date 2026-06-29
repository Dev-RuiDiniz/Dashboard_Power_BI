# ROADMAP.md — Roadmap de Desenvolvimento

**Projeto:** Dashboard Power BI
**Atualizado em:** 2026-06-28
**Metodologia:** Specification-Driven Development (SDD) + Test-Driven Development (TDD)

**Fonte única de verdade para acompanhamento do projeto com base no escopo V1.**

- **Base do escopo:** `ESCOPO_DASHBOARD_Plataforma_BI_V1.md`
- **Análise de aderência:** `ANALISE_ESCOPO_V1.md`
- **Escopo consolidado:** `ESCOPO.md`

---

## 1. Visão Geral do Roadmap

O projeto evolui em fases, épicos, histórias e tarefas. Cada item segue o padrão **SDD + TDD**:

- **SDD — Especificação:** o que deve ser entregue, critérios funcionais, dependências
- **TDD — Testes:** testes unitários, integração, E2E, validação manual, comandos de verificação
- **Entregáveis:** arquivos, rotas, data de conclusão, notas e débitos técnicos

Documentos detalhados por categoria:

- [📋 Telas (18 do escopo V1)](docs/roadmap/01-telas.md)
- [📋 Módulos (6 funcionais)](docs/roadmap/02-modulos.md)
- [📋 Tarefas técnicas e infraestrutura](docs/roadmap/03-tarefas-tecnicas.md)

---

## 2. Convenções de Status

- `PENDENTE` — não iniciado
- `EM ESPECIFICAÇÃO` — SDD em andamento
- `ESPECIFICADO` — especificação concluída, aguardando implementação
- `EM TESTE` — TDD em andamento (fase RED/GREEN)
- `EM DESENVOLVIMENTO` — implementação em andamento
- `EM REVISÃO` — implementação concluída, aguardando validação
- `CONCLUÍDO` — validado, testado e documentado
- `BLOQUEADO` — impedido por dependência externa
- `CANCELADO` — descartado ou fora de escopo

---

## Visão Geral de Progresso

| Categoria            | Concluído | Parcial | Pendente | Total |
| -------------------- | :-------: | :-----: | :------: | :---: |
| **Telas**            |    11     |    5    |    2     |  18   |
| **Módulos**          |     0     |    6    |    0     |   6   |
| **Tarefas Técnicas** |     8     |    1    |    3     |  12   |

---

## Fases de Entrega

| Fase       | Nome                       | Objetivo                                                                | Status             |
| ---------- | -------------------------- | ----------------------------------------------------------------------- | ------------------ |
| **Fase 0** | Fundação técnica           | Monorepo, Docker, CI/CD, testes base                                    | ✅ Concluído       |
| **Fase 1** | Auth e plataforma base     | Login, JWT, refresh, admin users/groups, relatórios                     | ✅ Concluído       |
| **Fase 2** | Administração e governança | Permissões, auditoria, settings, profile, segurança                     | ✅ Concluído       |
| **Fase 3** | BI avançado e dashboards   | Gráficos Recharts, drill-down, dashboards personalizados, editor visual | 🔄 Em planejamento |
| **Fase 4** | Hardening e fechamento     | 2FA/TOTP, testes E2E, documentação final de aceite                      | 📋 Pendente        |

---

## Resumo por Tela

| ID  | Tela                                         | Status                | Fase   |
| --- | -------------------------------------------- | --------------------- | ------ |
| T01 | Login                                        | ✅ Concluído          | Fase 1 |
| T02 | Recuperação de senha                         | ✅ Concluído          | Fase 1 |
| T03 | Dashboard Home (KPIs)                        | ✅ Concluído          | Fase 1 |
| T04 | Catálogo de relatórios                       | ✅ Concluído          | Fase 1 |
| T05 | Visualização de relatório                    | ✅ Concluído          | Fase 1 |
| T06 | Filtros avançados                            | ✅ Concluído          | Fase 1 |
| T07 | Dashboard interativo (gráficos + drill-down) | ✅ Concluído          | Fase 3 |
| T08 | Dashboards personalizados e favoritos        | ✅ Concluído          | Fase 3 |
| T09 | Exportação PDF/Excel com histórico           | ✅ Concluído          | Fase 3 |
| T10 | Meu perfil                                   | ✅ Concluído          | Fase 2 |
| T11 | Central de notificações                      | ✅ Concluído          | Fase 1 |
| T12 | Dashboard administrativo                     | ✅ Concluído          | Fase 4 |
| T13 | Gestão de usuários                           | ✅ Concluído          | Fase 1 |
| T14 | Gestão de permissões                         | ✅ Concluído          | Fase 2 |
| T15 | Gestão de relatórios (admin)                 | ✅ Concluído          | Fase 2 |
| T16 | Editor visual drag-and-drop                  | ✅ Concluído (mínimo) | Fase 3 |
| T17 | Auditoria com filtros                        | ✅ Concluído          | Fase 2 |
| T18 | Configurações do sistema                     | ✅ Concluído          | Fase 1 |

---

## Resumo por Módulo

| Módulo      | Status     |                                       Concluído                                       |         Parcial          |         Pendente          |
| ----------- | ---------- | :-----------------------------------------------------------------------------------: | :----------------------: | :-----------------------: |
| AUTH        | 🔄 Parcial |     Login, JWT, refresh, logout, reset, rate limit, profile, CSRF, CSP, 2FA/TOTP      |     Hardening final      |    Forçar 2FA por role    |
| PERMISSIONS | 🔄 Parcial |               Roles, setores, grupos, permissões granulares, auditoria                |    Herança via grupos    |       Regras finas        |
| SQL         | 🔄 Parcial |                 Queries parametrizadas, validação de identificadores                  |   Cache, monitoramento   |   Cron, observabilidade   |
| REPORTS     | 🔄 Parcial |   Catálogo, visualização, filtros, admin básico, persistência real, export pipeline   |    Ampliar favoritos     |             —             |
| BI          | 🔄 Parcial | KPIs, payload consolidado, charts reais, sparklines, drill-down, editor visual mínimo |  Editor visual completo  | Drill-down multi-dimensão |
| ADMIN       | 🔄 Parcial |        Usuários, grupos, permissões, auditoria, settings, dashboard admin KPIs        | Dashboard admin completo |    Governança completa    |

---

## 4. Backlog Geral

| ID      | Tipo           | Descrição                                      | Prioridade | Status             |
| ------- | -------------- | ---------------------------------------------- | ---------- | ------------------ |
| EP-0001 | Épico          | Criar governança do repositório                | Alta       | CONCLUÍDO          |
| EP-0002 | Épico          | Mapear arquitetura                             | Alta       | CONCLUÍDO          |
| EP-0003 | Épico          | Mapear banco de dados                          | Alta       | CONCLUÍDO          |
| EP-0004 | Épico          | Definir escopo inicial                         | Alta       | CONCLUÍDO          |
| EP-0005 | Épico          | Definir estratégia de testes                   | Alta       | CONCLUÍDO          |
| T16b    | Tarefa         | Editor visual drag-and-drop completo           | Alta       | EM DESENVOLVIMENTO |
| T07b    | Tarefa         | Drill-down multi-dimensão                      | Média      | PENDENTE           |
| T08b    | Tarefa         | Widgets editáveis e dashboard padrão por setor | Média      | PENDENTE           |
| T09b    | Tarefa         | Pipeline BullMQ + Redis para exports           | Média      | CONCLUÍDO          |
| T12b    | Tarefa         | Dashboard admin com gráficos de tendência      | Baixa      | PENDENTE           |
| DT-001  | Débito técnico | 2FA obrigatório para admins                    | Alta       | CONCLUÍDO          |
| DT-002  | Débito técnico | Hardening final de sessão                      | Alta       | CONCLUÍDO          |
| DT-003  | Débito técnico | Herança de permissões via grupos               | Média      | CONCLUÍDO          |
| DT-004  | Débito técnico | Cache de queries SQL Server                    | Média      | CONCLUÍDO          |
| DT-005  | Débito técnico | Testes E2E (Playwright)                        | Média      | PENDENTE           |
| DT-006  | Débito técnico | Política de retenção de logs (LGPD)            | Alta       | CONCLUÍDO          |

---

## 5. Matriz SDD/TDD por Tarefa

| ID  | Tarefa                    | Spec criada | Teste criado | Implementado | Documentado |
| --- | ------------------------- | ----------- | ------------ | ------------ | ----------- |
| T01 | Login                     | Sim         | Sim          | Sim          | Sim         |
| T02 | Recuperação de senha      | Sim         | Sim          | Sim          | Sim         |
| T03 | Dashboard Home            | Sim         | Sim          | Sim          | Sim         |
| T04 | Catálogo de relatórios    | Sim         | Sim          | Sim          | Sim         |
| T05 | Visualização de relatório | Sim         | Sim          | Sim          | Sim         |
| T06 | Filtros avançados         | Sim         | Sim          | Sim          | Sim         |
| T07 | Dashboard interativo      | Sim         | Sim          | Sim          | Sim         |
| T08 | Dashboards personalizados | Sim         | Sim          | Parcial      | Sim         |
| T09 | Exportação PDF/Excel      | Sim         | Sim          | Sim          | Sim         |
| T10 | Meu perfil                | Sim         | Sim          | Sim          | Sim         |
| T11 | Notificações              | Sim         | Sim          | Sim          | Sim         |
| T12 | Dashboard administrativo  | Sim         | Sim          | Sim          | Sim         |
| T13 | Gestão de usuários        | Sim         | Sim          | Sim          | Sim         |
| T14 | Gestão de permissões      | Sim         | Sim          | Sim          | Sim         |
| T15 | Gestão de relatórios      | Sim         | Sim          | Sim          | Sim         |
| T16 | Editor visual             | Sim         | Sim          | Sim          | Sim         |
| T17 | Auditoria                 | Sim         | Sim          | Sim          | Sim         |
| T18 | Configurações do sistema  | Sim         | Sim          | Sim          | Sim         |

---

## 6. Definição de Pronto

Uma tarefa só é considerada pronta quando:

- [ ] Requisito documentado
- [ ] Critérios de aceite definidos
- [ ] Teste criado ou justificativa registrada
- [ ] Implementação concluída
- [ ] Testes passando (`pnpm test`, `pnpm typecheck`)
- [ ] Documentação atualizada
- [ ] `CONTEXTO.md` atualizado
- [ ] `RELATORIO.md` atualizado

---

## Notas e Próximos Passos

1. **Próxima onda:** Fase 4 — Hardening de sessão, 2FA por role e segurança operacional
2. **Concluído:** Editor visual drag-and-drop completo (T16b) — 2026-06-28
3. **Débito técnico crítico:** Hardening final de sessão e 2FA por role (Fase 4)
4. **Verificação antes de cada commit:** `pnpm verify:docs`, `pnpm typecheck`, `pnpm test`, `pnpm build`

---

_Este ROADMAP é a fonte única de verdade. Toda mudança de escopo ou prioridade deve ser refletida aqui e nos documentos vinculados em `docs/roadmap/`._
