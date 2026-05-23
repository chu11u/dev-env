# Sarit Elkayam - Cosmetician Website
# Project Memory Dump
# Updated: May 22, 2026
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
| Home | `/` | Hero, services preview, products preview, testimonials, CTA |
| Services | `/services` | Full service catalog with pricing and descriptions |
| Testimonials | `/testimonials` | Customer reviews with photos |
| Products | `/shop` | Full product catalog (8 products, HE/EN, images) |
| Book | `/book` | Appointment booking (on hold for now) |
| Blog | `/blog` | Knowledge articles, beauty tips |
| Blog Post | `/blog/[slug]` | Individual blog post |
| Contact | `/contact` | Contact form, location, social links |
| Admin | `/admin` | Blog CMS admin panel (authenticated) |

## TECH STACK

### All Agents Use
- **Model**: `qwen3.6:27b-coding-nvfp4` (via Ollama)
- **Agent specs**: `.agents/` directory
- **Skill files**: `.skills/` directory

### Frontend
- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS + Framer Motion (animations)
- **Fonts**: Google Fonts (Phase 4: Frank Ruhl Libre + Heebo for Hebrew support)
- **Icons**: Lucide React
- **Images**: Next.js Image + local storage
- **i18n**: React Context + dictionary (Phase 4 — lightweight, no routing)

### Backend API
- **Runtime**: Express + TypeScript (separate from frontend)
- **Database**: PostgreSQL + Prisma ORM
- **Container**: `node:20-slim` (single-stage, OpenSSL)

### CMS
- **Approach**: Headless CMS (markdown files + admin UI)
- **Storage**: Markdown files in `public/content/posts/`
- **Admin**: Custom admin UI in Next.js (authenticated)
- **Blog posts**: Write in Hebrew. Admin CMS supports Hebrew content.

### Media Generation
- **Tool**: Draw Things (local AI image generation)
- **API**: `POST http://localhost:7860/sdapi/v1/txt2img`
- **Model**: Juggernaut XL Ragnarok (`juggernaut_xl_ragnarok_f16.ckpt`) ✅ Verified working
- **Sampler**: DPM++ 2M Karras
- **Settings**: `steps: 35`, `cfg_scale: 6.5`, `shift: 1`
- **Output**: JSON with base64-encoded images

### Payments (ON HOLD)
- Planned: Stripe
- Holds: product sales, subscriptions

### Booking (ON HOLD)
- Planned: Custom booking system (date picker + calendar)
- Holds: appointment scheduling, availability management

### Email
- Planned: Resend (or SMTP)
- Holds: newsletter + confirmation emails

## PROJECT STRUCTURE

```
projects/saritelkayam/
├── .agents/                          # Agent specifications (read-only context)
├── .skills/                          # Skill reference docs (read-only context)
├── .journal/                         # Agent work log
│    └── status.md                     # Living journal
├── MEMORY.md                         # This file
├── docker-compose.yml                # Docker orchestration
├── backend/
│    ├── Dockerfile                    # Single-stage node:20-slim + OpenSSL
│    ├── package.json
│    ├── prisma/
│    │    ├── schema.prisma            # Post, Author, PostAuthor tables + PostStatus enum
│    │    └── migrations/              # 0001_initial_schema (manual SQL)
│    ├── lib/db.ts                     # Prisma client singleton
│    ├── server.ts                     # Express server, CORS, routes
│    └── routes/                       # blog.ts, auth.ts
├── frontend/
│    ├── Dockerfile                    # Two-stage: build + serve
│    ├── package.json
│    ├── next.config.js
│    ├── tailwind.config.js
│    ├── tsconfig.json
│    ├── postcss.config.js
│    ├── nginx.conf                    # Nginx config (for CDN proxy setups)
│    ├── app/                          # Next.js App Router pages
│    ├── components/                   # UI, layout, sections, common
│    ├── lib/                          # blog.ts (markdown parsing), api.ts
│    ├── styles/globals.css            # Tailwind + custom animations
│    └── public/
│        ├── assets/                   # Generated images
│         └── content/posts/             # Blog markdown files (3 seed posts, Hebrew + English)
└── project-data/saritelkayam/db/     # Persistent PostgreSQL data (server only)
```

