# Sarit Elkayam - Cosmetician Website
# Project Memory Dump
# Updated: May 23, 2026
# Use this to continue the project in a new conversation

## HOW TO ACTIVATE AN AGENT

1. Read this file for project context
2. Read the journal: `.journal/status.md`
3. Execute tasks from `.journal/status.md` → What's next

## BRAND

- **Name**: Sarit Elkayam
- **Profession**: Cosmetician
- **Domain**: `saritelkayam.com` via Cloudflare tunnel (direct to port 3006)
- **Test URL**: `http://192.168.131.134:3006`

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

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, services preview, products preview, testimonials, blog preview, CTA |
| Services | `/services` | Full service catalog (4 categories, 12 services) |
| Testimonials | `/testimonials` | Customer reviews (10 total, 3 featured on home) |
| Products | `/shop` | Full product catalog (8 products, filterable by category) |
| Blog | `/blog` | Blog listing with 3 seed posts |
| Blog Post | `/blog/[slug]` | Individual blog post viewer |
| Contact | `/contact` | Contact form + studio info |
| Book | `/book` | Appointment booking (placeholder) |
| Admin | `/admin` | Full CMS — dashboard + CRUD for all content types |

## TECH STACK

### Frontend
- Next.js 15 with App Router
- Tailwind CSS with custom theme
- Framer Motion for scroll animations
- Lucide React for icons
- Bilingual: Hebrew (RTL) + English (LTR) with `useTranslation()` hook

### Backend API
- Express.js + TypeScript
- Prisma ORM with PostgreSQL
- Routes: blog, auth, testimonials, products, services, settings
- Auth: Simple password check (no JWT — `admin123` in docker-compose)

### API Routing (Critical!)
```
Browser → Next.js frontend (port 3006)
   /api/* → Next.js rewrite → backend:3001 (Docker service name)
   /* → Next.js pages (static/dynamic)
```
- All API calls use **relative paths** (`/api/...`) — proxied by Next.js rewrites
- `next.config.js` rewrites use `BACKEND_HOST` + `BACKEND_PORT` env vars
- Env vars passed at **build time** via Dockerfile `ARG` + `ENV`
- `frontend/Dockerfile` has build-time env vars: `BACKEND_HOST=backend`, `BACKEND_PORT=3001`
- No `API_URL` constant in code — all calls use relative paths

### CMS
- Admin panel at `/admin` (password-protected via simple password check)
- **Blog**: Full CRUD with draft/publish, markdown export pipeline
- **Testimonials**: Full CRUD with bilingual forms, featured toggle, star rating
- **Products**: Full CRUD with category filter, featured toggle, image preview
- **Services**: Full CRUD with features array, category dropdown
- **Settings**: Inline editing by category (general, contact, social, hours)
- Database: PostgreSQL with Prisma models (Post, Author, Testimonial, Product, Service, SiteSetting)
- Markdown pipeline: blog posts saved to `public/content/posts/` as `.md` files

### Admin Architecture
```
app/admin/
  layout.tsx   → Thin server layout with dynamic="force-dynamic"
  auth.tsx     → AuthProvider + useAuth() hook, relative API URLs
  page.tsx     → Wraps content with AuthProvider, handles login/dashboard
  blog/        → Blog CRUD (uses auth, no extra wrapper needed)
  testimonials/ → Testimonials CRUD
  products/    → Products CRUD
  services/    → Services CRUD
  settings/    → Settings editor
```
- `AdminLayout` is a **server component** — just passes `dynamic = "force-dynamic"`
- Each admin page is a **"use client"** component
- Only `AdminPage` wraps with `AuthProvider` (login page needs auth state)
- Sub-pages (blog, testimonials, etc.) don't need auth wrapper yet

### Media Generation
- Draw Things API (Flux 2 Klein 9B) — local Mac only
- Endpoints: `POST http://localhost:7860/sdapi/v1/txt2img`
- Generated images stored in `public/assets/[category]/`
- Categories: hero, services, products, testimonials, blog, decorative

## PROJECT STRUCTURE

