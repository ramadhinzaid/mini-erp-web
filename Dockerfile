# ---- Build stage ---------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

# Install deps (cached unless lockfile berubah).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* dibaca di browser & di-BAKE saat build -> harus URL publik API,
# bukan hostname internal Docker. Diteruskan dari docker-compose (PUBLIC_API_URL).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build

# ---- Runtime stage -------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# `pnpm start` = `next start -p 3001` (lihat package.json).
EXPOSE 3001
CMD ["pnpm", "start"]
