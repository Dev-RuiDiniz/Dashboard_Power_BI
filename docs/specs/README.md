# docs/specs — Especificações SDD

**Projeto:** Dashboard Power BI
**Metodologia:** Specification-Driven Development (SDD)

---

## O que é esta pasta

Esta pasta contém todas as especificações formais do projeto, organizadas por módulo funcional. Cada spec segue o modelo SDD definido no `AGENTS.md`.

Toda funcionalidade — existente ou pendente — deve ter uma spec correspondente aqui.

---

## Índice de Specs

### Auth

| Spec                                                                 | Tela/Tarefa                          | Status    |
| -------------------------------------------------------------------- | ------------------------------------ | --------- |
| [SPEC-auth-modulo](auth/SPEC-auth-modulo.md)                         | Módulo Auth (geral)                  | Parcial   |
| [SPEC-T01-login](auth/SPEC-T01-login.md)                             | T01 — Login                          | Concluído |
| [SPEC-T02-recuperacao-senha](auth/SPEC-T02-recuperacao-senha.md)     | T02 — Recuperação de senha           | Concluído |
| [SPEC-T10-perfil](auth/SPEC-T10-perfil.md)                           | T10 — Meu perfil                     | Concluído |
| [SPEC-DT-001-2fa-obrigatorio](auth/SPEC-DT-001-2fa-obrigatorio.md)   | DT-001 — 2FA obrigatório para admins | Concluído |
| [SPEC-DT-002-hardening-sessao](auth/SPEC-DT-002-hardening-sessao.md) | DT-002 — Hardening final de sessão   | Concluído |

### Permissions

| Spec                                                                    | Tela/Tarefa                               | Status    |
| ----------------------------------------------------------------------- | ----------------------------------------- | --------- |
| [SPEC-permissions-modulo](permissions/SPEC-permissions-modulo.md)       | Módulo Permissions (geral)                | Parcial   |
| [SPEC-T13-gestao-usuarios](permissions/SPEC-T13-gestao-usuarios.md)     | T13 — Gestão de usuários                  | Concluído |
| [SPEC-T14-gestao-permissoes](permissions/SPEC-T14-gestao-permissoes.md) | T14 — Gestão de permissões                | Concluído |
| [SPEC-DT-003-heranca-grupos](permissions/SPEC-DT-003-heranca-grupos.md) | DT-003 — Herança de permissões via grupos | Concluído |

### SQL Server

| Spec                                                           | Tela/Tarefa               | Status  |
| -------------------------------------------------------------- | ------------------------- | ------- |
| [SPEC-sql-server-modulo](sql-server/SPEC-sql-server-modulo.md) | Módulo SQL Server (geral) | Parcial |

### Reports

| Spec                                                      | Tela/Tarefa                        | Status    |
| --------------------------------------------------------- | ---------------------------------- | --------- |
| [SPEC-reports-modulo](reports/SPEC-reports-modulo.md)     | Módulo Reports (geral)             | Parcial   |
| [SPEC-T04-catalogo](reports/SPEC-T04-catalogo.md)         | T04 — Catálogo de relatórios       | Concluído |
| [SPEC-T05-visualizacao](reports/SPEC-T05-visualizacao.md) | T05 — Visualização de relatório    | Concluído |
| [SPEC-T06-filtros](reports/SPEC-T06-filtros.md)           | T06 — Filtros avançados            | Concluído |
| [SPEC-T09-exportacao](reports/SPEC-T09-exportacao.md)     | T09 — Exportação PDF/Excel         | Parcial   |
| [SPEC-T15-gestao-admin](reports/SPEC-T15-gestao-admin.md) | T15 — Gestão de relatórios (admin) | Concluído |
| [SPEC-T09b-bullmq](reports/SPEC-T09b-bullmq.md)           | T09b — Pipeline BullMQ + Redis     | Concluído |

### BI

