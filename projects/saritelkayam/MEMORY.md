# Sarit Elkayam - Cosmetician Website
# Project Memory Dump
# Updated: May 20, 2026
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
- **Domain**: `saritelkayam.com` (external DNS, NOT via Cloudflare tunnel)
- **Local dev**: `saritelkayam.apps.elkayam.me`
- **External**: `saritelkayam.com` (direct DNS to server, or Cloudflare tunnel)

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
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, clean)

### Style
- Clean whitespace, soft rounded cards, subtle scroll animations
- Feminine without being cliché, warm without being overwhelming
- Think: high-end spa meets boutique salon

## SITE MAP

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero section, services preview, testimonials, CTA |
| Services | `/services` | Full service catalog with pricing and descriptions |
| Testimonials | `/testimonials` | Customer reviews with photos |
| Products | `/shop` | Product catalog (e-commerce, Stripe - on hold) |
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
- **Fonts**: Google Fonts (Playfair Display + Inter)
- **Icons**: Lucide React
- **Images**: Next.js Image + local storage
- **Why**: Best DX, static export support, SEO-first, easy port to Vercel/any host

### Backend API
- **Runtime**: Next.js API routes (same monorepo as frontend)
- **Database**: PostgreSQL + Prisma ORM
- **Why**: One codebase, zero config complexity, exports cleanly

### CMS
- **Approach**: Headless CMS (markdown files + admin UI)
- **Storage**: Markdown files in `content/` directory
- **Admin**: Custom admin UI in Next.js (authenticated)
- **Why**: Simple, fast, portable - just push markdown files

