# SPEC-T08b — Dashboard Padrão por Setor

**ID:** T08b
**Módulo:** BI
**Fase:** Fase 3
**Status:** Concluído
**Atualizado em:** 2026-06-29

---

## 1. Objetivo

Implementar dashboards pré-configurados por setor (produção, comercial, algodoeira, diretoria) que servem como template inicial quando um usuário acessa `/app/dashboards` sem nenhum dashboard criado.

## 2. Contexto

Hoje o usuário encontra a tela `/app/dashboards` vazia quando não criou dashboards manualmente. O objetivo é que, ao listar dashboards e encontrar vazio, o sistema crie automaticamente um dashboard padrão baseado no setor do usuário, já populado com widgets de KPIs relevantes àquela área.

**Mapeamento setor → business area → KPIs:**

| SectorCode             | BusinessArea | KPIs                                                                                                              |
| ---------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `operacoes`            | `producao`   | producao-plantio-area, producao-operacoes-plantio, producao-colheita-area, producao-variedades, producao-talhoes  |
| `comercial`            | `comercial`  | comercial-contratos, comercial-quantidade-entregue, comercial-quantidade-pendente, comercial-quantidade-devolvida |
| `financeiro`           | `algodoeira` | algodoeira-contratos, algodoeira-embarques, algodoeira-fardos                                                     |
| `diretoria` (ou vazio) | todas        | dashboard executivo com KPIs de todas as áreas                                                                    |

## 3. Regras de Negócio

| Código | Regra                                                                                | Status           |
| ------ | ------------------------------------------------------------------------------------ | ---------------- |
| RN-019 | Dashboard padrão é criado apenas quando o usuário não possui nenhum dashboard        | Em implementação |
| RN-020 | O template é determinado pelo setor do usuário autenticado                           | Em implementação |
| RN-021 | Usuários da diretoria recebem dashboard executivo com KPIs de todas as áreas         | Em implementação |
| RN-022 | Dashboard padrão é privativo do usuário (mesmas regras de dashboards personalizados) | Em implementação |
| RN-023 | Widgets KPI são pré-populados com position e displayOrder pré-definidos              | Em implementação |

## 4. Fluxo Esperado

### Fluxo principal — Seed automático

1. Usuário acessa `/app/dashboards`.
2. Frontend chama `GET /dashboards`.
3. Backend lista dashboards do usuário.
4. Se vazio, backend cria dashboard padrão baseado em `user.sectors`.
5. Dashboard é criado com widgets KPI pré-configurados.
6. Backend retorna lista com o dashboard recém-criado.
7. Frontend exibe banner informando que um dashboard padrão foi criado.

### Fluxo — Usuário já tem dashboards

1. Usuário acessa `/app/dashboards`.
2. Backend lista dashboards existentes.
3. Retorna lista normalmente (seed não é executado).

## 5. Critérios de Aceite

- [ ] Usuário sem dashboards recebe dashboard padrão do seu setor automaticamente
- [ ] Dashboard padrão vem com widgets KPI pré-populados
- [ ] Usuário da diretoria recebe dashboard executivo com KPIs de todas as áreas
- [ ] Usuário com dashboards existentes não recebe seed
- [ ] Funciona em modo memória e Supabase
- [ ] Banner de boas-vindas exibido no frontend quando dashboard é criado
- [ ] Banner é dismissível

## 6. Impacto Técnico

| Área           | Impacto                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| Arquitetura    | Novo método em `DashboardsService`, templates constant, modificação no controller |
| Banco de dados | Sem migrations (usa tabela `dashboards` + `dashboard_widgets` existente)          |
| API            | `GET /dashboards` pode criar dashboards como side-effect quando vazio             |
| Frontend       | Banner informativo no `DashboardWorkspace`                                        |
| Testes         | 5+ novos testes (backend + frontend)                                              |
| Infraestrutura | Nenhuma adicional                                                                 |
| Segurança      | Dashboards privados por usuário, JwtAuthGuard                                     |

## 7. Testes Necessários

| Tipo        | Arquivo                      | Descrição                                                     |
| ----------- | ---------------------------- | ------------------------------------------------------------- |
| Unit        | dashboards.service.spec.ts   | Seed por setor, diretoria, não duplica, widgets pré-populados |
| Unit        | dashboard-workspace.test.tsx | Banner de boas-vindas aparece e é dismissível                 |
| Integration | —                            | GET /dashboards cria seed quando vazio                        |

## 8. Riscos

| Risco              | Impacto                                         | Mitigação                                        |
| ------------------ | ----------------------------------------------- | ------------------------------------------------ |
| Side-effect em GET | Não-RESTful                                     | Documentar claramente; aceitável para V1         |
| Race condition     | Dois requests podem criar dashboards duplicados | Aceitável para V1 (modo memória é single-thread) |

## 9. Dependências

- `DashboardsService` (CRUD existente)
- `DashboardService` (KPI definitions por business area)
- `AuthenticatedRequestUser.sectors` (setor do usuário no JWT)
