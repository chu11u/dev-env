#!/bin/bash
# ============================================================
# Deploy All Projects - Called by webhook automatically
# Also run manually: ./deploy-all.sh
# ============================================================

set -e

BASE_DIR="/home/elkayam/dev-env"
PROJECTS_DIR="$BASE_DIR/projects"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

echo "========================================"
echo "   Deploy"
echo "========================================"

# Pull latest
cd "$BASE_DIR"
git pull origin main 2>&1 || log "Git pull failed"

# Create persistent data directories (outside git repo)
mkdir -p "$BASE_DIR/project-data/arcade/data"

# Reload nginx
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true

# Deploy each project
log "Scanning projects..."
FOUND=0

for dir in "$PROJECTS_DIR"/*/; do
    if [ -d "$dir" ]; then
        FOUND=$((FOUND + 1))
        PROJECT_NAME=$(basename "$dir")
        DOCKER_FILE="$dir/docker-compose.yml"
        DOCKERFILE="$dir/Dockerfile"

        if [ -f "$DOCKER_FILE" ] && [ -f "$DOCKERFILE" ]; then
            log "$YELLOW Deploying $PROJECT_NAME...$NC"

             # Get port
            PORT=$(grep -oP '"127\.0\.0\.1:\K\d+' "$DOCKER_FILE" 2>/dev/null | head -1 || echo "3000")

             # Check for custom nginx config
            if [ -f "$dir/nginx-api.conf" ]; then
                cp "$dir/nginx-api.conf" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
                log "  Custom nginx config applied"
            elif [ -f "$BASE_DIR/nginx-project-template.conf" ]; then
                cp "$BASE_DIR/nginx-project-template.conf" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
                sed -i "s/{{PROJECT_NAME}}/${PROJECT_NAME}/g; s/{{PROJECT_PORT}}/${PORT}/g" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
                ln -sf "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf" "$NGINX_ENABLED/"
                log "  $GREEN $PROJECT_NAME.apps.elkayam.me  port $PORT$NC"
            fi

             # Check for multi-service projects
            SERVICE_COUNT=$(grep -c "container_name:" "$DOCKER_FILE" 2>/dev/null || echo "1")
            if [ "$SERVICE_COUNT" -gt 1 ]; then
                log "  Multi-service project ($SERVICE_COUNT services)"
            fi

             # Deploy
            cd "$dir"
            if docker compose up -d --build 2>&1 | tail -5; then
                log "$GREEN $PROJECT_NAME is LIVE! (https://$PROJECT_NAME.apps.elkayam.me)$NC"
            else
                log "$RED Failed to deploy $PROJECT_NAME$NC"
            fi
        else
            log "  Skip $PROJECT_NAME (no docker files)"
        fi
    fi
done

if [ "$FOUND" -eq 0 ]; then
    log "No projects found in $PROJECTS_DIR"
else
    log "Deployed $FOUND project(s)"
fi

# Final nginx reload
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true

echo ""
echo "========================================"
echo "   Deploy complete!"
echo "========================================"
