# SPEC-T04 — Catálogo de Relatórios

**ID:** T04
**Módulo:** Reports
**Fase:** Fase 1
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tela de listagem de relatórios por setor com busca, filtros e cards visuais.

## 2. Contexto

Tela inicial de relatórios para usuários autenticados. Exibe relatórios do setor do usuário (ou todos para admin). Integra com `reports.controller` (GET /reports).

## 3. Regras de Negócio

| Código | Regra                                          | Status     |
| ------ | ---------------------------------------------- | ---------- |
| RN-006 | Usuários só visualizam relatórios do seu setor | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário acessa `/app/reports`.
2. Frontend chama GET /reports com filtros (setor, tipo, busca).
3. API retorna relatórios filtrados pelo setor do usuário.
4. Frontend exibe cards com nome, descrição, setor, tipo.
5. Busca por nome ou descrição (termo parcial).

### Fluxo alternativo — Vazio

1. Nenhum relatório encontrado.
2. Frontend exibe estado vazio com mensagem.

## 5. Critérios de Aceite

- [x] Listagem de relatórios por setor com cards
- [x] Busca por nome ou descrição
- [x] Filtros por setor e tipo
- [x] Estados: loading, erro, vazio
- [x] Filtro automático por setor do usuário

## 6. Impacto Técnico

| Área           | Impacto                                                  |
| -------------- | -------------------------------------------------------- |
| Arquitetura    | Rota autenticada com JwtAuthGuard                        |
| Banco de dados | Consulta em api_report_definitions                       |
| API            | GET /reports com query params                            |
| Frontend       | /app/reports, reports-catalog.tsx                        |
| Testes         | Unit (reports-catalog), Integration (reports.controller) |
| Infraestrutura | Nenhuma adicional                                        |
| Segurança      | Filtro por setor no backend                              |

## 7. Testes Necessários

| Tipo        | Arquivo                    | Descrição                           |
| ----------- | -------------------------- | ----------------------------------- |
| Unit        | reports-catalog.tsx        | Filtragem, busca                    |
| Integration | reports.controller.spec.ts | GET /reports com filtros            |
| Manual      | —                          | Verificar busca com termos parciais |

## 8. Riscos

| Risco                     | Impacto                                 | Mitigação                     |
| ------------------------- | --------------------------------------- | ----------------------------- |
| Filtro apenas no frontend | Usuário vê relatórios de outros setores | Filtro obrigatório no backend |

## 9. Dependências

- `reports.controller` (GET /reports)
- `report-definitions.repository` (consulta por setor)
