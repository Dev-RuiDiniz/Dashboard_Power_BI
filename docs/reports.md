# Catálogo e Reports API

## Visão geral

O módulo de relatórios centraliza o catálogo de `ReportDefinition` e expõe a Reports API para listagem, detalhe e execução segura de relatórios.

A TASK-17 adicionou o catálogo administrativo. A TASK-18 adiciona os endpoints de consumo com paginação, validação de filtros e autorização por setor/permissão.

## Entidade `ReportDefinition`

| Campo | Descrição |
|---|---|
| `id` | Identificador interno da definição. |
| `name` | Nome exibido do relatório. |
| `description` | Descrição funcional. |
| `sector` | Setor autorizado, normalizado para minúsculas. |
| `sourceType` | Tipo da fonte SQL: `view` ou `stored_procedure`. |
| `sourceName` | Nome seguro da fonte SQL no formato `schema.nome`. |
| `parameters` | Lista de parâmetros aceitos pelo relatório. |
| `requiredPermissions` | Chaves de permissão necessárias. |
| `isActive` | Indica se o relatório aparece na API pública. |

## Segurança

- O catálogo não aceita SQL livre.
- `sourceName` deve usar o formato `schema.nome`.
- A Reports API não retorna `sourceName` no contrato público.
- Filtros são aceitos somente quando declarados em `parameters`.
- Valores são normalizados e enviados à camada SQL por parâmetros.
- A autorização roda antes da validação de execução SQL.
- Usuários sem setor ou permissão recebem erro controlado.
- Usuário `admin` pode acessar relatórios sem validação específica de setor/permissão.

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

## Reports API

### `GET /reports`

Lista relatórios autorizados com paginação.

Query params:

| Parâmetro | Padrão | Regra |
|---|---:|---|
| `sector` | opcional | setor normalizado |
| `page` | `1` | inteiro positivo |
| `pageSize` | `20` | inteiro positivo até `100` |

Exemplo:

```http
GET /reports?sector=financeiro&page=1&pageSize=20
```

### `GET /reports/{id}`

Retorna detalhe público de um relatório autorizado.

O retorno não inclui `sourceName`.

### `POST /reports/{id}/query`

Executa a consulta parametrizada do relatório.

Payload:

```json
{
  "filters": {
    "startDate": "2026-05-01",
    "sectorId": "financeiro"
  },
  "page": 1,
  "pageSize": 20
}
```

Fluxo interno:

1. Busca definição no catálogo.
2. Rejeita relatório inativo.
3. Valida setor e permissões do usuário.
4. Valida filtros contra `parameters`.
5. Executa view ou stored procedure via `SqlQueryService`.
6. Aplica paginação em memória.
7. Retorna resposta paginada.

## Persistência

O catálogo ainda usa repositório em memória. Dados não persistem após restart da API. A troca por persistência real deve ser feita em task própria, com migration segura e sem perda de dados.

## Testes

A TASK-18 adiciona cobertura para:

- contrato de paginação;
- validação de filtros;
- rejeição de filtros desconhecidos;
- autorização por setor;
- autorização por permissão;
- listagem autorizada;
- detalhe autorizado;
- query segura;
- garantia de que SQL não executa quando autorização ou validação falha.

## Validação local

```bash
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api typecheck
pnpm --filter @dashboard-power-bi/api build
pnpm lint
pnpm format:check
pnpm quality
```
