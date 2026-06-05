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

ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /workspace/ /workspace/
COPY . .

RUN pnpm --filter @dashboard-power-bi/web build

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /workspace/ /workspace/

EXPOSE 3000

CMD ["pnpm", "--filter", "@dashboard-power-bi/web", "exec", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
