FROM node:20-alpine AS base

WORKDIR /workspace

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --no-frozen-lockfile

FROM base AS builder

COPY --from=deps /workspace/ /workspace/
COPY . .

RUN pnpm --filter @dashboard-power-bi/api build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /workspace/ /workspace/

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
