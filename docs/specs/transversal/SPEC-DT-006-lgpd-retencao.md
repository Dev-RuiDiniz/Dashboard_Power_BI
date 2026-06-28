# SPEC-DT-006 — Política de Retenção LGPD

**ID:** DT-006
**Módulo:** Transversal (Segurança / Compliance)
**Fase:** Fase 4
**Status:** Pendente
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Definir e implementar política de retenção, anonimização e exclusão de dados pessoais em conformidade com a LGPD.

## 2. Contexto

O sistema armazena dados pessoais: email, nome, IP, user agent (em logs de auditoria e acessos). Atualmente não há política explícita de retenção, anonimização ou exclusão. A LGPD exige controle sobre o ciclo de vida dos dados pessoais.

## 3. Regras de Negócio

Nenhuma RN específica atualmente. Esta spec cria as RNs de LGPD.

## 4. Fluxo Esperado

### Fluxo — Retenção automática

1. Job agendado (cron) verifica dados pessoais.
2. Logs de auditoria > 90 dias → IP e userAgent anonimizados.
3. Tokens de refresh expirados > 30 dias → removidos.
4. Exportações expiradas > 7 dias → arquivo e registro removidos.

### Fluxo — Direito de exclusão (usuário)

1. Usuário solicita exclusão de dados (via admin ou self-service).
2. Admin verifica solicitação.
3. API anonimiza dados pessoais (email → [anonymized], nome → [deleted]).
4. Mantém registros não-pessoais (logs de auditoria com userId anonimizado).
5. Registra exclusão em log de auditoria.

### Fluxo — Portabilidade de dados

1. Usuário solicita exportação de seus dados.
2. API coleta todos os dados pessoais do usuário.
3. Gera arquivo JSON/CSV.
4. Disponibiliza download autenticado.

## 5. Critérios de Aceite

- [ ] Política de retenção documentada
- [ ] Job cron para retenção automática (logs, tokens, exports)
- [ ] Anonimização de IP e userAgent em logs > 90 dias
- [ ] Remoção de tokens expirados > 30 dias
- [ ] Remoção de exports expirados > 7 dias
- [ ] Endpoint para exclusão de dados pessoais (anonimização)
- [ ] Endpoint para portabilidade de dados (exportação JSON/CSV)
- [ ] Configuração de períodos de retenção em settings
- [ ] Documentação da política em docs/

## 6. Impacto Técnico

| Área           | Impacto                                                     |
| -------------- | ----------------------------------------------------------- |
| Arquitetura    | Job cron, novos endpoints, modificação em audit/logs        |
| Banco de dados | Anonimização em api_audit_logs, api_users, refresh_tokens   |
| API            | POST /admin/users/:id/anonymize, GET /users/:id/data-export |
| Frontend       | UI para solicitação de exclusão/portabilidade               |
| Testes         | Unit (retention.service), Integration (endpoints)           |
| Infraestrutura | Cron job ou BullMQ scheduled                                |
| Segurança      | Anonimização irreversível, auditoria de exclusão            |

## 7. Testes Necessários

| Tipo        | Arquivo                        | Descrição                                         |
| ----------- | ------------------------------ | ------------------------------------------------- |
| Unit        | retention.service.spec.ts      | Anonimização, remoção por período                 |
| Integration | admin-users.controller.spec.ts | Endpoint de anonimização                          |
| Integration | —                              | Endpoint de portabilidade                         |
| Manual      | —                              | Solicitar exclusão → verificar dados anonimizados |

## 8. Riscos

| Risco                     | Impacto                   | Mitigação                    |
| ------------------------- | ------------------------- | ---------------------------- |
| Anonimização irreversível | Dados perdidos sem backup | Backup antes de anonimizar   |
| Retenção muito curta      | Perda de logs necessários | Configurável via settings    |
| Não conformidade LGPD     | Sanções legais            | Revisão jurídica da política |

## 9. Dependências

- Cron job ou BullMQ scheduled (para retenção automática)
- Modificação em audit.service (anonimização)
- Novos endpoints (exclusão, portabilidade)
- Documentação da política
- Configuração de períodos em settings
