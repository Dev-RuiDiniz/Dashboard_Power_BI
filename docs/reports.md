# Relatórios

## Objetivo

Este documento descreve o módulo de relatórios no estado atual do repositório.

## O que existe hoje

O domínio de relatórios está dividido entre API e Web:

- a API mantém o catálogo administrativo e executa consultas no SQL Server;
- a Web lista relatórios, monta filtros, chama a execução e renderiza resultados.

## Catálogo administrativo

Endpoints existentes:

```http
POST /admin/reports
GET /admin/reports
GET /admin/reports/{id}
PATCH /admin/reports/{id}
PATCH /admin/reports/{id}/deactivate
```

Estado real:

- o catálogo existe no backend;
- as definições ainda usam repositório em memória;
- não há tela web administrativa equivalente para essa gestão.

## Reports API pública

```http
GET /reports
GET /reports/{id}
POST /reports/{id}/query
```

### `GET /reports`

- lista relatórios autorizados;
- aceita paginação;
- pode filtrar por setor.

### `GET /reports/{id}`

- retorna o detalhe público do relatório;
- não expõe `sourceName`.

### `POST /reports/{id}/query`

- valida autorização antes da execução;
- valida os filtros declarados;
- consulta view ou stored procedure no SQL Server;
- retorna paginação da resposta.

## Segurança da execução

O sistema hoje protege o fluxo com as seguintes regras:

- `sourceName` deve ser um identificador seguro no formato `schema.nome`;
- não existe SQL livre vindo do cliente;
- filtros desconhecidos são rejeitados;
- a autorização por role/setor/permissão roda antes da consulta;
- erros de SQL são sanitizados.

## Tipos de parâmetros suportados

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

## Experiência da Web

Na aplicação atual:

- o usuário acessa `/app/reports`;
- o catálogo é listado na mesma página do visualizador;
- filtros avançados são montados na interface;
- a resposta é exibida em tabela.

Isso cobre uma parte do escopo de relatórios, mas ainda não entrega:

- rota dedicada de visualização por relatório;
- exportação backend;
- favoritos integrados ao frontend atual;
- gráficos de BI a partir da execução.

## Persistência e limitações

Estado atual:

- definições de relatórios: memória da API;
- dados consultados: SQL Server;
- sessão do usuário: `localStorage` no frontend.

Limitações práticas:

- reiniciar a API perde definições mantidas em memória;
- a camada de relatórios ainda não tem cache Redis funcional;
- não há fila ou processamento assíncrono de export.

## O que não existe hoje

- `POST /reports/{id}/export`;
- `GET /exports/{jobId}`;
- worker de exportação;
- BullMQ;
- armazenamento de arquivo em S3;
- editor de relatórios/dashboards.

## Validação local

```bash
pnpm --filter @dashboard-power-bi/api test
pnpm --filter @dashboard-power-bi/api typecheck
pnpm --filter @dashboard-power-bi/api build
```
