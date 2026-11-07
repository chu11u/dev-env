#!/usr/bin/env bash
# Restore saritelkayam after Cloudflare 1033 / origin unreachable on :3006.
# Run on Games: cd /home/elkayam/dev-env/projects/saritelkayam && ./recover.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE=(docker compose -p saritelkayam)

echo "==> Removing stale saritelkayam containers (if any)..."
for c in saritelkayam-frontend saritelkayam-backend saritelkayam-postgres; do
  docker rm -f "$c" 2>/dev/null || true
done

echo "==> Starting stack..."
"${COMPOSE[@]}" up -d --build

echo "==> Waiting for frontend on :3006..."
for _ in $(seq 1 40); do
  if curl -sf -o /dev/null --max-time 3 http://127.0.0.1:3006/; then
    echo "OK: http://127.0.0.1:3006/ responds"
    "${COMPOSE[@]}" ps
    exit 0
  fi
  sleep 5
done

echo "FAIL: frontend did not become healthy within timeout"
"${COMPOSE[@]}" ps
docker logs --tail 80 saritelkayam-frontend 2>&1 || true
exit 1
