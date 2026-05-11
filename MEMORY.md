# Dev Environment Memory Dump
# Created: May 2026
# Use this to continue the project in a new conversation

## ARCHITECTURE

```
Internet → NPM (*.apps.elkayam.me, TLS) → nginx (192.168.131.134:80) → Docker containers

Subdomains:
  dev.apps.elkayam.me        → code-server (VS Code IDE)
  clock.apps.elkayam.me      → Clock dashboard (static HTML)
  todo.apps.elkayam.me       → Todo app (React + Vite)
  arcade.apps.elkayam.me     → Family Arcade (React + Express API)
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
├── docker-compose.yml            # code-server container
├── .env                          # code-server password
├── nginx-dev.apps.elkayam.me.conf       # code-server nginx config
├── nginx-project-template.conf         # Template for new projects
├── deploy-all.sh                 # Auto-deploy script (called by cron)
├── sync-push.sh                  # Local: push to GitHub
├── local-build.sh                # Local: scaffold projects (has clock template)
├── cleanup-project.sh            # Server: remove a project
├── build-arcade.sh               # Local: build arcade project
├── deploy-project.sh             # Server: deploy single project
├── new-project.sh                # Server: scaffold + deploy
├── setup.sh                      # Server: one-time bootstrap
├── webhook-server.sh             # GitHub webhook listener
├── cron-deploy                   # Cron entry (every 5 min)
├── README.md
├── projects/
│   ├─ clock/           # Static HTML clock (working ✅)
│   ├─ todo/            # React todo app (working ✅)
│   └─ arcade/          # Family Arcade (partially working)
│       ├─ frontend/    # React + Vite
│       │  ├─ src/App.jsx
│       │  ├─ src/main.jsx
│       │  ├─ src/index.css
│       │  └─ src/components/
│       │      ├─ PlayerSelect.jsx     # Player select + registration
│       │      ├─ GameLobby.jsx        # Game selection screen
│       │      ├─ SkyJumper.jsx        # Jumping game (canvas)
│       │      ├─ MemoryMatch.jsx      # Card matching game
│       │      └─ Leaderboard.jsx      # Score board
│       ├─ backend/     # Express + lowdb
│       │  ├─ server.js
│       │  ├─ package.json
│       │  └─ data/     # Persisted game data
│       ├─ docker-compose.yml    # 2 services: frontend + backend
│       └─ nginx-api.conf        # Custom nginx config (API proxy)
└── data/
    └── code-server/             # Persistent IDE workspace
```

## WORKFLOW

### Creating a New Project (Local → Server):

1. I create files in `/Users/elnaor/Environments/Zed/dev-env/projects/<name>/`
2. User runs locally:
   ```bash
   cd dev-env
   rm -rf projects/<name>/.git     # CRITICAL: remove nested git
   git add -A
   git commit -m "message"
   git push origin main
   ```
3. On server (or via cron every 5 min):
   ```bash
   cd /home/elkayam/dev-env
   rm -rf projects/<name>     # Remove old untracked files first
   git checkout -- .
   git pull origin main
   ./deploy-all.sh
   ```

## CRITICAL ISSUES & FIXES

1. **Nested .git repos**: If `git clone` or `build-*` scripts create a `.git` inside `projects/<name>/`, Git treats it as a submodule. Always `rm -rf projects/<name>/.git` before committing.

2. **Docker build cache**: If changes don't show, run:
   ```bash
   docker compose down
   docker image rm <name>-frontend <name>-backend 2>/dev/null
   docker compose build
   docker compose up -d
   ```

3. **Nginx API routing**: For projects with `/api/` routes, the proxy MUST preserve the prefix:
   ```nginx
   location /api/ {
       proxy_pass http://127.0.0.1:PORT/api/;   # Note trailing slash!
   }
   ```
   Wrong: `proxy_pass http://127.0.0.1:PORT/;` (strips /api/)
   Right: `proxy_pass http://127.0.0.1:PORT/api/;` (preserves /api/)

4. **Server not pulling changes**: If `git pull` fails with "untracked files would be overwritten":
   ```bash
   cd /home/elkayam/dev-env
   rm -rf projects/<name>/
   git checkout -- .
   git pull origin main
   ```

5. **Vite allowedHosts**: Must have `allowedHosts: true` in both `server` and `preview` sections of vite.config.js, AND the file must be copied to the final Docker stage.

6. **Browser caching**: Always hard refresh (Cmd+Shift+R) after frontend updates.

## ARCADE PROJECT STATUS

### Working:
- ✅ Player registration (with error handling)
- ✅ Player selection screen
- ✅ Game lobby with stats
- ✅ Leaderboard
- ✅ Memory Match game
- ✅ Backend API (players, scores)
- ✅ Data persistence (lowdb JSON file)
- ✅ Docker compose (2 containers)
- ✅ nginx routing (frontend + API)

### Pending Changes (committed locally but NOT verified on server):
As of last commit on May 10, 2026, these files were modified locally:

1. `GameLobby.jsx` - Added `onBack` prop + "← Players" button
2. `SkyJumper.jsx` - Complete rewrite with:
    - First platform guaranteed under player at start
    - Keyboard controls (← → and A/D)
    - Touch controls for mobile
    - On-screen Left/Right buttons during gameplay
    - High score with localStorage
    - Better visual effects (glow, gradient bg)
3. `App.jsx` - Added `onBack={() => { setCurrentPlayer(null); setScreen('player-select'); }}` to GameLobby
4. `nginx-project-template.conf` - Fixed API proxy to preserve `/api/` prefix

### To verify fixes worked:
```bash
# On server
cd /home/elkayam/dev-env
rm -rf projects/arcade
git checkout -- .
git pull origin main
cd projects/arcade
docker compose down
docker image rm arcade-frontend arcade-backend 2>/dev/null
docker compose build
docker compose up -d
# Then hard refresh browser
```

## PORT ALLOCATIONS

| Port | Project | Purpose |
|------|---------|---------|
| 8080 | code-server | IDE |
| 3001 | todo | Frontend |
| 3002 | clock | Frontend |
| 3003 | arcade | Frontend |
| 30031 | arcade | Backend API |

Next available: 3004, 30041

## GITHUB USER

- Username: `chu11u`
- Repos: `chu11u/dev-env` (main), `chu11u/v0-family-arcade-app` (old, deprecated)

## THINGS TO BUILD NEXT

1. **Fix Arcade** - Verify pending changes (SkyJumper, back button)
2. **Weather Widget** - Simple weather dashboard
3. **Home Dashboard** - Monitor all homelab services
4. **More Arcade Games** - Tic Tac Toe, Snake, etc.

## CRON CONFIG

```
*/5 * * * * cd /home/elkayam/dev-env && /home/elkayam/dev-env/deploy-all.sh >> /var/log/dev-env-deploy.log 2>&1
```
