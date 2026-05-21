# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# Stage 2: Production — Debian with OpenSSL for Prisma
FROM node:20-slim
WORKDIR /app

RUN apt-get update -y \
 && apt-get install -y openssl libssl3 \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/prisma/ ./prisma/
COPY --from=builder /app/generated/ ./generated/
COPY --from=builder /app/dist/ ./dist/

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