## DEPLOYMENT

### Status: ✅ Deployed and running on server (192.168.131.134)

### Ports
- **Frontend**: 3006 (`http://192.168.131.134:3006`)
- **Backend API**: 30061 (`http://192.168.131.134:30061`)

### Domain (TBD)
- `saritelkayam.com` — not yet configured. User will decide hosting (Cloudflare, direct DNS, or NPM).
- Test via direct IP: `http://192.168.131.134:3006`

### Containers
- `saritelkayam-frontend` — Next.js 15 on port 3006
- `saritelkayam-backend` — Express + Prisma on port 30061
- `saritelkayam-postgres` — PostgreSQL 16 on port 5432 (data persists in `project-data/`)

### Rebuild Workflow
1. Make changes in `projects/saritelkayam/`
2. `cd dev-env && git add -A && git commit -m "saritelkayam: [desc]" && git push origin main`
3. SSH to server: `cd /home/elkayam/dev-env && git pull && cd projects/saritelkayam && docker compose build frontend && docker compose up -d`

### Critical Deployment Notes
- **Backend Dockerfile**: Single-stage `node:20-slim` with OpenSSL. CMD runs `npx prisma generate` before starting server.
- **DB tables**: Created manually via `psql` (migrations were empty). Tables: Post, Author, PostAuthor + PostStatus enum.
- **Nested .git repos**: Always `rm -rf projects/saritelkayam/.git` before committing to dev-env
- **Container names**: Use `saritelkayam-*` prefix to avoid conflicts

