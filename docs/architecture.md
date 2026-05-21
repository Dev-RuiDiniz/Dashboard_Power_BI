# Arquitetura inicial

## Contexto

O Dashboard Power BI será construído como uma plataforma web de relatórios e BI com frontend, backend, pacotes compartilhados, documentação e infraestrutura organizados em um único repositório.

## Decisão arquitetural inicial

A base do projeto usa monorepo para permitir evolução coordenada entre API, Web, bibliotecas internas e documentação.

## Organização

```text
apps/api
apps/web
packages/shared
packages/ui
docs
infra
scripts
.github
```

## Responsabilidades por área

### `apps/api`

Aplicação backend responsável por autenticação, permissões, relatórios, dashboards, exportações, auditoria e integrações externas.

### `apps/web`

Aplicação frontend responsável pelas telas públicas, área autenticada, dashboards, relatórios, administração e experiência de uso.

### `packages/shared`

Pacote para contratos, tipos, schemas e utilitários compartilhados entre API e Web.

### `packages/ui`

Pacote para componentes visuais reutilizáveis e base do design system.

### `docs`

Documentação técnica, decisões arquiteturais, guias operacionais e materiais de handoff.

### `infra`

Arquivos de infraestrutura, Docker, deploy e automações operacionais.

## Princípios técnicos

- Separação clara de responsabilidades.
- Evolução por tarefas pequenas e revisáveis.
- TDD como fluxo obrigatório.
- Documentação atualizada a cada mudança relevante.
- Nenhum secret versionado.
- Commits e PRs rastreáveis por tarefa.

## Estado atual

A TASK-01 entrega apenas a estrutura do monorepo e validação estrutural. Frameworks, testes reais, CI/CD, Docker e aplicações serão adicionados em tarefas posteriores.
