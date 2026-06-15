# Ambiente

## Arquivos de referência

- `infra/env/.env.example`
- `infra/env/.env.production.example`

## Variáveis importantes

### API

- `API_PORT`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SQLSERVER_*`

### Web

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL` (residual e opcional no runtime principal atual)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (residual e opcional no runtime principal atual)

### Infra

- `REDIS_PORT`
- `NGINX_PORT`

## Diagnóstico rápido

- frontend sem autenticação: valide `NEXT_PUBLIC_API_URL`
- relatórios sem dados: valide `SQLSERVER_*`
- dashboard/notificações/exportações/settings vazios: valide `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
