# Dinnerplan Project Memory Dump
# Updated: Nov 2024
# Use this to continue the project in a new conversation

## PROJECT OVERVIEW

**Name**: dinnerplan
**Purpose**: App to plan family dinners with the user's wife's sisters and their families.
**Subdomain**: `dinnerplan.apps.elkayam.me`
**Language**: Hebrew (RTL) - all UI text is in Hebrew, layout is RTL
**Look & Feel**: Warm and friendly - warm color palette (oranges, greens, golds), rounded cards, emoji icons

## ARCHITECTURE

```
Internet → NPM (*.apps.elkayam.me, TLS) → nginx (192.168.131.134:80) → Docker containers

Frontend (React + Vite) → port 3004
Backend (Express + fs JSON) → port 30041
```

## SERVER

- **IP**: 192.168.131.134
- **SSH**: `ssh -i ~/.ssh/dev-env-server naor@192.168.131.134`
- **Server path**: `/home/elkayam/dev-env/projects/dinnerplan/`
- **Local path**: `/Users/elnaor/Environments/Zed/dev-env/projects/dinnerplan/`
- **Persistent data**: `/home/elkayam/dev-env/project-data/dinnerplan/data/data.json`
- **Docker containers**: `dinnerplan-frontend`, `dinnerplan-backend`
- **Ports**: Frontend 3004, Backend 30041

## STACK

- **Frontend**: React 18.3.1 + Vite 5.4.1 + react-router-dom 6.20.0
- **Backend**: Express 4.18.2 + cors (plain fs for JSON storage, NO lowdb!)
- **Font**: Google Heebo (Hebrew font, weights 300-700)
- **Styling**: CSS variables, RTL layout, warm color palette
- **Routing**: HashRouter (for static deployment behind nginx)
- **Data**: JSON file via fs read/write (same pattern as arcade)

## DIRECTORY STRUCTURE

```
projects/dinnerplan/
├── docker-compose.yml         # 2 services: frontend + backend (NO version attr needed)
├── .gitignore
├── frontend/
│   ├── Dockerfile             # Node builder + preview (no volume mount!)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html             # Hebrew RTL, Heebo font
│   └── src/
│       ├── main.jsx            # Entry point
│       ├── App.jsx             # Router + Layout + global data fetch
│       ├── index.css           # Global styles (warm theme, RTL, responsive)
│       ├── data/
│        │   └── api.js          # API layer (all CRUD for 4 entities)
│        └── components/
│            ├── Home.jsx         # Dashboard with stats + quick actions
│            ├── FamiliesPage.jsx   # Add/remove families with members
│            ├── DinnersPage.jsx    # Plan dinners (date, location, notes)
│            ├── DishesPage.jsx     # Assign dishes to families by category
│            └── ShoppingPage.jsx   # Shopping list + auto-generate from dishes
└── backend/
     ├── Dockerfile
     ├── package.json
     └── server.js              # Express API (fs read/write, NO lowdb)
```

## DATA MODEL (JSON file at /app/data/data.json)

```json
{
    "families": [
       { "id": "123", "name": "המשפחה של רותי", "members": ["רותי", "יונתן", "דניאל"] }
    ],
    "dinners": [
       { "id": "123", "name": "ארוחת שבת", "date": "2024-12-01", "location": "אצל רותי", "notes": "..." }
    ],
    "dishes": [
       { "id": "123", "name": "חומץ", "category": "main", "familyId": "456", "dinnerId": "789", "ingredientList": "..." }
    ],
    "shoppingItems": [
       { "id": "123", "name": "עגבניות", "quantity": "2 קילו", "purchaser": "רותי", "purchased": false }
    ]
}
```

## API ENDPOINTS (backend on port 30041)

All routes prefixed with `/api/`:
- `/api/health` - Health check (returns status + uptime)
- `/api/data` (GET) - Get all data
- `/api/data` (POST) - Save all data
- `/api/families` (GET, POST) - List/create families
- `/api/families/:id` (PUT, DELETE) - Update/delete family
- `/api/dinners` (GET, POST) - List/create dinners
- `/api/dinners/:id` (PUT, DELETE) - Update/delete dinner
- `/api/dishes` (GET, POST) - List/create dishes
- `/api/dishes/:id` (PUT, DELETE) - Update/delete dish
- `/api/shopping` (GET, POST) - List/create shopping items
- `/api/shopping/:id` (PUT, DELETE) - Update/delete shopping item

