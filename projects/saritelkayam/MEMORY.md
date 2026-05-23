# Sarit Elkayam - Cosmetician Website
# Project Memory Dump
# Updated: May 23, 2026
# Use this to continue the project in a new conversation

## HOW TO ACTIVATE AN AGENT

1. Read this file for project context
2. Read the agent spec: `.agents/[agent-name].md`
3. Read the agent's skill files: `.skills/[skill-name].md`
4. Execute the agent's task queue in order
5. Update FEATURES STATUS table as you complete tasks

## BRAND

- **Name**: Sarit Elkayam
- **Profession**: Cosmetician
- **Domain**: `saritelkayam.com` — not yet configured (user to decide hosting)
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
| Admin: Blog | `/admin/blog` | Blog CRUD (list, create, edit, delete) |
| Admin: Testimonials | `/admin/testimonials` | Testimonials CRUD (list, create, edit, delete) |
| Admin: Products | `/admin/products` | Products CRUD (list, create, edit, delete) |
| Admin: Services | `/admin/services` | Services CRUD (list, create, edit, delete) |
| Admin: Settings | `/admin/settings` | Site settings editor (general, contact, social, hours) |

## TECH STACK

### All Agents Use
- Git: `cd /Users/elnaor/Environments/Zed/dev-env && git add -A && git commit -m "msg" && git push origin main`
- Deploy: `ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && ./deploy-all.sh"`

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
- Image pipeline: markdown export (blog posts saved as `.md` files)

### CMS
- Admin panel at `/admin` (password-protected via simple password check)
- **Blog**: Full CRUD with draft/publish, markdown export pipeline
- **Testimonials**: Full CRUD with bilingual forms, featured toggle, star rating
- **Products**: Full CRUD with category filter, featured toggle, image preview
- **Services**: Full CRUD with features array, category dropdown
- **Settings**: Inline editing by category (general, contact, social, hours)
- Database: PostgreSQL with Prisma models (Post, Author, Testimonial, Product, Service, SiteSetting)
- Markdown pipeline: blog posts saved to `public/content/posts/` as `.md` files

### Media Generation
- Draw Things API (Flux 2 Klein 9B) — local Mac only
- Endpoints: `POST http://localhost:7860/sdapi/v1/txt2img`
- Generated images stored in `public/assets/[category]/`
- Categories: hero, services, products, testimonials, blog, decorative

### Payments (ON HOLD)
- Stripe integration planned but not implemented

### Booking (ON HOLD)
- Appointment booking placeholder — no integration yet

### Email
- Contact form is UI-only (no backend email sending yet)

## PROJECT STRUCTURE

```
saritelkayam/
├── docker-compose.yml               # 3 services: frontend, backend, postgres
├── frontend/
│    ├── Dockerfile                   # Multi-stage: node builder → nginx
│    ├── nginx.conf                   # Internal nginx config
│    ├── app/
│    │    ├── layout.tsx              # Root layout with LocaleProvider
│    │    ├── page.tsx                # Home: Hero→Services→Products→Testimonials→Blog→CTA
│    │    ├── services/page.tsx       # Full service catalog (4 categories, 12 services)
│    │    ├── testimonials/page.tsx   # Full testimonial page (10 testimonials)
│    │    ├── shop/page.tsx           # Product catalog (8 products, filterable)
│    │    ├── blog/                   # Blog listing + post viewer
│    │    ├── contact/page.tsx        # Contact form + studio info
│    │    ├── book/page.tsx           # Booking placeholder
│    │    ├── admin/                  # Admin panel (password-protected)
│    │    │    ├── page.tsx           # Dashboard with stats cards
│    │    │    ├── layout.tsx         # Admin layout with sidebar
│    │    │    ├── auth.tsx           # Auth context provider
│    │    │    ├── blog/              # Blog CRUD (list, new, [id]/edit)
│    │    │    ├── testimonials/      # Testimonials CRUD (list, new, [id]/edit)
│    │    │    ├── products/          # Products CRUD (list, new, [id]/edit)
│    │    │    ├── services/          # Services CRUD (list, new, [id]/edit)
│    │    │    └── settings/          # Settings editor (grouped by category)
│    │    └── NotFoundContent.tsx     # 404 page client component
│    ├── components/
│    │    ├── layout/                 # Header, Footer, Section, LocaleProvider
│    │    ├── sections/              # Hero, ServicesPreview, ProductsPreview, Testimonials, BlogPreview, CTA
│    │    ├── common/                # FadeInSection, StaggeredList, ImagePlaceholder, SectionDivider
│    │    ├── ui/                    # Button, Card, Badge, Input, Textarea
│    │    └── admin/                 # AdminSidebar (responsive navigation)
│    ├── lib/
│    │    ├── i18n.tsx               # Bilingual dictionaries + useTranslation() hook
│    │    ├── api.ts                 # API client functions (blog CRUD)
│    │    ├── admin-api.ts           # API client for all admin CRUD operations
│    │    └── blog.ts                # Markdown blog post parser (SSG)
│    ├── public/
│    │    ├── assets/                # Generated images (hero, services, products, etc.)
│    │    └── content/posts/         # Markdown blog posts (3 seed posts)
│    ├── styles/globals.css          # Tailwind + RTL/LTR styles
│    └── tailwind.config.js          # Custom theme (rose, cream, charcoal, gold)
├── backend/
│    ├── Dockerfile                   # node:20-slim, single stage
│    ├── server.ts                    # Express app (6 route modules registered)
│    ├── seed.ts                      # Seed script for initial data
│    ├── lib/db.ts                    # Prisma client singleton
│    ├── routes/
│    │    ├── blog.ts                # Blog CRUD API + markdown export pipeline
│    │    ├── auth.ts                # Admin login (password check)
│    │    ├── testimonials.ts        # Testimonials CRUD API
│    │    ├── products.ts            # Products CRUD API
│    │    ├── services.ts            # Services CRUD API
│    │    └── settings.ts            # Settings CRUD API
│    └── prisma/
│        ├── schema.prisma           # All 6 models: Post, Author, Testimonial, Product, Service, SiteSetting
│        ├── migrations/             # 0001_initial_schema + 20260523092523_add_cms_tables
│        └── migration_lock.toml     # Migration lock
└── .journal/
     ├── status.md                   # Agent work journal
     └── log/                        # Work logs
```

