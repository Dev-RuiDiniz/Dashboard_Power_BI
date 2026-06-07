# Handoff do Projeto

**Projeto:** Dashboard Power BI  
**Data:** 2026-06-05  
**Status correto:** base funcional parcial, abaixo do escopo V1

## Leitura rápida

O repositório já possui uma base navegável com:

- API NestJS de auth, admin e relatórios;
- Web Next.js com login, dashboard, relatórios e admin básico;
- integração real com SQL Server;
- uso direto de Supabase em partes da Web.

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
- sessão de frontend em `localStorage`;
- dashboard inicial com KPIs;
- catálogo e execução de relatórios;
- CRUD básico de usuários;
- CRUD básico de grupos;
- leitura de exportações, notificações e settings no Supabase;
- healthcheck da API e do SQL Server;
- Swagger local.

## O que está parcial

- dashboard interativo;
- visualizador de relatório como experiência dedicada;
- notificações end-to-end;
- exportações end-to-end;
- configurações do sistema;
- arquitetura de persistência da plataforma;
- gestão administrativa de relatórios na Web.

## O que está ausente

- perfil do usuário;
- gestão dedicada de permissões;
- logs de auditoria;
- editor de dashboards;
- dashboards personalizados;
- export pipeline backend;
- BullMQ;
- Prisma;
- React Query;
- Recharts/Chart.js;
- 2FA/TOTP;
- Redis funcional na aplicação.

## Arquitetura real em uma frase

A Web usa a API NestJS para auth/admin/reports, consulta Supabase direto para outras áreas e a API usa SQL Server mais estruturas em memória para sustentar parte do domínio.

## Observações operacionais importantes

- a documentação histórica do projeto superestimava o estado de entrega;
- a pasta `docs/` foi reconstruída para refletir o runtime atual e servir como base mínima canônica;
- `infra/env/.env.example` é citado por scripts e docs antigas, mas não está presente no clone atual;
- parte do estado administrativo da API ainda depende de memória do processo;
- exportações visíveis na Web não significam export backend funcional.

## Próximo passo recomendado para qualquer continuidade

Antes de implementar novas features, alinhar primeiro:

1. qual arquitetura desejada será mantida;
2. quais dados devem sair de memória;
3. se a Web continuará acessando Supabase diretamente;
4. quais itens do escopo V1 serão realmente perseguidos na próxima etapa.
