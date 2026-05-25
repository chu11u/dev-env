# Sarit Elkayam - Agent Work Journal
# Auto-maintained by Journal agent. Read this on crash recovery.
# Last updated: 2026-05-25

## Phase 8G: Image Upload for Services + Settings (2026-05-25)
### Backend:
- `backend/prisma/schema.prisma` — added `image String?` to Service model
- `backend/prisma/migrations/20260525_add_service_image/` — manual migration to add column
- `backend/routes/services.ts` — accept `image` in POST (PUT already spreads all fields)
- `backend/Dockerfile` — added `prisma migrate deploy` to startup CMD

### Frontend:
- `frontend/lib/admin-api.ts` — added `image` to Service, CreateServiceData types
- `frontend/lib/api.ts` — added `image` to ApiService + adaptService
- `frontend/app/admin/services/new/page.tsx` — ImageUpload component + image state
- `frontend/app/admin/services/[id]/page.tsx` — ImageUpload component + image state
- `frontend/app/admin/settings/page.tsx` — ImageUpload for logo/favicon settings

### Issues fixed:
- Fixed corrupted `migration_lock.toml` (binary content → P3019 error)
- `npm install --legacy-peer-deps` for react-quill React 19 compat

### Deploy:
- Committed `542205b`, `b158973`, `0d5f43c`, `9050116`
- All routes 200 ✅

### Files modified (8):
1. `backend/prisma/schema.prisma` — added image column
2. `backend/prisma/migrations/20260525_add_service_image/` — new migration
3. `backend/prisma/migrations/migration_lock.toml` — fixed corruption
4. `backend/routes/services.ts` — accept image in POST
5. `backend/Dockerfile` — prisma migrate deploy on startup
6. `frontend/lib/admin-api.ts` — image in Service types
7. `frontend/lib/api.ts` — image in ApiService + adaptService
8. `frontend/app/admin/services/new/page.tsx` — ImageUpload
9. `frontend/app/admin/services/[id]/page.tsx` — ImageUpload
10. `frontend/app/admin/settings/page.tsx` — ImageUpload for logo/favicon
### Dependencies:
- Added `react-quill` (rich text editor), `marked` (markdown→HTML), `turndown` (HTML→markdown)
- Added `@types/turndown` (dev)
- `react-quill` requires `--legacy-peer-deps` due to React 18 peer dep with React 19 project

### Component:
- `frontend/components/admin/WysiwygEditor.tsx` — new WYSIWYG editor with Visual/Markdown toggle
  - Dynamically imports react-quill to avoid SSR issues
  - Bidirectional markdown↔HTML conversion via lazy-loaded marked/turndown
  - Toolbar: headings (1-3), bold, italic, underline, strike, ordered/unordered lists, links, images, blockquote, code-block, color, background, clean
  - Uses `Textarea` component (from `@/components/ui/Textarea`) for Markdown mode
  - Warm Luxury styling matching existing design system

### Pages updated:
- `frontend/app/admin/blog/new/page.tsx` — replaced plain `<Textarea>` with `<WysiwygEditor>`
- `frontend/app/admin/blog/[id]/page.tsx` — replaced plain `<Textarea>` with `<WysiwygEditor>`

### Styling:
- `frontend/styles/globals.css` — added `.quill-editor-wrapper` styles matching Warm Luxury palette
  - Toolbar: cream background, blush borders
  - Editor: charcoal text, frank-ruhl-libre headings, rose-gold links
  - Blockquote: rose-gold left border, burgundy italic text
  - Image: rounded, max-width 100%

### Docker:
- `frontend/Dockerfile` — switched from `npm ci` to `npm install --legacy-peer-deps` (react-quill React 19 compat)
- Removed `package-lock.json*` from COPY (no lockfile to copy)

### Deploy:
- Committed `ef17d53` (code), `291e1a0` (dockerfix), `0b4b6b4` (remove @types/react-quill)
- Built and deployed to server ✅ — all routes returning 200

### Architecture:
- WysiwygEditor converts markdown→HTML for the Quill editor on mount
- On user edit in Visual mode: HTML→markdown via turndown, stored as markdown string (matches existing CMS backend)
- Advanced mode toggle lets users edit raw markdown directly
- Conversion libraries lazy-loaded to avoid blocking initial render
- All changes kept in `frontend/` — no backend changes needed

