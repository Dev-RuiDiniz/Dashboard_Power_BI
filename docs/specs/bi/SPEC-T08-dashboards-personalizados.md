# SPEC-T08 — Dashboards Personalizados e Favoritos

**ID:** T08
**Módulo:** BI
**Fase:** Fase 3
**Status:** Parcial
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Permitir que usuários criem dashboards personalizados com widgets configuráveis, salvem layouts e gerenciem favoritos.

## 2. Contexto

Tela `/app/dashboards` onde usuários criam e gerenciam dashboards personalizados. Widgets: KPI, gráfico, tabela. Layouts persistidos no backend. Editor visual mínimo (reordenação) implementado, editor completo é pendência (T16b).

## 3. Regras de Negócio

| Código | Regra                                              | Status     |
| ------ | -------------------------------------------------- | ---------- |
| RN-018 | Dashboards personalizados são privados por usuário | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Criar dashboard

1. Usuário acessa `/app/dashboards`.
2. Clica "Novo dashboard".
3. Define nome.
4. Adiciona widgets (KPI, gráfico, tabela).
5. Configura cada widget.
6. Salva layout (POST /dashboards).

### Fluxo — Editar layout

1. Usuário abre dashboard existente.
2. Entra em modo edição (toggle "Editar layout").
3. Reordena widgets via drag-and-drop.
4. Clica "Concluir" → PATCH /dashboards/:id/widgets/reorder.
5. Ordem persistida.

### Fluxo — Favoritos

1. Usuário marca dashboard como favorito.
2. Dashboard aparece no topo da lista.

## 5. Critérios de Aceite

- [x] Criação de dashboards personalizados
- [x] Widgets: KPI, gráfico, tabela
- [x] Salvamento de layouts no backend
- [x] Lista de dashboards
- [x] Reordenação via drag-and-drop
- [x] Persistência da ordem (PATCH /dashboards/:id/widgets/reorder)
- [ ] Widgets editáveis (configuração avançada)
- [x] Dashboard padrão por setor (T08b — concluído em 2026-06-29)
- [ ] Compartilhamento entre usuários do mesmo grupo

## 6. Impacto Técnico

| Área           | Impacto                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| Arquitetura    | Módulo Dashboards no backend, dashboard-workspace no frontend                     |
| Banco de dados | api_dashboards, api_widgets (Supabase)                                            |
| API            | CRUD /dashboards, PATCH /dashboards/:id/widgets/reorder                           |
| Frontend       | /app/dashboards, dashboard-workspace.tsx, dashboard-detail.tsx                    |
| Testes         | Unit (dashboard-workspace, dashboard-detail), Integration (dashboards.controller) |
| Infraestrutura | Nenhuma adicional                                                                 |
| Segurança      | Dashboards privados por usuário, JwtAuthGuard                                     |

## 7. Testes Necessários

| Tipo        | Arquivo                       | Descrição                                      |
| ----------- | ----------------------------- | ---------------------------------------------- |
| Unit        | dashboard-workspace.tsx       | CRUD de dashboards                             |
| Unit        | dashboard-detail.tsx          | Modo edição, drag-and-drop                     |
| Integration | dashboards.controller.spec.ts | CRUD de layouts, reorder                       |
| E2E         | —                             | Criar → adicionar widget → salvar → recarregar |
| Manual      | —                             | Verificar responsividade                       |

## 8. Riscos

| Risco                 | Impacto                            | Mitigação                              |
| --------------------- | ---------------------------------- | -------------------------------------- |
| Widgets não editáveis | Usuário limitado na personalização | T16b (editor completo)                 |
| Sem compartilhamento  | Usuários não colaboram             | Implementar compartilhamento por grupo |

## 9. Dependências

- `dashboards.controller` (CRUD + reorder)
- `@dnd-kit/core/sortable/utilities` (drag-and-drop)
- `recharts` (gráficos nos widgets)
