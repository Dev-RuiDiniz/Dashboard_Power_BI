# Status Atual do Projeto

**Projeto:** Dashboard Power BI  
**Data de verificação:** 2026-06-09  
**Base da análise:** estado real do código no repositório

## Como ler este documento

Este arquivo substitui a narrativa de sprint histórica por um status verificado.
Para rastreabilidade detalhada:

- inventário canônico: `docs/system-map.md`;
- comparação com o escopo V1: `docs/scope-v1-gap-analysis.md`;
- arquitetura consolidada: `docs/ARCHITECTURE_DETAILED.md`.

## Implementado

### Base de monorepo e qualidade

- monorepo `pnpm` com `apps/api` e `apps/web`;
- scripts de lint, format, typecheck, test e validações de workspace/docs;
- Dockerfiles e Compose para desenvolvimento local.

### API NestJS

- autenticação com login, refresh, logout, recuperação e redefinição de senha;
- guards de autorização por JWT, role e setor;
- CRUD de usuários;
- CRUD de grupos;
- endpoints administrativos de definições de relatórios;
- listagem, detalhe e execução de relatórios;
- healthcheck da API e do SQL Server;
- Swagger em `/docs`.

### Web Next.js

- páginas públicas de login, recuperação e reset de senha;
- área autenticada com `AuthGuard` e sessão em `localStorage`;
- dashboard inicial com KPIs e resumo por setor;
- catálogo de relatórios com filtros e execução;
- hub administrativo;
- tela de usuários;
- tela de grupos;
- tela de exportações;
- tela de notificações;
- tela de configurações do sistema;
- página de design system.

### Integrações reais

- SQL Server via API para consultas de relatórios;
- Supabase direto na Web para KPIs, setores, exportações, notificações e settings.

## Parcial

### Autenticação e segurança

- o fluxo JWT existe, mas a sessão do frontend ainda é local e client-side;
- há controle de tentativas de login, mas a cobertura de hardening do PDF não está completa;
- CSRF e headers de segurança (CSP, HSTS, X-Frame-Options etc.) implementados;
- não existe 2FA/TOTP (`otplib` instalado, endpoints/UI pendentes).

### Relatórios

- o catálogo e a execução estão implementados;
- o visualizador é acoplado à tela `/app/reports`, não uma experiência dedicada completa;
- há endpoints administrativos para relatórios, mas falta a interface web correspondente;
- o domínio de relatórios na API ainda depende de persistência em memória para definições;
- a tela de administração de relatórios (`/app/admin/reports`) está funcional.

### Dashboard e BI

- existe dashboard inicial com KPIs;
- Recharts instalado, mas ainda não integrado em telas ativas;
- não há drill-down;
- não há dashboards personalizados;
- não há editor visual.

### Administração

- usuários e grupos estão disponíveis;
- permissões finas têm tela dedicada (`/app/admin/permissions`) e API CRUD;
- logs de auditoria expostos via API e tela (`/app/admin/audit`);
- configurações do sistema existem como leitura direta no Supabase, não como gestão completa via backend.

### Exportações e notificações

- a Web lê dados existentes no Supabase;
- não há pipeline backend de geração de exportações;
- não há worker, fila, polling de job ou storage de arquivo gerado pela aplicação;
- notificações não têm backend próprio nem realtime.

## Ausente

- editor de dashboards;
- dashboards personalizados do usuário;
- exportação PDF/Excel no backend;
- BullMQ;
- Prisma;
- S3 ou storage equivalente para export;
- cache Redis funcional na aplicação;
- cron/refresh agendado;
- WebSocket/realtime da aplicação;
- 2FA/TOTP completo (backend parcial: `otplib` instalado).

## Riscos e documentação desatualizada

### Divergência entre docs históricas e código

Havia documentação tratando como entregue ou pronta para produção capacidades que não existem hoje no código, principalmente:

- BullMQ e export pipeline;
- Supabase Auth como base real de autenticação;
- 18 telas completas;
- auditoria;
- dashboards personalizados;
- stack com Prisma, React Query e gráficos dedicados.

### Arquitetura híbrida

A Web hoje mistura:

- consumo da API NestJS;
- consultas diretas ao Supabase.

Isso aumenta a necessidade de documentação clara e reduz a coerência com a arquitetura prevista no PDF.

### Persistência fragmentada

O estado atual está espalhado entre:

- memória da API;
- SQL Server;
- Supabase;
- `localStorage`.

Isso limita a leitura de "pronto para produção" para partes do sistema.

### Arquivo de ambiente referenciado e não encontrado

Parte da documentação antiga cita `infra/env/.env.example`, mas o arquivo não está presente no clone atual.

## Conclusão executiva

O projeto já possui uma base funcional útil para autenticação, administração básica e consumo de relatórios.
Ao mesmo tempo, o estado atual ainda está abaixo do escopo V1 em cobertura funcional e consistência arquitetural.

A leitura correta do momento é:

- base técnica existente: sim;
- plataforma BI V1 completa: não;
- documentação agora deve refletir o estado real, não o plano histórico.
