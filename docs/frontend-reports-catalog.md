# Catálogo de Dashboards — Frontend

## Objetivo

A rota `/app/reports` apresenta a primeira experiência funcional do catálogo de dashboards da plataforma Dashboard Power BI.

## Entrega

A tela substitui o placeholder anterior por um catálogo visual com:

- resumo de relatórios disponíveis e restritos;
- filtros por texto, setor e status;
- cards com nome, descrição, setor, tipo de fonte SQL, permissões necessárias e data de atualização;
- estado vazio quando nenhum relatório atende aos filtros;
- botões de acesso desabilitados quando o dashboard está restrito ou em manutenção.

## Implementação

Arquivos principais:

- `apps/web/src/app/app/reports/page.tsx`
- `apps/web/src/components/reports/report-catalog.tsx`
- `apps/web/src/components/reports/report-catalog.test.tsx`

A página usa dados iniciais controlados para permitir evolução incremental antes da integração autenticada com `GET /reports`.

## Integração futura com API

Quando o fluxo de autenticação frontend estiver persistindo o token da sessão, a tela deve trocar os dados iniciais pela chamada autenticada:

```http
GET /reports?page=1&pageSize=20
Authorization: Bearer <token>
```

O contrato esperado é compatível com o backend atual de relatórios:

- `items`
- `page`
- `pageSize`
- `total`
- `totalPages`

## Segurança e permissões

A tela exibe as permissões necessárias por relatório, mas a decisão real de autorização deve permanecer no backend. O frontend não deve ser tratado como fonte de verdade para controle de acesso.

## Validação esperada

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web typecheck
pnpm --filter @dashboard-power-bi/web build
pnpm lint
pnpm quality
```
