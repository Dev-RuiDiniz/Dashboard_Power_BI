# ADR-0001 — Uso de monorepo

## Status

Aceita.

## Contexto

O projeto Dashboard Power BI possui frontend, backend, bibliotecas compartilhadas, documentação técnica e infraestrutura. A evolução do produto exige rastreabilidade entre contratos de API, telas, tipos compartilhados, componentes visuais e automações.

## Decisão

Adotar monorepo com `pnpm workspaces`.

Estrutura inicial:

```text
apps/api
apps/web
packages/shared
packages/ui
docs
infra
```

## Consequências positivas

- Versionamento unificado.
- Contratos compartilhados entre frontend e backend.
- Revisões por Pull Request mais rastreáveis.
- Documentação próxima ao código.
- Evolução incremental por sprint e tarefa.
- Base adequada para CI/CD por workspace.

## Consequências negativas

- Requer disciplina de scripts e organização.
- Builds podem ficar mais complexos conforme o projeto crescer.
- Mudanças amplas exigem atenção para evitar acoplamento indevido.

## Mitigações

- Manter pacotes com responsabilidades claras.
- Criar scripts de validação por workspace.
- Evoluir CI/CD por app e pacote.
- Documentar decisões técnicas em ADRs.
