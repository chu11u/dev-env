#!/bin/bash
# ============================================================
# Deploy All Projects - One command, bulletproof
# Usage: ./deploy-all.sh
# ============================================================

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

declare -a SUMMARY_OK=()
declare -a SUMMARY_FAIL=()
declare -a SUMMARY_WARN=()

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }
is_project() { [ -f "$1/docker-compose.yml" ]; }
get_port() { grep -oP '"127\.0\.0\.1:\K\d+' "$1" 2>/dev/null | head -1 || echo "3000"; }

generate_nginx_config() {
    local name="$1"
    local port="$2"
    local dest="$NGINX_AVAILABLE/${name}.apps.elkayam.me.conf"
    cat > "$dest" << NGINX_EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${name}.apps.elkayam.me ${name}.elkayam.fun;

    access_log /var/log/nginx/${name}.access.log;
    error_log /var/log/nginx/${name}.error.log;

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
      }
}
NGINX_EOF
    ln -sf "$dest" "$NGINX_ENABLED/"
}

generate_nginx_api_config() {
    local name="$1"
    local frontend_port="$2"
    local api_port="$3"
    local dest="$NGINX_AVAILABLE/${name}.apps.elkayam.me.conf"
    cat > "$dest" << NGINX_EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${name}.apps.elkayam.me ${name}.elkayam.fun;

    access_log /var/log/nginx/${name}.access.log;
    error_log /var/log/nginx/${name}.error.log;

    location /api/ {
        proxy_pass http://127.0.0.1:${api_port};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
       }

    location / {
        proxy_pass http://127.0.0.1:${frontend_port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
      }
}
NGINX_EOF
    ln -sf "$dest" "$NGINX_ENABLED/"
}

# Force remove a project's containers, networks, and images
cleanup_project() {
    local project_dir="$1"
    local project_name="$2"

     # Get container names from compose file
    local containers
    containers=$(grep "container_name:" "$project_dir/docker-compose.yml" 2>/dev/null | sed 's/.*container_name: *//' | tr '\n' ' ')

     # Force stop each container
    for container in $containers; do
        docker stop "$container" 2>/dev/null || true
        docker rm -f "$container" 2>/dev/null || true
    done

     # Remove compose project networks
    docker compose -f "$project_dir/docker-compose.yml" down 2>/dev/null || true

     # Remove project-specific networks by name pattern
    docker network ls --format '{{.Name}}' | grep "default" | while read -r net; do
        docker network ls --format '{{.Name}} {{.Driver}}' | grep "$project_name" | while read -r _ _; do
            docker network rm "$net" 2>/dev/null || true
        done
    done || true

     # Remove images
    for container in $containers; do
        docker image rm "$container" 2>/dev/null || true
    done
}

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           🚀  Deploying All Projects              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── STEP 0: Move project-data if misplaced ──
if [ -d "$PROJECTS_DIR/project-data" ]; then
    log "${YELLOW}Step 0: Moving project-data outside projects/...${NC}"
    if [ -d "$DATA_DIR" ]; then
        cp -r "$PROJECTS_DIR/project-data/"* "$DATA_DIR/" 2>/dev/null || true
        rm -rf "$PROJECTS_DIR/project-data"
    else
        mv "$PROJECTS_DIR/project-data" "$DATA_DIR"
    fi
    log "      ✅ project-data fixed"
fi

# ── STEP 0.5: Migrate data BEFORE git pull (critical!) ──
if [ ! -d "$DATA_DIR/arcade/data" ]; then
    mkdir -p "$DATA_DIR/arcade/data"
    if [ -f "$PROJECTS_DIR/arcade/backend/data/data.json" ]; then
        cp "$PROJECTS_DIR/arcade/backend/data/data.json" "$DATA_DIR/arcade/data/data.json"
        log "      📦 Migrated arcade data to persistent location"
        SUMMARY_OK+=("Migrated arcade data")
    else
        log "      📦 Created arcade data directory"
        SUMMARY_OK+=("Created arcade data dir")
    fi
else
    log "       ✅ Arcade data already persistent"
    SUMMARY_OK+=("Arcade data persistent")
fi

