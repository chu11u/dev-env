#!/bin/bash
# ============================================================
# Deploy All Projects - One command, bulletproof
# Usage: ./deploy-all.sh
# Safe to run anytime. Handles untracked files, rebuilds images, preserves data.
# ============================================================

set -e

BASE_DIR="/home/elkayam/dev-env"
PROJECTS_DIR="$BASE_DIR/projects"
DATA_DIR="$BASE_DIR/project-data"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Track results for summary
declare -a SUMMARY_OK=()
declare -a SUMMARY_FAIL=()
declare -a SUMMARY_WARN=()

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

banner() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║      🚀  Deploying All Projects       ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
    echo ""
}

# Check if a directory is a deployable project
is_project() {
     [ -f "$1/docker-compose.yml" ]
}

# Get port from docker-compose.yml (first frontend service)
get_port() {
    grep -oP '"127\.0\.0\.1:\K\d+' "$1" 2>/dev/null | head -1 || echo "3000"
}

banner

# ── STEP 0: Move project-data out of projects/ if it's there ──
# This MUST happen before anything else to avoid treating it as a project
if [ -d "$PROJECTS_DIR/project-data" ]; then
    log "${YELLOW}Moving project-data outside projects/...${NC}"
    if [ -d "$DATA_DIR" ]; then
         # Merge, preferring existing data
        cp -r "$PROJECTS_DIR/project-data/"* "$DATA_DIR/" 2>/dev/null || true
        rm -rf "$PROJECTS_DIR/project-data"
        log "    ✅ Merged and removed duplicate project-data"
    else
        mv "$PROJECTS_DIR/project-data" "$DATA_DIR"
        log "    ✅ Moved project-data to correct location"
    fi
fi

# ── STEP 1: Safe Git Pull ──────────────────────────────────
log "${YELLOW}Step 1: Pulling latest code...${NC}"
cd "$BASE_DIR"

# Handle untracked files that would block git pull
if git status --porcelain | grep -q "^??"; then
    log "  Found untracked files — cleaning up..."
    for item in $(git status --porcelain | grep "^??" | sed 's/^?? //' | grep "^projects\//"); do
         # Never delete data files
        if echo "$item" | grep -q "data/"; then
            log "    ⏭️  Skipping data file: $item"
            continue
        fi
        log "    🗑️  Removing: $item"
        rm -rf "$item"
    done
fi

git pull origin main 2>&1 || {
    log "${RED}Git pull failed! Aborting.${NC}"
    SUMMARY_WARN+=("Git pull failed")
    exit 1
}
log "    ✅ Code pulled"
SUMMARY_OK+=("Git pull")

# ── STEP 2: Protect Persistent Data ────────────────────────
log "${YELLOW}Step 2: Setting up persistent data directories...${NC}"

if [ ! -d "$DATA_DIR/arcade/data" ]; then
    mkdir -p "$DATA_DIR/arcade/data"
    if [ -f "$PROJECTS_DIR/arcade/backend/data/data.json" ]; then
        cp "$PROJECTS_DIR/arcade/backend/data/data.json" "$DATA_DIR/arcade/data/data.json"
        log "    📦 Migrated arcade data to persistent location"
        SUMMARY_OK+=("Migrated arcade data")
    else
        log "    📦 Created arcade data directory"
        SUMMARY_OK+=("Created arcade data dir")
    fi
else
    log "    ✅ Arcade data already persistent"
    SUMMARY_OK+=("Arcade data persistent")
fi

# ── STEP 3: Apply Nginx Configs ────────────────────────────
log "${YELLOW}Step 3: Applying nginx configs...${NC}"

