# Dinnerplan Project Memory Dump
# Updated: May 15, 2026
# Use this to continue the project in a new conversation

## PROJECT OVERVIEW

**Name**: dinnerplan
**Purpose**: App to plan family dinners with the user's wife's sisters and their families.
**Subdomain**: `dinnerplan.apps.elkayam.me` (local), `dinnerplan.elkayam.fun` (external via Cloudflare)
**Language**: Hebrew (RTL) - all UI text is in Hebrew, layout is RTL
**Look & Feel**: Warm and friendly - warm color palette (oranges, greens, golds), rounded cards, emoji icons

## ACCESS ARCHITECTURE

```
Local network:   Technitium DNS (*.apps.elkayam.me → 192.168.131.134) → nginx:80 → containers
External:        Cloudflare DNS (*.elkayam.fun) → cloudflared tunnel → nginx:80 → containers
```

- **Cloudflare tunnel** (`cloudflared` in Docker, `network_mode: host`) routes all `*.elkayam.fun` → nginx port 80
- **Single tunnel** serves ALL apps - no per-app tunnel needed
- **Config**: `dev-env/docker-compose.cloudflare.yml` + `.env.cloudflare` (git-ignored, token via `TUNNEL_TOKEN` env var)
- **Cloudflare DNS ingress rule**: `dinnerplan.elkayam.fun` → `http://localhost:80`

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
├── docker-compose.yml           # 2 services: frontend + backend
├── .gitignore
├── frontend/
│   ├── Dockerfile               # Node builder + preview (no volume mount!)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html               # Hebrew RTL, Heebo font
│   └── src/
│       ├── main.jsx              # Entry point
│       ├── App.jsx               # Router + Layout + global data fetch (posts too)
│       ├── index.css             # Global styles (warm theme, RTL, responsive)
│       ├── data/
│         │     └── api.js        # API layer (all CRUD for all entities incl. posts)
│         └── components/
│             ├── Home.jsx          # Dashboard with clickable stat cards
│             ├── FamiliesPage.jsx     # Add/remove families with members
│             ├── DinnersPage.jsx      # Plan/edit dinners (date, time, location, notes, guests)
│             ├── DinnerDetail.jsx     # Dinner summary: countdown, guest list, dishes, blog
│             ├── DishesPage.jsx       # Assign dishes to families by category
│             └── ShoppingPage.jsx     # Shopping list + auto-generate from dishes
└── backend/
      ├── Dockerfile
      ├── package.json
      └── server.js                # Express API (auto CRUD generator + posts collection)
