# Variáveis de ambiente

O arquivo versionado é `infra/env/.env.example`. Arquivos `.env` reais não devem ser versionados.

## Auth

| Variável | Exemplo | Descrição |
|---|---:|---|
| `AUTH_DEMO_USER_EMAIL` | vazio | E-mail do usuário demo em desenvolvimento/testes. |
| `AUTH_DEMO_USER_PASSWORD` | vazio | Senha do usuário demo. Nunca versionar valor real. |
| `JWT_ACCESS_SECRET` | vazio | Secret forte usado para assinar access tokens. |
| `JWT_ACCESS_EXPIRES_IN_SECONDS` | `900` | Expiração do access token. |
| `JWT_REFRESH_EXPIRES_IN_SECONDS` | `604800` | Expiração do refresh token. |
| `BCRYPT_SALT_ROUNDS` | `10` | Custo de hash bcrypt. |
| `AUTH_LOGIN_MAX_ATTEMPTS` | `5` | Máximo de falhas antes do lockout. |
| `AUTH_LOGIN_WINDOW_SECONDS` | `900` | Janela de contagem das falhas. |
| `AUTH_LOGIN_LOCKOUT_SECONDS` | `900` | Tempo de bloqueio após exceder tentativas. |

## Recuperação de senha

| Variável | Exemplo | Descrição |
|---|---:|---|
| `PASSWORD_RESET_TOKEN_EXPIRES_SECONDS` | `900` | Expiração do token temporário. |
| `PASSWORD_RESET_PUBLIC_URL` | `http://localhost:3000/reset-password` | URL pública usada para montar o link de reset. |
| `SMTP_MODE` | `mock` | Modo de envio. `mock` usa adapter em memória. |
| `SMTP_HOST` | vazio | Host SMTP para envio real futuro. |
| `SMTP_PORT` | `587` | Porta SMTP. |
| `SMTP_USER` | vazio | Usuário SMTP. Nunca versionar valor real. |
| `SMTP_PASSWORD` | vazio | Senha SMTP. Nunca versionar valor real. |
| `SMTP_FROM` | vazio | Remetente padrão. |
| `SMTP_SECURE` | `false` | Define se SMTP usará conexão segura. |

## SQL Server

A TASK-15 adiciona configuração segura para conexão com SQL Server externo. Use usuário dedicado e preferencialmente `read-only`, sem permissões de escrita, DDL, administração ou acesso fora das bases necessárias.

| Variável | Exemplo | Descrição |
|---|---:|---|
| `SQLSERVER_HOST` | vazio | Host do SQL Server. Não expor em logs ou respostas públicas. |
| `SQLSERVER_PORT` | `1433` | Porta TCP do SQL Server. |
| `SQLSERVER_DATABASE` | vazio | Banco usado pela API. |
| `SQLSERVER_USER` | vazio | Usuário dedicado de leitura. Nunca usar `sa` ou usuário admin. |
| `SQLSERVER_PASSWORD` | vazio | Senha do usuário SQL. Nunca versionar valor real. |
| `SQLSERVER_ENCRYPT` | `true` | Habilita criptografia na conexão. |
| `SQLSERVER_TRUST_SERVER_CERTIFICATE` | `false` | Deve ser `false` em produção, salvo exceção controlada. |
| `SQLSERVER_CONNECTION_TIMEOUT_MS` | `5000` | Timeout de abertura da conexão em milissegundos. |
| `SQLSERVER_REQUEST_TIMEOUT_MS` | `5000` | Timeout de execução de consultas em milissegundos. |
| `SQLSERVER_POOL_MAX` | `5` | Tamanho máximo do pool de conexões. |
| `SQLSERVER_POOL_MIN` | `0` | Tamanho mínimo do pool de conexões. |
| `SQLSERVER_POOL_IDLE_TIMEOUT_MS` | `30000` | Tempo ocioso para liberar conexões do pool. |

### Healthcheck SQL

A API expõe um healthcheck sanitizado:

```http
GET /health/sql
```

A resposta informa apenas se a dependência está saudável ou indisponível. O retorno não deve conter senha, usuário, host, database, string de conexão ou erro bruto do driver.

## RBAC e setores

A TASK-11 não adiciona novas variáveis obrigatórias. Os usuários seed de desenvolvimento são criados em memória quando `AUTH_DEMO_USER_EMAIL` e `AUTH_DEMO_USER_PASSWORD` estão configurados.

Usuários adicionais de teste/desenvolvimento:

| E-mail | Perfil | Setores |
|---|---|---|
| `viewer.financeiro@example.com` | `viewer` | financeiro |
| `downloader.financeiro@example.com` | `downloader` | financeiro |
| `viewer.comercial@example.com` | `viewer` | comercial |

## Segurança

- Nunca versionar `.env` real.
- Nunca colar senhas, tokens, secrets ou strings de conexão no chat.
- Manter `infra/env/.env.example` apenas com placeholders.
- `JWT_ACCESS_SECRET` deve ser forte, exclusivo por ambiente e rotacionável.
- Tokens de recuperação são opacos, temporários e armazenados internamente apenas como hash.
- Perfis e setores devem vir do token validado ou da persistência confiável, nunca do payload enviado pelo cliente.
- Credenciais do SQL Server devem pertencer a usuário dedicado, preferencialmente `read-only`.
- Healthchecks devem ser sanitizados e não podem retornar credenciais, host, database ou erro bruto.