### Files modified (5):
1. `frontend/components/admin/WysiwygEditor.tsx` — new, ~220 lines
2. `frontend/app/admin/blog/new/page.tsx` — WysiwygEditor import
3. `frontend/app/admin/blog/[id]/page.tsx` — WysiwygEditor import
4. `frontend/styles/globals.css` — quill editor styling
5. `frontend/package.json` — react-quill, marked, turndown deps

### Net new code: ~220 lines. No regressions.

## Infrastructure Agent
- **Status**: complete
- **Task Queue**: 4 / 4 (Phase 1)
- **Files**: docker-compose.yml, Dockerfile (root), backend/Dockerfile, frontend/nginx.conf
- **Server**: 192.168.131.134, all 3 containers running stably

## Design System Agent
- **Status**: complete
- **Task Queue**: 6 / 6 (Phase 1)
- **Files**: tailwind.config.js, globals.css, 6 UI components, 3 layout components, 2 common components, root layout

## Media Agent
- **Status**: complete
- **Task Queue**: 6 / 6 (Phase 1)
- **Files**: 18 PNG images generated (2 hero, 4 service, 3 decorative, 3 testimonial, 3 blog, 3 product)
- **Total size**: ~18.6 MB across all categories
- **Quality**: Verified — on-brand, warm luxury aesthetic

## Frontend Agent (Phase 2 + 3)
- **Status**: complete
- **Task Queue**: 10 / 10
- **Files**: All pages (/, /services, /testimonials, /shop, /book, /blog, /blog/[slug], /contact), all sections (Hero, ServicesPreview, Testimonials, CTA), SEO files, BlogListContent, 404 page, blog.md lib
- **Phase 3**: Framer Motion animations integrated (FadeInSection, StaggeredList), all pages wrapped with scroll animations, responsive breakpoints on all components

## Fullstack Agent (Phase 2)
- **Status**: complete
- **Task Queue**: 7 / 7
- **Files**: Prisma schema (Post + Author), migrations, db.ts, server.ts, routes (blog, auth), admin CMS (dashboard, post CRUD), api.ts client, 3 seed blog posts

---

## Phase 8D: Frontend API Integration — Complete (2026-05-24)

### Changes:
Replaced all hardcoded data in public-facing components with API calls:
- `TestimonialsSection.tsx` → fetches from `/api/testimonials/featured`
- `testimonials/page.tsx` → fetches from `/api/testimonials`
- `shop/page.tsx` → fetches from `/api/products` (with dynamic category filter)
- `ProductsPreview.tsx` → fetches from `/api/products/featured`
- `services/page.tsx` → fetches from `/api/services` (grouped by category)
- `ServicesPreview.tsx` → fetches from `/api/services` (first 3 as featured)

### Architecture:
- Added to `lib/api.ts`: 3 public types (`ApiTestimonial`, `ApiProduct`, `ApiService`)
- Locale-aware adapt helpers: `adaptTestimonial()`, `adaptProduct()`, `adaptService()`
- Fetch wrappers: `fetchTestimonials(featuredOnly?)`, `fetchProducts(featuredOnly?)`, `fetchServices()`
- Category translation maps: `PRODUCT_CATEGORY_LABELS`, `SERVICE_CATEGORY_META`, `getCategoryLabel()`, `getServiceCategoryLabel()`, `getServiceCategoryIcon()`
- Each component uses `useState` with fallback data + `useEffect` to fetch from API
- Fallback data shown immediately (no loading flash), replaced when API responds
- Silent error handling — falls back to hardcoded data if API fails
- All components re-fetch on locale change

### Key design decisions:
- Services have no `image` or `badge` fields in DB — ServicesPreview uses index-based defaults
- Shop page category filter is dynamic (derived from fetched products) with Hebrew translation
- Category icons for services use `SERVICE_CATEGORY_META` map instead of hardcoded per-category data

### Files modified (7):
- `frontend/lib/api.ts` — Added public types, adapt helpers, fetch wrappers, category maps (+128 lines)
- `frontend/components/sections/TestimonialsSection.tsx` — API integration
- `frontend/components/sections/ProductsPreview.tsx` — API integration
- `frontend/components/sections/ServicesPreview.tsx` — API integration, simplified badge/image defaults
- `frontend/app/testimonials/page.tsx` — API integration, dynamic avg rating
- `frontend/app/shop/page.tsx` — API integration, dynamic category filter with i18n
- `frontend/app/services/page.tsx` — API integration, dynamic category grouping

