# SPEC-DT-002 — Hardening Final de Sessão

**ID:** DT-002
**Módulo:** Auth
**Fase:** Fase 4
**Status:** Pendente
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Implementar blacklist de tokens revogados, invalidação de sessão em massa e timeout por inatividade.

## 2. Contexto

Atualmente, tokens JWT permanecem válidos até expirar naturalmente (15min access, 7 dias refresh). Não há forma de revogar tokens antes da expiração. O logout invalida a sessão no frontend, mas o token continua válido no backend. Esta spec resolve essa lacuna.

## 3. Regras de Negócio

| Código | Regra                                              | Status     |
| ------ | -------------------------------------------------- | ---------- |
| RN-004 | Refresh token expira em 7 dias                     | Confirmado |
| RN-005 | Access token expira em 15 minutos                  | Confirmado |
| RN-017 | Sessão web deve expirar após inatividade (timeout) | Pendente   |

## 4. Fluxo Esperado

### Fluxo — Blacklist de tokens

1. Usuário faz logout.
2. API adiciona jti (JWT ID) do access token na blacklist.
3. API remove refresh token do banco.
4. Próxima requisição com token revogado → JwtAuthGuard rejeita (401).

### Fluxo — Invalidation em massa

1. Admin solicita "Encerrar todas as sessões" de um usuário.
2. API remove todos os refresh tokens do usuário do banco.
3. API adiciona todos os jti conhecidos na blacklist (ou invalida por versão).
4. Usuário é forçado a re-login.

### Fluxo — Timeout por inatividade

1. Frontend rastreia última atividade (clique, scroll, teclado).
2. Após 30 minutos sem atividade → frontend faz logout automático.
3. API também valida inatividade no refresh: se último refresh > 30min, rejeita.

## 5. Critérios de Aceite

- [ ] Blacklist de access tokens (jti) com Redis
- [ ] Logout revoga access token (blacklist) + refresh token (delete)
- [ ] Endpoint admin para invalidar todas as sessões de um usuário
- [ ] Timeout de sessão por inatividade (30min configurável)
- [ ] Frontend faz logout automático após inatividade
- [ ] Configuração de timeout editável em settings
- [ ] Testes unitários e de integração

## 6. Impacto Técnico

| Área           | Impacto                                                     |
| -------------- | ----------------------------------------------------------- |
| Arquitetura    | Novo middleware/guard para checar blacklist                 |
| Banco de dados | Remoção de refresh tokens, tabela de blacklist (ou Redis)   |
| API            | Modificação em logout, novo endpoint admin de invalidação   |
| Frontend       | Tracking de inatividade, logout automático                  |
| Testes         | Unit (blacklist.service), Integration (logout, invalidação) |
| Infraestrutura | Redis para blacklist de tokens                              |
| Segurança      | Revogação real de tokens, timeout, invalidação em massa     |

## 7. Testes Necessários

| Tipo        | Arquivo                        | Descrição                                         |
| ----------- | ------------------------------ | ------------------------------------------------- |
| Unit        | blacklist.service.spec.ts      | Adicionar, verificar, expirar tokens na blacklist |
| Unit        | session-timeout.spec.ts        | Tracking de inatividade, logout automático        |
| Integration | auth.controller.spec.ts        | Logout revoga token, token revogado rejeitado     |
| Integration | admin-users.controller.spec.ts | Invalidation em massa                             |
| Manual      | —                              | Logout → tentar usar token antigo → deve falhar   |

## 8. Riscos

| Risco                | Impacto                 | Mitigação                                      |
| -------------------- | ----------------------- | ---------------------------------------------- |
| Redis indisponível   | Blacklist não funciona  | Fallback em memória (com risco de perda)       |
| Latência na checagem | Requisições mais lentas | TTL curto na blacklist (igual ao access token) |
| Timeout muito curto  | Usuário frustrado       | Configurável via settings (padrão 30min)       |

## 9. Dependências

- Redis para blacklist de tokens (pendente)
- Modificação em JwtAuthGuard (checar blacklist)
- Modificação em auth.controller (logout revoga token)
- Modificação em admin-users.controller (invalidação em massa)
- Frontend: tracking de inatividade
