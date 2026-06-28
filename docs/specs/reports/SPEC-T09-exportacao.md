# SPEC-T09 — Exportação PDF/Excel com Histórico

**ID:** T09
**Módulo:** Reports
**Fase:** Fase 3
**Status:** Parcial
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Permitir exportação de relatórios em PDF, Excel, CSV e JSON, com histórico de exportações, download autenticado e expiração automática.

## 2. Contexto

Tela e fluxo de exportação acessível a usuários com role downloader ou admin. Atualmente funciona em memória (síncrono). Pipeline assíncrono com BullMQ é pendência (T09b).

## 3. Regras de Negócio

| Código | Regra                                               | Status     |
| ------ | --------------------------------------------------- | ---------- |
| RN-007 | Apenas Downloader e Admin podem exportar relatórios | Confirmado |
| RN-012 | Exportações expiram após 7 dias                     | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Exportar

1. Usuário executa relatório e visualiza resultados.
2. Clica "Exportar" → modal com seleção de formato.
3. Seleciona PDF, Excel, CSV ou JSON.
4. POST /exports com reportId, formato, parâmetros.
5. API gera arquivo (síncrono atual, assíncrono com BullMQ no futuro).
6. Exportação registrada em api_export_jobs.
7. Frontend exibe notificação de conclusão.
8. Download disponível em GET /exports/:id/download.

### Fluxo — Histórico

1. Usuário acessa `/app/exports`.
2. Frontend chama GET /exports com filtros.
3. Lista de exportações com status, formato, data, download.

### Fluxo alternativo — Sem permissão

1. Usuário com role viewer tenta exportar.
2. API retorna 403.
3. Frontend exibe "Sem permissão para exportar".

## 5. Critérios de Aceite

- [x] Botão de exportação por relatório (PDF, Excel, CSV, JSON)
- [x] Modal de confirmação com seleção de formato
- [x] Geração no backend (síncrono)
- [x] Histórico de exportações com status
- [x] Download autenticado
- [x] Expiração automática (7 dias)
- [x] Controle de permissão (downloader/admin)
- [ ] Pipeline assíncrono com BullMQ
- [ ] Notificação ao usuário após conclusão
- [ ] Storage S3 ou equivalente

## 6. Impacto Técnico

| Área           | Impacto                                                                              |
| -------------- | ------------------------------------------------------------------------------------ |
| Arquitetura    | Módulo Exports + integração Reports                                                  |
| Banco de dados | api_export_jobs (Supabase)                                                           |
| API            | POST /exports, GET /exports, GET /exports/:id/download                               |
| Frontend       | /app/exports, export-modal.tsx, exports-list.tsx                                     |
| Testes         | Unit (export-modal, exports-list), Integration (exports.controller, exports.service) |
| Infraestrutura | Storage de arquivos (local atual, S3 pendente)                                       |
| Segurança      | RolesGuard (downloader/admin), download autenticado, expiração                       |

## 7. Testes Necessários

| Tipo        | Arquivo                    | Descrição                                 |
| ----------- | -------------------------- | ----------------------------------------- |
| Unit        | export-modal.tsx           | Seleção de formato                        |
| Unit        | exports-list.tsx           | Listagem, filtros, download               |
| Integration | exports.controller.spec.ts | Solicitação de exportação                 |
| Integration | exports.service.spec.ts    | Geração de PDF/XLSX real                  |
| E2E         | —                          | Exportar → verificar notificação → baixar |
| Manual      | —                          | Verificar qualidade do arquivo gerado     |

## 8. Riscos

| Risco                      | Impacto                           | Mitigação                       |
| -------------------------- | --------------------------------- | ------------------------------- |
| Fila em memória perde jobs | Exportações perdidas ao reiniciar | BullMQ + Redis (T09b)           |
| Arquivo grande             | OOM, timeout                      | Processamento assíncrono (T09b) |
| Storage local cheio        | Falha em novas exportações        | S3 ou equivalente (pendente)    |

## 9. Dependências

- `exports.service` (geração de PDF/Excel/CSV/JSON)
- `exports.controller` (solicitação, histórico, download)
- `roles.guard` (controle downloader/admin)
- BullMQ + Redis (pendente, T09b)