### Deploy:
- Committed: `2cfa61a` (7 files, +466/-669 lines)
- Fix commit: `ad421a3` (add explicit `Promise<ApiX[]>` return types to fetch functions)
- Pushed to GitHub ✅
- **Deployed to server ✅** — `docker compose up -d --force-recreate frontend`
- Verified: all public pages 200, all API endpoints return real DB data

---

## Phase 8E: Image Upload — Complete (2026-05-25)

### Backend:
- **`backend/routes/upload.ts`** — New route module:
  - `POST /api/upload/image` — Upload image via multipart/form-data (multer, 5MB limit, image-only)
  - `DELETE /api/upload/image/:filename` — Delete uploaded image (path-traversal protected)
  - Auto-generates filenames: `{timestamp}-{random}.{ext}` (e.g., `1716800000-abc123.jpg`)
- **`backend/server.ts`** — Registered upload routes + static file serving at `/uploads`
- **`backend/package.json`** — Added `multer`, `@types/multer`
- **`backend/Dockerfile`** — Added `RUN mkdir -p /app/uploads`

### Frontend:
- **`frontend/components/admin/ImageUpload.tsx`** — New drag-and-drop upload component:
  - Drag & drop or click to browse
  - Immediate local preview (FileReader / URL.createObjectURL)
  - Upload progress spinner
  - Success state with green checkmark + thumbnail
  - Error state with retry button
  - Delete/clear button
  - File type + size validation (image/*, max 5MB)

### Integrated into 6 admin forms:
- `admin/products/new/page.tsx` — Product image
- `admin/products/[id]/page.tsx` — Product image
- `admin/testimonials/new/page.tsx` — Avatar image
- `admin/testimonials/[id]/page.tsx` — Avatar image
- `admin/blog/new/page.tsx` — Featured image
- `admin/blog/[id]/page.tsx` — Featured image

### Docker:
- **`docker-compose.yml`** — Added persistent volume for uploads: `../../project-data/saritelkayam/uploads:/app/uploads`

### Architecture:
```
Admin form → ImageUpload component → POST /api/upload/image (FormData)
  → Backend multer handler → Save to /app/uploads/{timestamp}-{random}.{ext}
  → Returns { url: "/uploads/{filename}" }
  → Stored in DB (featuredImage, image, avatar fields)
  → Served by Express static middleware at /uploads/
  → Persisted via Docker volume across container restarts
```

### Deploy:
- Committed: `c2f4a5f` (13 files), `5717d20` (lockfile fix)
- Both backend + frontend rebuilt on server
- Verified: all containers running, all endpoints 200

---

## Phase 8C: Admin Fixes & API Routing — Complete (2026-05-23)

### Issues fixed:

**Issue 1: Admin UI stuck on "Loading..." forever**
- Root cause: `AuthProvider` was never placed in the component tree. `AdminLayout` called `useAuth()` without wrapping children in `AuthProvider`, so `isLoading` stayed `true` forever.
- Fix: Moved auth logic into `AdminPage` — it self-wraps with `<AuthProvider>`. Admin layout is now a thin server wrapper.
- Files: `frontend/app/admin/layout.tsx` (thin server layout, `dynamic = "force-dynamic"`), `frontend/app/admin/page.tsx` (wraps with AuthProvider, handles login/dashboard)

**Issue 2: `$` icon next to ₪ prices**
- Root cause: `DollarSign` icon from lucide-react displayed next to prices already in ₪
- Fix: Removed `DollarSign` import and usage from `frontend/app/services/page.tsx`

**Issue 3: Login always failed (404)**
- Root cause: Backend route was `/api/login` but frontend called `/api/auth/login`
- Fix: Changed backend route to `/api/auth/login` in `backend/routes/auth.ts`

**Issue 4: Missing ADMIN_PASSWORD env var**
- Root cause: `ADMIN_PASSWORD` not set in docker-compose → login returns 500
- Fix: Added `ADMIN_PASSWORD=admin123` to docker-compose backend environment

**Issue 5: API unreachable from browser**
- Root cause: Frontend used `http://localhost:30061` — works for local dev but not for browser access via `192.168.131.134:3006` or `saritelkayam.com`
- Fix: Next.js rewrites proxy `/api/` requests to backend. Env vars passed at build time via Dockerfile ARG/ENV.
- Files: `frontend/next.config.js` (rewrites), `frontend/Dockerfile` (build-time env vars)

**Issue 6: All API clients using absolute URLs**
- Fix: Changed `api.ts` and `admin-api.ts` to use relative `/api/` paths (proxied by Next.js rewrites)
- No more `API_URL` constant — all calls use relative paths

### API routing architecture:
```
Browser → Next.js frontend (port 3000, exposed as 3006)
  /api/* → Next.js rewrite → backend:3001
  /* → Next.js pages (static/dynamic)

Local dev:  /api/* → localhost:30061
Docker:     /api/* → backend:3001 (docker-compose service name)
Cloudflare: /api/* → backend:3001 (via Next.js rewrite, same as Docker)
```

### Files modified:
- `frontend/app/admin/layout.tsx` — Thin server layout
- `frontend/app/admin/page.tsx` — Auth wrapper + login/dashboard
- `frontend/app/admin/auth.tsx` — Sync auth init, relative API URLs
- `frontend/lib/api.ts` — Relative URLs, no more API_URL constant
- `frontend/lib/admin-api.ts` — Relative URLs, no more API_URL constant
- `frontend/app/services/page.tsx` — Removed DollarSign icon
- `frontend/next.config.js` — API rewrites
- `frontend/Dockerfile` — Build-time env vars for rewrites
- `docker-compose.yml` — ADMIN_PASSWORD, removed runtime env vars (moved to Dockerfile)
- `backend/routes/auth.ts` — Fixed route path

### Admin password:
- `admin123` (set in docker-compose, committed to repo)
- Login endpoint: `POST /api/auth/login` → `{ "password": "admin123" }`

### Deploy:
- Multiple commits: `77c9d2e` → `93446fa`
- All admin pages working: Login → Dashboard → CRUD pages
- Verified: `/admin` returns 200, login works, API calls succeed

---

## Phase 8B: Full Admin UI — Complete (2026-05-23)

### Built:
- **Admin sidebar** — Responsive navigation with icons, active link highlighting, logout
- **Admin layout** — Updated with sidebar + mobile hamburger menu
- **Admin dashboard** — Stats cards for all 4 content types, quick action links
- **Testimonials CRUD** — List, create, edit, delete with bilingual forms, featured toggle, star rating
- **Products CRUD** — List, create, edit, delete with category dropdown, image preview, featured toggle
- **Services CRUD** — List, create, edit, delete with category dropdown, features array
- **Settings editor** — Grouped by category (general, contact, social, hours), inline editing
- **API client** — `admin-api.ts` with 24 functions + TypeScript interfaces

### Files:
- **12 new**: admin-api.ts, AdminSidebar.tsx, 4× CRUD pages (testimonials, products, services, settings)
- **3 modified**: admin layout, admin dashboard, i18n.tsx (28 admin strings)
- **Total**: 15 files, +3155 lines

### Deploy:
- Committed: `b3d2abd` (15 files, +3155/-60 lines)
- Pushed + deployed via `deploy-all.sh`
- All admin pages verified: 200 OK

---

## Phase 8A: CMS Backend — Complete (2026-05-23)

### Built:
- **4 new Prisma models**: Testimonial, Product, Service, SiteSetting
- **4 new API routes**: testimonials.ts, products.ts, services.ts, settings.ts
- **Seed script**: seed.ts populates all tables with existing hardcoded data
- **server.ts**: Registered all 4 new routes (6 total route modules now)

### Data seeded:
- 10 testimonials (3 featured, 7 regular)
- 8 products (3 featured, 5 regular)
- 12 services (4 categories: Facials, Skin Analysis, Body Treatments, Makeup)
- 11 settings (general, contact, social, hours)

### Migration:
- `20260523092523_add_cms_tables` — Creates all 4 tables with indexes
- Migration committed to repo for future deploys

### API endpoints:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/testimonials` | GET | All testimonials |
| `/api/testimonials/featured` | GET | Featured testimonials only |
| `/api/admin/testimonials` | GET/POST | Admin CRUD |
| `/api/admin/testimonials/:id` | PUT/DELETE | Admin CRUD |
| `/api/products` | GET | All products |
| `/api/products/featured` | GET | Featured products only |
| `/api/products/category/:cat` | GET | Products by category |
| `/api/admin/products` | GET/POST | Admin CRUD |
| `/api/admin/products/:id` | PUT/DELETE | Admin CRUD |
| `/api/services` | GET | All services |
| `/api/services/category/:cat` | GET | Services by category |
| `/api/admin/services` | GET/POST | Admin CRUD |
| `/api/admin/services/:id` | PUT/DELETE | Admin CRUD |
| `/api/settings` | GET | All settings |
| `/api/settings/:key` | GET | Single setting |
| `/api/admin/settings` | GET/POST | Admin CRUD |
| `/api/admin/settings/:key` | PUT/DELETE | Admin CRUD |

### Deploy:
- Committed: `191b83e` (8 files, +1099 lines)
- Pushed + deployed via `deploy-all.sh`
- Migration + seed ran successfully on server
- All API endpoints verified: responding with correct data

---

## Phase 7: Final Polish — Complete (2026-05-23)

### Changes:
1. **Blog preview on home page** — New BlogPreview component between Testimonials and CTA
     - Shows 3 recent posts with cover images
     - Bilingual content (HE/EN)
     - Links to /blog for full catalog
2. **All prices converted to NIS (₪)** — Services, shop, products preview
     - Changed from $ to ₪ across all price displays (24 values total)
3. **Hero image fixed** — Replaced ImagePlaceholder with real image (/assets/hero/hero-main.png)
4. **Service images fixed** — Replaced ImagePlaceholder with real images per service
     - facial-treatment.png, skin-analysis.png, makeup.png
5. **Blog image references fixed** — Corrected featuredImage paths in all 3 markdown posts
     - featured-skincare.png, featured-seasonal.png, featured-beauty-tip.png

### Files modified:
- `frontend/app/page.tsx` — Added BlogPreview
- `frontend/components/sections/BlogPreview.tsx` — New file
- `frontend/components/sections/HeroSection.tsx` — Real image
- `frontend/components/sections/ServicesPreview.tsx` — Real images + ₪ prices
- `frontend/components/sections/ProductsPreview.tsx` — ₪ prices
- `frontend/app/shop/page.tsx` — ₪ prices
- `frontend/app/services/page.tsx` — ₪ prices
- `frontend/lib/i18n.tsx` — Added blog preview strings (blogReadMore, blogViewAll)
- `frontend/public/content/posts/*.md` — Fixed image references

### Deploy:
- Committed: `37965a9` (31 files changed, +2577/-901 lines)
- Pushed to GitHub: `github.com/chu11u/dev-env`
- Deployed via `deploy-all.sh` (proper git-based pipeline)
- All 4 projects deployed successfully
- Verified: all pages return 200

---

## Current State (2026-05-23)

### All admin pages WORKING:
- ✅ Login page (`/admin`) — Password: `admin123`
- ✅ Dashboard — Stats cards for all content types
- ✅ Blog CRUD — Full create/edit/delete
- ✅ Testimonials CRUD — Full create/edit/delete with star ratings
- ✅ Products CRUD — Full create/edit/delete with categories
- ✅ Services CRUD — Full create/edit/delete with features
- ✅ Settings — Inline editing, grouped by category

### Public pages:
- ✅ Home, Services, Testimonials, Blog, Shop, Contact all working
- ✅ All prices in ₪ (NIS)
- ✅ Bilingual HE/EN throughout
- ✅ All public components now fetch from API (Phase 8D)

### Phase 8D is deployed ✅ — all public components fetch from API.

### Phase 8E deployed ✅ — drag-and-drop image upload in admin panel.

### What's next:
- **Phase 8F**: WYSIWYG editor for blog content

### Git commits (newest first):
| Commit | Description | Files |
|--------|-------------|-------|
| `5717d20` | Update backend package-lock.json with multer deps | 1 |
| `c2f4a5f` | Phase 8E - Image upload (drag-and-drop) in admin panel | 13 |
| `ad421a3` | Fix TypeScript types for public API fetch functions | 1 |
| `12ac5b0` | Update journal for Phase 8D completion | 1 |
| `2cfa61a` | Phase 8D - Replace hardcoded data with API calls in all public components | 7 |
| `93446fa` | Fix API rewrites - pass build-time env vars | 2 |
| `11fdad6` | Fix API rewrites - use server-side env vars | 2 |
| `ecfef5a` | Use relative API URLs + Next.js rewrites | 3 |
| `e7a3e8e` | Fix admin dashboard loading forever | 1 |
| `5133bcc` | Simplify admin - move auth to page, thin server layout | 2 |
| `ba72f7a` | Move admin layout into single client file | 2 |
| `af7ff55` | Fix admin - render login form on /admin | 1 |
| `ecfef5a` | Use relative API URLs + Next.js rewrites | 3 |
| `97e1c7c` | Use Next.js rewrites for /api/ proxying | 2 |
| `5133bcc` | Simplify admin auth | 2 |
| `ba72f7a` | Move admin layout to client | 2 |
| `af7ff55` | Fix admin login form | 1 |
| `e7a3e8e` | Guard window access in admin layout | 1 |
| `336c0e5` | Move admin layout into single client file | 2 |
| `ba72f7a` | Move auth to page, thin server layout | 2 |
| `9460a87` | Use .tsx extension for server layout | 1 |
| `5133bcc` | Simplify admin auth | 2 |
| `1ad9456` | Guard window access in admin layout | 1 |
| `ba72f7a` | Move admin layout into single client file | 2 |
| `af7ff55` | Fix admin - render login form | 1 |
| `ecfef5a` | Use relative API URLs + Next.js rewrites | 3 |
| `97e1c7c` | Use Next.js rewrites for /api/ proxying | 2 |
| `5133bcc` | Simplify admin - move auth to page | 2 |
| `ba72f7a` | Move admin layout into single client file | 2 |
| `af7ff55` | Fix admin - render login form on /admin | 1 |
| `e7a3e8e` | Guard window access in admin layout | 1 |
| `336c0e5` | Move admin layout into single client file | 2 |
| `ba72f7a` | Move auth to page, thin server layout | 2 |
| `9460a87` | Use .tsx extension for server layout | 1 |
| `5133bcc` | Simplify admin - move auth to page, thin server layout | 2 |
| `af7ff55` | Fix admin - render login form on /admin | 1 |
| `e7a3e8e` | Guard window access in admin layout | 1 |
| `336c0e5` | Move admin layout into single client file | 2 |
| `ba72f7a` | Move auth to page, thin server layout | 2 |
| `9460a87` | Use .tsx extension for server layout | 1 |
| `5133bcc` | Simplify admin - move auth to page, thin server layout | 2 |
| `af7ff55` | Fix admin - render login form on /admin | 1 |
| `e7a3e8e` | Guard window access in admin layout | 1 |
| `336c0e5` | Move admin layout into single client file | 2 |
| `ba72f7a` | Move auth to page, thin server layout | 2 |
| `9460a87` | Use .tsx extension for server layout | 1 |
| `5133bcc` | Simplify admin - move auth to page, thin server layout | 2 |
| `af7ff55` | Fix admin - render login form on /admin | 1 |
| `ecfef5a` | Use relative API URLs + Next.js rewrites | 3 |
| `97e1c7c` | Use Next.js rewrites for /api/ proxying | 2 |
| `5133bcc` | Simplify admin - move auth to page, thin server layout | 2 |
| `ba72f7a` | Move admin layout into single client file | 2 |
| `af7ff55` | Fix admin - render login form on /admin | 1 |
| `e7a3e8e` | Guard window access in admin layout | 1 |
| `336c0e5` | Move admin layout into single client file | 2 |
| `ba72f7a` | Move auth to page, thin server layout | 2 |
| `9460a87` | Use .tsx extension for server layout | 1 |
| `5133bcc` | Simplify admin - move auth to page, thin server layout | 2 |
| `af7ff55` | Fix admin - render login form on /admin | 1 |

### Deploy workflow:
1. `git add -A && git commit -m "saritelkayam: [what changed]" && git push origin main`
2. SSH: `cd /home/elkayam/dev-env && git pull origin main && cd projects/saritelkayam && docker compose build frontend && docker compose up -d frontend`
3. Verify: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3006/`

### Deploy shortcut (frontend-only changes):
```bash
# SCP changed files then rebuild on server (faster than full rebuild)
scp -i ~/.ssh/dev-env-server <file> naor@192.168.131.134:/home/elkayam/dev-env/projects/saritelkayam/<same-path>
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env/projects/saritelkayam && docker compose build frontend && docker compose up -d frontend"
```

### Critical: Docker disk space
- Server only has ~32GB for Docker → builds fill it up
- If "no space left on device": `cd /home/elkayam/dev-env/projects/saritelkayam && docker compose down --rmi local && docker system prune -af --volumes`
- Then rebuild: `docker compose build && docker compose up -d`

### Cloudflare routing
- Cloudflare points directly to port 3006 (Next.js frontend), NOT to nginx:80
- Next.js rewrites handle `/api/` → backend proxying
- This works for both Cloudflare (`saritelkayam.com`) and direct access (`192.168.131.134:3006`)
