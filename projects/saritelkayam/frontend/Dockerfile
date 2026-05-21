# Stage 1: Build Next.js application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (separate layer for caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production - nginx serves static output
FROM nginx:alpine

# Copy built output from builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Custom nginx config: serve static files + proxy /api/ to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
