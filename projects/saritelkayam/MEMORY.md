# Sarit Elkayam - Cosmetician Website
# Project Memory Dump
# Updated: May 25, 2026
# Use this to continue the project in a new conversation

## HOW TO ACTIVATE AN AGENT
1. Read this file first — it has everything you need
2. Also read `.journal/status.md` for detailed work history
3. The project is at: `/Users/elnaor/Environments/Zed/dev-env/projects/saritelkayam`
4. No local Node/npm — builds run in Docker on the server
5. Deploy workflow is at the bottom

## BRAND
- **Name**: Sarit Elkayam (שרית אלקיים)
- **Profession**: Professional cosmetician / beauty specialist
- **Language**: Primarily Hebrew (RTL), with English support (LTR)
- **Vibe**: Warm, elegant, feminine — high-end spa meets boutique salon

## DESIGN SYSTEM

### Palette - "Warm Luxury"
| Role | Color | Hex |
|------|-------|-----|
| Primary | Soft rose gold | `#D4A59A` |
| Primary light | Blush | `#E8C4B8` |
| Secondary | Warm cream | `#FAF6F2` |
| Accent | Deep burgundy | `#6B3A3A` |
| Text | Rich charcoal | `#3D2B2B` |
| Highlight | Gold shimmer | `#C8A979` |

### Typography
- **Headings**: Frank Ruhl Libre (serif, elegant, supports Hebrew + Latin)
- **Body**: Heebo (sans-serif, clean, supports Hebrew + Latin)

### Style
- Clean whitespace, soft rounded cards, subtle scroll animations
- Feminine without being cliché, warm without being overwhelming
- Think: high-end spa meets boutique salon

## SITE MAP
```
/               → Home (hero + services preview + testimonials + CTA)
/services      → All services (grouped by category)
/shop          → Products (with category filter)
/blog          → Blog listing (markdown posts)
/blog/[slug]   → Single blog post
/testimonials  → All customer testimonials
/book          → Booking CTA (coming soon)
/contact       → Contact info + social links
/admin         → Admin panel (password-protected)
  /admin/blog            → Blog CRUD
  /admin/testimonials    → Testimonials CRUD
  /admin/products        → Products CRUD
  /admin/services        → Services CRUD
  /admin/settings        → Site settings editor
```

## TECH STACK

### Frontend
- Next.js 15 with App Router
- Tailwind CSS with custom theme
- Framer Motion for scroll animations
- Lucide React for icons
- React-Quill for WYSIWYG editing (blog content)
- Marked + Turndown for markdown↔HTML conversion
- Bilingual: Hebrew (RTL) + English (LTR) with `useTranslation()` hook

### Backend API
- Express.js + TypeScript
- Prisma ORM with PostgreSQL
- Routes: blog, auth, testimonials, products, services, settings, upload
- Auth: Simple password check (no JWT — `admin123` in docker-compose)
- Image upload via multer (images stored in `/app/uploads`, served at `/uploads/`)
- Auto-applies pending Prisma migrations on startup

### API Routing (Critical!)
```
Browser → Next.js frontend (port 3006)
     /api/* → Next.js rewrite → backend:3001 (Docker service name)
     /uploads/* → Next.js rewrite → backend:3001 (static file serving)
     /* → Next.js pages (static/dynamic)
```
- All API calls use **relative paths** (`/api/...`) — proxied by Next.js rewrites
- `next.config.js` rewrites use `BACKEND_HOST` + `BACKEND_PORT` env vars
- Env vars passed at **build time** via Dockerfile `ARG` + `ENV`

### Public API Integration (Phase 8D)
All public-facing components fetch from backend API:
- Testimonials, Products, Services → all use `/api/...` endpoints
- `lib/api.ts` has shared adapters: `adaptTestimonial()`, `adaptProduct()`, `adaptService()`
- Silent error handling — falls back to hardcoded data if API fails

### Image Upload (Phase 8E + 8G)
- **Backend**: `backend/routes/upload.ts` with multer (POST/DELETE `/api/upload/image`)
- **Frontend**: `ImageUpload` component — drag-and-drop, live preview, progress, error handling
- **Integrated in**: Blog (featured image), Products (image), Testimonials (avatar), Services (image), Settings (logo/favicon)
- Storage: `/app/uploads` directory, persisted via Docker volume
- Images served via Next.js rewrite: `/uploads/` → backend

### CMS
- Admin at `/admin` (password-protected)
- Full CRUD for: Blog, Testimonials, Products, Services, Settings
- Blog uses WYSIWYG editor (react-quill) with Visual/Markdown toggle
- Services have image upload via ImageUpload component
- Settings: inline editing, image upload for logo/favicon keys

### Admin Architecture
```
app/admin/
  layout.tsx     → Server layout, dynamic="force-dynamic"
  auth.tsx       → AuthProvider + useAuth() hook
  page.tsx       → Wraps with AuthProvider, login/dashboard
  blog/          → Blog CRUD (WysiwygEditor for content)
  testimonials/  → Testimonials CRUD (ImageUpload for avatar)
  products/      → Products CRUD (ImageUpload for image)
  services/      → Services CRUD (ImageUpload for image)
  settings/      → Settings editor (ImageUpload for logo/favicon)
```
- Each admin page is a **"use client"** component
- Only `AdminPage` wraps with `AuthProvider`
- `lib/admin-api.ts` — all admin API functions + TypeScript interfaces
- `lib/api.ts` — public API functions + locale-aware adapters