## ENVIRONMENT VARIABLES

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (http://localhost:30061 in container)
- `NEXT_PUBLIC_SITE_URL` - Site URL (for SEO)

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Production/development

### Draw Things (local only, not on server)
- API URL: `http://127.0.0.1:7860/sdapi/v1/txt2img`
- No auth required (local access)

## FEATURES STATUS

| Feature | Status | Notes |
|---------|--------|-------|
| Agent/Skill files | ✅ Done | All specs created |
| Design system | ✅ Done | Tailwind, CSS, 6 UI, 3 layout, 2 common, root layout |
| Media assets | ✅ Done | 18 images generated via Draw Things |
| Docker/Deploy | ✅ Live | All 3 containers running on server |
| Home page | ✅ Done | Hero, services preview, testimonials, CTA |
| Services page | ✅ Done | Service catalog with pricing |
| Testimonials | ✅ Done | Customer reviews with photos |
| Shop/Products | ✅ Done — Live | Full catalog (8 products, HE/EN, images) + home page preview |
| Booking | ✅ Done | "Coming soon" placeholder page |
| Blog | ✅ Done | Listing, post viewer, markdown CMS, 3 seed posts |
| Contact | ✅ Done | Contact form, location, social |
| Admin CMS | ✅ Done | Auth, dashboard, post CRUD, markdown export |
| Database | ✅ Done | Post, Author, PostAuthor tables + PostStatus enum |
| Animations | ✅ Done | FadeInSection, StaggeredList, scroll animations on all pages |
| Mobile polish | ✅ Done | Responsive breakpoints on all components |
| i18n (HE/EN) | ✅ Done — Live | Hebrew default (RTL), English toggle. Frank Ruhl Libre + Heebo fonts. All ~100 UI strings translated across 15 files. Cookie-persisted locale. Dynamic dir/lang via useEffect. Nav includes all 6 links |
| i18n polish | ✅ Done — Live | Phase 5: All Hebrew translations polished to natural, fluent Hebrew. Name fixed to "שרית אלקיים". Korean char fixed. Blog posts translated to Hebrew. Dynamic dir/lang on toggle. See Phase 5 details below |
| Domain config | ⏳ Pending | User to decide hosting for saritelkayam.com |

## PHASE 4: Bilingual Hebrew/English (i18n) — P0

**Goal**: Site supports both Hebrew (default) and English with a language toggle in the header.

**Approach**: Lightweight React Context + dictionary object. No complex routing.
- Hebrew as default language (`dir="rtl"`)
- Small language switcher ("עברית | English" pill) in the header
- All UI text goes through `useTranslation()` hook
- `dir="rtl"` on `<html>` when Hebrew, `dir="ltr"` when English

**Font changes**:
- Playfair Display → **Frank Ruhl Libre** (serif, elegant, supports Hebrew + Latin)
- Inter → **Heebo** (sans-serif, clean, supports Hebrew + Latin)
- Both from Google Fonts, import via `next/font/google`

**RTL layout changes**:
- Tailwind logical properties: `ms-`/`me-` instead of `ml-`/`mr-`, `ps-`/`pe-` instead of `pl-`/`pr-`
- Flip animation directions (slide from right in RTL)
- Hero image: swap left/right column order in grid
- ChevronRight icons → flip direction in RTL

**Translation file**: `frontend/lib/i18n.tsx` (note: .tsx — contains JSX)
- `const he = { ... }` and `const en = { ... }` with all ~100 UI strings
- `LocaleProvider` context component in `frontend/components/layout/LocaleProvider.tsx`
- Cookie-based persistence so language choice survives page reloads
- `useTranslation()` hook returns the right dictionary
- Wrap `app/layout.tsx` children with `<LocaleProvider>`

**Files translated** (~100 strings total, one-time work):
1. `app/layout.tsx` — fonts, metadata, html lang/dir
2. `components/layout/Header.tsx` — nav links, brand, aria labels, language toggle
3. `components/layout/Footer.tsx` — brand, tagline, copyright
4. `components/sections/HeroSection.tsx` — headline, subheadline, CTAs
5. `components/sections/ServicesPreview.tsx` — title, subtitle, service data, buttons
6. `components/sections/TestimonialsSection.tsx` — title, subtitle, testimonial data
7. `components/sections/CTASection.tsx` — title, subtitle, button labels
8. `app/services/page.tsx` — page header, category data, buttons
9. `app/testimonials/page.tsx` — page header, testimonial data, rating labels
10. `app/contact/page.tsx` — form labels, contact info, hours, social labels
11. `app/blog/page.tsx` + `BlogListContent.tsx` — page header, labels, meta
12. `app/shop/page.tsx` — placeholder page text
13. `app/book/page.tsx` — placeholder page text, step labels
14. `app/not-found.tsx` + `app/NotFoundContent.tsx` — 404 page text, button labels
15. `components/common/FadeInSection.tsx` + `StaggeredList.tsx` — animation direction flip

**RTL layout changes implemented**:
- `dir="rtl"` on `<html>` when Hebrew, `dir="ltr"` when English
- Animation directions flipped (slide from right in RTL)
- Hero image: swap left/right column order in grid
- ChevronRight icons → flip direction in RTL
- ArrowLeft icons → flip direction in RTL (404 page, blog post)

**Build notes**:
- `frontend/lib/i18n.ts` → renamed to `frontend/lib/i18n.tsx` (contains JSX)
- All page components using `useTranslation()` need `"use client"` directive
- `app/not-found.tsx` is a server component (exports `metadata`), so client UI extracted to `app/NotFoundContent.tsx`

**Verify**: All 7 pages return 200 at `http://192.168.131.134:3006`
- Hebrew default: `lang="he" dir="rtl"` in HTML, all nav strings in Hebrew
- English toggle button in header switches to English/LTR

**Blog posts**: Markdown in `public/content/posts/` — ✅ translated to Hebrew (Phase 5).

**All Phase 4 translation issues resolved in Phase 5** ✅ — see Phase 5 section below.

**Deploy workflow**:
```bash
# Copy changed files
for f in lib/i18n.tsx components/layout/Header.tsx ...; do
  scp -i ~/.ssh/dev-env-server "/Users/elnaor/Environments/Zed/dev-env/projects/saritelkayam/frontend/$f" \
    "naor@192.168.131.134:/home/elkayam/dev-env/projects/saritelkayam/frontend/$f"
done
# Rebuild on server
ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env/projects/saritelkayam && docker compose build frontend && docker compose up -d frontend"
```

## TODO / NEXT STEPS

1. ✅ Phases 1-6 complete, deployed and running
2. ⬜ Configure external domain (saritelkayam.com) — user to decide hosting approach

## PHASE 6: Products Page (2026-05-22)

**Full product catalog on `/shop`:**
- 8 products across 4 categories: Cleansers, Serums, Moisturizers, Sun Protection
- Bilingual product data (Hebrew default / English toggle)
- Product cards with: image, category badge, size, name, description, price, star rating, wishlist button
- Category filter buttons (pill-style)
- CTA: "Ask About This Product" → `/contact`, bottom section with "Get Recommendations" / "Book Treatment"
- Uses 3 existing product images from `public/assets/products/`

**Products preview on home page:**
- New `ProductsPreview` component between Services and Testimonials
- Shows 3 featured products with link to full `/shop` page
- Bilingual: `productsTitle`, `productsSubtitle`, `productsViewAll`

**Also fixed:**
- Stale Korean chars + awkward translations in `ServicesPreview.tsx` (home page)
- i18n updated with new shop/product strings for both HE and EN

**Files modified:**
- `frontend/components/sections/ProductsPreview.tsx` (new)
- `frontend/app/page.tsx` — added ProductsPreview to home page
- `frontend/app/shop/page.tsx` — full rewrite (placeholder → product catalog)
- `frontend/components/sections/ServicesPreview.tsx` — fixed stale translations
- `frontend/components/layout/Header.tsx` — added shop link to nav (all 6 nav links)
- `frontend/lib/i18n.tsx` — updated shop + products strings

## PHASE 5: Polish Hebrew Translations (i18n) — Complete (2026-05-22)

**P0 — Polish all Hebrew translations:**
- Fixed name transliteration: "Sarit Elkayam" → "שרית אלקיים" (was "סריטל קיימ") — across all files
- Fixed Korean char "פילינג סיגני처" → "פילינג סיגניצ'ר"
- Fixed "עיטפי" → "גלי" (browse), "חוי" → "חופפי" (experience)
- Rewrote all service feature strings in `services/page.tsx` (categoriesHe) — natural Hebrew
- Rewrote all testimonial strings in `testimonials/page.tsx` (testimonialsHe) — natural Hebrew
- Polished all `i18n.tsx` Hebrew strings for natural, fluent Hebrew
- Updated `TestimonialsSection.tsx` (home page) to match fixed translations

**P1 — Translate blog posts:**
- Translated all 3 seed posts in `public/content/posts/` to Hebrew
- Added `lang: he` frontmatter to all blog posts

**P2 — Dynamic dir/lang:**
- Already implemented in Phase 4 (`useEffect` in LocaleProvider updates `document.documentElement.dir` and `lang`)

**Files modified:**
- `frontend/lib/i18n.tsx` — polished all Hebrew strings, fixed name
- `frontend/app/layout.tsx` — fixed metadata name
- `frontend/app/not-found.tsx` — fixed metadata name
- `frontend/components/layout/Header.tsx` — fixed aria-label name
- `frontend/components/sections/TestimonialsSection.tsx` — fixed Korean char, name, natural Hebrew
- `frontend/app/services/page.tsx` — rewrote all Hebrew service data
- `frontend/app/testimonials/page.tsx` — rewrote all Hebrew testimonial data
- `frontend/public/content/posts/understanding-skin-types.md` — translated to Hebrew
- `frontend/public/content/posts/summer-skincare-essentials.md` — translated to Hebrew
- `frontend/public/content/posts/natural-makeup-guide.md` — translated to Hebrew

**Verify**: All 7 pages return 200. Blog posts return 200. Zero Korean chars. "שרית אלקיים" visible on all pages.
