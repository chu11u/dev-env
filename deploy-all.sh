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

# Check if a directory is a deployable project (has docker-compose.yml)
is_project() {
    [ -f "$1/docker-compose.yml" ]
}

banner

# ── STEP 1: Safe Git Pull ──────────────────────────────────
log "${YELLOW}Step 1: Pulling latest code...${NC}"
cd "$BASE_DIR"

# Handle untracked files that would block git pull
# Only clean up directories inside projects/, never project-data or tracked files
if git status --porcelain | grep -q "^??"; then
    log "  Found untracked files in projects/ — cleaning up..."
    for item in $(git status --porcelain | grep "^??" | sed 's/^?? //' | grep "^projects\//"); do
        # Don't delete data directories
        if echo "$item" | grep -q "data/"; then
            log "    Skipping data file: $item"
            continue
        fi
        log "    Removing untracked: $item"
        rm -rf "$item"
    done
fi

git pull origin main 2>&1 || {
    log "${RED}Git pull failed! Aborting.${NC}"
    exit 1
}
log "${GREEN}   ✅ Code pulled${NC}"

# ── STEP 2: Protect Persistent Data ────────────────────────
log "${YELLOW}Step 2: Setting up persistent data directories...${NC}"

# Ensure project-data is at the right level (not inside projects/)
if [ -d "$PROJECTS_DIR/project-data" ]; then
    log "  ⚠️  Moving project-data outside projects/..."
    mv "$PROJECTS_DIR/project-data" "$DATA_DIR" 2>/dev/null || true
fi

# Arcade data migration (only if data doesn't exist in new location)
if [ ! -d "$DATA_DIR/arcade/data" ]; then
    mkdir -p "$DATA_DIR/arcade/data"
    if [ -f "$PROJECTS_DIR/arcade/backend/data/data.json" ]; then
        cp "$PROJECTS_DIR/arcade/backend/data/data.json" "$DATA_DIR/arcade/data/data.json"
        log "   📦 Migrated arcade data to persistent location"
    else
        log "   📦 Created arcade data directory"
    fi
else
    log "   ✅ Arcade data already persistent"
fi

# ── STEP 3: Apply Nginx Configs ────────────────────────────
log "${YELLOW}Step 3: Applying nginx configs...${NC}"

for dir in "$PROJECTS_DIR"/*/; do
    [ -d "$dir" ] || continue
    PROJECT_NAME=$(basename "$dir")

    # Only process actual projects (skip data dirs)
    is_project "$dir" || continue

    if [ -f "$dir/nginx-api.conf" ]; then
        cp "$dir/nginx-api.conf" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
        ln -sf "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf" "$NGINX_ENABLED/"
        log "   📝 Custom nginx config for $PROJECT_NAME"
    elif [ -f "$BASE_DIR/nginx-project-template.conf" ]; then
        PORT=$(grep -oP '"127\.0\.0\.1:\K\d+' "$dir/docker-compose.yml" 2>/dev/null | head -1 || echo "3000")
        cp "$BASE_DIR/nginx-project-template.conf" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
        sed -i "s/{{PROJECT_NAME}}/${PROJECT_NAME}/g; s/{{PROJECT_PORT}}/${PORT}/g" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
        ln -sf "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf" "$NGINX_ENABLED/"
        log "   📝 Nginx config for $PROJECT_NAME (port $PORT)"
    fi
done

nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || log "   ⚠️  Nginx reload failed"
log "${GREEN}   ✅ Nginx configs applied${NC}"

# ── STEP 4: Build & Deploy Each Project ────────────────────
log "${YELLOW}Step 4: Building and deploying projects...${NC}"
FOUND=0

for dir in "$PROJECTS_DIR"/*/; do
    [ -d "$dir" ] || continue
    PROJECT_NAME=$(basename "$dir")
    DOCKER_FILE="$dir/docker-compose.yml"

    # Only deploy actual projects
    is_project "$dir" || continue

    FOUND=$((FOUND + 1))
    log ""
    log "${CYAN}   ┌─ Deploying: $PROJECT_NAME${NC}"

    cd "$dir"

    # Count services
    SERVICE_COUNT=$(grep -c "container_name:" "$DOCKER_FILE" 2>/dev/null || echo "1")
    if [ "$SERVICE_COUNT" -gt 1 ]; then
        log "   │  Multi-service project ($SERVICE_COUNT services)"
    fi

    # Remove old images to avoid cache issues
    log "   │  Removing old images..."
    docker compose down 2>&1 | tail -1
    IMAGES=$(grep "container_name:" "$DOCKER_FILE" | sed 's/.*container_name: *//' | tr '\n' ' ')
    for img in $IMAGES; do
        docker image rm "$img" 2>/dev/null || true
    done

    # Build & start
    log "   │  Building & starting..."
    if docker compose up -d --build 2>&1 | tail -3; then
        log "   └─ ${GREEN}✅ $PROJECT_NAME is LIVE!${NC}"
    else
        log "   └─ ${RED}❌ Failed to deploy $PROJECT_NAME${NC}"
    fi
done

# ── Summary ────────────────────────────────────────────────
echo ""
if [ "$FOUND" -eq 0 ]; then
    log "${YELLOW}No projects to deploy${NC}"
else
    log "${GREEN}✅ Deployed $FOUND project(s)${NC}"
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      🎉  Deploy Complete!             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""
