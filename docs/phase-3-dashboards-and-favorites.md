# Fase 3 - Dashboards E Favoritos

## Estado entregue nesta tarefa

- a API centralizada agora expõe `GET /dashboards` e `POST /dashboards`;
- a API também expõe `GET /reports/favorites`, `POST /reports/:id/favorite` e `DELETE /reports/:id/favorite`;
- a web ganhou `/app/dashboards` como área inicial de dashboards personalizados;
- o detalhe do relatório agora consegue favoritar o item aberto;
- a persistência dos favoritos foi alinhada ao runtime atual com a tabela `api_favorite_reports`.

## O que isso muda no escopo

- T08 deixa de ser apenas modelagem e passa a ter fluxo funcional inicial;
- o módulo `RELAT.` ganha favoritos reais no runtime;
- o módulo `BI` ganha a primeira área personalizada do usuário, mas ainda sem editor visual.

## Limites que permanecem

- ainda não existem endpoints de widgets/layout completos para edição visual;
- o dashboard padrão existe no contrato e na criação inicial, mas ainda sem gestão rica no frontend;
- T16 continua faltando, porque o editor visual ainda não foi entregue.
