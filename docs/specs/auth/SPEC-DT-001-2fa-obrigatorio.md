# SPEC-DT-001 — 2FA Obrigatório para Administradores

**ID:** DT-001
**Módulo:** Auth
**Fase:** Fase 4
**Status:** Concluído
**Atualizado em:** 2026-06-28

---

## 1. Objetivo

Tornar o 2FA/TOTP obrigatório para usuários com role `admin`, com endpoints de ativação/verificação e UI de configuração.

## 2. Contexto

O `otplib` já está instalado em `apps/api`. O 2FA é opcional para todos os usuários (RN-014), mas deve ser obrigatório para administradores (RN-015). Esta spec cobre: geração de secret, QR code, verificação de código, fluxo de login com 2FA e enforcement para admins.

## 3. Regras de Negócio

| Código | Regra                                              | Status     |
| ------ | -------------------------------------------------- | ---------- |
| RN-014 | 2FA/TOTP é opcional para todos os usuários         | Confirmado |
| RN-015 | 2FA/TOTP deve ser obrigatório para administradores | Concluído  |

## 4. Fluxo Esperado

### Fluxo — Ativação de 2FA

1. Usuário acessa `/app/profile` → seção 2FA.
2. Clica em "Ativar 2FA".
3. POST /auth/2fa/enable → API gera secret com otplib.
4. API retorna secret + QR code (data URL).
5. Frontend exibe QR code para escanear no app autenticador.
6. Usuário digita código TOTP de 6 dígitos.
7. POST /auth/2fa/verify → API valida código com otplib.
8. API armazena secret criptografado no banco.
9. Frontend exibe "2FA ativado".

### Fluxo — Login com 2FA

1. Usuário faz login (email + senha).
2. API valida credenciais.
3. Se 2FA ativo → API retorna 200 com flag `requiresTwoFactor: true` (sem tokens).
4. Frontend exibe tela de código TOTP.
5. Usuário digita código.
6. POST /auth/login/2fa com código.
7. API valida TOTP.
8. API emite access + refresh tokens.
9. Frontend prossegue para `/app`.

### Fluxo — Enforcement para admins

1. Admin tenta acessar painel sem 2FA ativo.
2. API redireciona para tela de ativação obrigatória.
3. Admin não pode navegar até ativar 2FA.

### Fluxo — Desativação de 2FA

1. Usuário clica em "Desativar 2FA".
2. API exige senha atual + código TOTP.
3. POST /auth/2fa/disable com senha + código.
4. API valida ambos.
5. API remove secret do banco.

## 5. Critérios de Aceite

- [x] Endpoint POST /auth/totp/setup — gera secret + otpauthUrl
- [x] Endpoint POST /auth/totp/verify — valida código TOTP
- [x] Endpoint POST /auth/totp/disable — exige senha + TOTP (proibido para admin)
- [x] Endpoint POST /auth/totp/login — login com código TOTP
- [x] Secret armazenado criptografado no banco (AES-256-GCM)
- [x] UI de configuração de 2FA no perfil
- [x] UI de verificação de código no login
- [x] 2FA obrigatório para role admin (TwoFactorGuard + redirect frontend)
- [x] Bloqueio após 3 tentativas falhas de TOTP (TotpAttemptsService)
- [x] Testes unitários e de integração

## 6. Impacto Técnico

| Área           | Impacto                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| Arquitetura    | Novo serviço TOTP, modificação no fluxo de login                               |
| Banco de dados | Coluna totp_secret em users (criptografada)                                    |
| API            | POST /auth/2fa/enable, /verify, /disable, /login/2fa                           |
| Frontend       | Seção 2FA no perfil, tela de código no login                                   |
| Testes         | Unit (totp.service), Integration (auth.controller 2FA), Security (brute force) |
| Infraestrutura | Nenhuma adicional                                                              |
| Segurança      | Criptografia do secret, rate limiting no TOTP, enforcement por role            |

## 7. Testes Necessários

| Tipo        | Arquivo                 | Descrição                                                    |
| ----------- | ----------------------- | ------------------------------------------------------------ |
| Unit        | totp.service.spec.ts    | Gerar secret, validar código                                 |
| Integration | auth.controller.spec.ts | Fluxo de ativação de 2FA                                     |
| Integration | auth.controller.spec.ts | Login com 2FA                                                |
| Security    | —                       | Brute force em TOTP → bloqueio após 3 tentativas             |
| Manual      | —                       | Escanear QR code no Google Authenticator → verificar códigos |

## 8. Riscos

| Risco                | Impacto                       | Mitigação                    |
| -------------------- | ----------------------------- | ---------------------------- |
| Secret comprometido  | 2FA bypassado                 | Criptografar secret no banco |
| Brute force de TOTP  | Adivinhar código de 6 dígitos | Rate limiting (3 tentativas) |
| Perda de dispositivo | Usuário sem acesso            | Códigos de backup (futuro)   |
| Admin sem 2FA        | Conta comprometida            | Enforcement obrigatório      |

## 9. Dependências

- `otplib` (instalado)
- Coluna `totp_secret` em users (migration pendente)
- Modificação no fluxo de login (auth.controller)
- UI de 2FA no perfil e no login
