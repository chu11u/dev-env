# Sarit Elkayam - Agent Work Journal
# Auto-maintained by Agent. Read this on crash recovery.
# Last updated: 2026-05-27

## Phase 8K: Embed EasyBizy Scheduler + Logo + Price Toggles (2026-05-26/27)

### Work done in this session:

**1. Fix contact page address — Docker cache issue (Phase 8J)**
- Root cause: stale Docker image despite correct source code
- Fixed: `docker compose build --no-cache` after pruning 30GB build cache
- Deployed via Tailscale SSH (not `~/.ssh/dev-env-server` which times out from remote)

**2. Embed EasyBizy scheduler in /book page**
- Replaced placeholder with iframe: `https://schedule.easybizy.net/saritelkayam/welcome`
- Loading spinner (10s timeout) + fallback link if iframe fails
- Updated translations: removed "coming soon", added bookBadge, bookLoading, bookErrorTitle, bookErrorMsg, bookOpenExternal

**3. Logo in header + footer**
- Created `components/layout/Logo.tsx` — renders logo image with graceful text fallback
- Supports `dark` prop for dark backgrounds (footer uses `dark`)
- Logo file: `public/assets/logo/logo.png`
- Updated Header.tsx and Footer.tsx to use `<Logo />` component
- Added `navBook` to header navigation links

**4. Per-category price visibility toggles**
- Admin → Settings: new "Display Settings" section with toggle cards
- 8 toggles: Facials, Skin Analysis, Body Treatments, Makeup, Cleansers, Serums, Moisturizers, Sun Protection
- Default: all prices visible (`valueEn="true"`)
- Auto-seeds missing toggles on first admin visit
- Affects: services page, services preview (home), products preview (home), shop page

### Files modified:
| File | Change |
|------|--------|
| `frontend/app/book/page.tsx` | EasyBizy iframe with loading/fallback |
| `frontend/lib/i18n.tsx` | Updated book translations |
| `frontend/components/layout/Header.tsx` | `<Logo />` component, added `navBook` link |
| `frontend/components/layout/Footer.tsx` | `<Logo dark />` component |
| `frontend/components/layout/Logo.tsx` (new) | Logo image + text fallback |
| `frontend/lib/admin-api.ts` | `PRICE_TOGGLE_CATEGORIES`, `shouldShowPrice()`, `getCategoryPriceKey()`, "Display" category |
| `frontend/app/admin/settings/page.tsx` | Toggle UI + auto-seed, filter Display from raw settings |
| `frontend/app/services/page.tsx` | Conditional price per category |
| `frontend/components/sections/ServicesPreview.tsx` | Conditional price per category |
| `frontend/components/sections/ProductsPreview.tsx` | Conditional price per category |
| `frontend/app/shop/page.tsx` | Conditional price per category |

### Deployed commits:
- `54889c1` — price visibility toggles + logo + scheduler (final)

### How to deploy (from remote, via Tailscale):
```bash
cd /Users/elnaor/Environments/Zed/HomeLab
./scripts/ssh.sh games "sudo -u naor bash -c 'cd /home/elkayam/dev-env && git fetch origin && git reset --hard origin/main && cd projects/saritelkayam && docker image rm -f saritelkayam-frontend:latest 2>/dev/null; docker compose up -d --force-recreate --build frontend'"
```
- SSH via `~/.ssh/dev-env-server` times out when NOT on local network
- Use `./scripts/ssh.sh games` which auto-detects Tailscale and routes through jump host
- `--build` forces rebuild even if `--no-cache` layer caching still hits
- Build takes ~6-8 minutes (Next.js full build)

### Current site status:
- All routes 200: `/`, `/services`, `/shop`, `/book`, `/contact`, `/testimonials`, `/blog`
- EasyBizy scheduler embedded in `/book`
- Logo showing in header + footer
- Price toggles available in admin `/admin/settings`
- Contact page shows dynamic address from DB
- Footer shows dynamic email/social from DB

---

## Phase 8I: Fix Blog Edit Crash + Settings Stale Data (2026-05-25)

### Issues fixed:

**1. Blog edit page crash (client-side exception)**
- Root cause: `use(useParams())` pattern not supported by Next.js 15.5.18 (TypeScript build error — `Params` not assignable to `Usable<unknown>`)
- Secondary cause: ReactQuill crashes on React 19 without error boundary — page would blow up
- Fix: Created `lib/hooks.ts` with `useParamId()` using plain `useParams()` + null guard
- All 4 `[id]` edit pages updated to use `useParamId()` with `if (!id) return` guard
- `WysiwygEditor` wrapped in `EditorErrorBoundary` — falls back to Markdown mode on crash
- `next.config.js` rewrites changed to `beforeFiles` (properly forwards PUT/POST/DELETE)
- `backend/routes/blog.ts` — added `GET /admin/blog/posts/:id` (single post endpoint)
- `frontend/lib/api.ts` — `getPost()` uses new single-post endpoint

**2. Settings changes not showing on public pages**
- Root cause: Contact page and Footer had HARDCODED email/phone/social — never read from API
- Fix: Both components now fetch from `getPublicSettings()` on mount
- Contact page: reads `email`, `phone`, `instagram`, `facebook` keys with locale-aware fallback (He → En → hardcoded)
- Footer: reads `email`, `instagram`, `facebook` keys
- Settings admin: now re-fetches from server after save/delete (no optimistic UI — prevents stale local state)
- Added console logging to settings save for debugging

**3. SSH deployment fix**
- Found correct SSH user is `naor` (not `elkayam`) — using `~/.ssh/dev-env-server` key

### Files modified:
| File | Change |
|------|--------|
| `frontend/lib/hooks.ts` (new) | `useParamId()` hook |
| `frontend/lib/api.ts` | `getPost()` uses single-post endpoint |
| `frontend/components/admin/WysiwygEditor.tsx` | Error boundary + fallback |
| `frontend/next.config.js` | `beforeFiles` rewrites |
| `frontend/app/admin/blog/[id]/page.tsx` | `useParamId` + null guard |
| `frontend/app/admin/products/[id]/page.tsx` | `useParamId` + null guard |
| `frontend/app/admin/testimonials/[id]/page.tsx` | `useParamId` + null guard |
| `frontend/app/admin/services/[id]/page.tsx` | `useParamId` + null guard |
| `frontend/app/admin/settings/page.tsx` | Re-fetch after save/delete + logging |
| `frontend/app/contact/page.tsx` | Dynamic settings API integration |
| `frontend/components/layout/Footer.tsx` | Dynamic settings API integration |
| `backend/routes/blog.ts` | `GET /admin/blog/posts/:id` endpoint |

### Deploy:
- Commit `50b3c9a` — first batch (error boundary, rewrites, settings wiring, single-post endpoint)
- Commit `a7a48b6` — second batch (settings wiring continued)
- Commit `7fe5d21` — fix useParams type error (revert `use()` pattern) + null guards
- Deployed via `deploy-all.sh` — all 4 projects deployed, saritelkayam ✅
- All routes returning 200, all containers healthy

---
