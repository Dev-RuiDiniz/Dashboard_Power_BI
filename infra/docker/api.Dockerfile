FROM node:20-alpine

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile=false

COPY . .

EXPOSE 3001

CMD ["pnpm", "--filter", "@dashboard-power-bi/api", "dev"]
