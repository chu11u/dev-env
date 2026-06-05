# Sarit Elkayam Website — Low-Level Design Document

**Project**: `saritelkayam.com` — Professional cosmetician website  
**Stack**: Next.js 15 (frontend) + Express.js (backend) + PostgreSQL (database)  
**Deployment**: Docker Compose on homelab Games server  
**Last Updated**: 2026-06-01

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Directory Structure](#2-directory-structure)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Component Tree](#7-component-tree)
8. [Data Flow](#8-data-flow)
9. [Routing](#9-routing)
10. [Internationalization (i18n)](#10-internationalization-i18n)
11. [Authentication & Authorization](#11-authentication--authorization)
12. [Price Visibility System](#12-price-visibility-system)
13. [Deployment Pipeline](#13-deployment-pipeline)
14. [Docker Configuration](#14-docker-configuration)
15. [Environment Variables](#15-environment-variables)
16. [Integrations](#16-integrations)
17. [Known Issues & Edge Cases](#17-known-issues--edge-cases)

---

## 1. System Architecture

```
┌──────────────┐      ┌───────────────────┐      ┌──────────────┐
│   Browser    │ ───> │  nginx (reverse   │ ───> │  PostgreSQL  │
│ (Client-Side) │ <─── │  proxy on host)   │      │  (port 5432) │
└──────────────┘      └───────────────────┘      └──────────────┘
                              │
                              ▼
                     ┌───────────────────┐      ┌──────────────┐
                     │  Next.js 15 App   │ ───> │  Express.js  │
                     │  (port 3000)      │      │  Backend     │
                     │                   │ <─── │  (port 3001) │
                     │  /api/* → backend │      └──────────────┘
                     │  /uploads/* → bk  │             │
                     └───────────────────┘      ┌──────┴──────┐
                                                │  Prisma ORM │
                                                │ (PostgreSQL)│
                                                └─────────────┘
```

### Port Mapping (Host → Container)

| Host Port | Container Port | Service |
|-----------|---------------|---------|
| 3006      | 3000          | Frontend (Next.js) |
| 30061     | 3001          | Backend (Express) |

### Internal Docker Network

Containers communicate via Docker's internal network:
- Frontend → Backend: `http://backend:3001` (set via build args `BACKEND_HOST=backend`, `BACKEND_PORT=3001`)
- Backend → PostgreSQL: `postgres:5432` (set via `DATABASE_URL`)

---

## 2. Directory Structure

```
dev-env/
├── projects/saritelkayam/
│   ├── docker-compose.yml          # Multi-container orchestration
│   ├── MEMORY.md                   # Agent memory file
│   │
│   ├── frontend/
│   │   ├── Dockerfile              # Multi-stage Next.js build
│   │   ├── next.config.js          # API rewrites, images config
│   │   ├── tailwind.config.js      # Custom design tokens
│   │   ├── postcss.config.js
│   │   ├── tsconfig.json           # Path alias: @/*
│   │   ├── package.json
│   │   ├── nginx.conf              # (Unused — Next.js serves directly)
│   │   └── public/
│   │       ├── assets/
│   │       │   ├── hero/           # Hero section images
│   │       │   ├── services/       # Service card images
│   │       │   ├── products/       # Product card images
│   │       │   └── logo/           # logo.png, logo-dark.png
│   │       └── content/posts/      # Blog markdown files
│   │
│   ├── frontend/app/               # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (fonts, Header, Footer)
│   │   ├── page.tsx                # Homepage
│   │   ├── not-found.tsx
│   │   ├── services/page.tsx       # Services listing
│   │   ├── shop/page.tsx           # Shop / products listing
│   │   ├── book/page.tsx           # Booking (EasyBizy iframe)
│   │   ├── contact/page.tsx        # Contact form + info
│   │   ├── testimonials/page.tsx   # Testimonials list
│   │   ├── blog/page.tsx           # Blog listing (SSG)
│   │   ├── blog/[slug]/page.tsx    # Blog post (SSG)
│   │   └── admin/
│   │       ├── page.tsx            # Admin dashboard (login + dashboard)
│   │       ├── auth.tsx            # Auth context provider
│   │       ├── layout.tsx          # Admin layout (sidebar)
│   │       ├── blog/               # Blog CRUD (list + edit/new)
│   │       ├── testimonials/       # Testimonial CRUD
│   │       ├── products/           # Product CRUD
│   │       ├── services/           # Service CRUD
│   │       └── settings/           # Site settings + price toggles
│   │
│   ├── frontend/components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Sticky nav + mobile hamburger
│   │   │   ├── Footer.tsx          # Social links, copyright
│   │   │   ├── Logo.tsx            # Logo with text fallback
│   │   │   ├── Section.tsx         # Reusable section wrapper
│   │   │   └── LocaleProvider.tsx  # RTL direction provider
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ServicesPreview.tsx # Featured services (homepage)
│   │   │   ├── ProductsPreview.tsx # Featured products (homepage)
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── BlogPreview.tsx
│   │   │   └── CTASection.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   └── Container.tsx
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── ImageUpload.tsx
│   │   └── common/
│   │       ├── FadeInSection.tsx   # Scroll-triggered fade animation
│   │       └── SectionDivider.tsx
│   │
│   ├── frontend/lib/
│   │   ├── api.ts                  # Public API client + adapters
│   │   ├── admin-api.ts            # Admin API + TypeScript types
│   │   ├── blog.ts                 # Markdown blog content loader (server-side)
│   │   └── i18n.tsx                # Hebrew/English translations + locale provider
│   │
│   ├── frontend/styles/
│   │   └── globals.css             # Tailwind base + Quill editor styles
│   │
│   └── backend/
│       ├── Dockerfile              # Single-stage build with Prisma
│       ├── package.json
│       ├── tsconfig.json
│       ├── server.ts               # Express entry point
│       ├── seed.ts                 # Database seed data
│       ├── seed_blog.ts            # Blog seed data (generates markdown files)
│       ├── lib/
│       │   └── db.ts               # Prisma client singleton
│       ├── prisma/
│       │   └── schema.prisma       # Database schema
│       └── routes/
│           ├── auth.ts             # POST /api/auth/login
│           ├── services.ts         # Services CRUD
│           ├── products.ts         # Products CRUD
│           ├── testimonials.ts     # Testimonials CRUD
│           ├── settings.ts         # Site settings
│           ├── blog.ts             # Blog CRUD + markdown pipeline
│           └── upload.ts           # Image upload/download
```

---

## 3. Frontend Architecture

### 3.1 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 11.x | Animations |
| Lucide React | 0.460 | Icon set |
| React-Quill | 2.x | WYSIWYG editor (admin) |
| Turndown | 7.x | HTML→Markdown conversion (admin blog) |
| Marked | 15.x | Markdown→HTML rendering |

### 3.2 Routing (Next.js App Router)

| Route | Type | Page Component | Data Source |
|-------|------|---------------|-------------|
| `/` | Static | `app/page.tsx` | i18n translations |
| `/services` | Static | `app/services/page.tsx` | `fetchServices()` → API |
| `/shop` | Static | `app/shop/page.tsx` | `fetchProducts()` → API |
| `/book` | Static | `app/book/page.tsx` | EasyBizy iframe |
| `/contact` | Static | `app/contact/page.tsx` | `getPublicSettings()` → API |
| `/testimonials` | Static | `app/testimonials/page.tsx` | `fetchTestimonials()` → API |
| `/blog` | SSG | `app/blog/page.tsx` | `getAllBlogPosts()` → markdown files |
| `/blog/[slug]` | SSG | `app/blog/[slug]/page.tsx` | `getBlogPostBySlug()` → markdown |
| `/admin` | Dynamic | `app/admin/page.tsx` | Admin API calls |
| `/admin/settings` | Dynamic | `app/admin/settings/page.tsx` | `getSettings()` → API |
| `/admin/services` | Dynamic | `app/admin/services/` | Admin API CRUD |
| `/admin/products` | Dynamic | `app/admin/products/` | Admin API CRUD |
| `/admin/testimonials` | Dynamic | `app/admin/testimonials/` | Admin API CRUD |
| `/admin/blog` | Dynamic | `app/admin/blog/` | Admin API CRUD |

**Key**: `Static` = prerendered at build time, `SSG` = static with `generateStaticParams`, `Dynamic` = server-rendered on each request.

### 3.3 Design System (Tailwind)

**Custom Color Palette**:
- `rose` (50–900): Primary accent — buttons, highlights, links
- `cream` (50–900): Backgrounds, cards, borders
- `burgundy` (50–900): Deep accent, error states
- `charcoal` (50–900): Text, headings, dark UI
- `gold` (50–900): Star ratings

**Typography**:
- Headings: `Frank Ruhl Libre` (serif) via CSS variable `--font-frank-ruhl`
- Body: `Heebo` (sans-serif) via CSS variable `--font-heebo`

**Shadows**:
- `soft`: `0 1px 4px rgba(61, 43, 43, 0.06)`
- `soft-lg`: `0 4px 16px rgba(61, 43, 43, 0.08)`
- `lift`: `0 8px 24px rgba(61, 43, 43, 0.12)`

**Border Radius**:
- `xl`: 1rem, `2xl`: 1.5rem, `3xl`: 2rem

### 3.4 Component Hierarchy

```
RootLayout (app/layout.tsx)
├── LocaleWrapper (LocaleProvider)
│   ├── Header
│   │   ├── Logo (link to /)
│   │   ├── Desktop nav (ul)
│   │   ├── Language toggle button
│   │   └── Mobile hamburger menu (AnimatePresence)
│   ├── <main> {children}
│   │   ├── HomePage
│   │   │   ├── HeroSection
│   │   │   ├── FadeInSection
│   │   │   │   └── ServicesPreview
│   │   │   └── FadeInSection
│   │   │       └── ProductsPreview
│   │   │   └── TestimonialsSection
│   │   │   └── BlogPreview
│   │   │   └── CTASection
│   │   ├── ServicesPage
│   │   │   ├── Header section
│   │   │   └── Category sections (map)
│   │   │       └── ServiceCard (×N)
│   │   ├── ShopPage
│   │   │   ├── Header section
│   │   │   ├── Category filter bar
│   │   │   └── ProductCard grid (×N)
│   │   ├── BookPage (EasyBizy iframe)
│   │   ├── ContactPage (form + info)
│   │   ├── TestimonialsPage
│   │   ├── BlogPage (markdown SSG)
│   │   └── AdminLayout
│   │       ├── AdminSidebar
│   │       └── [CRUD pages]
│   └── Footer
│       ├── Logo (dark variant)
│       ├── Social links
│       └── Copyright
```

---

## 4. Backend Architecture

### 4.1 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Express.js | 4.21 | HTTP server framework |
| Prisma | 5.x | ORM + migrations |
| PostgreSQL | 16 | Relational database |
| Multer | 1.4.5 | File upload handling |
| TypeScript | 5.x | Type safety |
| ts-node | 10.x | TS execution in production |

### 4.2 Server Entry Point (`server.ts`)

```
Express App (port 3001)
├── CORS origins: localhost:3006, localhost:3000, *.elkayam.me, saritelkayam.com
├── JSON body parser
├── Static files: /uploads → /app/uploads
├── API routes (all under /api):
│   ├── /api/auth/login
│   ├── /api/blog/*               # Public + admin blog CRUD
│   ├── /api/services/*           # Public + admin services CRUD
│   ├── /api/products/*           # Public + admin products CRUD
│   ├── /api/testimonials/*       # Public + admin testimonials CRUD
│   ├── /api/settings/*           # Public + admin settings CRUD
│   └── /api/upload/*             # Image upload/delete
└── GET /health (health check)
```

### 4.3 Route Module Design Pattern

Every route module follows this pattern:

```typescript
import { Router, Request, Response } from "express";
import db from "../lib/db";

const router = Router();

// ─── Public Routes ───────────────────
router.get("/entity", async (_req, res) => { ... });
router.get("/entity/:id", async (req, res) => { ... });

// ─── Admin Routes ────────────────────
router.get("/admin/entity", async (_req, res) => { ... });
router.post("/admin/entity", async (req, res) => { ... });
router.put("/admin/entity/:id", async (req, res) => { ... });
router.delete("/admin/entity/:id", async (req, res) => { ... });

export default router;
```

Public and admin routes are mounted on the same Express `Router` but use different URL prefixes. This allows sharing the same route file while keeping public/admin API separation.

### 4.4 Error Handling Pattern

Every route handler uses try/catch with consistent error responses:
- Success: `res.json(data)` or `res.status(201).json(data)`
- Client error: `res.status(4xx).json({ error: "message" })`
- Server error: `res.status(500).json({ error: "Failed to ..." })`

No centralized error handler — each route handles its own errors.

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐
│   Post      │       │     Author       │
│─────────────│       │──────────────────│
│ id (PK)     │       │ id (PK)          │
│ title       │       │ name             │
│ slug (UQ)   │       │ email (UQ)       │
│ excerpt     │       │ avatar?          │
│ content     │       │ bio?             │
│ featuredImg?│       │ createdAt        │
│ status      │◄─────►│                  │
│ publishedAt?│       └──────────────────┘
│ createdAt   │
│ updatedAt   │
└─────────────┘

┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   Testimonial    │   │    Product       │   │    Service       │
│──────────────────│   │──────────────────│   │──────────────────│
│ id (PK)          │   │ id (PK)          │   │ id (PK)          │
│ nameEn           │   │ nameEn           │   │ category         │
│ nameHe           │   │ nameHe           │   │ titleEn          │
│ textEn           │   │ category         │   │ titleHe          │
│ textHe           │   │ descriptionEn    │   │ descriptionEn    │
│ serviceEn        │   │ descriptionHe    │   │ descriptionHe    │
│ serviceHe        │   │ price            │   │ duration         │
│ rating           │   │ size             │   │ price            │
│ avatar?          │   │ image?           │   │ image?           │
│ featured         │   │ badge?           │   │ featuresEn[]     │
│ sortOrder        │   │ rating           │   │ featuresHe[]     │
│ createdAt        │   │ featured         │   │ sortOrder        │
│ updatedAt        │   │ sortOrder        │   │ createdAt        │
└──────────────────┘   │ createdAt        │   │ updatedAt        │
                       │ updatedAt        │   └──────────────────┘
                       └──────────────────┘

┌──────────────────┐
│   SiteSetting    │
│──────────────────│
│ id (PK)          │
│ key (UQ)         │
│ valueEn          │
│ valueHe          │
│ category         │
│ updatedAt        │
└──────────────────┘
```

### 5.2 Detailed Schema

**Post** — Blog articles with bilingual content and publish workflow.
- `status`: enum `DRAFT | PUBLISHED`
- `slug`: unique URL-friendly identifier
- `content`: raw HTML stored as Text (entered via Quill editor in admin)
- `authors`: many-to-many relation via Prisma's implicit join table
- Indexes: `slug`, `status`, `publishedAt`

**Author** — Blog authors.
- `email`: unique identifier
- `posts`: many-to-many relation with Post

**Testimonial** — Client reviews with bilingual text.
- `featured`: Boolean for homepage spotlight
- `sortOrder`: manual ordering
- Index: `featured`

**Product** — Retail products available for purchase.
- `category`: free-text (Cleansers, Serums, Moisturizers, Sun Protection)
- `price`: stored as string (includes ₪ symbol, e.g. "₪38")
- `image`: URL path to uploaded file
- `featured`: Boolean for homepage display
- `badge`: optional label (e.g. "Best Seller", "Staff Pick")
- Indexes: `category`, `featured`

**Service** — Professional treatments offered.
- `category`: free-text (Facials, Skin Analysis, Body Treatments, Makeup)
- `featuresEn[]`, `featuresHe[]`: PostgreSQL text arrays for bullet points
- `duration`: human-readable string (e.g. "60 min")
- `price`: stored as string (includes ₪ symbol)
- Index: `category`

**SiteSetting** — Key-value configuration store.
- `key`: unique identifier (e.g. `email`, `pricesFacials`, `phone`)
- `valueEn`/`valueHe`: bilingual values
- `category`: grouping (General, Contact, Social, Hours, Display)
- Index: `category`

### 5.3 Seed Data

The `seed.ts` file populates:
- **8 products** across 4 categories (Cleansers, Serums, Moisturizers, Sun Protection)
- **16 services** across 4 categories (4 Facials, 2 Skin Analysis, 3 Body Treatments, 3 Makeup)

---

## 6. API Reference

### 6.1 Public API (no auth required)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/services` | All services sorted by sortOrder | `Service[]` |
| GET | `/api/services/category/:cat` | Services filtered by category | `Service[]` |
| GET | `/api/products` | All products sorted by sortOrder | `Product[]` |
| GET | `/api/products/featured` | Featured products only | `Product[]` |
| GET | `/api/products/category/:cat` | Products filtered by category | `Product[]` |
| GET | `/api/testimonials` | All testimonials | `Testimonial[]` |
| GET | `/api/testimonials/featured` | Featured testimonials only | `Testimonial[]` |
| GET | `/api/settings` | All site settings | `Setting[]` |
| GET | `/api/settings/:key` | Single setting by key | `Setting` |
| GET | `/api/blog/posts` | Published posts (with authors) | `Post[]` |
| GET | `/api/blog/posts/:slug` | Single post by slug | `Post` |

### 6.2 Admin API (no auth enforced server-side)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login (password check) |
| GET | `/api/admin/services` | All services |
| POST | `/api/admin/services` | Create service |
| PUT | `/api/admin/services/:id` | Update service |
| DELETE | `/api/admin/services/:id` | Delete service |
| GET | `/api/admin/products` | All products |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/testimonials` | All testimonials |
| POST | `/api/admin/testimonials` | Create testimonial |
| PUT | `/api/admin/testimonials/:id` | Update testimonial |
| DELETE | `/api/admin/testimonials/:id` | Delete testimonial |
| GET | `/api/admin/settings` | All settings |
| POST | `/api/admin/settings` | Create setting |
| PUT | `/api/admin/settings/:key` | Update setting |
| DELETE | `/api/admin/settings/:key` | Delete setting |
| GET | `/api/admin/blog/posts` | All posts (including drafts) |
| GET | `/api/admin/blog/posts/:id` | Single post by ID |
| POST | `/api/admin/blog/posts` | Create post |
| PUT | `/api/admin/blog/posts/:id` | Update post |
| DELETE | `/api/admin/blog/posts/:id` | Delete post |
| POST | `/api/upload/image` | Upload image (multipart) |
| DELETE | `/api/upload/image/:filename` | Delete uploaded image |

**Auth Note**: Admin routes do **not** require an auth header server-side. Authentication is enforced client-side only — the admin pages check `localStorage.getItem("admin_token") === "admin-authenticated"` and redirect to a login page if not set. The login POST verifies the password against `ADMIN_PASSWORD` env var and returns a static token `"admin-authenticated"`.

### 6.3 Data Types (TypeScript interfaces)

See `frontend/lib/admin-api.ts` for the full Admin API types and `frontend/lib/api.ts` for public API types.

Key interfaces:
- `Service`: id, category, titleEn/He, descriptionEn/He, duration, price, image, featuresEn/He[], sortOrder
- `Product`: id, nameEn/He, category, descriptionEn/He, price, size, image, badge, rating, featured, sortOrder
- `Testimonial`: id, nameEn/He, textEn/He, serviceEn/He, rating, avatar, featured, sortOrder
- `Setting`: id, key, valueEn, valueHe, category

---

## 7. Component Tree

### 7.1 State Management

The application does **not** use a global state library. State management is handled through:

| Mechanism | Where Used |
|-----------|-----------|
| `useState` | Client components: forms, toggles, UI state |
| `useEffect` | Data fetching on mount |
| `useMemo` | Derived data (filtered products, category grouping) |
| React Context | `AuthContext` (admin auth state), `LocaleContext` (language) |
| Props drilling | Parent→child data passing (e.g., `showPrice` prop) |

### 7.2 Data Fetching Pattern

All public client components follow this pattern:

```tsx
function Page() {
  const [data, setData] = useState<Type[]>(fallbackData);
  const [settings, setSettings] = useState<Setting[]>([]);

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(() => { /* keep fallback */ });
  }, [locale]);

  return (
    // Render using data + settings
    {data.map(item => (
      <Card showPrice={shouldShowPrice(settings, item.category)} />
    ))}
  );
}
```

**Key characteristics**:
- Always initializes with hardcoded fallback data
- Silently catches API errors (keeps fallback)
- Separates settings fetch from data fetch (parallel)
- Re-fetches when locale changes (for translations)

---

## 8. Data Flow

### 8.1 Page Load Flow

```
User visits /services

1. Request hits nginx (host port 3006)
2. nginx proxies to Next.js (container port 3000)
3. Next.js streams HTML with loading state
4. Client hydrates:
   a. ServicesPage component mounts
   b. Initial state: fallbackServices (3 hardcoded items)
   c. useEffect #1: fetch /api/settings (for price toggles)
   d. useEffect #2: fetch /api/services (for real data)
5. Settings API responds → setSettings([])
6. Services API responds → setServices(apiData)
7. Component re-renders with real data + price visibility applied
```

### 8.2 Frontend → Backend Communication

```
Browser → Next.js Server → Express Backend → PostgreSQL
          │                    │
          │ Next.js rewrite    │ Prisma ORM
          │ (beforeFiles)      │
          │                    │
          │ /api/services ──>  │ ──> SELECT * FROM services
          │ <── JSON ────────  │ <── ORDER BY sortOrder
```

The Next.js rewrite in `next.config.js` proxies all `/api/*` requests to the backend:

```javascript
// beforeFiles rewrite (runs before static file check)
source: "/api/:path*"
destination: `http://${BACKEND_HOST}:${BACKEND_PORT}/api/:path*`
```

Build args bake `BACKEND_HOST=backend` and `BACKEND_PORT=3001` into the Docker image.

### 8.3 Admin CRUD Flow

```
Admin logs in:
  POST /api/auth/login { password: "admin123" }
  ← { token: "admin-authenticated" }
  → stored in localStorage

Admin creates a service:
  Admin fills form → clicks Save
  POST /api/admin/services { body }
  ← { id, titleEn, ... }

Admin updates settings:
  Toggle click → togglePriceVisibility()
  → Optimistic update (immediate UI change)
  → PUT /api/admin/settings/:key { valueEn: "false" }
  ← If fails: revert to previous value
```

---

## 9. Routing

### 9.1 Frontend Route Details

#### Homepage (`/`)
- **Type**: Static (no data fetching at request time)
- **Sections**: Hero → ServicesPreview → ProductsPreview → TestimonialsSection → BlogPreview → CTASection
- **Data**: Fetches settings + services + products + testimonials client-side via useEffect

#### Services Page (`/services`)
- **Type**: Static
- **Pattern**: Category sections with service cards
- **Data**: `fetchServices()` → API → grouped by `api.category`
- **Fallback**: 4 categories (Facials, Skin Analysis, Body Treatments, Makeup) with 1 service each
- **Price toggle**: `shouldShowPrice(settings, category.rawName)` per category

#### Shop Page (`/shop`)
- **Type**: Static
- **Pattern**: Category filter bar + product card grid
- **Data**: `fetchProducts(false)` → API
- **Fallback**: 3 products (Gentle Gel Cleanser, Vitamin C Serum, Hydrating Day Cream)
- **Price toggle**: `shouldShowPrice(settings, product.category)` per product

#### Book Page (`/book`)
- **Type**: Static
- **Content**: Full-height iframe embedding EasyBizy scheduler
- **States**: Loading spinner → iframe ready → success
- **Timeout**: 10 seconds → shows fallback card with external link
- **CSP**: `sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"`

#### Contact Page (`/contact`)
- **Type**: Static
- **Features**:
  - Contact form (no backend — frontend-only, `handleSubmit` just sets `submitted=true`)
  - Dynamic contact info (email, phone, address, social links) from SiteSettings API
  - Operating hours (hardcoded in translation)
- **Settings fallback**: hardcoded defaults if API fails

#### Testimonials Page (`/testimonials`)
- **Type**: Static
- **Data**: `fetchTestimonials(false)` → API
- **Fallback**: 3 hardcoded testimonials

#### Blog List (`/blog`) — SSG
- **Type**: Static Site Generation at build time
- **Data**: `getAllBlogPosts()` reads markdown files from `public/content/posts/`
- **Markdown frontmatter**: title, slug, excerpt, featuredImage, status, authors, publishedAt
- **Empty state**: "No posts yet" message

#### Blog Post (`/blog/[slug]`) — SSG
- **Type**: Static Site Generation with `generateStaticParams`
- **Data**: `getBlogPostBySlug(slug)` parses markdown with YAML-like frontmatter
- **404**: If slug not found → `notFound()`
- **Metadata**: Dynamic OG tags from frontmatter

### 9.2 Admin Route Details

All admin pages use a shared layout with `AdminSidebar`. Auth is checked client-side via `AuthContext`:
- If `!isAuthenticated`: render `Login` component (password form)
- If `isAuthenticated`: render the page content with sidebar

### 9.3 Next.js Rewrite Rules

```javascript
async rewrites() {
  return {
    beforeFiles: [
      { source: "/api/:path*", destination: "http://backend:3001/api/:path*" },
      { source: "/uploads/:path*", destination: "http://backend:3001/uploads/:path*" },
    ],
  };
}
```

- Uses `beforeFiles` priority to ensure API requests are handled before static file matching
- Uploads are proxied to the backend's static file serving

---

## 10. Internationalization (i18n)

### 10.1 Architecture

```
LocaleContext (React Context)
├── locale: "he" | "en"        // Current language
├── t: Translations             // Dictionary for current locale
├── setLocale: (locale) => void // Toggle language
└── isRtl: boolean              // Direction (he=true, en=false)
```

### 10.2 Implementation

- Dictionaries defined as two large objects (`he`, `en`) in `lib/i18n.tsx`
- ~200+ translation keys covering all UI text
- Locale stored in cookie: `NEXT_LOCALE`, 365-day max age
- Initial locale detected from: cookie → browser `navigator.language`
- `isRtl` computed as `locale === "he"`
- HTML `dir` attribute set on `<html>` element, also provided via context

### 10.3 Translation Categories

| Category | Keys | Description |
|----------|------|-------------|
| Navigation | `navHome`, `navServices`, ... | Nav link labels |
| Hero | `heroTitle`, `heroSubtitle`, ... | Hero section |
| Services | `servicesTitle`, `servicesPageTitle`, ... | Service pages |
| Products/Shop | `shopTitle`, `productsTitle`, ... | Product pages |
| Testimonials | `testimonialsTitle`, `testimonialsSubtitle`, ... | Testimonial pages |
| Contact | `contactTitle`, `contactLocation`, ... | Contact page |
| Booking | `bookTitle`, `bookLoading`, ... | Booking page |
| Blog | `blogTitle`, `blogReadTime`, ... | Blog pages |
| Admin | `adminDashboard`, `adminSave`, `adminDelete`, ... | Admin panel |
| Common | `siteName`, `tagline`, `copyright`, ... | Shared UI |

### 10.4 Usage Pattern

```tsx
const { t, locale, setLocale, isRtl } = useTranslation();
// t.servicesTitle        → "הטיפולים שלנו" (he) / "Our Services" (en)
// locale                  → "he" | "en"
// isRtl                   → true | false
```

---

## 11. Authentication & Authorization

### 11.1 Implementation

**Simplified, client-only auth**:

1. User navigates to `/admin`
2. `AuthProvider` checks: `localStorage.getItem("admin_token") === "admin-authenticated"`
3. If not authenticated: shows login form
4. Login form: `POST /api/auth/login { password }`
5. Server checks: `password === process.env.ADMIN_PASSWORD`
6. If match: returns `{ token: "admin-authenticated" }`
7. Client stores token in `localStorage` and sets `isAuthenticated = true`
8. If no match: returns 401

**Important**: No server-side auth validation on admin API routes. All admin API endpoints are publicly accessible if the URL is known. This is a known security limitation.

### 11.2 Admin Password

- Set via environment variable `ADMIN_PASSWORD`
- Current value: `admin123` (from docker-compose.yml)
- **Should be changed for production**

---

## 12. Price Visibility System

### 12.1 Overview

Eight categories are togglable: Facials, Skin Analysis, Body Treatments, Makeup, Cleansers, Serums, Moisturizers, Sun Protection.

### 12.2 Architecture

```
SiteSetting table:
  key: "pricesFacials" | "pricesSkinAnalysis" | "pricesBodyTreatments" | "pricesMakeup"
     | "pricesCleansers" | "pricesSerums" | "pricesMoisturizers" | "pricesSunProtection"
  valueEn: "true" | "false"
  valueHe: "true" | "false"
  category: "Display"
```

### 12.3 Toggle Key Construction

```typescript
// In shouldShowPrice() and getCategoryPriceKey():
const toggleKey = `prices${category.replace(/\s+/g, "")}`;

// Examples:
// "Facials"         → "pricesFacials"         ✅
// "Skin Analysis"   → "pricesSkinAnalysis"   ✅ (space stripped)
// "Body Treatments" → "pricesBodyTreatments" ✅ (space stripped)
// "Sun Protection"  → "pricesSunProtection"  ✅ (space stripped)
```

### 12.4 Component Integration

Four components check price visibility:

| Component | Check | Location |
|-----------|-------|----------|
| `ServicesPreview` | `shouldShowPrice(settings, service.category)` | Homepage |
| `ProductsPreview` | `shouldShowPrice(settings, product.category)` | Homepage |
| `ServicesPage` | `shouldShowPrice(settings, category.rawName)` | /services |
| `ShopPage` | `shouldShowPrice(settings, product.category)` | /shop |

### 12.5 Auto-Seeding

When an admin visits `/admin/settings`, the settings page checks for missing toggle keys and creates them:

```typescript
useEffect(() => {
  if (settings.length === 0) return;
  const existingKeys = new Set(settings.map(s => s.key));
  const missing = PRICE_TOGGLE_CATEGORIES.filter(t => !existingKeys.has(t.key));
  if (missing.length === 0) return;

  // Create each missing toggle with valueEn: "true"
  Promise.all(missing.map(t => createSetting({ key: t.key, valueEn: "true", valueHe: "true", category: "Display" })))
}, [settings.length]);
```

### 12.6 Default Behavior

- If no setting exists for a category → prices are **shown** (`shouldShowPrice` returns `true`)
- If setting exists and `valueEn === "true"` → prices shown
- If setting exists and `valueEn === "false"` → prices hidden

---

## 13. Deployment Pipeline

### 13.1 Workflow

```
Developer commits & pushes → Server pulls & rebuilds → Restarts container

1. Local: git add -A && git commit && git push origin main
2. SSH: ./scripts/ssh.sh games
3. Server: sudo -u naor bash -c 'cd /home/elkayam/dev-env && git pull origin main'
4. Server: sudo docker compose -f projects/saritelkayam/docker-compose.yml build frontend
5. Server: sudo docker compose -f projects/saritelkayam/docker-compose.yml up -d frontend
```

### 13.2 Build Time

| Step | Duration |
|------|----------|
| npm install (builder) | ~3 min |
| npm install (production) | ~3 min |
| Next.js build | ~5–7 min |
| Docker image export | ~1 min |
| **Total** | **~12–14 min** |

### 13.3 SSH Connection

- **Key**: `~/.ssh/dev-env-server`
- **User**: `naor@192.168.131.134`
- **Off-LAN**: Uses Tailscale routing via OMV jump host (`100.70.29.65`)
- **Helper script**: `./scripts/ssh.sh games` (auto-detects network and routes appropriately)

### 13.4 Git Permission Issues

The `.git` directory on the server may have mixed ownership (root vs naor). Fix:

```bash
sudo -u naor bash -c 'cd /home/elkayam/dev-env && git pull origin main'
```

For more severe issues:
```bash
sudo -u naor bash -c 'cd /home/elkayam/dev-env && git stash && git reset --hard origin/main && git pull origin main'
```

### 13.5 Health Check

```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:3006/  # → 200
curl -s -o /dev/null -w '%{http_code}' http://localhost:3006/services  # → 200
curl -s -o /dev/null -w '%{http_code}' http://localhost:3006/shop  # → 200
curl -s http://localhost:30061/api/services | head -c 200  # → JSON array
```

---

## 14. Docker Configuration

### 14.1 Container Architecture

```
┌──────────────────────────────────────────┐
│  docker-compose.yml                      │
│                                          │
│  ┌──────────────┐  ┌──────────────┐      │
│  │  frontend    │  │  backend     │      │
│  │  port 3000   │  │  port 3001   │      │
│  │  Next.js 15  │  │  Express.js  │      │
│  │  node:20-    │  │  node:20-    │      │
│  │  alpine      │  │  slim        │      │
│  └──────┬───────┘  └──────┬───────┘      │
│         │                 │              │
│         │    ┌────────────┴───────┐      │
│         │    │  postgres          │      │
│         │    │  postgres:16-alpine│      │
│         │    │  port 5432         │      │
│         │    └────────────────────┘      │
│         │                                │
│         ▼                                │
│  Host:                                   │
│  3006 → frontend:3000                    │
│  30061 → backend:3001                    │
│  ./project-data/uploads → /app/uploads   │
│  ./project-data/db → /var/lib/postgresql │
└──────────────────────────────────────────┘
```

### 14.2 Frontend Dockerfile (Multi-stage)

- **Stage 1 (builder)**: `node:20-alpine`, installs deps, copies source, runs `npm run build`
- **Stage 2 (production)**: `node:20-alpine`, installs production deps only, copies `.next` and `public`
- Build-time ARGs: `BACKEND_HOST=backend`, `BACKEND_PORT=3001`, `NEXT_PUBLIC_SITE_URL=https://saritelkayam.com`
- ARGs are baked into ENV so the Next.js server knows where to proxy API requests

### 14.3 Backend Dockerfile (Single-stage)

- `node:20-slim` (needs OpenSSL for Prisma engine)
- Installs OpenSSL via apt
- `npm ci` (clean install for production)
- Generates Prisma client
- Compiles TypeScript
- Startup: generates Prisma client → runs migrations → starts server

### 14.4 Docker Volumes

| Volume Mount | Container Path | Purpose |
|-------------|---------------|---------|
| `../../project-data/saritelkayam/uploads` | `/app/uploads` | Uploaded images (persistent) |
| `../../project-data/saritelkayam/db` | `/var/lib/postgresql/data` | Database data (persistent) |

### 14.5 Dependency Order

```
postgres → backend → frontend
     │         │
     │    depends_on with healthcheck
     │    pg_isready -U saritelkayam
     │
     └── backend depends on postgres being healthy
         frontend depends on backend being started
```

---

## 15. Environment Variables

### 15.1 Frontend (build-time via Dockerfile ARG)

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_HOST` | `backend` | Internal Docker hostname |
| `BACKEND_PORT` | `3001` | Internal backend port |
| `NEXT_PUBLIC_SITE_URL` | `https://saritelkayam.com` | Public site URL |

### 15.2 Backend (runtime via docker-compose environment)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://saritelkayam:...@postgres:5432/saritelkayam` | PostgreSQL connection |
| `NODE_ENV` | `production` | Runtime environment |
| `ADMIN_PASSWORD` | `admin123` | Admin login password |

---

## 16. Integrations

### 16.1 EasyBizy Booking System

- **URL**: `https://schedule.easybizy.net/saritelkayam/welcome`
- **Integration method**: Full-width iframe with loading/error states
- **Iframe sandbox**: `allow-scripts allow-same-origin allow-forms allow-popups allow-modals`
- **Fallback**: 10-second timeout → CTA card with external link
- **Limitation**: EasyBizy may block iframe embedding via `X-Frame-Options`. The fallback handles this case.

### 16.2 Blog Content Pipeline

```
Admin creates/edits post via Quill WYSIWYG editor
  → POST/PUT /admin/blog/posts
  → Backend stores in PostgreSQL
  → Backend writes markdown file with frontmatter:
      frontend/public/content/posts/{slug}.md
  → Next.js SSG reads markdown at build time
  → generateStaticParams() creates static pages
```

**Note**: Blog posts created via the admin API are stored both in PostgreSQL (source of truth) and as markdown files in `frontend/public/content/posts/`. The markdown files are used for SSG at build time. This means new blog posts require a rebuild to appear on the site.

### 16.3 Image Upload

- **Upload endpoint**: `POST /api/upload/image` (multipart, 5MB limit, images only)
- **Storage**: `/app/uploads/` with timestamped filenames
- **Serving**: Express static middleware at `/uploads`
- **Unused tags**: `react-quill` is imported but may not be actively used

---

## 17. Known Issues & Edge Cases

### 17.1 Security

1. **No server-side auth on admin APIs**: Any endpoint under `/api/admin/*` is publicly accessible. Auth is client-only via localStorage check.
2. **Static admin token**: The login returns a hardcoded token `"admin-authenticated"` — no JWT, no session, no expiry.
3. **Admin password in docker-compose.yml**: Currently `admin123` stored in plaintext. Should use Docker secrets or a more secure mechanism.

### 17.2 Performance

1. **Build time**: ~12 minutes for a full frontend rebuild. The `npm install` and Next.js compilation are the bottlenecks.
2. **No CDN**: Static assets served directly from Next.js with `max-age=31536000, immutable` but no edge caching.
3. **Images unoptimized**: Next.js image optimization is disabled (`unoptimized: true`). Images are served as-is.
4. **Blog rebuild requirement**: New/edited blog posts require a full frontend rebuild to appear.

### 17.3 Data Integrity

1. **Contact form has no backend**: The contact form just sets `submitted=true` locally — messages are never sent.
2. **No input validation on admin API**: The backend accepts all fields as-is from request bodies.
3. **Price stored as string**: Includes the `₪` symbol (e.g., `"₪120"`), making numeric sorting/calculation impossible.
4. **Seed data doesn't include images for services**: Services have no image field in seed data; the frontend uses hardcoded image paths.

### 17.4 UI/UX

1. **Browser caching**: JS chunks have `max-age=31536000, immutable`. Users must hard-refresh (Cmd+Shift+R) after deployments.
2. **Price toggle default**: If settings fail to load, all prices are shown (safer than hiding).
3. **RTL/LTR transitions**: Language switch uses a simple cookie change with full page re-render. No smooth transition between directions.

### 17.5 Deployment

1. **Git permission issues**: The server's `.git` directory may have mixed ownership. Requires `sudo -u naor` for git operations.
2. **Docker cache**: Previous builds with `--no-cache` are necessary when package.json or prisma schema changes.
3. **No CI/CD**: Deployments are manual via SSH.

### 17.6 EasyBizy Integration

1. **Iframe blocking**: EasyBizy may not allow embedding if the server sends `X-Frame-Options: DENY` or restrictive CSP headers.
2. **Sandbox restrictions**: The `sandbox` attribute on the iframe may prevent some EasyBizy features from working.
