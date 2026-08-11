# Dev Environment Memory Dump
# Updated: May 20, 2026
# Use this to continue the project in a new conversation

## ARCHITECTURE

```
Local network:   Technitium DNS (*.apps.elkayam.me → 192.168.131.134) → nginx:80 → containers
External:        Cloudflare DNS (*.elkayam.fun) → cloudflared tunnel → nginx:80 → containers
```

**Domains**:
- `*.apps.elkayam.me` — Local access via Technitium DNS + NPM (TLS)
- `*.elkayam.fun` — External access via Cloudflare DNS + tunnel (Cloudflare TLS)

**Apps**:
- `dev.apps.elkayam.me` → code-server (VS Code IDE, port 8080)
- `clock.apps.elkayam.me` → Clock dashboard (static HTML, port 3002)
- `arcade.apps.elkayam.me` / `arcade.elkayam.fun` → Family Arcade (React + Express, ports 3003/30031)
- `dinnerplan.apps.elkayam.me` / `dinnerplan.elkayam.fun` → Dinner planner (React + Express, ports 3004/30041)
- `saritelkayam.apps.elkayam.me` / `saritelkayam.com` → Sarit Elkayam cosmetician website (Next.js 15, ports 3006/30061, Cloudflare direct to port 3006)
- `erez.apps.elkayam.me` / `erez.elkayam.fun` → Location Log PWA (React 19 + Vite + IndexedDB, port 3008)

**Cloudflare tunnel** (`docker-compose.cloudflare.yml`):
- Single `cloudflared` container with `network_mode: host`
- Routes all `*.elkayam.fun` → nginx port 80
- Token in `.env.cloudflare` (git-ignored, env var `TUNNEL_TOKEN`)
- Configured via Cloudflare Zero Trust dashboard → Tunnels → ingress rules
- Each app needs an ingress rule: `appname.elkayam.fun` → `http://localhost:80`
- Catch-all rule: `*` → `http://nowhere`

## SERVER (LXC Container - Debian 12)

- **IP**: 192.168.131.134
- **SSH**: `ssh -i ~/.ssh/dev-env-server naor@192.168.131.134` (key-based auth)
- **Docker**: 20.10.24 + compose plugin (v2.x) — `naor` user in docker group
- **nginx**: 1.22.1 on port 80
- **Domain**: elkayam.me (Technitium DNS + NPM for TLS, local only)
- **External domain**: elkayam.fun (Cloudflare DNS + tunnel)
- **Technitium**: Wildcard A record `*.apps` → server's public IP
- **Nginx**: `server_name` includes both `.apps.elkayam.me` and `.elkayam.fun` (auto-generated)
- **Files owned by**: `naor` (was `root`/`elkayam`, fixed with `sudo chown -R naor:naor`)

## PROJECT PATHS

**Server**: `/home/elkayam/dev-env/` (owned by `naor`)
**Local**: `/Users/elnaor/Environments/Zed/dev-env/`
**GitHub**: `github.com/chu11u/dev-env`

## DIRECTORY STRUCTURE

```
dev-env/
├── deploy-all.sh                     # Main deploy script (self-updates, see below)
├── .env                              # code-server password
├── .env.cloudflare                   # Tunnel token (git-ignored)
├── docker-compose.cloudflare.yml    # Cloudflare tunnel (cloudflared)
├── docker-compose.yml               # code-server
├── nginx-dev.apps.elkayam.me.conf # code-server nginx config
├── nginx-project-template.conf     # Template for single-service projects
├── project-data/                    # PERSISTENT DATA (outside git, auto-migrated)
│    ├── arcade/data/data.json       # Arcade player/score data
│    └── dinnerplan/data/data.json   # Dinnerplan data
├── projects/
│    ├── clock/                      # Static HTML clock ✅
│    │    ├── Dockerfile             # nginx:alpine serving index.html
│    │    ├── docker-compose.yml     # container_name: clock, port 3002
│    │    └── index.html             # Clock dashboard
│    └── arcade/                     # Family Arcade ✅
│        ├── docker-compose.yml      # 2 services: frontend + backend
│        │   NOTE: backend volume = `../../project-data/arcade/data:/app/data`
│        │   (NOT `../project-data` — docker-compose resolves from projects/arcade/)
│        ├── nginx-api.conf          # Custom nginx (API proxy)
│        ├── backend/
│        │    ├── Dockerfile
│        │    ├── server.js          # Express + lowdb (players, scores, games)
│        │    └── package.json
│         └── frontend/
│             ├── Dockerfile           # Node builder + preview
│             ├── vite.config.js
│             ├── package.json         # React 18.3.1 + Vite 5.4.1
│             ├── src/App.jsx          # Main app (routing between games)
│             ├── src/main.jsx
│             ├── src/index.css        # Global styles + mobile media queries
│             └── src/components/
│                 ├── PlayerSelect.jsx     # Player list + registration + DELETE button
│                 ├── GameLobby.jsx        # Game selection + player stats + back button
│                 ├── SkyJumper.jsx        # Jumping game (canvas)
│                 ├── MemoryMatch.jsx      # Card matching game
│                 ├── TetrisGame.jsx       # Classic Tetris (canvas, mobile-responsive)
│                 └── Leaderboard.jsx      # Score board
│     └── dinnerplan/                     # Family Dinner Planner ✅
│         ├── docker-compose.yml           # 2 services: frontend + backend
│         ├── frontend/                    # React + Vite (Hebrew RTL)
│          └── backend/                     # Express + fs JSON
│      └── saritelkayam/                   # Sarit Elkayam cosmetician website 🆕
│          ├── docker-compose.yml           # 3 services: frontend + backend + postgres
│          ├── frontend/                    # Next.js 15 + Tailwind + Framer Motion
│          ├── backend/                     # Next.js API routes + Prisma + PostgreSQL
│          ├── content/                     # Markdown blog posts
│          └── MEMORY.md                    # Project-specific memory dump
```

