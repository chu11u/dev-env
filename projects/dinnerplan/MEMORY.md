# Dinnerplan Project Memory Dump
# Updated: May 14, 2026
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
- **Nginx**: `sudo /usr/sbin/nginx -s reload` works (passwordless sudo configured)

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
├── docker-compose.yml          # 2 services: frontend + backend
├── .gitignore
├── frontend/
│   ├── Dockerfile              # Node builder + preview (no volume mount!)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html              # Hebrew RTL, Heebo font
│   └── src/
│       ├── main.jsx             # Entry point
│       ├── App.jsx              # Router + Layout + global data fetch
│       ├── index.css            # Global styles (warm theme, RTL, responsive)
│       ├── data/
│        │    └── api.js         # API layer (all CRUD for all entities)
│        └── components/
│            ├── Home.jsx          # Dashboard with stats + quick actions
│            ├── FamiliesPage.jsx    # Add/remove families with members
│            ├── DinnersPage.jsx     # Plan dinners (date, time, location, notes)
│            ├── DinnerDetail.jsx    # Dinner summary page (in progress)
│            ├── DishesPage.jsx      # Assign dishes to families by category
│            └── ShoppingPage.jsx    # Shopping list + auto-generate from dishes
└── backend/
     ├── Dockerfile
     ├── package.json
     └── server.js               # Express API (fs read/write, NO lowdb)
```

## DATA MODEL (JSON file at /app/data/data.json)

```json
{
  "families": [
    { "id": "123", "name": "המשפחה של רותי", "members": ["רותי", "יונתן"], "defaultAttendees": 2 }
  ],
  "dinners": [
    { "id": "123", "name": "ארוחת שבת", "date": "2024-12-01", "time": "19:00", "location": "אצל רותי", "notes": "...", "guestList": [{"familyId": "456", "attendees": 3}] }
  ],
  "dishes": [
    { "id": "123", "name": "חומץ", "category": "main", "familyId": "456", "dinnerId": "789", "ingredientList": "..." }
  ],
  "shoppingItems": [
    { "id": "123", "name": "עגבניות", "quantity": "2 קילו", "purchaser": "רותי", "purchased": false }
  ],
  "posts": [
    { "id": "123", "dinnerId": "456", "author": "רותי", "message": "אני אביא סלט!", "createdAt": "2024-12-01T18:00:00Z" }
  ]
}
```

## API ENDPOINTS (backend on port 30041)

All routes prefixed with `/api/`:
- `/api/health` - Health check
- `/api/data` (GET/POST) - Get/save all data
- `/api/families` (GET, POST) - List/create families
- `/api/families/:id` (PUT, DELETE) - Update/delete family
- `/api/dinners` (GET, POST) - List/create dinners
- `/api/dinners/:id` (PUT, DELETE) - Update/delete dinner
- `/api/dishes` (GET, POST) - List/create dishes
- `/api/dishes/:id` (PUT, DELETE) - Update/delete dish
- `/api/shopping` (GET, POST) - List/create shopping items
- `/api/shopping/:id` (PUT, DELETE) - Update/delete shopping item
- `/api/posts` (GET, POST) - List/create posts
- `/api/posts/:id` (PUT, DELETE) - Update/delete post

## DEPLOY WORKFLOW

### Quick deploy (recommended - rebuild frontend only):
```bash
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && git pull origin main && cd projects/dinnerplan && docker compose build frontend --no-cache && docker compose up -d frontend"
```

### Full deploy (rebuilds everything):
```bash
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && ./deploy-all.sh"
```

### Local workflow:
1. Make changes in `dev-env/projects/dinnerplan/`
2. Commit & push: `cd dev-env && git add -A && git commit -m "msg" && git push origin main`
3. Deploy via SSH (see above)
4. Hard refresh browser (Cmd+Shift+R)

## CRITICAL GOTCHAS

1. **NO lowdb!** Uses plain `fs` for JSON read/write.
2. **NO volume mount on frontend!** Overwrites node_modules → vite crash.
3. **Backend volume**: Only mount data dir (`../../project-data/dinnerplan/data:/app/data`).
4. **`allowedHosts` (plural!)** in vite.config.js, NOT `allowedHost`.
5. **Cached builds**: Use `docker compose build --no-cache` when changes don't take effect.
6. **HashRouter**: Used instead of BrowserRouter.
7. **Browser caching**: Hard refresh (Cmd+Shift+R) after frontend updates.
8. **Nginx reload**: `sudo /usr/sbin/nginx -s reload` works (passwordless sudo).
9. **Deploy script**: Now uses `sudo /usr/sbin/nginx` for nginx operations.

## IN PROGRESS (May 14, 2026)

### Customizations requested:
1. ✅ Home page stat cards should be links to their pages
2. In progress: Add time field to dinners
3. In progress: Dinner detail page with summary, countdown, guest list with editable attendance
4. In progress: Blog/thread posts on dinner detail page

## GITHUB

- Username: `chu11u`
- Repo: `chu11u/dev-env` (dinnerplan is inside `projects/dinnerplan/`)

---
*This memory file is project-specific. For infra-level details, see `dev-env/MEMORY.md`.*
