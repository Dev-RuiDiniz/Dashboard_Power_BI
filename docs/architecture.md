# Arquitetura

## Topologia real

```text
apps/web -> apps/api -> SQL Server
                    \-> Supabase
                    \-> fallbacks em memória em partes do domínio
```

## Resumo

O repositório é um monorepo pnpm com duas aplicações principais:

- `apps/api`: API NestJS para autenticação, administração básica e relatórios
- `apps/web`: frontend Next.js 14 com App Router

## Fontes de dados

- SQL Server: consultas de relatórios via API
- Supabase: usado pela API nos fluxos de dashboard, notificações, exportações, settings, permissões e auditoria
- memória de processo: ainda existe como fallback em partes do domínio, mas definições administrativas de relatórios já persistem via Supabase no runtime principal

## Estado após a Fase 1

- a API é a fonte oficial dos fluxos autenticados de platform;
- `PlatformModule`, `PermissionsModule`, `AuditModule` e `CommonModule` estão integrados ao runtime principal;
- a Web deixou de depender de `/auth/me` e `/auth/me/password` inexistentes.
- settings administrativos agora são mutáveis pela API centralizada e auditados no backend;
- mutações de permissões também entram na trilha de auditoria do runtime principal.
- a sessão web saiu de `localStorage`, passou a usar `sessionStorage` e ganhou refresh automático único via `/auth/refresh` em respostas `401`.

## Limitações atuais

- a centralização na API não elimina a dependência operacional do Supabase no backend atual;
- Redis aparece na infraestrutura local, mas não é uma dependência funcional da aplicação hoje.

## Referências

- `README.md`
- `SPRINT_STATUS.md`
- `HANDOFF.md`
