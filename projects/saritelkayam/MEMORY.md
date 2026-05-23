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
| Services | `/services` | Full service catalog with pricing and descriptions |
| Testimonials | `/testimonials` | Customer reviews with photos |
| Products | `/shop` | Full product catalog (8 products, HE/EN, images) |
| Blog | `/blog` | Blog listing with 3 seed posts |
| Blog Post | `/blog/[slug]` | Individual blog post viewer |
| Contact | `/contact` | Contact form + studio info |
| Book | `/book` | Appointment booking (placeholder) |
| Admin | `/admin` | Password-protected admin panel for blog CRUD |

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
- Routes: blog CRUD + auth
- Image pipeline: markdown export (blog posts saved as `.md` files)

### CMS
- Admin panel at `/admin` (password-protected)
- Blog: full CRUD with draft/publish toggle
- Markdown pipeline: posts saved to `public/content/posts/` as `.md` files
- Database: PostgreSQL with Prisma models (Post, Author)

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
├── docker-compose.yml              # 3 services: frontend, backend, postgres
├── frontend/
│   ├── Dockerfile                  # Multi-stage: node builder → nginx
│   ├── nginx.conf                  # Internal nginx config
│   ├── app/
│   │   ├── layout.tsx              # Root layout with LocaleProvider
│   │   ├── page.tsx                # Home: Hero → Services → Products → Testimonials → Blog → CTA
│   │   ├── services/page.tsx       # Full service catalog (4 categories, 12 services)
│   │   ├── testimonials/page.tsx   # Full testimonial page (10 testimonials)
│   │   ├── shop/page.tsx           # Product catalog (8 products, filterable)
│   │   ├── blog/                   # Blog listing + post viewer
│   │   ├── contact/page.tsx        # Contact form + studio info
│   │   ├── book/page.tsx           # Booking placeholder
│   │   ├── admin/                  # Admin panel (password-protected)
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── auth.tsx            # Auth context provider
│   │   │   └── blog/               # Blog CRUD (list, create, edit)
│   │   └── NotFoundContent.tsx     # 404 page client component
│   ├── components/
│   │   ├── layout/                 # Header, Footer, Section, LocaleProvider
│   │   ├── sections/               # Hero, ServicesPreview, ProductsPreview, Testimonials, BlogPreview, CTA
│   │   ├── common/                 # FadeInSection, StaggeredList, ImagePlaceholder, SectionDivider
│   │   └── ui/                     # Button, Card, Badge, Input, Textarea
│   ├── lib/
│   │   ├── i18n.tsx                # Bilingual dictionaries + useTranslation() hook
│   │   ├── api.ts                  # API client functions (blog CRUD)
│   │   └── blog.ts                 # Markdown blog post parser (SSG)
│   ├── public/
│   │   ├── assets/                 # Generated images (hero, services, products, etc.)
│   │   └── content/posts/          # Markdown blog posts (3 seed posts)
│   ├── styles/globals.css          # Tailwind + RTL/LTR styles
│   └── tailwind.config.js          # Custom theme (rose, cream, charcoal, gold)
├── backend/
│   ├── Dockerfile                  # node:20-slim, single stage
│   ├── server.ts                   # Express app (blog routes, auth routes, health)
│   ├── lib/db.ts                   # Prisma client singleton
│   ├── routes/
│   │   ├── blog.ts                 # Blog CRUD API + markdown export pipeline
│   │   └── auth.ts                 # Admin login (password check)
│   └── prisma/
│       ├── schema.prisma           # Post, Author models + PostStatus enum
│       └── migration_lock.toml     # Migration lock
└── .journal/
    ├── status.md                   # Agent work journal
    └── log/                        # Work logs
```

## DEPLOYMENT

### Status: ✅ Deployed and running on server (192.168.131.134)

### Access
- Local: `http://saritelkayam.apps.elkayam.me` or `http://192.168.131.134:3006`
- External: TBD (Cloudflare tunnel + domain)

### Ports
| Port | Service | Purpose |
|------|---------|---------|
| 3006 | Frontend | Next.js 15 |
| 30061 | Backend | Express + Prisma |
| 5432 | PostgreSQL | Database (internal only) |

