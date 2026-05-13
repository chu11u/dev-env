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
Backend (Express + lowdb) → port 30041
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
- **Backend**: Express 4.18.2 + lowdb 1.0.0 + cors
- **Font**: Google Heebo (Hebrew font, weights 300-700)
- **Styling**: CSS variables, RTL layout, warm color palette
- **Routing**: HashRouter (for static deployment behind nginx)

## DIRECTORY STRUCTURE

```
projects/dinnerplan/
├── docker-compose.yml        # 2 services: frontend + backend
├── .gitignore
├── frontend/
│   ├── Dockerfile            # Node builder + preview
│   ├── docker-compose.yml
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html            # Hebrew RTL, Heebo font
│   └── src/
│       ├── main.jsx           # Entry point
│       ├── App.jsx            # Router + Layout + global data fetch
│       ├── index.css          # Global styles (warm theme, RTL, responsive)
│       ├── data/
│       │   └── api.js         # API layer (all CRUD for 4 entities)
│       └── components/
│           ├── Home.jsx        # Dashboard with stats + quick actions
│           ├── FamiliesPage.jsx  # Add/manage families
│           ├── DinnersPage.jsx   # Plan dinners (date, location, notes)
│           ├── DishesPage.jsx    # Assign dishes to families
│           └── ShoppingPage.jsx  # Shopping list + auto-generate from dishes
└── backend/
    ├── Dockerfile
    ├── package.json
    └── server.js             # Express API for families, dinners, dishes, shopping
```

## DATA MODEL (lowdb JSON)

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
- `/api/health` - Health check
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

### Full deploy:
```bash
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && ./deploy-all.sh"
```

### Local workflow:
1. Make changes in `dev-env/projects/dinnerplan/`
2. Commit & push: `cd dev-env && git add -A && git commit -m "msg" && git push origin main`
3. Deploy via SSH (command above)
4. Hard refresh browser (Cmd+Shift+R)

## NGINX CONFIG

- This project uses `generate_nginx_api_config()` (multi-service: frontend + backend)
- Frontend proxied to port 3004
- `/api/` proxied to port 30041
- **CRITICAL**: `proxy_pass` MUST NOT have trailing slash for API routes

## CRITICAL GOTCHAS

1. **Nested .git repos**: Always `rm -rf projects/dinnerplan/.git` before committing to parent.
2. **Vite allowedHosts**: Set to `true` in both server and preview (already configured).
3. **Browser caching**: Hard refresh (Cmd+Shift+R) after frontend updates.
4. **File ownership**: Server files owned by `naor`. Fix: `sudo chown -R naor:naor /home/elkayam/dev-env`.
5. **Docker compose down**: Run BEFORE `docker rm -f` to avoid name conflicts.
6. **Data persistence**: Volume mount = `../../project-data/dinnerplan/data:/app/data`
7. **HashRouter**: Used instead of BrowserRouter for static deployment behind nginx.

## PROJECT STATUS

### ✅ Framework Complete:
- [x] Docker compose (2 services: frontend + backend)
- [x] Backend API (CRUD for families, dinners, dishes, shopping)
- [x] Frontend skeleton (React + Vite, RTL Hebrew)
- [x] Home dashboard (stats overview + quick actions)
- [x] Families page (add/remove families with members)
- [x] Dinners page (plan dinners with date, location, notes)
- [x] Dishes page (assign dishes to families, filter by category)
- [x] Shopping page (list management, auto-generate from dishes)
- [x] Warm color palette + Heebo font + responsive layout
- [x] Commit & push to GitHub
- [x] Deploy to server

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
- Repo: part of `chu11u/dev-env`

---
*This memory file is project-specific. For infra-level details, see `dev-env/MEMORY.md`.*
