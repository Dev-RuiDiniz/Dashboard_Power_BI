# Catálogo de Relatórios

## Visão geral

O catálogo de relatórios centraliza as definições usadas pela plataforma para listar e futuramente executar relatórios do SQL Server.

A TASK-17 adiciona a entidade `ReportDefinition`, CRUD administrativo parcial e listagem de relatórios ativos por setor.

## Entidade `ReportDefinition`

Campos principais:

| Campo | Descrição |
|---|---|
| `id` | Identificador interno da definição. |
| `name` | Nome exibido do relatório. |
| `description` | Descrição funcional. |
| `sector` | Setor responsável ou autorizado, normalizado para minúsculas. |
| `sourceType` | Tipo da fonte SQL: `view` ou `stored_procedure`. |
| `sourceName` | Nome seguro da fonte SQL no formato `schema.nome`. |
| `parameters` | Lista de parâmetros aceitos pelo relatório. |
| `requiredPermissions` | Chaves de permissão necessárias. |
| `isActive` | Indica se o relatório aparece na listagem pública. |
| `createdAt` | Data de criação. |
| `updatedAt` | Data da última atualização. |

## Fonte SQL

O catálogo não aceita SQL livre. A fonte deve apontar para uma view ou stored procedure revisada:

```text
reports.vw_financial_reports
reports.sp_get_report_data
```

Valores como `reports.vw_reports; DROP TABLE users` são rejeitados.

## Parâmetros

Tipos permitidos:

```text
string
int
number
boolean
date
```

Exemplo:

```json
[
  {
    "name": "startDate",
    "type": "date",
    "required": true
  },
  {
    "name": "sectorId",
    "type": "string",
    "required": false,
    "maxLength": 80
  }
]
```

## Endpoints administrativos

```http
POST /admin/reports
GET /admin/reports
GET /admin/reports/{id}
PATCH /admin/reports/{id}
PATCH /admin/reports/{id}/deactivate
```

## Endpoint de listagem por setor

```http
GET /reports?sector=financeiro
```

Retorna apenas relatórios ativos do setor informado.

## Persistência

Nesta etapa, o catálogo usa repositório em memória para viabilizar a feature e os testes sem introduzir migrações ou banco adicional. Uma próxima task pode trocar o repositório por persistência real, preservando os contratos do service.

## Segurança

- Não aceitar SQL livre.
- Validar `sourceName` com o padrão `schema.nome`.
- Validar parâmetros antes de uso.
- Não expor secrets, connection strings ou credenciais.
- Usar permissões mínimas para views e stored procedures no SQL Server.
- Adicionar autorização real quando o módulo de permissões de relatórios for implementado.

## Testes

A TASK-17 adiciona cobertura para:

- validação da entidade;
- rejeição de fonte SQL perigosa;
- rejeição de parâmetros e permissões inseguros;
- repositório em memória;
- service;
- CRUD admin parcial;
- listagem por setor.

## Validação local

```bash
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api typecheck
pnpm --filter @dashboard-power-bi/api build
pnpm lint
pnpm format:check
pnpm quality
```
