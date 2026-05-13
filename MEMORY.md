# Dev Environment Memory Dump
# Updated: May 13, 2026
# Use this to continue the project in a new conversation

## ARCHITECTURE

```
Internet → NPM (*.apps.elkayam.me, TLS) → nginx (192.168.131.134:80) → Docker containers

Subdomains:
  dev.apps.elkayam.me         → code-server (VS Code IDE)
  clock.apps.elkayam.me       → Clock dashboard (static HTML)
  todo.apps.elkayam.me        → Todo app (React + Vite)
  arcade.apps.elkayam.me      → Family Arcade (React + Express API)
```

## SERVER (LXC Container - Debian 12)

- **IP**: 192.168.131.134
- **Docker**: 20.10.24 + compose plugin (v2.x)
- **nginx**: 1.22.1 on port 80
- **Domain**: elkayam.me (Technitium DNS + NPM for TLS)
- **NPM config**: `*.apps.elkayam.me` → `192.168.131.134:80` (http, NPM handles TLS)
- **Technitium**: Wildcard A record `*.apps` → server's public IP

## PROJECT PATHS

**Server**: `/home/elkayam/dev-env/`
**Local**: `/Users/elnaor/Environments/Zed/dev-env/`
**GitHub**: `github.com/chu11u/dev-env`

## DIRECTORY STRUCTURE

```
dev-env/
├── deploy-all.sh                  # Main deploy script (self-updates, see below)
├── .env                           # code-server password
├── nginx-dev.apps.elkayam.me.conf # code-server nginx config
├── nginx-project-template.conf    # Template for single-service projects
├── project-data/                  # PERSISTENT DATA (outside git, auto-migrated)
│   └── arcade/data/data.json      # Arcade player/score data
├── projects/
│   ├── clock/                     # Static HTML clock ✅
│   │   ├── Dockerfile             # nginx:alpine serving index.html
│   │   ├── docker-compose.yml     # container_name: clock, port 3002
│   │   └── index.html             # Clock dashboard
│   └── arcade/                    # Family Arcade ✅
│       ├── docker-compose.yml     # 2 services: frontend + backend
│       ├── nginx-api.conf         # Custom nginx (API proxy)
│       ├── backend/
│       │   ├── Dockerfile
│       │   ├── server.js          # Express + lowdb (players, scores, games)
│       │   └── package.json
│       └── frontend/
│           ├── Dockerfile         # Node builder + preview
│           ├── vite.config.js
│           ├── package.json       # React 18.3.1 + Vite 5.4.1
│           ├── src/App.jsx        # Main app (routing between games)
│           ├── src/main.jsx
│           ├── src/index.css
│           └── src/components/
│               ├── PlayerSelect.jsx   # Player list + registration + DELETE button
│               ├── GameLobby.jsx      # Game selection + player stats + back button
│               ├── SkyJumper.jsx      # Jumping game (canvas)
│               ├── MemoryMatch.jsx    # Card matching game
│               ├── TetrisGame.jsx     # Classic Tetris (canvas)
│               └── Leaderboard.jsx    # Score board
```

## DEPLOY WORKFLOW

### Local (creating new projects):
1. Create files in `projects/<name>/` (must have `docker-compose.yml` + `Dockerfile`)
2. Push: `cd dev-env && git add -A && git commit -m "msg" && git push origin main`

### Server (ONE COMMAND):
```bash
cd /home/elkayam/dev-env
./deploy-all.sh
```

### Deploy script (`deploy-all.sh`) — bulletproof, self-updates:

**Step 0**: Move `project-data` outside `projects/` if misplaced
**Step 0.5**: Migrate arcade data BEFORE git pull (prevents data loss)
**Step 1**: Git pull with untracked file cleanup. **Self-updates**: checks md5sum before/after pull and re-runs with `exec "$0" "$@"` if script changed
**Step 2**: Generate nginx configs via heredocs (no `sed -i`):
    - Single-service projects: use `generate_nginx_config()` function
    - Multi-service projects: use `generate_nginx_api_config()` function
    - Auto-cleans stale configs for non-existent projects
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

6. **Data persistence**: Arcade data lives in `project-data/arcade/data/data.json`. Deploy script auto-migrates this BEFORE git pull.

7. **Vite allowedHosts**: Must have `allowedHosts: true` in both `server` and `preview` sections of vite.config.js.

8. **Browser caching**: Always hard refresh (Cmd+Shift+R) after frontend updates.

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
    - NOTE: If left/right don't work, check that `gameRef.current` in keyboard handler matches `game` object in game loop

### Features:
- ✅ Player registration (with error handling, username required)
- ✅ Player selection screen with avatars
- ✅ **Player deletion** — ✕ button on player cards (only when 2+ players)
- ✅ Game lobby with stats + back button
- ✅ Leaderboard
- ✅ Backend API (players CRUD, scores, games)
- ✅ Data persistence (lowdb JSON in `project-data/`)
- ✅ Docker compose (2 containers: frontend + backend)
- ✅ nginx routing (frontend + API proxy)

### Known issues to verify after deploy:
- ⚠️ Tetris left/right controls — verify on server after deploy
- ⚠️ Clock app loading — verify after deploy (may have Docker network issue)

## PORT ALLOCATIONS

| Port | Project | Purpose |
|------|---------|---------|
| 8080 | code-server | IDE |
| 3002 | clock | Frontend |
| 3003 | arcade | Frontend |
| 30031 | arcade | Backend API |

Next available: 3004, 30041

## PERSISTENT DATA

**IMPORTANT**: Arcade data lives in `/home/elkayam/dev-env/project-data/arcade/data/data.json`
This directory is OUTSIDE the git repo. The deploy script auto-migrates data from old location.

## GITHUB USER

- Username: `chu11u`
- Repos: `chu11u/dev-env` (main), `chu11u/v0-family-arcade-app` (old, deprecated)

## THINGS TO BUILD NEXT

1. **Verify Tetris works** on server (left/right controls)
2. **Fix Clock app** if not loading
3. **Weather Widget** — Simple weather dashboard
4. **Home Dashboard** — Monitor all homelab services
5. **More Arcade Games** — Tic Tac Toe, Snake, etc.

## CRON CONFIG

```
*/5 * * * * cd /home/elkayam/dev-env && /home/elkayam/dev-env/deploy-all.sh >> /var/log/dev-env-deploy.log 2>&1
```
