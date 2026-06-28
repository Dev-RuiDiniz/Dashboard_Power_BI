# SPEC-T06 — Filtros Avançados

**ID:** T06
**Módulo:** Reports
**Fase:** Fase 1
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Painel de filtros avançados para relatórios com múltiplos tipos, composição AND/OR e persistência na URL.

## 2. Contexto

Componente integrado à visualização de relatório (T05). Permite filtrar resultados por texto, data, número e dropdown, com composição de múltiplos filtros. Filtros são persistidos na URL (query params) para compartilhamento e refresh.

## 3. Regras de Negócio

Nenhuma RN específica. Aplica RN-006 (filtro por setor no backend).

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário abre relatório com parâmetros.
2. Painel de filtros exibe campos por tipo (texto, data, número, dropdown).
3. Usuário aplica múltiplos filtros.
4. Filtros serializados para query params na URL.
5. Execução considera filtros aplicados.
6. Refresh da página mantém filtros (lidos da URL).

### Fluxo — Limpar filtros

1. Usuário clica "Limpar".
2. Todos os filtros removidos.
3. URL limpa.
4. Resultados sem filtro.

## 5. Critérios de Aceite

- [x] Painel de filtros por tipo: texto, data, número, dropdown
- [x] Composição de múltiplos filtros com operadores AND/OR
- [x] Persistência de filtros na URL (query params)
- [x] Aplicação e limpeza de filtros
- [x] Filtros mantidos após refresh

## 6. Impacto Técnico

| Área           | Impacto                                                       |
| -------------- | ------------------------------------------------------------- |
| Arquitetura    | Componente frontend, serialização para URL                    |
| Banco de dados | Nenhum direto (filtros aplicados na query)                    |
| API            | Filtros passados como parâmetros em POST /reports/:id/execute |
| Frontend       | report-advanced-filters.tsx, report-filters.ts                |
| Testes         | Unit (report-advanced-filters, report-filters)                |
| Infraestrutura | Nenhuma adicional                                             |
| Segurança      | Filtros sanitizados antes de enviar à API                     |

## 7. Testes Necessários

| Tipo   | Arquivo                     | Descrição                           |
| ------ | --------------------------- | ----------------------------------- |
| Unit   | report-advanced-filters.tsx | Composição de filtros               |
| Unit   | report-filters.ts           | Serialização/deserialização         |
| Manual | —                           | Verificar persistência após refresh |

## 8. Riscos

| Risco                   | Impacto              | Mitigação                              |
| ----------------------- | -------------------- | -------------------------------------- |
| URL muito longa         | Limite de caracteres | Compactar ou limitar número de filtros |
| Filtros não sanitizados | SQL injection        | Sanitizar no frontend e backend        |

## 9. Dependências

- `report-detail.tsx` (integração)
- `report-filters.ts` (serialização/deserialização)