Frontend uses relative `/api` paths - nginx proxies to backend.

## DEPLOY WORKFLOW

### Full deploy (via SSH):
```bash
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && ./deploy-all.sh"
```

### Manual rebuild (when deploy script misses latest commit):
```bash
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && git pull origin main && cd projects/dinnerplan && docker compose down && docker compose build --no-cache && docker compose up -d"
```

### Nginx reload (requires sudo on server):
After first deploy or config changes, run on server:
```bash
sudo /usr/sbin/nginx -t && sudo /usr/sbin/nginx -s reload
```
Or from SSH (needs password):
```bash
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "sudo /usr/sbin/nginx -s reload"
```

### Local workflow:
1. Make changes in `dev-env/projects/dinnerplan/`
2. Commit & push: `cd dev-env && git add -A && git commit -m "msg" && git push origin main`
3. Deploy via SSH (see above)
4. Hard refresh browser (Cmd+Shift+R)

## NGINX CONFIG

- Config file: `/etc/nginx/sites-available/dinnerplan.apps.elkayam.me.conf`
- Symlink: `/etc/nginx/sites-enabled/dinnerplan.apps.elkayam.me.conf`
- Frontend proxied to port 3004
- `/api/` proxied to port 30041 (NO trailing slash on proxy_pass!)
- **NEEDS sudo reload after first deploy** - deploy script can't reload nginx (no sudo perms)

## CRITICAL GOTCHAS

1. **NO lowdb!** Uses plain `fs` for JSON read/write (same as arcade). Initial lowdb attempt caused crashes.
2. **NO volume mount on frontend!** Volume mounts overwrite node_modules → vite not found.
3. **Backend volume**: Only mount data dir (`../../project-data/dinnerplan/data:/app/data`), NOT the full project.
4. **docker compose version attr**: The `version: "3.8"` in docker-compose.yml triggers a warning. Can be removed.
5. **Cached builds**: Use `docker compose build --no-cache` when changes don't take effect.
6. **Vite allowedHosts**: Set to `true` in both server and preview sections.
7. **HashRouter**: Used instead of BrowserRouter for static deployment behind nginx.
8. **Browser caching**: Hard refresh (Cmd+Shift+R) after frontend updates.
9. **Nginx reload needs sudo** - can't be done via deploy script. Must be done manually.

## PROJECT STATUS

### ✅ Framework Complete & Running:
- [x] Docker compose (2 services: frontend + backend)
- [x] Backend API (CRUD for families, dinners, dishes, shopping) - plain fs
- [x] Frontend (React + Vite, RTL Hebrew, warm design)
- [x] Home dashboard (stats overview + quick actions)
- [x] Families page (add/remove families with members)
- [x] Dinners page (plan dinners with date, location, notes)
- [x] Dishes page (assign dishes to families, filter by category)
- [x] Shopping page (list management, auto-generate from dishes)
- [x] Warm color palette + Heebo font + responsive layout
- [x] Commit & push to GitHub
- [x] Deployed to server - containers running (ports 3004, 30041)
- [x] Nginx config in place (needs sudo reload to activate)

### 🔴 BLOCKER:
- [ ] **Nginx reload needed** - Run on server: `sudo /usr/sbin/nginx -s reload`
  - After this, `dinnerplan.apps.elkayam.me` will be accessible

### TODO / Next Iterations:
- [ ] Test on live server and fix any issues
- [ ] Edit mode for dinners, dishes, shopping items (currently only create/delete)
- [ ] Better dish-to-dinner linking in UI
- [ ] WhatsApp/Share export for shopping lists per family
- [ ] Print-friendly view
- [ ] Meal suggestion / rotation helpers
- [ ] Guest count per family per dinner
- [ ] Invite / notification system?

## GITHUB

- Username: `chu11u`
- Repo: `chu11u/dev-env` (dinnerplan is inside `projects/dinnerplan/`)

---
*This memory file is project-specific. For infra-level details, see `dev-env/MEMORY.md`.*
