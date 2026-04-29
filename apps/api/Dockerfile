# syntax=docker/dockerfile:1.7
# Dockerfile da API AHCF-CPS — uso com Railway / Render / Fly.io.
# Build multi-stage a partir da raiz do monorepo:
#   docker build -f apps/api/Dockerfile -t ahcf-cps-api .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---- Install deps (cacheável) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/engine/package.json packages/engine/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile=false

# ---- Build ----
FROM deps AS build
COPY packages/engine ./packages/engine
COPY apps/api ./apps/api
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile=false
# pnpm 10+ não executa scripts de dependências por padrão — sem isso, `prisma generate`
# não roda e o runtime falha ao importar @prisma/client (STORE_BACKEND=prisma).
RUN pnpm --filter @ahcf-cps/api exec prisma generate
RUN pnpm --filter @ahcf-cps/engine build \
 && pnpm --filter @ahcf-cps/api build
# Frontend no mesmo processo (monólito): VITE_API_URL vazio => fetch relativo a `/api/...`.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @ahcf-cps/web build

# ---- Runtime ----
FROM node:20-alpine AS runtime
RUN apk add --no-cache openssl wget
ENV NODE_ENV=production
ENV PORT=3333
ENV WEB_DIST_PATH=apps/web/dist
WORKDIR /app

COPY --from=build /repo/node_modules ./node_modules
# pnpm isola deps por pacote — imports como `dotenv` resolvem em apps/api/node_modules.
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/packages/engine/package.json packages/engine/package.json
COPY --from=build /repo/packages/engine/dist packages/engine/dist
COPY --from=build /repo/apps/api/package.json apps/api/package.json
COPY --from=build /repo/apps/api/dist apps/api/dist
COPY --from=build /repo/apps/api/prisma apps/api/prisma
COPY --from=build /repo/apps/web/dist ./apps/web/dist

EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "apps/api/dist/index.js"]
