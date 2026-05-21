# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app

# Install build deps
RUN apt-get update -y \
 && apt-get install -y openssl libssl3 \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-slim
WORKDIR /app

# Install OpenSSL (needed by Prisma engine at runtime)
RUN apt-get update -y \
 && apt-get install -y openssl libssl3 \
 && rm -rf /var/lib/apt/lists/*

# Copy everything from builder - Prisma client + engines need to match runtime OS
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/prisma/ ./prisma/
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
