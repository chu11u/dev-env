# Agent: Infrastructure

## Role

Build all deployment infrastructure: Docker containers, docker-compose orchestration, nginx reverse proxy configuration, and deployment scripts.

## Model

`qwen3.6:27b-coding-nvfp4`

## Skills to Load

- `.skills/docker-deploy.md` — Containerization, nginx reverse proxy, deployment patterns

## Scope Boundaries

### Owns (writes these files)
- Root `docker-compose.yml` — Service orchestration for frontend, backend, postgres
- Root `Dockerfile` — Multi-stage build for frontend (Next.js builder + nginx serving)
- `backend/Dockerfile` — Node runtime for backend API
- `nginx-project-template.conf` (in dev-env root) — Nginx config for this project's domains
- `deploy-project.sh` updates (in dev-env root) — If needed for new project integration

### Reads (do not modify)
- `MEMORY.md` — Project context, ports, domains, environment variables
- `.skills/docker-deploy.md` — Reference patterns
- Files created by other agents (reference only, never modify)

### Must NOT Touch
- Frontend source code (`frontend/`)
- Backend source code (`backend/`)
- Design system files
- Media assets
- Application code of any kind

## Task Queue

### Phase 1 Tasks (execute in order)

1. **Create root docker-compose.yml**
   - Services: frontend, backend, postgres
   - Ports: frontend:3006, backend:30061, postgres:5432 (internal only)
   - Volume: `../../project-data/saritelkayam/db:/var/lib/postgresql/data`
   - Container names: `saritelkayam-frontend`, `saritelkayam-backend`, `saritelkayam-postgres`
   - Environment: DATABASE_URL for backend, NEXT_PUBLIC_API_URL for frontend
   - Restart policy: `unless-stopped`
   - Health checks for postgres (backend depends on it)

2. **Create frontend Dockerfile**
   - Multi-stage: builder (Node 20) → production (nginx:alpine)
   - Builder stage: install deps, run Next.js build
   - Production stage: copy build output, serve with nginx
   - Expose port 3000 (mapped to 3006 in docker-compose)
   - Include nginx config that serves Next.js static output + proxies /api/ to backend

3. **Create backend Dockerfile**
   - Node 20 runtime
   - Copy prisma schema, generate client
   - Copy application code
   - Expose port 3001 (mapped to 30061 in docker-compose)
   - Start command: node server

4. **Create/update nginx config**
   - Domain: `saritelkayam.apps.elkayam.me` (local dev)
   - Proxy frontend to port 3006
   - Proxy `/api/` to backend on port 30061
   - NO trailing slash on proxy_pass (preserves /api/ prefix)
   - Follow existing pattern in dev-env for `nginx-project-template.conf`

### Phase 3 Tasks (execute after all other agents complete)

5. **Verify infrastructure works**
   - Docker compose builds and starts all services
   - Nginx routes traffic correctly to all services
   - Health checks pass

6. **Document deployment steps**
   - Add to MEMORY.md: final deploy checklist
   - Cloudflare tunnel ingress rule for `saritelkayam.com`

## Output Expectations

After Phase 1, these files should exist and be correct:
- `docker-compose.yml` ✅
- `Dockerfile` (root) ✅
- `backend/Dockerfile` ✅
- Nginx config entries for `saritelkayam.apps.elkayam.me` ✅

After Phase 3:
- All services build and run successfully ✅
- External domain access working ✅
- Deployment documented in MEMORY.md ✅

## Constraints

- Follow existing dev-env patterns (look at other projects for reference)
- Container naming: `saritelkayam-*` prefix
- Data persistence: `../../project-data/saritelkayam/db/`
- No trailing slash on nginx proxy_pass directives
- Keep Docker images lean — multi-stage builds, alpine base images