```
saritelkayam/
├── docker-compose.yml                # 3 services: frontend, backend, postgres
├── frontend/
│     ├── Dockerfile                  # Multi-stage: node builder → node runtime
│     ├── app/
│     │     ├── layout.tsx            # Root layout with LocaleProvider
│     │     ├── page.tsx              # Home: Hero→Services→Products→Testimonials→Blog→CTA
│     │     ├── services/page.tsx     # Full service catalog
│     │     ├── testimonials/page.tsx # Full testimonial page
│     │     ├── shop/page.tsx         # Product catalog
│     │     ├── blog/                 # Blog listing + post viewer
│     │     ├── contact/page.tsx      # Contact form + studio info
│     │     ├── book/page.tsx         # Booking placeholder
│     │     ├── admin/                # Admin panel (password-protected)
│     │     │     ├── layout.tsx      # Thin server layout, dynamic="force-dynamic"
│     │     │     ├── auth.tsx        # AuthProvider + useAuth() hook
│     │     │     ├── page.tsx        # Wraps with AuthProvider, login/dashboard
│     │     │     ├── blog/           # Blog CRUD
│     │     │     ├── testimonials/   # Testimonials CRUD
│     │     │     ├── products/       # Products CRUD
│     │     │     ├── services/       # Services CRUD
│     │     │     └── settings/       # Settings editor
│     │     └── NotFoundContent.tsx   # 404 page
│     ├── components/
│     │     ├── layout/               # Header, Footer, Section, LocaleProvider
│     │     ├── sections/             # Hero, ServicesPreview, ProductsPreview, Testimonials, BlogPreview, CTA
│     │     ├── common/               # FadeInSection, StaggeredList, ImagePlaceholder, SectionDivider
│     │     ├── ui/                   # Button, Card, Badge, Input, Textarea
│     │     └── admin/                # AdminSidebar (responsive navigation)
│     ├── lib/
│     │     ├── i18n.tsx              # Bilingual dictionaries + useTranslation() hook
│     │     ├── api.ts                # API client (blog CRUD, relative URLs)
│     │     ├── admin-api.ts          # Admin API client (relative URLs)
│     │     └── blog.ts              # Markdown blog post parser
│     ├── next.config.js              # Rewrites: /api/* → backend
│     ├── public/assets/              # Generated images
│     └── public/content/posts/       # Markdown blog posts (3 seed posts)
├── backend/
│     ├── Dockerfile                  # node:20-slim
│     ├── server.ts                   # Express app (6 route modules)
│     ├── seed.ts                     # Seed script
│     ├── lib/db.ts                   # Prisma client singleton
│     ├── routes/                     # blog, auth, testimonials, products, services, settings
│     └── prisma/
│         ├── schema.prisma           # 6 models
│         └── migrations/             # Initial + CMS tables
└── .journal/
      └── status.md                   # Agent work journal
```

## DEPLOYMENT

### Status: ✅ Deployed and running on server (192.168.131.134)

### Access
- Local: `http://192.168.131.134:3006`
- External: `https://saritelkayam.com` (Cloudflare → port 3006 directly)
- Admin: `http://192.168.131.134:3006/admin` (password: `admin123`)

### Ports
| Port | Service | Purpose |
|------|---------|---------|
| 3006 | Frontend | Next.js 15 |
| 30061 | Backend | Express + Prisma |
| 5432 | PostgreSQL | Database (internal only) |

### Containers
```
saritelkayam-frontend   Up   port 3006       (Next.js 15)
saritelkayam-backend    Up   port 30061 (Express + Prisma)
saritelkayam-postgres   Up   port 5432       (PostgreSQL 16)
```

### Rebuild Workflow

**Full deploy (git + server):**
```bash
cd /Users/elnaor/Environments/Zed/dev-env
git add -A && git commit -m "saritelkayam: [what changed]" && git push origin main
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && git pull origin main && cd projects/saritelkayam && docker compose build frontend && docker compose up -d frontend"
```

**Frontend-only deploy (fast, SCP):**
```bash
scp -i ~/.ssh/dev-env-server <file> naor@192.168.131.134:/home/elkayam/dev-env/projects/saritelkayam/<same-path>
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env/projects/saritelkayam && docker compose build frontend && docker compose up -d frontend"
```