# ── STEP 0.6: Migrate dinnerplan data BEFORE git pull ──
if [ ! -d "$DATA_DIR/dinnerplan/data" ]; then
    mkdir -p "$DATA_DIR/dinnerplan/data"
    log "       📦 Created dinnerplan data directory"
    SUMMARY_OK+=("Created dinnerplan data dir")
else
    log "       ✅ Dinnerplan data already persistent"
    SUMMARY_OK+=("Dinnerplan data persistent")
fi

# ── STEP 1: Safe Git Pull (with self-update) ──
log "${YELLOW}Step 1: Pulling latest code...${NC}"
cd "$BASE_DIR"

# Clean untracked files first (before checking hash)
if git status --porcelain | grep -q "^??"; then
    log "  Cleaning untracked files..."
    for item in $(git status --porcelain | grep "^??" | sed 's/^?? //' | grep "^projects\//"); do
        echo "$item" | grep -q "data/" && continue
        rm -rf "$item"
    done
fi

BEFORE_HASH=$(md5sum "$BASE_DIR/deploy-all.sh" 2>/dev/null | cut -d' ' -f1)
git pull origin main 2>&1 || {
    log "${RED}      ❌ Git pull failed! Aborting.${NC}"
    SUMMARY_FAIL+=("Git pull failed"); exit 1
}
AFTER_HASH=$(md5sum "$BASE_DIR/deploy-all.sh" 2>/dev/null | cut -d' ' -f1)

if [ "$BEFORE_HASH" != "$AFTER_HASH" ]; then
    log "      🔄 Deploy script updated — re-running with new version..."
    exec "$0" "$@"
fi

log "      ✅ Code pulled"
SUMMARY_OK+=("Git pull")

# ── STEP 2: Generate & Apply Nginx Configs ──
log "${YELLOW}Step 2: Generating nginx configs...${NC}"

NGINX_APPLIED=0
for dir in "$PROJECTS_DIR"/*/; do
     [ -d "$dir" ] || continue
    PROJECT_NAME=$(basename "$dir")
    is_project "$dir" || continue

    COMPOSE="$dir/docker-compose.yml"
    SERVICE_COUNT=$(grep -c "container_name:" "$COMPOSE" 2>/dev/null || echo "1")

    if [ "$SERVICE_COUNT" -gt 1 ]; then
        FRONTEND_PORT=$(grep -oP '"127\.0\.0\.1:\K\d+' "$COMPOSE" 2>/dev/null | head -1)
        BACKEND_PORT=$(grep -oP '"127\.0\.0\.1:\K\d+' "$COMPOSE" 2>/dev/null | tail -1)
         [ -z "$FRONTEND_PORT" ] && FRONTEND_PORT=3000
         [ -z "$BACKEND_PORT" ] && BACKEND_PORT=3001
        generate_nginx_api_config "$PROJECT_NAME" "$FRONTEND_PORT" "$BACKEND_PORT"
        log "      📝 Nginx for $PROJECT_NAME (frontend:$FRONTEND_PORT, api:$BACKEND_PORT)"
    else
        PORT=$(get_port "$COMPOSE")
        generate_nginx_config "$PROJECT_NAME" "$PORT"
        log "      📝 Nginx for $PROJECT_NAME (port $PORT)"
    fi
    NGINX_APPLIED=$((NGINX_APPLIED + 1))
done

# Remove stale configs
VALID_PROJECTS="dev"
for dir in "$PROJECTS_DIR"/*/; do
     [ -d "$dir" ] || continue
    is_project "$dir" && VALID_PROJECTS="$VALID_PROJECTS $(basename "$dir")"
done

