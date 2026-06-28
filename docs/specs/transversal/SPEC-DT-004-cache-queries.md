# SPEC-DT-004 — Cache de Queries SQL Server

**ID:** DT-004
**Módulo:** Transversal (SQL Server / Reports)
**Fase:** Fase 3+
**Status:** Concluído
**Atualizado em:** 2026-06-29

---

## 1. Objetivo

Implementar cache de resultados de queries SQL Server com TTL configurável, invalidação e monitoramento.

## 2. Contexto

Atualmente toda execução de relatório faz uma query nova ao SQL Server. Queries idênticas em curto intervalo são reexecutadas desnecessariamente. Cache com TTL reduz carga no SQL Server e melhora tempo de resposta.

## 3. Regras de Negócio

| Código | Regra                                          | Status     |
| ------ | ---------------------------------------------- | ---------- |
| RN-009 | Queries ao SQL Server devem ser parametrizadas | Confirmado |

## 4. Fluxo Esperado

### Fluxo principal — Cache hit

1. Usuário executa relatório com parâmetros.
2. API calcula chave de cache (reportId + parâmetros hash).
3. Cache hit → retorna resultado cacheado.
4. Resposta imediata sem query ao SQL Server.

### Fluxo — Cache miss

1. Chave não encontrada no cache.
2. API executa query no SQL Server.
3. Resultado armazenado no cache com TTL.
4. Retorna resultado.

### Fluxo — Invalidation

1. TTL expira → cache invalidado automaticamente.
2. Próxima execução é cache miss.
3. Admin pode invalidar cache manualmente (POST /admin/cache/invalidate).

## 5. Critérios de Aceite

- [x] Cache de resultados com TTL configurável
- [x] Chave de cache baseada em query + hash de parâmetros + provider
- [x] Cache hit retorna resultado sem query
- [x] Cache miss executa query e armazena resultado
- [x] Invalidation automática por TTL
- [x] Invalidation manual por admin (POST /admin/cache/invalidate)
- [x] Configuração de TTL global (QUERY_CACHE_TTL_MS)
- [x] Monitoramento de hit/miss ratio (GET /admin/cache/stats)

**Notas de implementação:**

- Cache em memória (Map) com LRU eviction e TTL por entrada.
- Chave determinística via SHA-256 de `provider:query:JSON.stringify(params)`.
- Cache desabilitável via `QUERY_CACHE_ENABLED=false`.
- Limite de entradas configurável via `QUERY_CACHE_MAX_ENTRIES` (default 100).
- Endpoints admin protegidos por JwtAuthGuard + RolesGuard (admin apenas).

## 6. Impacto Técnico

| Área           | Impacto                                                                |
| -------------- | ---------------------------------------------------------------------- |
| Arquitetura    | Camada de cache entre reports.controller e sql-server.service          |
| Banco de dados | Redis ou cache em memória                                              |
| API            | Modificação em POST /reports/:id/execute, POST /admin/cache/invalidate |
| Frontend       | Nenhum direto                                                          |
| Testes         | Unit (cache.service), Integration (execução com cache)                 |
| Infraestrutura | Redis (preferencial) ou memória                                        |
| Segurança      | Cache isolado por usuário/setor                                        |

## 7. Testes Necessários

| Tipo        | Arquivo                    | Descrição                                          |
| ----------- | -------------------------- | -------------------------------------------------- |
| Unit        | cache.service.spec.ts      | Set, get, expire, invalidate                       |
| Integration | reports.controller.spec.ts | Execução com cache hit e miss                      |
| Manual      | —                          | Executar relatório 2x → segunda deve ser cache hit |

## 8. Riscos

| Risco              | Impacto              | Mitigação                       |
| ------------------ | -------------------- | ------------------------------- |
| Cache stale        | Dados desatualizados | TTL curto + invalidação manual  |
| Cache por usuário  | Memória excessiva    | LRU eviction, limite de tamanho |
| Redis indisponível | Cache não funciona   | Fallback em memória             |

## 9. Dependências

- Cache em memória (sem Redis necessário para V1)
- Modificação em `SqlQueryService` (sql-query.service.ts)
- Configuração via env vars: `QUERY_CACHE_ENABLED`, `QUERY_CACHE_TTL_MS`, `QUERY_CACHE_MAX_ENTRIES`
- `QueryCacheController` em `sql-server.module.ts`
