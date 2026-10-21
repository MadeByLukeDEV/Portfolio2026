# syntax=docker/dockerfile:1

ARG NODE_VERSION=24

# ---- dependencies -----------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
RUN npm install -g pnpm@12.3.4
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# ---- build ------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS build
RUN npm install -g pnpm@12.3.4
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Nothing connects to the database during the build; Prisma only needs the variable to exist.
ENV DATABASE_URL="mysql://build:build@127.0.0.1:3306/build" \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm exec prisma generate && pnpm build

# ---- migration tooling (prisma CLI only, kept out of the runtime bundle) ----
FROM node:${NODE_VERSION}-alpine AS migrate-tools
WORKDIR /migrate
RUN npm init -y >/dev/null && npm install --omit=dev prisma@7.10.1 dotenv@17
COPY prisma ./prisma
COPY prisma.config.ts ./

# ---- runtime ----------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=migrate-tools --chown=nextjs:nodejs /migrate /migrate
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