### Containers
```
saritelkayam-frontend   Up   port 3006     (Next.js 15)
saritelkayam-backend    Up   port 30061 (Express + Prisma)
saritelkayam-postgres   Up   port 5432     (PostgreSQL 16)
```

### Rebuild Workflow

**Proper deploy (via git + deploy script):**
```bash
# 1. Make changes locally
# 2. Commit and push
cd /Users/elnaor/Environments/Zed/dev-env
git add -A && git commit -m "msg" && git push origin main
# 3. Deploy on server
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && ./deploy-all.sh"
```

**Quick frontend rebuild (frontend changes only):**
```bash
# 1. Copy changed files to server
scp -i ~/.ssh/dev-env-server <file> naor@192.168.131.134:/home/elkayam/dev-env/projects/saritelkayam/<file>
# 2. Rebuild on server
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env/projects/saritelkayam && docker compose build frontend && docker compose up -d frontend"
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
- Dockerfile copies `node_modules` into builder — `COPY . .` includes them, invalidate cache with `--no-cache` if lib files change
- deploy-all.sh resolves docker network conflicts with `docker network prune -f`
- deploy-all.sh auto-generates nginx configs for all projects

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
| Prices in NIS (₪) | ✅ Complete | 7 |
| Blog preview on home page | ✅ Complete | 7 |
| Hero image (real, not placeholder) | ✅ Complete | 7 |
| Service images (real, not placeholder) | ✅ Complete | 7 |
| Testimonials CMS | ❌ Not built | — |
| Products CMS | ❌ Not built | — |
| Services CMS | ❌ Not built | — |
| Site settings CMS | ❌ Not built | — |
| Admin i18n (Hebrew) | ❌ Not built | — |
| Image upload in admin | ❌ Not built | — |
| Booking integration | ⏸️ On hold | — |
| Payment integration | ⏸️ On hold | — |

## PHASE 7: Final Polish — Complete (2026-05-23)

### Changes:
1. **Blog preview on home page** — Added BlogPreview component between Testimonials and CTA
   - Shows 3 recent posts with cover images, bilingual content
   - Links to `/blog` for full catalog
2. **All prices converted to NIS (₪)** — Services, shop, products preview
   - Changed from `$` to `₪` across all price displays
3. **Hero image fixed** — Replaced ImagePlaceholder with real image (`/assets/hero/hero-main.png`)
4. **Service images fixed** — Replaced ImagePlaceholder with real images per service category
5. **Blog image references fixed** — Corrected featuredImage paths in all 3 markdown posts

### Files modified:
- `frontend/app/page.tsx` — Added BlogPreview import + section
- `frontend/components/sections/BlogPreview.tsx` — New file
- `frontend/components/sections/HeroSection.tsx` — Real image
- `frontend/components/sections/ServicesPreview.tsx` — Real images + ₪ prices
- `frontend/components/sections/ProductsPreview.tsx` — ₪ prices
- `frontend/app/shop/page.tsx` — ₪ prices
- `frontend/app/services/page.tsx` — ₪ prices (all 12 services)
- `frontend/lib/i18n.tsx` — Added blog preview strings
- `frontend/public/content/posts/*.md` — Fixed image references

### Deploy:
- Committed to git: `37965a9` (31 files changed)
- Pushed to GitHub: `github.com/chu11u/dev-env`
- Deployed via `deploy-all.sh` on server (proper git-based pipeline)
- All 4 projects deployed (arcade, clock, dinnerplan, saritelkayam)
- Verified: all pages return 200

### What's Left:
| Priority | Work | Blocker |
|----------|------|---------|
| P0 | Full content management system (testimonials, products, services, site settings) | Design decision needed |
| P1 | Admin i18n (translate to Hebrew) | Low priority |
| P2 | Image upload in admin (drag-and-drop) | Requires backend endpoint |
| P3 | Booking integration | On hold |
| P4 | Payment integration | On hold |

## PHASE 6: Products Page — Complete (2026-05-22)

- Replaced "coming soon" placeholder with full product catalog on `/shop`
- 8 products with bilingual data (HE/EN): cleansers, serums, moisturizers, sunscreen
- Product cards with images, badges, ratings, sizes, prices (now in ₪)
- Category filter buttons (All, Cleansers, Serums, Moisturizers, Sun Protection)
- Wishlist button on each product
- CTA section with contact/book links
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
