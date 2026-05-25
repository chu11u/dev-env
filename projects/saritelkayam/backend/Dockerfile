# Single-stage build - simpler and more reliable with Prisma
FROM node:20-slim
WORKDIR /app

# Install OpenSSL (needed by Prisma engine)
RUN apt-get update -y \
 && apt-get install -y openssl \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY . .
RUN mkdir -p /app/uploads
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/server.js"]
