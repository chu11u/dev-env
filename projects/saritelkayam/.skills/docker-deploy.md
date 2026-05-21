# Skill: Docker Deployment

## Overview

Container-based deployment for the Sarit Elkayam website. Multi-stage builds for lean images, docker-compose for orchestration, nginx for reverse proxy.

## Project Architecture

```
nginx (port 80)
    │
    ├── saritelkayam.apps.elkayam.me → frontend:3000 (mapped to host:3006)
    │       └── Next.js 15 app (static + SSR, served by nginx)
    │
    └── /api/* → backend:3001 (mapped to host:30061)
            └── Node.js API (Prisma + routes)
            
    postgres:5432 (internal only, not exposed to host)
```

## Docker Compose

```yaml
# docker-compose.yml (at project root)
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: saritelkayam-frontend
    ports:
      - "3006:3000"
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:30061
      - NEXT_PUBLIC_SITE_URL=https://saritelkayam.com

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: saritelkayam-backend
    ports:
      - "30061:3001"
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://saritelkayam:saritelkayam_password@postgres:5432/saritelkayam
      - NODE_ENV=production

  postgres:
    image: postgres:16-alpine
    container_name: saritelkayam-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: saritelkayam
      POSTGRES_USER: saritelkayam
      POSTGRES_PASSWORD: saritelkayam_password
    volumes:
      - ../../project-data/saritelkayam/db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U saritelkayam"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### Key Points
- Container names: `saritelkayam-*` prefix (avoid conflicts with other projects)
- Port mapping: Frontend host:3006, Backend host:30061
- Postgres: Internal only (no port mapping)
- Data persistence: `../../project-data/saritelkayam/db/` volume
- Health check: Postgres health check ensures backend waits for DB
- Restart policy: `unless-stopped` (survives container restarts)

## Frontend Dockerfile (Multi-Stage)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (separate layer for caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production (nginx serves static files)
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html

# Custom nginx config for Next.js
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Config for Next.js (inside container)

```nginx
server {
    listen 3000;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Next.js static assets
    location /_next/ {
        try_files $uri $uri/ =404;
    }
    
    # Static assets (images, fonts, etc.)
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy (forward to backend)
    location /api/ {
        proxy_pass http://backend:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # SPA fallback (for client-side routing)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Backend Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy application code
COPY . .

# Expose API port
EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

## Nginx Reverse Proxy (Host Level)

### Project Config Template

```nginx
# nginx-project-template.conf (in dev-env root)
# This is included by the main nginx config

# Local dev access
server {
    listen 80;
    server_name saritelkayam.apps.elkayam.me;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:30061;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Critical: No Trailing Slash on proxy_pass

```nginx
# ✅ CORRECT — preserves /api/ prefix
location /api/ {
    proxy_pass http://localhost:30061;
}
# Request: /api/blog/posts → Forwarded: /api/blog/posts

# ❌ WRONG — strips /api/ prefix
location /api/ {
    proxy_pass http://localhost:30061/;
}
# Request: /api/blog/posts → Forwarded: /blog/posts (WRONG!)
```

## Deployment Workflow

### Build and Deploy

```bash
# 1. Navigate to project directory
cd dev-env/projects/saritelkayam

# 2. Build and start containers
docker compose up -d --build

# 3. Check logs for errors
docker compose logs -f

# 4. Verify services are running
docker compose ps
```

### Stop and Restart

```bash
# Stop all services
docker compose down

# Restart without rebuilding
docker compose restart

# Rebuild and restart
docker compose up -d --build
```

### Data Backup

```bash
# PostgreSQL dump
docker exec saritelkayam-postgres pg_dump -U saritelkayam saritelkayam > backup.sql

# Restore
docker exec -i saritelkayam-postgres psql -U saritelkayam saritelkayam < backup.sql
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs saritelkayam-frontend
docker logs saritelkayam-backend
docker logs saritelkayam-postgres

# Check if ports are in use
lsof -i :3006
lsof -i :30061

# Kill conflicting processes
kill -9 $(lsof -ti :3006)
```

### Database Connection Failed

```bash
# Check if postgres is healthy
docker compose ps postgres

# Check postgres logs
docker logs saritelkayam-postgres

# Verify DATABASE_URL matches docker-compose settings
echo $DATABASE_URL
```

### Nginx 502 Bad Gateway

```bash
# Check if backend is running
curl http://localhost:30061/api/health

# Check nginx config syntax
nginx -t

# Reload nginx
nginx -s reload
```

## Cloudflare Tunnel (External Access)

### For `saritelkayam.com`

```bash
# Install cloudflared
# Add ingress rule in Cloudflare Zero Trust dashboard:
# saritelkayam.com → https://localhost:80 (nginx)

# Or use cloudflared CLI:
cloudflared tunnel --hostname saritelkayam.com --url http://localhost:80
```

### Docker-Compose with Cloudflare (Alternative)

If using Cloudflare tunnel as a service:

```yaml
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: saritelkayam-cloudflared
    command: tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
    depends_on:
      - frontend
    restart: unless-stopped
```

## Do Not

### Don't: Expose PostgreSQL to Host

```yaml
# ❌ Never do this in production
ports:
  - "5432:5432"

# ✅ Keep it internal only
# No ports mapping — only accessible via docker network
```

### Don't: Forget Health Checks

Without health checks, backend may start before postgres is ready, causing connection errors.

### Don't: Hardcode Secrets in Dockerfile

Use environment variables or docker-compose environment section. Never bake secrets into images.

### Don't: Forget Data Volumes

Without persistent volumes, PostgreSQL data is lost on container recreation. Always mount `../../project-data/` volumes.
