# SPEC-DT-005 — Testes E2E (Playwright)

**ID:** DT-005
**Módulo:** Transversal (Qualidade)
**Fase:** Fase 4
**Status:** Pendente
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Implementar testes E2E com Playwright cobrindo fluxos críticos da plataforma: login, catálogo, execução de relatório, exportação, dashboard e admin.

## 2. Contexto

Atualmente o projeto tem testes unitários e de integração (Jest, Supertest, Testing Library), mas não tem testes E2E. Fluxos críticos como login → catálogo → executar → exportar não são validados ponta a ponta. Playwright é a ferramenta recomendada.

## 3. Regras de Negócio

Nenhuma RN específica. Testes devem respeitar todas as RNs existentes.

## 4. Fluxo Esperado

### Fluxo — Login

1. Navegar para /login.
2. Preencher email + senha.
3. Clicar "Entrar".
4. Verificar redirecionamento para /app.
5. Verificar token em sessionStorage.

### Fluxo — Catálogo → Execução

1. Login.
2. Navegar para /app/reports.
3. Buscar relatório.
4. Clicar em relatório.
5. Preencher parâmetros.
6. Clicar "Executar".
7. Verificar tabela de resultados.

### Fluxo — Exportação

1. Login como downloader.
2. Executar relatório.
3. Clicar "Exportar" → PDF.
4. Verificar notificação.
5. Verificar download.

### Fluxo — Dashboard

1. Login.
2. Verificar KPIs em /app.
3. Clicar em gráfico → drill-down.
4. Verificar detalhe.

### Fluxo — Admin

1. Login como admin.
2. Navegar para /app/admin.
3. Verificar KPIs admin.
4. Criar usuário.
5. Verificar na lista.
6. Verificar log de auditoria.

## 5. Critérios de Aceite

- [ ] Playwright instalado e configurado
- [ ] Teste E2E: login
- [ ] Teste E2E: catálogo → execução
- [ ] Teste E2E: exportação
- [ ] Teste E2E: dashboard interativo
- [ ] Teste E2E: admin (CRUD usuário + auditoria)
- [ ] CI/CD executa E2E em PRs
- [ ] Screenshots em falhas

## 6. Impacto Técnico

| Área           | Impacto                                      |
| -------------- | -------------------------------------------- |
| Arquitetura    | Novo diretório e2e/, configuração Playwright |
| Banco de dados | Seed de teste (usuários, relatórios)         |
| API            | Nenhuma modificação                          |
| Frontend       | Nenhuma modificação                          |
| Testes         | E2E com Playwright                           |
| Infraestrutura | Playwright no CI/CD                          |
| Segurança      | Credenciais de teste, isolamento             |

## 7. Testes Necessários

| Tipo | Arquivo               | Descrição              |
| ---- | --------------------- | ---------------------- |
| E2E  | e2e/login.spec.ts     | Fluxo de login         |
| E2E  | e2e/reports.spec.ts   | Catálogo → execução    |
| E2E  | e2e/exports.spec.ts   | Exportação             |
| E2E  | e2e/dashboard.spec.ts | Dashboard interativo   |
| E2E  | e2e/admin.spec.ts     | Admin CRUD + auditoria |

## 8. Riscos

| Risco                     | Impacto             | Mitigação                             |
| ------------------------- | ------------------- | ------------------------------------- |
| Testes flaky              | CI instável         | Retries, waits explícitos             |
| Dependência de SQL Server | E2E não roda sem DB | Mock ou container Docker              |
| Tempo de execução         | CI lento            | Paralelização, testes críticos apenas |

## 9. Dependências

- Playwright (instalação pendente)
- Seed de dados de teste
- CI/CD configurado para E2E
- API e Web rodando para testes
