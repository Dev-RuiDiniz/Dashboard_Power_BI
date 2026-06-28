# SPEC-T16 — Editor Visual Drag-and-Drop (Mínimo)

**ID:** T16
**Módulo:** BI
**Fase:** Fase 3
**Status:** Concluído (mínimo)
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Editor visual mínimo com reordenação de widgets via drag-and-drop, toggle de modo edição e persistência da ordem.

## 2. Contexto

Implementado na tela de detalhe do dashboard. Usa @dnd-kit/sortable para reordenação. Grid responsivo mantido (md:grid-cols-2). Persistência via PATCH /dashboards/:id/widgets/reorder (batch). Editor completo (redimensionamento, paleta, canvas livre) é pendência (T16b).

## 3. Regras de Negócio

| Código | Regra                                              | Status     |
| ------ | -------------------------------------------------- | ---------- |
| RN-018 | Dashboards personalizados são privados por usuário | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário abre dashboard personalizado.
2. Clica toggle "Editar layout".
3. Widgets ficam arrastáveis.
4. Usuário arrasta widgets para reordenar.
5. Clica "Concluir".
6. Frontend envia nova ordem via PATCH /dashboards/:id/widgets/reorder.
7. Ordem persistida no backend.
8. Widgets re-renderizam na nova ordem.

### Fluxo alternativo — Cancelar

1. Usuário clica "Cancelar" no modo edição.
2. Ordem original restaurada.
3. Modo edição desativado.

## 5. Critérios de Aceite

- [x] Modo de edição com toggle "Editar layout" / "Concluir"
- [x] Reordenação de widgets via drag-and-drop (@dnd-kit/sortable)
- [x] Grid responsivo mantido (md:grid-cols-2)
- [x] Persistência da ordem via PATCH /dashboards/:id/widgets/reorder (batch)
- [x] Fallback em memória funcional
- [x] Cancelar restaura ordem original

## 6. Impacto Técnico

| Área           | Impacto                                                                            |
| -------------- | ---------------------------------------------------------------------------------- |
| Arquitetura    | Componente DnD no frontend, endpoint reorder no backend                            |
| Banco de dados | Update em api_widgets (ordem)                                                      |
| API            | PATCH /dashboards/:id/widgets/reorder                                              |
| Frontend       | dashboard-detail.tsx, sortable-widget-card.tsx, widget-card.tsx                    |
| Testes         | Unit (dashboard-detail, sortable-widget-card), Integration (dashboards.controller) |
| Infraestrutura | Nenhuma adicional                                                                  |
| Segurança      | JwtAuthGuard, dashboards privados                                                  |

## 7. Testes Necessários

| Tipo        | Arquivo                       | Descrição                                         |
| ----------- | ----------------------------- | ------------------------------------------------- |
| Unit        | dashboard-detail.tsx          | Modo edição, drag-and-drop                        |
| Unit        | sortable-widget-card.tsx      | Eventos DnD                                       |
| Integration | dashboards.controller.spec.ts | Endpoint reorderWidgets                           |
| Manual      | —                             | Reordenar → concluir → recarregar → ordem mantida |

## 8. Riscos

| Risco              | Impacto                   | Mitigação                               |
| ------------------ | ------------------------- | --------------------------------------- |
| DnD em mobile      | UX degradada em touch     | @dnd-kit suporta touch                  |
| Ordem não persiste | Usuário perde reordenação | Fallback em memória + persistência real |

## 9. Dependências

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (instalados)
- `dashboards.controller` (PATCH /reorder)
- `reorder-widgets.dto` (validação)
