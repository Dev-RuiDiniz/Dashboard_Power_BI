# SQL Server

## Visão geral

A camada SQL Server da API centraliza:

- conexão;
- healthcheck;
- validação de identificadores;
- execução segura de consultas para relatórios.

## Arquivos principais

```text
apps/api/src/sql-server/sql-server.service.ts
apps/api/src/sql-server/sql-query-validator.ts
apps/api/src/sql-server/sql-parameters.ts
apps/api/src/sql-server/sql-query.service.ts
apps/api/src/sql-server/sql-server.module.ts
```

## Como funciona hoje

O fluxo real é:

1. a API recebe uma consulta de relatório;
2. valida o relatório e seus parâmetros;
3. monta execução segura para view ou stored procedure;
4. envia valores via parâmetros do driver `mssql`;
5. sanitiza erros antes de responder.

## Regras de segurança

- não aceitar SQL livre vindo do cliente;
- não concatenar valores de usuário em SQL;
- validar nomes de schema, view, procedure, coluna e parâmetro;
- aceitar apenas identificadores no formato `schema.nome`;
- usar `.input()` do `mssql` para valores;
- não retornar erro bruto do driver;
- não logar credenciais ou connection string.

## Identificadores permitidos

Formato aceito:

```text
schema.nome
```

Exemplos válidos:

```text
reports.vw_dashboard_reports
reports.sp_get_report_data
dbo.vw_reports
```

Exemplos rejeitados:

```text
reports.vw_dashboard_reports; DROP TABLE users
reports.vw_dashboard_reports--
SELECT * FROM users
dbo].[users
exec reports.sp_get_report_data
```

## Parâmetros suportados

```text
string
int
number
boolean
date
```

Exemplo de view segura:

```ts
await sqlQueryService.executeView({
  viewName: 'reports.vw_dashboard_reports',
  columns: ['id', 'name', 'sector_id'],
  filters: [
    {
      column: 'sector_id',
      name: 'sectorId',
      type: 'string',
      value: 'financeiro',
      maxLength: 80,
    },
  ],
});
```

## Limites atuais

- a camada é usada para relatórios, não como ORM geral da plataforma;
- não existe Prisma;
- não há cache Redis funcional na frente dessas consultas;
- paginação do resultado de relatórios ainda pode ocorrer em memória após a execução.

## Healthcheck

```http
GET /health/sql
```

O retorno é sanitizado e serve para validar disponibilidade da dependência sem expor detalhes sensíveis.

## Validação local

```bash
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api typecheck
pnpm --filter @dashboard-power-bi/api build
```
