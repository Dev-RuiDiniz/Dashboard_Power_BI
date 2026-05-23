# SQL Server

## Visão geral

A camada SQL Server da API centraliza conexão, healthcheck e execução segura de consultas para relatórios.

A TASK-16 adiciona a camada de queries parametrizadas para impedir SQL livre vindo de entrada externa e reduzir risco de SQL Injection.

## Arquivos principais

```text
apps/api/src/sql-server/sql-server.service.ts
apps/api/src/sql-server/sql-query-validator.ts
apps/api/src/sql-server/sql-parameters.ts
apps/api/src/sql-server/sql-query.service.ts
apps/api/src/sql-server/sql-server.module.ts
```

## Regras de segurança

- Não aceitar SQL livre vindo de controller, query string, body ou parâmetros externos.
- Não concatenar valores de usuário em SQL.
- Validar nomes de schemas, views, stored procedures, colunas e parâmetros.
- Executar views apenas com identificadores no formato `schema.nome`.
- Executar stored procedures apenas com identificadores no formato `schema.nome`.
- Usar `.input()` do driver `mssql` para valores.
- Não retornar erro bruto do driver ao chamador.
- Não logar credenciais, connection string, host, usuário, senha ou database.
- Usar usuário SQL dedicado e preferencialmente `read-only`.

## Identificadores permitidos

Views e stored procedures devem usar o padrão:

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

## Parâmetros permitidos

Os parâmetros são tipados e normalizados antes da chamada ao driver.

Tipos suportados:

```text
string
int
number
boolean
date
```

Exemplo de filtro seguro para view:

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

Query gerada:

```sql
SELECT id, name, sector_id FROM reports.vw_dashboard_reports WHERE sector_id = @sectorId
```

O valor `financeiro` é enviado via `.input()` e não é interpolado no SQL.

## Stored procedures

Exemplo de execução segura:

```ts
await sqlQueryService.executeStoredProcedure({
  procedureName: 'reports.sp_get_report_data',
  parameters: [
    {
      name: 'reportId',
      type: 'string',
      value: 'abc',
      maxLength: 50,
    },
  ],
});
```

A procedure é executada pelo driver via `execute`, com parâmetros enviados por `.input()`.

## Testes de segurança

A TASK-16 adiciona testes para:

- rejeição de identificadores perigosos;
- rejeição de colunas inseguras;
- rejeição de parâmetros inseguros;
- normalização de parâmetros tipados;
- manutenção de payloads de SQL Injection como valor parametrizado;
- execução segura de views;
- execução segura de stored procedures;
- erro sanitizado quando o driver falha.

## Validação local

```bash
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api typecheck
pnpm --filter @dashboard-power-bi/api build
pnpm lint
pnpm format:check
pnpm quality
```

## Pontos de atenção

- A camada não deve ser usada para executar SQL arbitrário.
- Para novos relatórios, preferir views e stored procedures revisadas.
- Qualquer filtro novo deve ser declarado com coluna, nome de parâmetro e tipo.
- Arrays, objetos aninhados e parâmetros desconhecidos são rejeitados.
- Erros retornados ao chamador devem permanecer sanitizados.