## DEPLOY WORKFLOW

### Remote deploy (via SSH):
```bash
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && ./deploy-all.sh"
```

### Local (creating new projects):
1. Create files in `projects/<name>/` (must have `docker-compose.yml` + `Dockerfile`)
2. Push: `cd dev-env && git add -A && git commit -m "msg" && git push origin main`

### Deploy script (`deploy-all.sh`) — bulletproof, self-updates:

**Step 0**: Move `project-data` outside `projects/` if misplaced
**Step 0.5**: Migrate arcade data BEFORE git pull (prevents data loss)
**Step 1**: Git pull with untracked file cleanup. **Self-updates**: checks md5sum before/after pull and re-runs with `exec "$0" "$@"` if script changed
**Step 2**: Generate nginx configs via heredocs (no `sed -i`):
     - Single-service projects: use `generate_nginx_config()` function
     - Multi-service projects: use `generate_nginx_api_config()` function
     - Auto-cleans stale configs for non-existent projects
     - Write to `/tmp/` first, then `sudo cp` + `sudo ln` to `/etc/nginx/` (no permission issues)
     - All configs include both `.apps.elkayam.me` and `.elkayam.fun` domains
- **Sudoers**: `naor` has NOPASSWD for `/usr/sbin/nginx`, `/usr/bin/cp`, `/usr/bin/ln` (needed for nginx config writes)
**Step 3**: Docker cleanup:
     - `docker compose down --rmi local --volumes --remove-orphans`
     - `docker rm -f` for any remaining containers
     - `docker network rm` for project-specific networks
     - `docker image rm` for dangling images
**Step 4**: Build & deploy each project
**Summary**: Shows ✅ successes, ❌ failures, ⚠️ warnings

## CRITICAL ISSUES & FIXES

1. **Nested .git repos**: Always `rm -rf projects/<name>/.git` before committing.

2. **Nginx config generation**:
     - Deploy script generates configs via **heredocs** (not `sed -i` on template file)
     - `generate_nginx_config(name, port)` for single-service projects
     - `generate_nginx_api_config(name, frontend_port, api_port)` for multi-service projects
     - Stale configs auto-removed based on whitelist of valid project names

3. **API routing in nginx**: The `proxy_pass` MUST NOT have trailing slash:
     ```nginx
     # RIGHT (preserves /api/ prefix):
     proxy_pass http://127.0.0.1:PORT;
     # WRONG (strips /api/ prefix):
     proxy_pass http://127.0.0.1:PORT/;
     ```
     This was the cause of "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" errors.

4. **Docker container name conflicts**: Use `docker compose down` BEFORE `docker rm -f`. Don't try to remove containers before compose knows about them.

5. **Docker network ambiguity**: "network X_default is ambiguous (2 matches found)" means duplicate networks exist. Fix with `docker network prune -f` or manually remove duplicates.

6. **Data persistence**: Arcade data lives in `project-data/arcade/data/data.json`. Deploy script auto-migrates this BEFORE git pull. **Volume path in docker-compose**: `../../project-data/arcade/data:/app/data` (was `../` which pointed wrong dir).

7. **Vite allowedHosts**: Must have `allowedHosts: true` in both `server` and `preview` sections of vite.config.js.

8. **Browser caching**: Always hard refresh (Cmd+Shift+R) after frontend updates.

9. **SSH access**: Key at `~/.ssh/dev-env-server` (ed25519). User: `naor`. Files owned by `naor` (was `root`).

10. **File ownership**: Server files must be owned by `naor`. Fix with `sudo chown -R naor:naor /home/elkayam/dev-env`.

## ARCADE PROJECT STATUS

