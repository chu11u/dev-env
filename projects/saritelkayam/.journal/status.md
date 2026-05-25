# Sarit Elkayam - Agent Work Journal
# Auto-maintained by Agent. Read this on crash recovery.
# Last updated: 2026-05-25

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
