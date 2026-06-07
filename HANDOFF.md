# Handoff do Projeto

**Projeto:** Dashboard Power BI  
**Data:** 2026-06-05  
**Status correto:** base funcional parcial, abaixo do escopo V1

## Leitura rápida

O repositório já possui uma base navegável com:

- API NestJS de auth, admin e relatórios;
- API NestJS também como fonte oficial de dashboard, notificações, exportações, settings e perfil;
- Web Next.js com login, dashboard, relatórios e admin básico;
- integração real com SQL Server;
- uso de Supabase concentrado no backend para partes da plataforma.

O repositório ainda não entrega a plataforma V1 completa descrita no PDF.

## Documentos canônicos

Comece por estes arquivos:

1. `README.md`
2. `SPRINT_STATUS.md`
3. `docs/setup.md`
4. `docs/architecture.md`
5. `docs/api.md`
6. `docs/web.md`

## O que está implementado

- login, refresh, logout e reset de senha;
- perfil do usuário via `/auth/me` e `/auth/me/password`;
- sessão de frontend em `sessionStorage`, com migração de legado e refresh automático único em `401`;
- dashboard inicial com KPIs;
- catálogo e execução de relatórios;
- CRUD básico de usuários;
- CRUD básico de grupos;
- leituras de dashboard, exportações, notificações e settings pela API;
- atualização de settings pela API com auditoria;
- trilha de auditoria para criação, edição e exclusão de permissões;
- pipeline real de exportações de relatórios com PDF/XLSX, histórico, fila e download autenticado;
- healthcheck da API e do SQL Server;
- Swagger local.

## O que está parcial

- dashboard interativo;
- visualizador de relatório como experiência dedicada;
- notificações end-to-end;
- configurações do sistema ainda abaixo da profundidade do PDF, mas já editáveis via API;
- arquitetura de persistência da plataforma;
- gestão administrativa de relatórios na Web.

## O que está ausente

- editor de dashboards;
- dashboards personalizados;
- BullMQ;
- Prisma;
- React Query;
- Recharts/Chart.js;
- 2FA/TOTP;
- Redis funcional na aplicação.

## Arquitetura real em uma frase

A Web usa a API NestJS como entrada principal dos fluxos autenticados, e a API combina SQL Server, Supabase e estruturas em memória para sustentar o domínio atual.

## Observações operacionais importantes

- a documentação histórica do projeto superestimava o estado de entrega;
- a pasta `docs/` foi reconstruída para refletir o runtime atual e servir como base mínima canônica;
- `infra/env/.env.example` e `infra/env/.env.production.example` existem neste clone e seguem como referência de ambiente;
- a persistência de definições administrativas de relatórios agora usa Supabase no runtime principal quando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configurados;
- exportações de relatórios agora têm backend real, mas o escopo total de BI/export do PDF ainda não está encerrado.
- settings administrativos agora aceitam atualização via `PATCH /admin/settings/:key`;
- criação, edição e exclusão de permissões agora registram eventos de auditoria.

## Próximo passo recomendado para qualquer continuidade

Antes de implementar novas features, alinhar primeiro:

1. qual arquitetura desejada será mantida;
2. quais dados devem sair de memória;
3. quais persistências ainda precisam sair de memória;
4. quais itens do escopo V1 serão realmente perseguidos na próxima etapa.
