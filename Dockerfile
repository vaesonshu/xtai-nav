# xtai-nav 生产镜像（Next.js standalone + Prisma）
# 用法见 docker-compose.yml

ARG NODE_IMAGE=docker.m.daocloud.io/library/node:22-alpine
# ARG NODE_IMAGE=node:22-alpine
FROM ${NODE_IMAGE} AS base
RUN corepack enable
WORKDIR /app

# ---------- 安装依赖 ----------
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml* ./
RUN corepack prepare pnpm@10.18.3 --activate \
  && pnpm install --frozen-lockfile

# ---------- 构建 ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建期环境变量（NEXT_PUBLIC_* 会打进前端包）
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

RUN pnpm exec prisma generate
RUN pnpm run build

# ---------- 生产镜像 ----------
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
