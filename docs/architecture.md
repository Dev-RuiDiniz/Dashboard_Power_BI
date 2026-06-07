# Arquitetura

## Topologia real

```text
apps/web -> apps/api -> SQL Server
       \-> Supabase direct reads
```

## Resumo

O repositório é um monorepo pnpm com duas aplicações principais:

- `apps/api`: API NestJS para autenticação, administração básica e relatórios
- `apps/web`: frontend Next.js 14 com App Router

## Fontes de dados

- SQL Server: consultas de relatórios via API
- Supabase: leituras diretas do frontend para dashboard, notificações, exportações e settings no estado atual
- memória de processo: parte dos dados administrativos e definições de relatórios ainda não está persistida de forma definitiva

## Limitações atuais

- a arquitetura ainda não está centralizada apenas na API;
- nem todos os módulos existentes no código estão integrados ao runtime principal;
- Redis aparece na infraestrutura local, mas não é uma dependência funcional da aplicação hoje.

## Referências

- `README.md`
- `SPRINT_STATUS.md`
- `HANDOFF.md`