**Docker disk full:**
```bash
cd /home/elkayam/dev-env/projects/saritelkayam
docker compose down --rmi local
docker system prune -af --volumes
docker compose build && docker compose up -d
```

### Critical Deployment Notes
- No local `node/npm/npx` — build only via Docker on server
- Docker disk is tight (32G loop) — prune if full
- `frontend/lib/i18n.tsx` — note the `.tsx` extension (contains JSX)
- `app/not-found.tsx` is server component — UI is in `app/NotFoundContent.tsx`
- Always copy to `/home/elkayam/dev-env/projects/saritelkayam/frontend/`
- Footer needs `"use client"` directive (uses hooks)
- Components using `useTranslation()` need `"use client"` directive
- Admin layout must be **server component** with `dynamic = "force-dynamic"`
- API calls use relative paths — proxied by Next.js rewrites
- `NEXT_PUBLIC_*` env vars are **client-only** — server rewrites need regular env vars
- Build-time env vars: pass via Dockerfile `ARG` + `ENV`

### Cloudflare Routing
- Cloudflare points **directly to port 3006** (Next.js frontend), NOT to nginx:80
- Next.js rewrites handle `/api/` → backend proxying
- Works for both Cloudflare (`saritelkayam.com`) and direct access (`192.168.131.134:3006`)
- nginx:80 is NOT involved for saritelkayam

## ENVIRONMENT VARIABLES

### Frontend (build-time, in Dockerfile)
- `BACKEND_HOST` — Backend hostname (default: `backend`)
- `BACKEND_PORT` — Backend port (default: `3001`)
- `NEXT_PUBLIC_SITE_URL` — Site URL (default: `https://saritelkayam.com`)

### Backend (in docker-compose.yml)
- `DATABASE_URL` — PostgreSQL connection string
- `NODE_ENV` — `production`
- `ADMIN_PASSWORD` — Admin panel password (`admin123`)

### Draw Things (local only, not on server)
- API: `POST http://localhost:7860/sdapi/v1/txt2img`
- Model: Flux 2 Klein 9B

## FEATURES STATUS

| Feature | Status | Phase |
|---------|--------|-------|
| Infrastructure (Docker, nginx) | ✅ Complete | 1 |
| Design system (Tailwind, components) | ✅ Complete | 1 |
| Media assets (18 images) | ✅ Complete | 1 |
| Frontend pages (7 pages) | ✅ Complete | 2 |
| Animations (Framer Motion) | ✅ Complete | 3 |
| Blog CMS (CRUD + markdown) | ✅ Complete | 2 |
| Bilingual i18n (HE/EN + RTL) | ✅ Complete | 4 |
| Hebrew translations polish | ✅ Complete | 5 |
| Products page (8 products) | ✅ Complete | 6 |
| Final polish (images, prices, blog preview) | ✅ Complete | 7 |
| CMS Backend (4 new models + routes) | ✅ Complete | 8A |
| CMS Admin UI (full CRUD for all types) | ✅ Complete | 8B |
| Admin auth + API routing fixes | ✅ Complete | 8C |
| Frontend integration (API → components) | ❌ Not built | 8D |
| Image upload (drag-and-drop) | ❌ Not built | 8E |
| WYSIWYG editor | ❌ Not built | 8F |
| Booking integration | ⏸️ On hold | — |
| Payment integration | ⏸️ On hold | — |

## What's Next (Priority Order)

### P0: Phase 8D — Frontend Integration
Replace hardcoded data in public-facing components with API calls:
- `TestimonialsSection.tsx` → fetch from `/api/testimonials`
- `testimonials/page.tsx` → fetch from `/api/testimonials`
- `shop/page.tsx` → fetch from `/api/products`
- `ProductsPreview.tsx` → fetch from `/api/products/featured`
- `services/page.tsx` → fetch from `/api/services`
- `ServicesPreview.tsx` → fetch from `/api/services`

### P1: Phase 8E — Image Upload
- Backend endpoint for image upload
- Frontend drag-and-drop component
- Update admin forms to support file uploads

### P2: Phase 8F — WYSIWYG Editor
- Replace textarea with rich text editor for blog content
