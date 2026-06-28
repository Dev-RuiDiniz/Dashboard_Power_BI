# SPEC-T16b — Editor Visual Drag-and-Drop Completo

**ID:** T16b
**Módulo:** BI
**Fase:** Fase 3
**Status:** Pendente
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Completar o editor visual com paleta de widgets, redimensionamento, canvas livre (grid de 12 colunas), preview em tempo real e versões de dashboard.

## 2. Contexto

O editor mínimo (T16) permite apenas reordenação. Esta spec expande para um editor completo: adicionar novos widgets via paleta, redimensionar (altura/largura), canvas livre, preview em tempo real e versionamento de layouts.

## 3. Regras de Negócio

| Código | Regra                                              | Status     |
| ------ | -------------------------------------------------- | ---------- |
| RN-018 | Dashboards personalizados são privados por usuário | Confirmado |

## 4. Fluxo Esperado

### Fluxo — Adicionar widget via paleta

1. Usuário entra em modo edição.
2. Paleta de widgets exibe tipos disponíveis (KPI, gráfico, tabela, texto, iframe).
3. Usuário arrasta widget da paleta para o canvas.
4. Widget adicionado na posição do drop.
5. Usuário configura o widget (dados, título, estilo).

### Fluxo — Redimensionar widget

1. Usuário seleciona widget no canvas.
2. Handles de redimensionamento aparecem nas bordas.
3. Usuário arrasta handle para ajustar largura/altura.
4. Grid de 12 colunas ajusta posição.
5. Preview em tempo real durante resize.

### Fluxo — Versões de dashboard

1. Usuário salva dashboard → versão atual incrementada.
2. Histórico de versões acessível.
3. Usuário pode restaurar versão anterior.

## 5. Critérios de Aceite

- [ ] Paleta de widgets (KPI, gráfico, tabela, texto, iframe)
- [ ] Arrastar widget da paleta para o canvas
- [ ] Redimensionamento de widgets (largura/altura)
- [ ] Grid de 12 colunas interativo
- [ ] Canvas livre (posição arbitrária)
- [ ] Preview em tempo real durante edição
- [ ] Configuração de widget (dados, título, estilo)
- [ ] Versões de dashboard (histórico e restauração)
- [ ] Responsivo

## 6. Impacto Técnico

| Área           | Impacto                                                                |
| -------------- | ---------------------------------------------------------------------- |
| Arquitetura    | Expansão do dashboard-workspace e dashboard-detail                     |
| Banco de dados | Colunas de dimensão em api_widgets, tabela de versões                  |
| API            | Modificação em POST/PATCH /dashboards para aceitar dimensões e versões |
| Frontend       | Paleta, canvas grid, handles de resize, preview                        |
| Testes         | Unit (paleta, resize, canvas), Integration (API de versões)            |
| Infraestrutura | Nenhuma adicional                                                      |
| Segurança      | JwtAuthGuard, dashboards privados                                      |

## 7. Testes Necessários

| Tipo        | Arquivo                       | Descrição                                                           |
| ----------- | ----------------------------- | ------------------------------------------------------------------- |
| Unit        | widget-palette.tsx            | Tipos disponíveis, drag para canvas                                 |
| Unit        | resizable-widget.tsx          | Handles, redimensionamento                                          |
| Unit        | dashboard-canvas.tsx          | Grid de 12 colunas, posicionamento                                  |
| Integration | dashboards.controller.spec.ts | Salvar com dimensões, versões                                       |
| E2E         | —                             | Adicionar widget → redimensionar → configurar → salvar → recarregar |
| Manual      | —                             | Verificar responsividade e UX do editor                             |

## 8. Riscos

| Risco                          | Impacto              | Mitigação                   |
| ------------------------------ | -------------------- | --------------------------- |
| Editor complexo                | Curva de aprendizado | UI intuitiva, tooltips      |
| Performance com muitos widgets | Dashboard lento      | Virtualização, lazy render  |
| Conflito de versões            | Perda de dados       | Lock otimista ou versioning |

## 9. Dependências

- T16 (editor mínimo) — concluído
- `@dnd-kit` (instalado)
- Biblioteca de resize (pendente, ex. react-resizable)
- Modificação em api_widgets (dimensões)
- Tabela de versões (pendente)
