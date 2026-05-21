# Setup local

Este guia orienta uma pessoa desenvolvedora nova a rodar o projeto localmente.

## Pré-requisitos

- Git
- Node.js 20+
- pnpm 9+
- Docker e Docker Compose para execução containerizada

## 1. Clonar repositório

```bash
git clone https://github.com/Dev-RuiDiniz/Dashboard_Power_BI.git
cd Dashboard_Power_BI
```

## 2. Instalar dependências

```bash
pnpm install
```

## 3. Validar fundação técnica

```bash
pnpm verify:workspace
pnpm verify:docker
pnpm verify:docs
pnpm quality
```

## 4. Configurar variáveis

```bash
cp infra/env/.env.example .env
```

Preencha somente valores locais. Não commitar `.env`.

## 5. Rodar sem Docker

Terminal 1:

```bash
pnpm dev:api
```

Terminal 2:

```bash
pnpm dev:web
```

Validar:

```text
http://localhost:3000
http://localhost:3001/health
http://localhost:3001/docs
http://localhost:3000/design-system
```

## 6. Rodar com Docker

```bash
pnpm docker:dev
```

Logs:

```bash
pnpm docker:dev:logs
```

Derrubar:

```bash
pnpm docker:dev:down
```

## 7. Checklist final

- [ ] `pnpm install` executou sem erro
- [ ] `pnpm quality` executou sem erro
- [ ] API responde `/health`
- [ ] Swagger abre em `/docs`
- [ ] Web abre em `localhost:3000`
- [ ] Preview visual abre em `/design-system`
- [ ] `.env` real não foi versionado