| Spec                                                                           | Tela/Tarefa                       | Status             |
| ------------------------------------------------------------------------------ | --------------------------------- | ------------------ |
| [SPEC-bi-modulo](bi/SPEC-bi-modulo.md)                                         | Módulo BI (geral)                 | Parcial            |
| [SPEC-T03-dashboard-home](bi/SPEC-T03-dashboard-home.md)                       | T03 — Dashboard Home (KPIs)       | Concluído          |
| [SPEC-T07-dashboard-interativo](bi/SPEC-T07-dashboard-interativo.md)           | T07 — Dashboard interativo        | Concluído          |
| [SPEC-T08-dashboards-personalizados](bi/SPEC-T08-dashboards-personalizados.md) | T08 — Dashboards personalizados   | Parcial            |
| [SPEC-T16-editor-visual](bi/SPEC-T16-editor-visual.md)                         | T16 — Editor visual drag-and-drop | Concluído (mínimo) |
| [SPEC-T16b-editor-completo](bi/SPEC-T16b-editor-completo.md)                   | T16b — Editor visual completo     | Pendente           |
| [SPEC-T07b-drilldown-multi](bi/SPEC-T07b-drilldown-multi.md)                   | T07b — Drill-down multi-dimensão  | Pendente           |

### Admin

| Spec                                                                  | Tela/Tarefa                    | Status    |
| --------------------------------------------------------------------- | ------------------------------ | --------- |
| [SPEC-admin-modulo](admin/SPEC-admin-modulo.md)                       | Módulo Admin (geral)           | Parcial   |
| [SPEC-T12-dashboard-admin](admin/SPEC-T12-dashboard-admin.md)         | T12 — Dashboard administrativo | Concluído |
| [SPEC-T11-notificacoes](admin/SPEC-T11-notificacoes.md)               | T11 — Central de notificações  | Concluído |
| [SPEC-T17-auditoria](admin/SPEC-T17-auditoria.md)                     | T17 — Auditoria com filtros    | Concluído |
| [SPEC-T18-configuracoes](admin/SPEC-T18-configuracoes.md)             | T18 — Configurações do sistema | Concluído |
| [SPEC-T12b-graficos-tendencia](admin/SPEC-T12b-graficos-tendencia.md) | T12b — Gráficos de tendência   | Pendente  |

### Transversal

| Spec                                                                  | Tela/Tarefa                          | Status    |
| --------------------------------------------------------------------- | ------------------------------------ | --------- |
| [SPEC-DT-004-cache-queries](transversal/SPEC-DT-004-cache-queries.md) | DT-004 — Cache de queries SQL Server | Concluído |
| [SPEC-DT-005-testes-e2e](transversal/SPEC-DT-005-testes-e2e.md)       | DT-005 — Testes E2E (Playwright)     | Pendente  |
| [SPEC-DT-006-lgpd-retencao](transversal/SPEC-DT-006-lgpd-retencao.md) | DT-006 — Política de retenção LGPD   | Pendente  |

---

## Template SDD

Toda spec deve seguir este template:

```markdown
# SPEC-[ID] — [Título]

**ID:** [identificador]
**Módulo:** [módulo]
**Fase:** [fase]
**Status:** [Concluído | Parcial | Pendente]
**Atualizado em:** [data]

---

## 1. Objetivo

[O que esta spec entrega.]

## 2. Contexto

[Background, módulo, telas relacionadas, fase do roadmap.]

## 3. Regras de Negócio

| Código | Regra       | Status                |
| ------ | ----------- | --------------------- |
| RN-XXX | [descrição] | [Confirmado/Pendente] |

## 4. Fluxo Esperado

### Fluxo principal

1. [passo]
2. [passo]

### Fluxos alternativos

- [cenário alternativo]

## 5. Critérios de Aceite

- [ ] [critério verificável]

## 6. Impacto Técnico

| Área           | Impacto     |
| -------------- | ----------- |
| Arquitetura    | [descrição] |
| Banco de dados | [descrição] |
| API            | [descrição] |
| Frontend       | [descrição] |
| Testes         | [descrição] |
| Infraestrutura | [descrição] |
| Segurança      | [descrição] |

## 7. Testes Necessários

| Tipo        | Arquivo     | Descrição   |
| ----------- | ----------- | ----------- |
| Unit        | [arquivo]   | [descrição] |
| Integration | [arquivo]   | [descrição] |
| E2E         | [arquivo]   | [descrição] |
| Manual      | [descrição] | —           |

## 8. Riscos

| Risco   | Impacto   | Mitigação   |
| ------- | --------- | ----------- |
| [risco] | [impacto] | [mitigação] |

## 9. Dependências

- [dependência]
```

---

## Convenções

- **Status da spec** reflete o estado de implementação, não da spec em si.
- Toda spec deve ser atualizada quando o status mudar.
- Specs de itens concluídos documentam o que foi entregue.
- Specs de itens pendentes documentam o que deve ser entregue.
- Toda spec nova deve ser criada antes da implementação (SDD).
- Toda spec deve ter pelo menos um critério de aceite verificável.
