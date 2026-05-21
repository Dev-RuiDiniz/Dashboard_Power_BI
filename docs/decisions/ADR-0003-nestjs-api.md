# ADR-0003 — Inicialização da API NestJS

## Status

Aceita.

## Contexto

O projeto precisa de uma API backend modular, testável e segura para sustentar autenticação, permissões, relatórios, dashboards, exportações e auditoria.

## Decisão

Inicializar `apps/api` com NestJS, TypeScript, ConfigModule global, ValidationPipe global, Swagger e testes com Jest/Supertest.

## Consequências positivas

- Estrutura backend modular desde o início.
- Endpoint `/health` para smoke test e futura monitoração.
- Validação global habilitada com whitelist e bloqueio de campos não permitidos.
- Swagger disponível para documentação técnica incremental.
- Testes e2e preparados para validar contrato HTTP.

## Consequências negativas

- A configuração inicial adiciona dependências antes das funcionalidades reais.
- O endpoint `validation-test` é técnico e temporário.
- A configuração pode precisar de ajustes quando autenticação, banco e módulos reais forem adicionados.

## Mitigações

- Documentar claramente o papel temporário do endpoint de validação.
- Manter módulos pequenos e coesos.
- Evoluir testes junto com cada tarefa.
- Não versionar secrets ou arquivos `.env` reais.