### Games (all working):
- ✅ **Sky Jumper** — Jumping game with keyboard (← →, A/D) + touch controls, high score
- ✅ **Memory Match** — Card matching game
- ✅ **Tetris** — Classic Tetris with:
     - All 7 tetrominoes (I, O, T, S, Z, J, L) with distinct colors
     - Ghost piece preview
     - Next piece preview
     - Score, Lines, Level tracking
     - High score (localStorage)
     - Keyboard: ← → move, ↑ rotate, ↓ soft drop, Space pause
     - Touch: top=rotate, left/right=move, center=drop
     - Game state in single mutable `game` object, shared via `gameRef.current`
     - Mobile-responsive layout (canvas scales to viewport, compact overlays)
     - **Fixed**: clearLines logic (was keeping full rows instead of removing them)

### Features:
- ✅ Player registration (with error handling, username required)
- ✅ Player selection screen with avatars
- ✅ **Player deletion** — ✕ button on player cards (only when 2+ players)
- ✅ Game lobby with stats + back button (mobile-friendly flex layout)
- ✅ Leaderboard
- ✅ Backend API (players CRUD, scores, games)
- ✅ Data persistence (lowdb JSON in `project-data/`)
- **Docker compose** (2 containers: frontend + backend)
- **nginx routing** (frontend + API proxy)
- **External access** via `arcade.elkayam.fun` (Cloudflare tunnel)
- **Mobile responsive** — responsive canvas, compact overlays, media queries for 600px/400px

### Mobile layout:
- Canvas: `width: 100%` with `maxWidth: 500px` container
- Game overlays: `80%` width, compact padding
- Header: `flexWrap` so buttons don't overflow on narrow screens
- GameLobby: back button inline (not absolute), `minmax(200px)` grid
- Media queries at 600px (smaller buttons/padding) and 400px (extra compact)

## PORT ALLOCATIONS

| Port | Project | Purpose |
|------|---------|---------|
| 8080 | code-server | IDE |
| 3002 | clock | Frontend |
| 3003 | arcade | Frontend |
| 30031 | arcade | Backend API |
| 3004 | dinnerplan | Frontend |
| 30041 | dinnerplan | Backend API |
| 3005 | eventcorrelator | Frontend |
| 3006 | saritelkayam | Frontend |
| 30061 | saritelkayam | Backend API |
| 30062 | saritelkayam | PostgreSQL (internal, not exposed) |
| 3007 | languages | Frontend |
| 30071 | languages | Backend API |
| 3008 | erez | Location Log PWA (frontend) |

Next available: 3009, 30091

## PERSISTENT DATA

**IMPORTANT**: Arcade data lives in `/home/elkayam/dev-env/project-data/arcade/data/data.json`
This directory is OUTSIDE the git repo. The deploy script auto-migrates data from old location.
**Volume mount**: Must be `../../project-data/arcade/data:/app/data` in docker-compose.

## GITHUB USER

- Username: `chu11u`
- Repos: `chu11u/dev-env` (main), `chu11u/v0-family-arcade-app` (old, deprecated)

## SARIT ELKAYAM WEBSITE (🆕 New Project)

- **Brand**: Sarit Elkayam (cosmetician)
- **Domain**: `saritelkayam.com` (external), `saritelkayam.apps.elkayam.me` (local)
- **Tech**: Next.js 15 + Tailwind CSS + Framer Motion + Prisma + PostgreSQL
- **Design**: Warm luxury (rose gold, cream, burgundy)
- **Features**: Services, Testimonials, Shop, Blog (CMS), Contact, Booking (on hold)
- **Media**: Draw Things API (Flux 2 Klein 9B) for royalty-free images
- **Media API**: `POST http://localhost:7860/sdapi/v1/txt2img` (local Mac only, NOT on server)
- **Payment**: Stripe (on hold)
- **Status**: 🆕 Planning phase — see `projects/saritelkayam/MEMORY.md` for full details

## THINGS TO BUILD NEXT

1. **Sarit Elkayam Website** — Cosmetician website (🆕 TOP PRIORITY)
2. **Weather Widget** — Simple weather dashboard
3. **Home Dashboard** — Monitor all homelab services
4. **More Arcade Games** — Tic Tac Toe, Snake, etc.

## HOW TO PUBLISH A NEW APP EXTERNALLY

1. Create project in `projects/<name>/` with `docker-compose.yml` + Dockerfiles
2. Push to git and run `./deploy-all.sh` (generates dual-domain nginx config automatically)
3. In **Cloudflare Zero Trust** → Tunnels → your tunnel → Configuration:
   - Add hostname rule: `appname.elkayam.fun` → `http://localhost:80`
   - (The tunnel forwards to nginx, which routes to the right container)
4. That's it — `appname.elkayam.fun` works externally, `appname.apps.elkayam.me` works locally

## CRON CONFIG

```
*/5 * * * * cd /home/elkayam/dev-env && /home/elkayam/dev-env/deploy-all.sh >> /var/log/dev-env-deploy.log 2>&1
```
