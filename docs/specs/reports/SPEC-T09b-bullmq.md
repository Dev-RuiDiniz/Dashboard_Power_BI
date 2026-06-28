# SPEC-T09b — Pipeline BullMQ + Redis para Exports

**ID:** T09b
**Módulo:** Reports
**Fase:** Fase 3
**Status:** Pendente
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Implementar pipeline assíncrono de exportação com BullMQ + Redis, worker de processamento, polling de status e notificação ao usuário.

## 2. Contexto

Atualmente as exportações são processadas de forma síncrona em memória. Isso causa timeout em relatórios grandes e perda de jobs ao reiniciar. BullMQ + Redis resolve com fila persistente, worker dedicado e status em tempo real.

## 3. Regras de Negócio

| Código | Regra                                               | Status     |
| ------ | --------------------------------------------------- | ---------- |
| RN-007 | Apenas Downloader e Admin podem exportar relatórios | Confirmado |
| RN-012 | Exportações expiram após 7 dias                     | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal

1. Usuário solicita exportação (POST /exports).
2. API adiciona job na fila BullMQ (status: pending).
3. API retorna jobId imediatamente (202 Accepted).
4. Worker processa job assincronamente:
   a. Busca definição do relatório.
   b. Executa query no SQL Server.
   c. Gera arquivo (PDF/Excel/CSV/JSON).
   d. Salva em storage (local ou S3).
   e. Atualiza status: completed.
5. Frontend faz polling de status (GET /exports/:id).
6. Quando completed → notificação + download disponível.

### Fluxo alternativo — Falha

1. Worker encontra erro (query falha, OOM, timeout).
2. Status atualizado: failed.
3. Frontend exibe erro.
4. Usuário pode tentar novamente.

### Fluxo — Expiração

1. Job antigo (> 7 dias) é expirado automaticamente.
2. Arquivo removido do storage.
3. Status: expired.

## 5. Critérios de Aceite

- [ ] BullMQ + Redis instalados e configurados
- [ ] Fila de exportações criada
- [ ] Worker de processamento assíncrono
- [ ] Status de job: pending, processing, completed, failed
- [ ] Polling de status pelo frontend
- [ ] Notificação ao usuário após conclusão
- [ ] Expiração automática de jobs antigos (7 dias)
- [ ] Storage de arquivos (local ou S3)
- [ ] Testes unitários e de integração

## 6. Impacto Técnico

| Área           | Impacto                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| Arquitetura    | Novo worker process, fila BullMQ, Redis                                  |
| Banco de dados | api_export_jobs com status expandido                                     |
| API            | Modificação em POST /exports (async), GET /exports/:id (polling)         |
| Frontend       | Polling de status, notificação de conclusão                              |
| Testes         | Unit (export-queue.service, export-worker), Integration (fluxo completo) |
| Infraestrutura | Redis, worker process, storage                                           |
| Segurança      | Jobs autenticados, download autenticado, expiração                       |

## 7. Testes Necessários

| Tipo        | Arquivo                      | Descrição                                            |
| ----------- | ---------------------------- | ---------------------------------------------------- |
| Unit        | export-queue.service.spec.ts | Adicionar job, obter status                          |
| Unit        | export-worker.spec.ts        | Processamento de exportação                          |
| Integration | exports.controller.spec.ts   | Solicitação e polling                                |
| Integration | —                            | Export completo: solicitar → processar → notificar   |
| Manual      | —                            | Verificar tempo de processamento de relatório grande |

## 8. Riscos

| Risco              | Impacto                    | Mitigação                          |
| ------------------ | -------------------------- | ---------------------------------- |
| Redis indisponível | Fila não funciona          | Fallback em memória (com risco)    |
| Worker crash       | Job interrompido           | Retry automático do BullMQ         |
| Storage cheio      | Falha em novas exportações | Limpeza automática + monitoramento |

## 9. Dependências

- BullMQ + Redis (instalação pendente)
- Worker process (criação pendente)
- Storage (S3 ou local persistente)
- Modificação em exports.controller e exports.service
- Frontend: polling de status