for link in "$NGINX_ENABLED"/*.apps.elkayam.me.conf; do
     [ -f "$link" ] || continue
    NAME=$(basename "$link" .apps.elkayam.me.conf)
    if ! echo "$VALID_PROJECTS" | grep -qw "$NAME"; then
        rm -f "$link"
        rm -f "$NGINX_AVAILABLE/${NAME}.apps.elkayam.me.conf"
        log "      🧹 Removed stale config: $NAME"
    fi
done

sudo /usr/sbin/nginx -t 2>&1 | grep -v "nginx: the configuration file .* syntax is ok"
NGINX_EXIT=${PIPESTATUS[0]}
if [ $NGINX_EXIT -eq 0 ]; then
    sudo /usr/sbin/nginx -s reload 2>/dev/null || {
        log "      ⚠️  Config OK but reload failed"
        SUMMARY_WARN+=("Nginx reload failed")
     }
    log "      ✅ Nginx configs applied ($NGINX_APPLIED)"
    SUMMARY_OK+=("Nginx configs ($NGINX_APPLIED)")
else
    log "${RED}      ❌ Nginx config FAILED!${NC}"
    sudo /usr/sbin/nginx -t 2>&1
    SUMMARY_FAIL+=("Nginx config test failed")
fi

# ── STEP 3: Cleanup old containers before building ──
log "${YELLOW}Step 3: Cleaning up old containers...${NC}"

for dir in "$PROJECTS_DIR"/*/; do
     [ -d "$dir" ] || continue
    PROJECT_NAME=$(basename "$dir")
    is_project "$dir" || continue

    log "         Cleaning up $PROJECT_NAME..."
    cd "$dir" || continue
      # Order matters: compose down first, then prune leftovers
    docker compose -p "$PROJECT_NAME" down --rmi local --volumes --remove-orphans 2>/dev/null || true
      # Force remove any remaining containers
    CONTAINERS=$(grep "container_name:" "$dir/docker-compose.yml" 2>/dev/null | sed 's/.*container_name: *//')
    for c in $CONTAINERS; do
        docker rm -f "$c" 2>/dev/null || true
    done
      # Remove project networks
    docker network ls --format '{{.Name}}' 2>/dev/null | grep "^${PROJECT_NAME}_" | xargs -r docker network rm 2>/dev/null || true
      # Remove dangling images
    for img in $CONTAINERS; do
        docker image rm "$img" 2>/dev/null || true
    done
done

log "      ✅ Cleanup complete"

# ── STEP 4: Build & Deploy ──
log "${YELLOW}Step 4: Building & deploying...${NC}"
DEPLOYED=0

for dir in "$PROJECTS_DIR"/*/; do
     [ -d "$dir" ] || continue
    PROJECT_NAME=$(basename "$dir")
    is_project "$dir" || continue

    log ""
    log "${CYAN}      ┌─ Deploying: $PROJECT_NAME${NC}"
    cd "$dir" || continue

    SERVICE_COUNT=$(grep -c "container_name:" "$dir/docker-compose.yml" 2>/dev/null || echo "1")
     [ "$SERVICE_COUNT" -gt 1 ] && log "      │  Multi-service ($SERVICE_COUNT services)"

    log "      │  Building & starting..."
    BUILD_OUTPUT=$(docker compose up -d --build 2>&1)
    if [ $? -eq 0 ]; then
        log "      └─ ${GREEN}✅ $PROJECT_NAME is LIVE!${NC}"
        SUMMARY_OK+=("Deployed $PROJECT_NAME")
        DEPLOYED=$((DEPLOYED + 1))
    else
        log "      └─ ${RED}❌ Failed: $PROJECT_NAME${NC}"
        log "${RED}       │  Build errors:${NC}"
        echo "$BUILD_OUTPUT" | grep -iE "error|fail|SyntaxError|expected" | head -15 | while IFS= read -r line; do
            log "       │     $line"
        done
        SUMMARY_FAIL+=("Failed to deploy $PROJECT_NAME")
    fi
done

# ── Summary ──
echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              📊  Summary                   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

echo -e "      ${GREEN}✅ Success:${NC}"
for item in "${SUMMARY_OK[@]}"; do echo "        • $item"; done

if [ ${#SUMMARY_FAIL[@]} -gt 0 ]; then
    echo ""
    echo -e "      ${RED}❌ Failures:${NC}"
    for item in "${SUMMARY_FAIL[@]}"; do echo "        • $item"; done
fi

if [ ${#SUMMARY_WARN[@]} -gt 0 ]; then
    echo ""
    echo -e "      ${YELLOW}⚠️  Warnings:${NC}"
    for item in "${SUMMARY_WARN[@]}"; do echo "        • $item"; done
fi

echo ""
echo "  Projects deployed: $DEPLOYED"
echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║            🎉  Deploy Complete!            ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""