NGINX_APPLIED=0
for dir in "$PROJECTS_DIR"/*/; do
     [ -d "$dir" ] || continue
    PROJECT_NAME=$(basename "$dir")

     # Only process actual deployable projects
    is_project "$dir" || continue

    if [ -f "$dir/nginx-api.conf" ]; then
        cp "$dir/nginx-api.conf" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
        ln -sf "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf" "$NGINX_ENABLED/"
        log "    📝 Custom nginx config for $PROJECT_NAME"
    else
        PORT=$(get_port "$dir/docker-compose.yml")
        cp "$BASE_DIR/nginx-project-template.conf" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
        sed -i "s/{{PROJECT_NAME}}/${PROJECT_NAME}/g; s/{{PROJECT_PORT}}/${PORT}/g" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
        ln -sf "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf" "$NGINX_ENABLED/"
        log "    📝 Nginx config for $PROJECT_NAME (port $PORT)"
    fi
    NGINX_APPLIED=$((NGINX_APPLIED + 1))
done

# Clean up stale nginx configs for non-project directories
for link in "$NGINX_ENABLED"/*.apps.elkayam.me.conf; do
     [ -f "$link" ] || continue
    NAME=$(basename "$link" .apps.elkayam.me.conf)
     # Skip code-server (managed separately)
    [ "$NAME" = "dev" ] && continue
     # Remove if not a real project
    if [ -d "$PROJECTS_DIR/$NAME" ] && ! is_project "$PROJECTS_DIR/$NAME"; then
        rm -f "$link"
        rm -f "$NGINX_AVAILABLE/${NAME}.apps.elkayam.me.conf"
        log "    🧹 Removed stale config for $NAME"
    fi
done

nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || {
    log "    ⚠️  Nginx reload failed (configs still applied)"
    SUMMARY_WARN+=("Nginx reload failed")
}
log "    ✅ Nginx configs applied ($NGINX_APPLIED projects)"
SUMMARY_OK+=("Nginx configs ($NGINX_APPLIED)")

# ── STEP 4: Build & Deploy Each Project ────────────────────
log "${YELLOW}Step 4: Building and deploying projects...${NC}"
DEPLOYED=0

for dir in "$PROJECTS_DIR"/*/; do
     [ -d "$dir" ] || continue
    PROJECT_NAME=$(basename "$dir")

     # Only deploy actual projects
    is_project "$dir" || continue

    log ""
    log "${CYAN}    ┌─ Deploying: $PROJECT_NAME${NC}"
    cd "$dir"

     # Count services
    SERVICE_COUNT=$(grep -c "container_name:" "$dir/docker-compose.yml" 2>/dev/null || echo "1")
    if [ "$SERVICE_COUNT" -gt 1 ]; then
        log "    │  Multi-service project ($SERVICE_COUNT services)"
    fi

     # Remove old images to avoid cache issues
    log "    │  Removing old images..."
    docker compose down 2>&1 | tail -1
    IMAGES=$(grep "container_name:" "$dir/docker-compose.yml" | sed 's/.*container_name: *//' | tr '\n' ' ')
    for img in $IMAGES; do
        docker image rm "$img" 2>/dev/null || true
    done

     # Build & start
    log "    │  Building & starting..."
    if docker compose up -d --build 2>&1 | tail -3; then
        log "    └─ ${GREEN}✅ $PROJECT_NAME is LIVE!${NC}"
        SUMMARY_OK+=("Deployed $PROJECT_NAME")
        DEPLOYED=$((DEPLOYED + 1))
    else
        log "    └─ ${RED}❌ Failed to deploy $PROJECT_NAME${NC}"
        SUMMARY_FAIL+=("Failed to deploy $PROJECT_NAME")
    fi
done

# ── Summary ────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        📊  Deployment Summary         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

echo -e "  ${GREEN}✅ Successes:${NC}"
for item in "${SUMMARY_OK[@]}"; do
    echo "    • $item"
done

if [ ${#SUMMARY_FAIL[@]} -gt 0 ]; then
    echo ""
    echo -e "  ${RED}❌ Failures:${NC}"
    for item in "${SUMMARY_FAIL[@]}"; do
        echo "    • $item"
    done
fi

if [ ${#SUMMARY_WARN[@]} -gt 0 ]; then
    echo ""
    echo -e "  ${YELLOW}⚠️  Warnings:${NC}"
    for item in "${SUMMARY_WARN[@]}"; do
        echo "    • $item"
    done
fi

echo ""
echo "  Projects deployed: $DEPLOYED"
echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      🎉  Deploy Complete!            ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""
