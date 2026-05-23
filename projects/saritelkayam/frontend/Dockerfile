# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
# Pass build-time env vars for Next.js rewrites
ARG BACKEND_HOST=backend
ARG BACKEND_PORT=3001
ARG NEXT_PUBLIC_SITE_URL=https://saritelkayam.com
ENV BACKEND_HOST=$BACKEND_HOST
ENV BACKEND_PORT=$BACKEND_PORT
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

# Stage 2: Production - Node.js runtime to serve Next.js
FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
