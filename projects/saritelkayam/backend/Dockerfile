# Stage 1: Build TypeScript + generate Prisma client
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev for compilation)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy source and compile TypeScript
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy Prisma schema, generated client, and compiled output
COPY --from=builder /app/prisma/ ./prisma/
COPY --from=builder /app/generated/ ./generated/
COPY --from=builder /app/dist/ ./dist/

EXPOSE 3001

# Run migrations then start compiled server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