## PROJECT STRUCTURE
```
saritelkayam/
  docker-compose.yml    → 3 services (frontend, backend, postgres)
  frontend/
    app/                → Next.js 15 App Router pages
      admin/            → Admin panel (CRUD for all CMS types)
    components/
      admin/            → WysiwygEditor, ImageUpload
      layout/           → Header, Footer, LocaleProvider
      ui/               → Button, Card, Input, Textarea
    lib/
      api.ts            → Public API + locale adapters
      admin-api.ts      → Admin API + types
      i18n.tsx          → Bilingual translation hook
    styles/globals.css  → Tailwind + Quill editor styling
    package.json        → react-quill, marked, turndown + core deps
    Dockerfile          → npm install --legacy-peer-deps (react 19 compat)
  backend/
    server.ts           → Express entry point
    lib/db.ts           → Prisma client (singleton)
    routes/             → blog, auth, testimonials, products, services, settings, upload
    prisma/
      schema.prisma     → Post, Author, Testimonial, Product, Service, SiteSetting
      migrations/       → Migration history
    seed.ts             → Seeds testimonials, products, services, settings
    seed_blog.ts        → Seeds 3 initial blog posts
    Dockerfile          → prisma migrate deploy on startup
```

## DEPLOYMENT

### Status: ✅ Deployed and running on server (192.168.131.134)

### Access
- Local: `http://192.168.131.134:3006`
- External: `https://saritelkayam.com` (Cloudflare → port 3006)
- Admin: `http://192.168.131.134:3006/admin` (password: `admin123`)

### Ports
| Port | Service | Purpose |
|------|---------|---------|
| 3006 | Frontend | Next.js 15 |
| 30061 | Backend | Express + Prisma |
| 5432 | PostgreSQL | Database (internal only) |

### Containers
```
saritelkayam-frontend   Up   port 3006         (Next.js 15)
saritelkayam-backend    Up   port 30061        (Express + Prisma)
saritelkayam-postgres   Up   port 5432         (PostgreSQL 16)
```

### Deploy Workflow
1. `cd /Users/elnaor/Environments/Zed/dev-env && git add -A && git commit -m "saritelkayam: [what]" && git push origin main`
2. SSH: `cd /home/elkayam/dev-env && git fetch origin && git reset --hard origin/main && cd projects/saritelkayam && docker compose build && docker compose up -d`
3. Frontend-only: `docker compose build frontend && docker compose up -d frontend`

### Critical Deployment Notes
- No local `node/npm/npx` — build only via Docker on server
- `frontend/Dockerfile` uses `npm install --legacy-peer-deps` (react-quill React 19 compat)
- `backend/Dockerfile` runs `prisma migrate deploy` on startup (auto-applies pending migrations)
- Server git: use `git fetch origin && git reset --hard origin/main` (NOT `git pull`)
- Docker disk is tight — prune if full: `docker system prune -af --volumes`
- Image uploads persist via volume: `../../project-data/saritelkayam/uploads:/app/uploads`

### Cloudflare Routing
- Points **directly to port 3006** (Next.js frontend)
- `/api/` and `/uploads/` rewrites handled by Next.js config
- nginx:80 is NOT involved for saritelkayam

## ENVIRONMENT VARIABLES
- Frontend: `BACKEND_HOST=backend`, `BACKEND_PORT=3001`, `NEXT_PUBLIC_SITE_URL=https://saritelkayam.com`
- Backend: `DATABASE_URL`, `NODE_ENV=production`, `ADMIN_PASSWORD=admin123`

## FEATURES STATUS

| Feature | Status | Phase |
|---------|--------|-------|
| Infrastructure (Docker, nginx) | ✅ Complete | 1 |
| Design system (Tailwind, components) | ✅ Complete | 1 |
| Media assets (18 images) | ✅ Complete | 1 |
| Frontend pages (7 pages) | ✅ Complete | 2 |
| Animations (Framer Motion) | ✅ Complete | 3 |
| Bilingual i18n (HE/EN + RTL) | ✅ Complete | 4 |
| Products page (8 products) | ✅ Complete | 6 |
| Final polish | ✅ Complete | 7 |
| CMS Backend (4 models + routes) | ✅ Complete | 8A |
| CMS Admin UI (full CRUD) | ✅ Complete | 8B |
| Admin auth + API routing | ✅ Complete | 8C |
| Frontend API integration | ✅ Complete | 8D |
| Image upload (drag-and-drop) | ✅ Complete | 8E |
| WYSIWYG editor (react-quill) | ✅ Complete | 8F |
| Services image upload | ✅ Complete | 8G |
| Settings image upload | ✅ Complete | 8G |
| Blog seed + settings fix | ✅ Complete | 8H |
| Booking integration | ⏸️ On hold | — |
| Payment integration | ⏸️ On hold | — |

## Git history (newest first):
| Commit | Description |
|--------|-------------|
| `d74179c` | Fix seed_blog.ts types + rebuild |
| `636b0d5` | Fix seed_blog.ts import for ts-node |
| `0ace2de` | Fix settings category match + seed blog posts |
| `9050116` | Add Service.image database migration |
| `0d5f43c` | Fix migration_lock.toml binary corruption |
| `b158973` | Fix JSX nested ternary in settings admin |
| `542205b` | Phase 8G - Image upload for services + settings |
| `1f3a81c` | Update MEMORY.md + journal for Phase 8G |
| `ef17d53` | Phase 8F - WYSIWYG editor for blog admin |
| `0b4b6b4` | Remove non-existent @types/react-quill |
| `291e1a0` | Fix Dockerfile for react-quill peer dep |

## Future Phases (on hold)
- Booking integration (Calendly, Acuity Scheduling, or custom)
- Payment integration (Stripe, PayPal)
- SEO optimization (meta tags, Open Graph, sitemap)
- Performance optimization (image optimization, lazy loading)
- Blog post categories/tags