## DEPLOYMENT

### Status: ✅ Deployed and running on server (192.168.131.134)

### Access
- Local: `http://saritelkayam.apps.elkayam.me` or `http://192.168.131.134:3006`
- Admin: `http://192.168.131.134:3006/admin` (password-protected)
- External: TBD (Cloudflare tunnel + domain)

### Ports
| Port | Service | Purpose |
|------|---------|---------|
| 3006 | Frontend | Next.js 15 |
| 30061 | Backend | Express + Prisma |
| 5432 | PostgreSQL | Database (internal only) |

### Containers
```
saritelkayam-frontend   Up   port 3006      (Next.js 15)
saritelkayam-backend    Up   port 30061 (Express + Prisma)
saritelkayam-postgres   Up   port 5432      (PostgreSQL 16)
```

### Rebuild Workflow

**Proper deploy (via git + deploy script):**
```bash
cd /Users/elnaor/Environments/Zed/dev-env
git add -A && git commit -m "saritelkayam: [what changed]" && git push origin main
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && ./deploy-all.sh"
```

**Docker disk full:** `docker system prune -af --volumes`

### Critical Deployment Notes
- No local `node/npm/npx` — build only via Docker on server
- Docker disk is tight (32G loop) — prune if full
- `frontend/lib/i18n.tsx` — note the `.tsx` extension (contains JSX)
- `app/not-found.tsx` is server component — UI is in `app/NotFoundContent.tsx`
- Always copy to `/home/elkayam/dev-env/projects/saritelkayam/frontend/` — NOT nested `frontend/frontend/`
- Footer needs `"use client"` directive (uses hooks)
- Components using `useTranslation()` need `"use client"` directive
- `deploy-all.sh` resolves docker network conflicts with `docker network prune -f`
- `deploy-all.sh` auto-generates nginx configs for all projects
- After schema changes: run `prisma migrate deploy` inside backend container
- Run `seed.ts` after migrations to populate initial data

## ENVIRONMENT VARIABLES

### Frontend
- `NEXT_PUBLIC_API_URL` — Backend API URL (default: `http://localhost:30061`)
- `NEXT_PUBLIC_SITE_URL` — Site URL (default: `https://saritelkayam.com`)

### Backend
- `DATABASE_URL` — PostgreSQL connection string
- `NODE_ENV` — `production`
- `ADMIN_PASSWORD` — Admin panel password (simple password check)

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
| **CMS Backend (4 new models + routes)** | ✅ Complete | 8A |
| **CMS Admin UI (full CRUD for all types)** | ✅ Complete | 8B |
| Frontend integration (API → components) | ❌ Not built | 8C |
| Image upload (drag-and-drop) | ❌ Not built | 8C |
| Booking integration | ⏸️ On hold | — |
| Payment integration | ⏸️ On hold | — |

## PHASE 8B: Admin UI — Complete (2026-05-23)

**Full admin panel with CRUD for all content types:**

### What was built:
- **Admin sidebar** (`AdminSidebar.tsx`) — Responsive navigation with icons, active link highlighting, logout
- **Admin layout** — Updated to include sidebar with responsive mobile support
- **Admin dashboard** — Stats cards for all 4 content types, quick action links
- **Testimonials CRUD** — List, create, edit, delete with bilingual forms, featured toggle, star rating selector
- **Products CRUD** — List, create, edit, delete with category dropdown, image preview, featured toggle
- **Services CRUD** — List, create, edit, delete with category dropdown, features array
- **Settings editor** — Grouped by category (general, contact, social, hours), inline editing

### API client:
- `frontend/lib/admin-api.ts` — Clean API client with TypeScript interfaces for all 4 content types
- 24 functions covering all CRUD operations

