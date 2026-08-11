# Location Log (erez.elkayam.fun)

A mobile-first PWA for logging GPS locations with an optional description, viewing daily
reports, and generating multi-stop Google Maps routes. Deployed from the homelab Games
server and published at `erez.elkayam.fun` (and `erez.apps.elkayam.me` locally).

## Features

- **Log Location** — one tap captures your GPS position (high accuracy, with a graceful
  coarse-fix fallback), lets you add an optional description, and saves it to IndexedDB.
  Handles permission denials, timeouts, and insecure contexts with clear error messages.
- **Daily Report** — pick any date (chips + date picker) and see that day's locations as
  cards with time, description, coordinates, and an **Open Pin** link to Google Maps.
  **History is retained for the last 6 months** — older records are pruned automatically
  on load, and the date picker is limited to the retention window.
- **Multi-Stop Route** — one button builds a Google Maps directions link from the day's
  points (first = origin, last = destination, rest = waypoints). Days with more than 12
  points are downsampled evenly. Copy the link or open it directly in Google Maps.
- **PWA** — installable, works offline after the first visit, dark mode follows the system.

## Tech stack

React 19 · TypeScript (strict) · Vite 6 · Tailwind CSS v4 · IndexedDB (via `idb`) ·
vite-plugin-pwa (Workbox) · Vitest · Docker (multi-stage node build + nginx)

## Getting started

```sh
npm install
npm run dev
```

Open the printed localhost URL (geolocation works on `localhost` — it's a secure context).

## Scripts

| Command                  | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `npm run dev`            | Start the dev server                         |
| `npm test`               | Run the unit tests (route/downsample/dates/retention) |
| `npm run build`          | Type-check + production build to `dist/`     |
| `npm run preview`        | Serve the production build locally           |
| `npm run lint`           | ESLint                                       |
| `npm run generate-icons` | Regenerate PWA icons from `public/icon.svg`  |

## Deployment (homelab standard flow)

This project lives inside the `dev-env` repo, so publishing follows the same flow as the
other projects (`arcade`, `clock`, `dinnerplan`, `saritelkayam`):

```sh
cd /Users/elnaor/Environments/Zed/dev-env
git add projects/erez
git commit -m "erez: <what changed>"
git push origin main

cd /Users/elnaor/Environments/Zed/HomeLab
./scripts/ssh.sh games "cd /home/elkayam/dev-env && ./deploy-all.sh"
```

- `deploy-all.sh` git-pulls on the server, auto-generates the nginx config
  (`erez.apps.elkayam.me` + `erez.elkayam.fun` → port 3005) and builds the container
  (`container_name: erez`, static files served by nginx with PWA-friendly cache headers).
- The server's cron also runs `deploy-all.sh` every 5 minutes, so a git push alone
  eventually self-deploys.
- External access goes through the Cloudflare tunnel: `erez.elkayam.fun` must be routed
  in the tunnel ingress (Cloudflare Zero Trust → Tunnels → Configuration) to
  `http://localhost:80`, with the DNS CNAME record pointing at the tunnel.
- Data lives **only on the device** (IndexedDB) — no backend, nothing leaves the browser
  except the Google Maps links you open.

## Notes

- Route URL: `https://www.google.com/maps/dir/?api=1&origin=…&destination=…&waypoints=…`
  (Google's max is 10 waypoints / 12 points total; larger days are downsampled evenly while
  always keeping the first point as origin and the last as destination).
