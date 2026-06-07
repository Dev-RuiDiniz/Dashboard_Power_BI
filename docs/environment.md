# Ambiente

## Arquivos de referência

- `infra/env/.env.example`
- `infra/env/.env.production.example`

## Variáveis importantes

### API

- `API_PORT`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SQLSERVER_*`

### Web

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Infra

- `REDIS_PORT`
- `NGINX_PORT`

## Diagnóstico rápido

- frontend sem autenticação: valide `NEXT_PUBLIC_API_URL`
- relatórios sem dados: valide `SQLSERVER_*`
- dashboard/notificações/exportações/settings vazios: valide as variáveis públicas do Supabase
