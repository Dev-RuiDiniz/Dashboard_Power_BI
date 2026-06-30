# SPEC-T12b — Gráficos de Tendência no Dashboard Admin

**ID:** T12b
**Módulo:** Admin
**Fase:** Fase 4
**Status:** Em implementação
**Atualizado em:** 2026-06-29

---

## 1. Objetivo

Adicionar gráficos de tendência ao dashboard administrativo: usuários novos, execuções por período, top relatórios e setores mais ativos.

## 2. Contexto

O dashboard admin atual (T12) exibe KPIs em cards (totais) e tabela de atividade recente. Esta spec adiciona gráficos Recharts de tendência temporal, top relatórios e top setores. **Não requer sistema de tracking separado** — os dados já têm timestamps (`AuditLog.createdAt`, `ExportJobRecord.created_at`, `AuthUser.createdAt`) e podem ser agregados diretamente.

## 3. Regras de Negócio

| Código | Regra                                                     | Status     |
| ------ | --------------------------------------------------------- | ---------- |
| RN-008 | Apenas Admin pode gerenciar usuários, grupos e permissões | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal

1. Admin acessa `/app/admin`.
2. Frontend chama GET /admin/dashboard/trends.
3. API retorna dados históricos agregados.
4. Frontend exibe gráficos:
   a. Usuários novos por mês (line chart).
   b. Execuções de relatórios por semana (bar chart).
   c. Top 5 relatórios mais executados (pie/bar).
   d. Top 5 setores com mais atividade (bar).

### Fluxo alternativo — Sem dados históricos

1. Sem tracking suficiente.
2. Gráficos exibem estado vazio.
3. Mensagem "Dados insuficientes para tendência".

## 5. Critérios de Aceite

- [ ] Endpoint GET /admin/dashboard/trends
- [ ] Gráfico de usuários novos por mês (line/area)
- [ ] Gráfico de atividade por semana (bar)
- [ ] Gráfico de exports por semana (bar)
- [ ] Top 5 relatórios mais executados (bar horizontal)
- [ ] Top 5 setores com mais atividade (bar horizontal)
- [ ] Estados: loading, erro, vazio
- [ ] Responsivo

## 6. Impacto Técnico

| Área           | Impacto                                                                    |
| -------------- | -------------------------------------------------------------------------- |
| Arquitetura    | Novo endpoint de trends, tracking histórico                                |
| Banco de dados | Sem migrations — agrega de tabelas existentes (audit_logs, exports, users) |
| API            | GET /admin/dashboard/trends                                                |
| Frontend       | Gráficos Recharts no admin-dashboard.tsx                                   |
| Testes         | Unit (trends), Integration (endpoint)                                      |
| Infraestrutura | Nenhuma adicional                                                          |
| Segurança      | RolesGuard admin                                                           |

## 7. Testes Necessários

| Tipo        | Arquivo                            | Descrição                             |
| ----------- | ---------------------------------- | ------------------------------------- |
| Unit        | admin-dashboard.tsx                | Renderização de gráficos de tendência |
| Integration | admin-dashboard.controller.spec.ts | Endpoint trends com dados e vazio     |
| Manual      | —                                  | Verificar gráficos com dados reais    |

## 8. Riscos

| Risco                    | Impacto         | Mitigação                   |
| ------------------------ | --------------- | --------------------------- |
| Sem dados suficientes    | Gráficos vazios | Estado vazio com mensagem   |
| Performance em agregação | Dashboard lento | Agregação no backend, cache |

## 9. Dependências

- T12 (dashboard admin) — concluído
- `recharts` (instalado)
- Dados com timestamps já disponíveis em audit_logs, exports e users
