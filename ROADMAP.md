# ROADMAP — Dashboard Power BI

**Fonte única de verdade para acompanhamento do projeto com base no escopo V1.**

- **Base do escopo:** `ESCOPO_DASHBOARD_Plataforma_BI_V1.pdf`
- **Análise de aderência:** `ANALISE_ESCOPO_V1.md`
- **Metodologia:** SDD (Spec-Driven Development) + TDD (Test-Driven Development)
- **Última atualização:** 2026-06-09

---

## Como usar este ROADMAP

Cada item segue o padrão **SDD + TDD**:

- **SDD — Especificação:** o que deve ser entregue, critérios funcionais, dependências
- **TDD — Testes:** testes unitários, integração, E2E, validação manual, comandos de verificação
- **Entregáveis:** arquivos, rotas, data de conclusão, notas e débitos técnicos

Documentos detalhados por categoria:

- [📋 Telas (18 do escopo V1)](docs/roadmap/01-telas.md)
- [📋 Módulos (6 funcionais)](docs/roadmap/02-modulos.md)
- [📋 Tarefas técnicas e infraestrutura](docs/roadmap/03-tarefas-tecnicas.md)

---

## Visão Geral de Progresso

| Categoria            | Concluído | Parcial | Pendente | Total |
| -------------------- | :-------: | :-----: | :------: | :---: |
| **Telas**            |    11     |    5    |    2     |  18   |
| **Módulos**          |     0     |    6    |    0     |   6   |
| **Tarefas Técnicas** |     6     |    1    |    5     |  12   |

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

| ID  | Tela                                         | Status       | Fase   |
| --- | -------------------------------------------- | ------------ | ------ |
| T01 | Login                                        | ✅ Concluído | Fase 1 |
| T02 | Recuperação de senha                         | ✅ Concluído | Fase 1 |
| T03 | Dashboard Home (KPIs)                        | ✅ Concluído | Fase 1 |
| T04 | Catálogo de relatórios                       | ✅ Concluído | Fase 1 |
| T05 | Visualização de relatório                    | ✅ Concluído | Fase 1 |
| T06 | Filtros avançados                            | ✅ Concluído | Fase 1 |
| T07 | Dashboard interativo (gráficos + drill-down) | ✅ Concluído | Fase 3 |
| T08 | Dashboards personalizados e favoritos        | ✅ Concluído | Fase 3 |
| T09 | Exportação PDF/Excel com histórico           | ✅ Concluído | Fase 3 |
| T10 | Meu perfil                                   | ✅ Concluído | Fase 2 |
| T11 | Central de notificações                      | ✅ Concluído | Fase 1 |
| T12 | Dashboard administrativo                     | 📋 Pendente  | Fase 4 |
| T13 | Gestão de usuários                           | ✅ Concluído | Fase 1 |
| T14 | Gestão de permissões                         | ✅ Concluído | Fase 2 |
| T15 | Gestão de relatórios (admin)                 | 🔄 Parcial   | Fase 2 |
| T16 | Editor visual drag-and-drop                  | 📋 Pendente  | Fase 3 |
| T17 | Auditoria com filtros                        | ✅ Concluído | Fase 2 |
| T18 | Configurações do sistema                     | ✅ Concluído | Fase 1 |

---

## Resumo por Módulo

| Módulo      | Status     |                                     Concluído                                     |       Parcial        |         Pendente          |
| ----------- | ---------- | :-------------------------------------------------------------------------------: | :------------------: | :-----------------------: |
| AUTH        | 🔄 Parcial |        Login, JWT, refresh, logout, reset, rate limit, profile, CSRF, CSP         |       2FA/TOTP       |      Hardening final      |
| PERMISSIONS | 🔄 Parcial |             Roles, setores, grupos, permissões granulares, auditoria              |  Herança via grupos  |       Regras finas        |
| SQL         | 🔄 Parcial |               Queries parametrizadas, validação de identificadores                | Cache, monitoramento |   Cron, observabilidade   |
| REPORTS     | 🔄 Parcial | Catálogo, visualização, filtros, admin básico, persistência real, export pipeline |  Ampliar favoritos   |             —             |
| BI          | 🔄 Parcial |            KPIs, payload consolidado, charts reais, drill-down inicial            |    Editor visual     | Drill-down multi-dimensão |
| ADMIN       | 🔄 Parcial |                 Usuários, grupos, permissões, auditoria, settings                 |   Dashboard admin    |    Governança completa    |

---

## Notas e Próximos Passos

1. **Próxima onda:** Fase 3 — BI avançado e dashboards personalizados
2. **Prioridade imediata:** Integrar Recharts em telas ativas (T07)
3. **Débito técnico crítico:** 2FA/TOTP (Fase 4)
4. **Verificação antes de cada commit:** `pnpm verify:docs`, `pnpm typecheck`, `pnpm test`, `pnpm build`

---

_Este ROADMAP é a fonte única de verdade. Toda mudança de escopo ou prioridade deve ser refletida aqui e nos documentos vinculados em `docs/roadmap/`._