### Media Generation
- **Tool**: Draw Things (local AI image generation)
- **API**: `POST http://localhost:7860/sdapi/v1/txt2img`
- **Model**: Juggernaut XL Ragnarok (`juggernaut_xl_ragnarok_f16.ckpt`) ✅ Verified working
- **Sampler**: DPM++ 2M Karras
- **Settings**: `steps: 35`, `cfg_scale: 6.5`, `shift: 1`
- **Output**: JSON with base64-encoded images
- **Why Juggernaut XL**: Best photorealism for beauty/cosmetician imagery. Superior product photography, natural warm luxury aesthetic. Speed doesn't matter since we generate assets once.
- **Usage**: Hero images, product photos, decorative elements, blog banners
- **Curl command**:
    ```bash
  curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
      -H "Content-Type: application/json" \
      -d '{"prompt":"YOUR_PROMPT", "negative_prompt":"blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed", "steps": 35, "width": 1024, "height": 1024, "cfg_scale": 6.5}' \
      | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('output.png','wb').write(base64.b64decode(data['images'][0]))"
    ```

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
├── .agents/                        # Agent specifications (read-only context)
│   ├── README.md                   # Agent system overview
│   ├── infrastructure.md           # Docker, nginx, deploy agent
│   ├── design-system.md            # Tailwind, UI components agent
│   ├── frontend.md                 # Pages, sections agent
│   ├── fullstack.md                # Prisma, API, CMS agent
│   └── media.md                    # Image generation agent
├── .skills/                        # Skill reference docs (read-only context)
│   ├── nextjs-app-router.md        # Next.js 15 patterns
│   ├── tailwind-css.md             # Tailwind config, tokens
│   ├── framer-motion.md            # Animation patterns
│   ├── prisma-orm.md               # Schema, queries, migrations
│   ├── docker-deploy.md            # Containerization, nginx
│   └── draw-things-api.md          # Image generation workflow
├── MEMORY.md                       # This file
├── docker-compose.yml              # (Phase 1 - Infrastructure agent)
├── Dockerfile                      # (Phase 1 - Infrastructure agent)
├── backend/
│   ├── Dockerfile                  # (Phase 1 - Infrastructure agent)
│   ├── package.json                # (Phase 2 - Fullstack agent)
│   ├── prisma/
│   │   ├── schema.prisma           # (Phase 2 - Fullstack agent)
│   │   └── migrations/             # (Phase 2 - Fullstack agent)
│   ├── lib/
│   │   └── db.ts                   # (Phase 2 - Fullstack agent)
│   ├── server.ts                   # (Phase 2 - Fullstack agent)
│   └── routes/                     # (Phase 2 - Fullstack agent)
├── frontend/
│   ├── Dockerfile                  # (Phase 1 - Infrastructure agent)
│   ├── package.json                # (Phase 1 - Design System agent)
│   ├── next.config.js              # (Phase 1 - Design System agent)
│   ├── tailwind.config.js          # (Phase 1 - Design System agent)
│   ├── tsconfig.json               # (Phase 1 - Design System agent)
│   ├── postcss.config.js           # (Phase 1 - Design System agent)
│   ├── app/
│   │   ├── layout.tsx              # (Phase 1 - Design System agent)
│   │   ├── page.tsx                # (Phase 2 - Frontend agent)
│   │   ├── not-found.tsx           # (Phase 2 - Frontend agent)
│   │   ├── manifest.ts             # (Phase 2 - Frontend agent)
│   │   ├── sitemap.ts              # (Phase 2 - Frontend agent)
│   │   ├── robots.ts               # (Phase 2 - Frontend agent)
│   │   ├── services/               # (Phase 2 - Frontend agent)
│   │   ├── testimonials/           # (Phase 2 - Frontend agent)
│   │   ├── shop/                   # (Phase 2 - Frontend agent)
│   │   ├── blog/                   # (Phase 2 - Frontend agent)
│   │   ├── book/                   # (Phase 2 - Frontend agent)
│   │   ├── contact/                # (Phase 2 - Frontend agent)
│   │   └── admin/                  # (Phase 2 - Fullstack agent)
│   ├── components/
│   │   ├── ui/                     # (Phase 1 - Design System agent)
│   │   ├── layout/                 # (Phase 1 - Design System agent)
│   │   ├── sections/               # (Phase 2 - Frontend agent)
│   │   └── common/                 # (Phase 1 - Design System agent)
│   ├── lib/                        # (Phase 2 - Frontend agent)
│   ├── styles/
│   │   └── globals.css             # (Phase 1 - Design System agent)
│   └── public/
│       ├── assets/                 # (Phase 1 - Media agent)
│       └── content/                # (Phase 2 - Fullstack agent)
├── project-data/                   # Persistent data (outside git)
│   └── saritelkayam/
│       └── db/                     # PostgreSQL data
└── README.md
```

## DEPLOYMENT

### Ports
- **Frontend**: 3006
- **Backend API**: 30061

### Local Access
- `saritelkayam.apps.elkayam.me` → nginx:80 → containers
- Via Technitium DNS (*.apps.elkayam.me → 192.168.131.134)

### External Access
- `saritelkayam.com` → Cloudflare DNS → Cloudflare tunnel → nginx:80 → containers
- Need to add Cloudflare tunnel ingress rule for `saritelkayam.com`
- OR direct DNS A record pointing to server's public IP

### Docker Compose Pattern
```yaml
services:
  frontend:
    build: ./frontend
    container_name: saritelkayam-frontend
    ports: ["3006:3000"]
    restart: unless-stopped
    depends_on: [backend]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:30061
      - NEXT_PUBLIC_SITE_URL=https://saritelkayam.com
  backend:
    build: ./backend
    container_name: saritelkayam-backend
    ports: ["30061:3001"]
    restart: unless-stopped
    depends_on:
      postgres: { condition: service_healthy }
    environment:
      - DATABASE_URL=postgresql://saritelkayam:saritelkayam_password@postgres:5432/saritelkayam
      - NODE_ENV=production
  postgres:
    image: postgres:16-alpine
    container_name: saritelkayam-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: saritelkayam
      POSTGRES_USER: saritelkayam
      POSTGRES_PASSWORD: saritelkayam_password
    volumes: ["../../project-data/saritelkayam/db:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U saritelkayam"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### Deploy Workflow
1. Create files in `projects/saritelkayam/`
2. `cd dev-env && git add -A && git commit -m "saritelkayam: [update]" && git push origin main`
3. SSH to server: `ssh -i ~/.ssh/dev-env-server naor@192.168.131.134 "cd /home/elkayam/dev-env && ./deploy-all.sh"`
4. Add Cloudflare tunnel ingress rule for `saritelkayam.com` in Zero Trust dashboard

### Critical Deployment Notes
- **Nested .git repos**: Always `rm -rf projects/saritelkayam/.git` before committing to dev-env
- **Nginx proxy_pass**: MUST NOT have trailing slash (preserves /api/ prefix)
- **Data persistence**: Use `../../project-data/saritelkayam/db:/var/lib/postgresql/data` in docker-compose
- **Container names**: Use `saritelkayam-*` prefix to avoid conflicts

## MULTI-AGENT SYSTEM

### Agents (all use `qwen3.6:27b-coding-nvfp4`)

| Agent | Spec | Skills | Phase |
|-------|------|--------|-------|
| Infrastructure | `.agents/infrastructure.md` | `docker-deploy` | 1, 3 |
| Design System | `.agents/design-system.md` | `tailwind-css`, `framer-motion` | 1 |
| Media | `.agents/media.md` | `draw-things-api` | 1 |
| Frontend | `.agents/frontend.md` | `nextjs-app-router`, `tailwind-css`, `framer-motion` | 2, 3 |
| Fullstack | `.agents/fullstack.md` | `nextjs-app-router`, `prisma-orm` | 2 |
| Journal | `.agents/journal.md` | — | Continuous |

### Journal Agent
The Journal agent maintains `.journal/status.md` — a living log of every agent's progress.
It records: task start/completion, files created, blockers, and handoff notes.
All agents should log their work to this file. On crash recovery, read `.journal/status.md` to resume.

### Execution Order

```
Phase 1 (parallel, 3 agents):
  Infrastructure: docker-compose, Dockerfiles, nginx config
  Design System: Tailwind config, UI components, layout components
  Media: Generate all image assets via Draw Things API

Phase 2 (parallel, 2 agents, after Phase 1 completes):
  Frontend: All page components, sections, routing, SEO
  Fullstack: Prisma schema, API routes, blog CMS admin

Phase 3 (sequential):
  Frontend: Framer Motion animations, mobile polish
  Infrastructure: Final deployment, Cloudflare tunnel config
```

### How to Activate (from a new thread)

```
Read MEMORY.md for context
Read .agents/[agent-name].md for scope and tasks
Read .skills/[relevant-skills].md for reference patterns
Execute task queue in order
Update FEATURES STATUS table when done
```

## ENVIRONMENT VARIABLES

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SITE_URL` - Site URL (for SEO)

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Production/development

### Draw Things (local only, not on server)
- API URL: `http://127.0.0.1:7860/sdapi/v1/txt2img`
- No auth required (local access)

## FEATURES STATUS

| Feature | Status | Agent | Notes |
|---------|--------|-------|-------|
| Agent/Skill files | ✅ Done | Planning | All specs created |
| Design system | ✅ Done | Design System | All 12 files: Tailwind, CSS, 6 UI, 3 layout, 2 common, root layout |
| Media assets | ✅ Done | Media | 18 images: 2 hero, 4 service, 3 decorative, 3 testimonial, 3 blog, 3 product |
| Docker/Deploy | ✅ Done | Infrastructure | docker-compose, Dockerfiles, nginx config all created |
| Home page | ✅ Done | Frontend | Hero, services preview, testimonials, CTA |
| Services page | ✅ Done | Frontend | Service catalog with pricing |
| Testimonials | ✅ Done | Frontend | Customer reviews with photos (placeholder avatars) |
| Shop/Products | ✅ Done | Frontend | "Coming soon" placeholder page |
| Booking | ✅ Done | Frontend | "Coming soon" placeholder page |
| Blog | ✅ Done | Frontend + Fullstack | Listing, post viewer, markdown CMS, 3 seed posts |
| Contact | ✅ Done | Frontend | Contact form, location, social |
| Admin CMS | ✅ Done | Fullstack | Auth, dashboard, post CRUD, markdown export |
| Database | ✅ Done | Fullstack | Prisma schema (Post, Author), migrations |
| Animations | ✅ Done | Frontend | FadeInSection, StaggeredList, scroll animations on all pages |
| Mobile polish | ✅ Done | Frontend | Responsive breakpoints on all components |
| Deploy | ⏳ Ready | Infrastructure | Files created. Run docker-compose + nginx enable. |

## TODO / NEXT STEPS

1. ✅ Create project folder and memory dump
2. ✅ Create agent specifications (`.agents/`)
3. ✅ Create skill reference docs (`.skills/`)
4. ✅ **Phase 1**: Run all 3 agents (Infrastructure ✅, Design System ✅, Media ✅ 18 images generated)
5. ✅ **Phase 2**: Run Frontend + Fullstack agents (both complete)
6. ✅ **Phase 3**: Animations, mobile polish (both complete)
7. ✅ Generate media assets (18 images generated via Draw Things)
8. ⬜ Configure external domain (saritelkayam.com)
9. ⬜ Deploy to server + configure Cloudflare tunnel