```

## DATA MODEL (JSON file at /app/data/data.json)

```json
{
     "families": [
       { "id": "123", "name": "המשפחה של רותי", "members": ["רותי", "יונתן"] }
     ],
     "dinners": [
       { "id": "123", "name": "ארוחת שבת", "date": "2024-12-01", "time": "19:00", "location": "אצל רותי", "notes": "...", "guestList": [{ "familyId": "456", "attendees": 3 }] }
     ],
     "dishes": [
       { "id": "123", "name": "חצילים בשמנת", "category": "salad", "ingredientList": "חצילים, שמנת", "notes": "..." }
     ],
     "dinnerDishes": [
       { "id": "456", "dinnerId": "789", "dishId": "123", "familyId": "456" }
     ],
     "shoppingItems": [
       { "id": "123", "name": "עגבניות", "quantity": "2 קילו", "purchaser": "רותי", "purchased": false }
     ],
     "posts": [
       { "id": "123", "dinnerId": "456", "author": "רותי", "message": "אני אביא סלט!", "createdAt": "2024-12-01T18:00:00Z" }
     ]
}
```

**Dish model changed**: Dishes are now unique recipes (no `dinnerId`/`familyId`).
**`dinnerDishes`** links a dish to a dinner + family assignment.
Same dish can be assigned to multiple dinners with different families.
Auto-migration runs on backend startup to convert old data.

## API ENDPOINTS (backend on port 30041)

All routes prefixed with `/api/`:
- `/api/health` - Health check
- `/api/data` (GET/POST) - Get/save all data
- `/api/families` (CRUD) - Family management
- `/api/dinners` (CRUD) - Dinner management
- `/api/dishes` (CRUD) - Dish management (recipes only, no dinnerId/familyId)
- `/api/shoppingItems` (CRUD) - Shopping items (collection name matches endpoint!)
- `/api/dinnerDishes` (CRUD) - Links dishes to dinners + family assignment
- `/api/posts` (CRUD) - Blog posts per dinner

Backend uses auto-generated CRUD routes via `crudRoutes(name, collection)` helper.

## ROUTES (Frontend)

- `/` → Home (clickable stat cards, upcoming dinners, quick actions)
- `/families` → Families management (add/remove families)
- `/dinners` → Dinners list (create/edit/delete, with time, guests)
- `/dinner/:id` → Dinner detail (countdown, editable guest list, dishes summary, blog posts)
- `/dishes` → All dishes (filter by category)
- `/dishes/:dinnerId` → Dishes for specific dinner
- `/shopping` → Shopping list (auto-generate from dishes, track purchased)

## KEY FEATURES

### Home Page
- **Clickable stat cards** - Families, Dinners, Dishes, Shopping cards link to their pages
- **Upcoming dinners** - Shows upcoming dinners with date, time, location, attendee count
- **Quick action cards** - Same 4 sections as clickable tiles

### Families
- Add family (name + members comma-separated)
- Delete family
- Each family gets an avatar color

### Dinners
- Create: name, date, **time**, location, notes, guest families
- Edit: full edit mode for all fields
- Guest families: enter family names → maps to family IDs
- Default attendee count = family member count
- Shows: date badge, time badge, location badge, total attendees

### Dinner Detail Page
- **Countdown** to the dinner (days, hours, minutes)
- **Date/Time/Location** display with badges
- **Guest list** with editable attendance (−/+ buttons per family)
- **Dishes summary** showing dishes assigned to this dinner
- **Blog posts** - threaded comments per dinner (name + message + timestamp)

### Dishes (Recipe Database)
- Categories: appetizer, main, salad, dessert, drink, bread, other
- **Dishes are unique recipes** — no dinnerId/familyId on the dish itself
- Edit existing dishes (full edit mode)
- Duplicate dishes to create variants
- **Assign dishes to dinners** via `dinnerDishes` linking table
- When viewing dishes for a dinner: "📌 חבר מנה קיימת" to pick from recipe DB + choose family
- Shows which dinners each dish is assigned to (with family)
- Unassign dishes directly from the dish card (✕ button)

### Shopping
- List with checkboxes (mark as purchased)
- Auto-generate from dishes assigned to dinners (via `dinnerDishes`)
- Track who buys what

## DEPLOY WORKFLOW

### Quick frontend-only deploy (most common):
```bash
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && git pull origin main && cd projects/dinnerplan && docker compose build frontend --no-cache && docker compose up -d frontend"
```

### Full rebuild (when backend changes):
```bash
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && git pull origin main && cd projects/dinnerplan && docker compose down && docker compose build --no-cache && docker compose up -d"
```

### Local workflow:
1. Make changes in `dev-env/projects/dinnerplan/`
2. Commit & push: `cd dev-env && git add -A && git commit -m "msg" && git push origin main`
3. Deploy via SSH (pick command above based on what changed)
4. Hard refresh browser (Cmd+Shift+R)

## GIT TAGS

- `v1.0-framework` - Complete framework (before customizations)
- Current: Feature-complete with time, detail page, blog, edit mode

- **Current commit**: `c9fa016` — Cloudflare tunnel + dual-domain nginx. Data migrated to `dinnerDishes` table.

## CRITICAL GOTCHAS

1. **NO lowdb!** Uses plain `fs` for JSON read/write.
2. **NO volume mount on frontend!** Overwrites node_modules → vite crash.
3. **Backend volume**: Only mount data dir (`../../project-data/dinnerplan/data:/app/data`).
4. **`allowedHosts` (plural!)** in vite.config.js, NOT `allowedHost`.
5. **`preview.proxy` NOT supported in Vite 5!** Use nginx for API routing in production. Dev proxy works fine.
6. **Cached builds**: Use `docker compose build --no-cache` when changes don't take effect.
7. **HashRouter**: Used instead of BrowserRouter.
8. **Browser caching**: Hard refresh (Cmd+Shift+R) after frontend updates.
9. **Nginx reload**: `sudo /usr/sbin/nginx -s reload` works (passwordless sudo).
10. **Deploy script**: Uses `sudo /usr/sbin/nginx` for nginx operations.
11. **Guest family mapping**: Form stores family names as text → maps to IDs on submit via `families.find()`.
12. **Dinner detail route**: `/dinner/:id` (singular) to avoid conflicts with `/dishes/:dinnerId`.
13. **Route params**: Use `useParams()` hook via wrapper components, NOT `location.params` (which is undefined).

## BUG FIXES

- **Blank page fix** (May 15): Replaced `location.params.id` with proper `useParams()` via `DinnerDetailWrapper` and `DishesPageWrapper` components. Removed unsupported `preview.proxy` from vite.config.js.
- **Shopping auto-generate + API mismatch fix** (May 15): Backend uses `crudRoutes("Shopping", "shoppingItems")` creating `/api/shoppingItems` but frontend called `/api/shopping` → 404. Fixed api.js to use `/shoppingItems` endpoint. Made `autoGenerateShopping` properly async with try/catch.
- **Dish edit** (May 15): Added full edit capability to DishesPage (openEdit → prefill form → save). Shows ingredient list on dish cards. Delete now requires confirmation.
- **ErrorBoundary** (May 15): Added to catch and display React runtime errors instead of blank page.
- **Data persistence verified**: Data JSON is safe in `/home/elkayam/dev-env/project-data/dinnerplan/data/data.json`. Data loss was due to UI crashes, not data deletion.
- **Dish → dinner redesign** (May 15): Dishes are now unique recipes (no dinnerId/familyId). New `dinnerDishes` linking table. Auto-migration in backend converts old data on startup. Shopping auto-generate now uses `dinnerDishes` instead of raw dishes.

## TODO / Next Ideas

- [ ] WhatsApp/Share export for shopping lists per family
- [ ] Print-friendly view of dinner summary
- [ ] Meal suggestion / rotation helpers
- [ ] Invite/invite link per dinner
- [ ] Calendar export (iCal)
- [ ] Notifications/reminders

## GITHUB

- Username: `chu11u`
- Repo: `chu11u/dev-env` (dinnerplan is inside `projects/dinnerplan/`)

---
*This memory file is project-specific. For infra-level details, see `dev-env/MEMORY.md`.*
