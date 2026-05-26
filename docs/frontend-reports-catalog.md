# Catálogo de Dashboards — Frontend

## Objetivo

A rota `/app/reports` apresenta o catálogo funcional de dashboards da plataforma Dashboard Power BI.

## Entrega atual

A tela agora consome a Reports API por meio de uma camada dedicada de frontend e renderiza:

- loading enquanto a API é consultada;
- erro controlado quando a API falha ou retorna erro HTTP;
- estado vazio quando nenhum relatório atende aos filtros;
- resumo de dashboards disponíveis e restritos;
- filtros por texto, setor e status;
- cards com nome, descrição, setor, tipo de fonte SQL, permissões necessárias e data de atualização.

## Arquivos principais

- `apps/web/src/app/app/reports/page.tsx`
- `apps/web/src/components/reports/report-catalog-container.tsx`
- `apps/web/src/components/reports/report-catalog.tsx`
- `apps/web/src/lib/reports-api.ts`
- `apps/web/src/lib/reports-api.test.ts`
- `apps/web/src/components/reports/report-catalog-container.test.tsx`
- `apps/web/src/components/reports/report-catalog.test.tsx`

## Integração com API

Cliente usado:

```ts
fetchReports({ page: 1, pageSize: 20, token })
```

Endpoint consumido:

```http
GET /reports?page=1&pageSize=20
```

Quando `token` é informado, o cliente envia `Authorization: Bearer <token>` e `Accept: application/json`.

A URL base é definida por `NEXT_PUBLIC_API_URL`. Na ausência da variável, o fallback local é `http://localhost:3001`.

## Contrato esperado

```json
{
  "items": [
    {
      "id": "financeiro-dre",
      "name": "DRE Mensal",
      "description": "Resultado financeiro.",
      "sector": "Financeiro",
      "sourceType": "view",
      "requiredPermissions": ["reports:read"]
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "totalPages": 1
}
```

O frontend normaliza `sourceType: "stored_procedure"` para `sourceType: "procedure"` para manter compatibilidade visual com o catálogo.

## Segurança e permissões

A autorização real permanece no backend. O frontend somente exibe dados retornados pela Reports API e não deve ser usado como fonte de verdade para controle de acesso.

Regras importantes:

- não gravar token fixo no código;
- não registrar token em logs;
- tratar `401` e `403` como falhas controladas;
- exibir mensagem segura sem detalhes sensíveis;
- manter a filtragem de permissão no backend.

## Estratégia TDD aplicada

Foram criados testes antes da implementação para cobrir:

- chamada da Reports API com paginação e token bearer;
- normalização de `stored_procedure`;
- erro controlado quando a API falha;
- estado de loading no catálogo integrado;
- renderização dos relatórios retornados pela API;
- estado de erro quando a integração falha.

## Validação esperada

```bash
pnpm --filter @dashboard-power-bi/web test
pnpm --filter @dashboard-power-bi/web typecheck
pnpm --filter @dashboard-power-bi/web build
pnpm lint
pnpm quality
```

## Próximos passos

- Persistir e recuperar token real da sessão autenticada no frontend.
- Tratar paginação real na interface.
- Adicionar retry controlado, se fizer sentido.
- Exibir mensagens específicas para `401` e `403` sem expor detalhes sensíveis.
