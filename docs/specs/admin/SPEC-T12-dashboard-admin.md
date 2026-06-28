# SPEC-T12 — Dashboard Administrativo

**ID:** T12
**Módulo:** Admin
**Fase:** Fase 4
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Dashboard administrativo com KPIs operacionais, atividade recente e hub de navegação para funções admin.

## 2. Contexto

Tela inicial do hub admin (`/app/admin`). Exibe métricas: total de usuários, usuários ativos, total de grupos, total de exportações. Tabela com últimos 5 logs de auditoria. Cards de navegação para gestão. Gráficos de tendência são pendência (T12b).

## 3. Regras de Negócio

| Código | Regra                                                     | Status     |
| ------ | --------------------------------------------------------- | ---------- |
| RN-008 | Apenas Admin pode gerenciar usuários, grupos e permissões | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal

1. Admin acessa `/app/admin`.
2. Frontend chama GET /admin/dashboard.
3. API agrega métricas operacionais.
4. Frontend exibe KPIs em cards.
5. Tabela de atividade recente (últimos 5 logs).
6. Cards de navegação (usuários, grupos, configurações).

### Fluxo alternativo — Sem dados

1. Services retornam vazio.
2. Fallback para 0 em todos os contadores.
3. Tabela de atividade vazia com mensagem.

## 5. Critérios de Aceite

- [x] Endpoint GET /admin/dashboard agregando métricas
- [x] KPIs: total usuários, ativos, grupos, exportações
- [x] Tabela de atividade recente (últimos 5 logs)
- [x] Fallback para 0 quando services retornam vazio/erro
- [x] Cards de navegação (usuários, grupos, configurações)
- [x] Estados: loading, erro, vazio
- [ ] Gráficos de tendência (T12b)
- [ ] Alertas de segurança em tempo real
- [ ] Top relatórios/setores mais ativos

## 6. Impacto Técnico

| Área           | Impacto                                                             |
| -------------- | ------------------------------------------------------------------- |
| Arquitetura    | Rota admin com RolesGuard                                           |
| Banco de dados | Agregação em api_users, api_groups, api_export_jobs, api_audit_logs |
| API            | GET /admin/dashboard                                                |
| Frontend       | /app/admin, admin-dashboard.tsx                                     |
| Testes         | Unit (admin-dashboard.service, admin-dashboard.tsx)                 |
| Infraestrutura | Nenhuma adicional                                                   |
| Segurança      | RolesGuard admin                                                    |

## 7. Testes Necessários

| Tipo   | Arquivo                         | Descrição                                  |
| ------ | ------------------------------- | ------------------------------------------ |
| Unit   | admin-dashboard.service.spec.ts | getMetrics() com dados, vazio e erro       |
| Unit   | admin-dashboard.tsx             | Renderização de KPIs, loading, erro, vazio |
| Manual | —                               | Verificar métricas reais no hub admin      |

## 8. Riscos

| Risco                  | Impacto                   | Mitigação              |
| ---------------------- | ------------------------- | ---------------------- |
| Métricas em tempo real | Performance               | Cache de curta duração |
| Sem tracking histórico | Sem gráficos de tendência | T12b (pendente)        |

## 9. Dependências

- `admin-dashboard.service` (agregação de métricas)
- `admin-dashboard.controller` (endpoint)
- `audit.service` (atividade recente)