### Admin routes:
| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard with stats |
| `/admin/blog` | Existing blog CRUD |
| `/admin/testimonials` | Testimonials list + CRUD |
| `/admin/testimonials/new` | Create testimonial |
| `/admin/testimonials/[id]` | Edit testimonial |
| `/admin/products` | Products list + CRUD |
| `/admin/products/new` | Create product |
| `/admin/products/[id]` | Edit product |
| `/admin/services` | Services list + CRUD |
| `/admin/services/new` | Create service |
| `/admin/services/[id]` | Edit service |
| `/admin/settings` | Site settings editor |

### Files modified/created:
- **12 new files**: admin-api.ts, AdminSidebar.tsx, 4× CRUD pages (testimonials, products, services, settings)
- **3 modified**: admin layout, admin dashboard, i18n.tsx (28 admin strings)
- **Total**: 15 files, +3155 lines

### i18n:
- Added 28 admin strings (Hebrew + English) for sidebar, forms, actions
- All admin UI text is bilingual

### Deploy:
- Committed: `b3d2abd` (15 files, +3155/-60 lines)
- Pushed + deployed via `deploy-all.sh`
- All admin pages return 200

## PHASE 8A: CMS Backend — Complete (2026-05-23)

**Prisma models + API routes for 4 new content types:**

### Models:
- **Testimonial** — nameEn/He, textEn/He, serviceEn/He, rating, avatar, featured, sortOrder
- **Product** — nameEn/He, category, descriptionEn/He, price, size, image, badge, rating, featured, sortOrder
- **Service** — category, titleEn/He, descriptionEn/He, duration, price, featuresEn/He[], sortOrder
- **SiteSetting** — key (unique), valueEn/He, category

### API routes:
- `testimonials.ts` — Public + admin CRUD routes
- `products.ts` — Public + admin CRUD routes (includes category filter)
- `services.ts` — Public + admin CRUD routes (includes category filter)
- `settings.ts` — Public + admin CRUD routes (includes single key lookup)

### Migration:
- `20260523092523_add_cms_tables` — Creates all 4 tables with indexes
- Run with `npx prisma migrate deploy` in backend container

### Seed:
- `seed.ts` — Populates all 4 tables with existing hardcoded data
- 10 testimonials, 8 products, 12 services, 11 settings

### Deploy:
- Committed: `191b83e` (8 files, +1099 lines)
- Pushed + deployed via `deploy-all.sh`
- Migration + seed ran successfully on server

## PHASE 7: Final Polish — Complete (2026-05-23)

### Changes:
1. **Blog preview on home page** — Added BlogPreview component between Testimonials and CTA
2. **All prices converted to NIS (₪)** — Changed `$` to `₪` across all price displays (24 values)
3. **Hero image fixed** — Replaced ImagePlaceholder with real image
4. **Service images fixed** — Replaced ImagePlaceholder with real images per service
5. **Blog image references fixed** — Corrected featuredImage paths in all 3 markdown posts

### Deploy:
- Committed: `37965a9` (31 files)
- Pushed + deployed via `deploy-all.sh`
- Verified: all pages return 200

## PHASE 6: Products Page — Complete (2026-05-22)

- Replaced "coming soon" placeholder with full product catalog on `/shop`
- 8 products with bilingual data (HE/EN): cleansers, serums, moisturizers, sunscreen
- Product cards with images, badges, ratings, sizes, prices (now in ₪)
- Category filter buttons (All, Cleansers, Serums, Moisturizers, Sun Protection)
- Wishlist button on each product
- Products preview on home page — new ProductsPreview component
- All product images from `public/assets/products/` (3 image files)

## PHASE 5: Polish Hebrew Translations — Complete (2026-05-22)

- Fixed name transliteration: "סריטל קיימ" → "שרית אלקיים"
- Fixed Korean characters, awkward translations
- Rewrote all service/testimonial strings for natural Hebrew
- Translated all 3 blog seed posts to Hebrew with `lang: he` frontmatter

## PHASE 4: Bilingual Hebrew/English — Complete (2026-05-21)

- Created `frontend/lib/i18n.tsx` with he/en dictionaries (~100 strings each)
- Created `frontend/components/layout/LocaleProvider.tsx` wrapper
- Fonts: Frank Ruhl Libre + Heebo (both with Hebrew subset)
- RTL layout support with `dir="rtl"`/`lang="he"` on html
- Language toggle in header (desktop + mobile)
- Translated all UI strings across 15 frontend files

## Current Nav Links (all 6, desktop + mobile)

Home → Services → Testimonials → Blog → Shop → Contact

## SSH / Server Details
- Key: `~/.ssh/dev-env-server`
- User: `naor@192.168.131.134`
- Server path: `/home/elkayam/dev-env/projects/saritelkayam/`
- Dev-env repo: `github.com/chu11u/dev-env`

## What's Next
| Priority | Work | Description |
|----------|------|-------------|
| P0 | Frontend integration | Replace hardcoded data with API calls in frontend components |
| P0 | Image upload | Drag-and-drop upload in admin (backend endpoint + UI) |
| P1 | Blog frontend integration | Blog pages already fetch from markdown — add DB fallback |
| P2 | WYSIWYG editor | Replace textarea with rich text editor for content |
| P3 | Booking integration | Connect to external booking service |
| P4 | Payment integration | Stripe for product sales |
