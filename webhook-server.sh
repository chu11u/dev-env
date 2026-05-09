#!/bin/bash
# ============================================================
# Webhook Listener - Auto-deploys when GitHub pushes
# Run on server: ./webhook-server.sh (runs in background)
# ============================================================

set -e

BASE_DIR="/home/elkayam/dev-env"
PROJECTS_DIR="$BASE_DIR/projects"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
WEBHOOK_SECRET="${WEBHOOK_SECRET:-your-secret-change-this}"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Deploy a single project
deploy_project() {
    local PROJECT_NAME="$1"
    local PROJECT_DIR="$PROJECTS_DIR/$PROJECT_NAME"

    if [ ! -d "$PROJECT_DIR" ]; then
        log "  ⏭️  Skipping $PROJECT_NAME (no directory)"
        return
    fi

    local DOCKER_FILE="$PROJECT_DIR/docker-compose.yml"
    local DOCKERFILE="$PROJECT_DIR/Dockerfile"

    if [ ! -f "$DOCKER_FILE" ] || [ ! -f "$DOCKERFILE" ]; then
        log "  ⏭️  Skipping $PROJECT_NAME (no docker files)"
        return
    fi

    log "  📦 Deploying $PROJECT_NAME..."

    # Find port from docker-compose.yml
    local PORT
    PORT=$(grep -oP '"127\.0\.0\.1:\K\d+' "$DOCKER_FILE" 2>/dev/null || echo "3000")

    # Setup nginx config
    if [ -f "$BASE_DIR/nginx-project-template.conf" ]; then
        cp "$BASE_DIR/nginx-project-template.conf" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
        sed -i "s/{{PROJECT_NAME}}/${PROJECT_NAME}/g; s/{{PROJECT_PORT}}/${PORT}/g" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
        ln -sf "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf" "$NGINX_ENABLED/"
        log "  🌐 Nginx: $PROJECT_NAME.apps.elkayam.me → port $PORT"
    fi

    # Build and start
    cd "$PROJECT_DIR"
    if docker compose up -d --build 2>&1 | tail -1; then
        log "  ✅ $PROJECT_NAME deployed! (https://$PROJECT_NAME.apps.elkayam.me)"
    else
        log "  ❌ Failed to deploy $PROJECT_NAME"
    fi
}

# Handle webhook
handle_webhook() {
    log "📨 Webhook received!"

    # Pull latest code
    cd "$BASE_DIR"
    git pull origin main 2>&1 || log "  ⚠️  Git pull failed"

    # Reload nginx in case config changed
    nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true

    # Scan for new projects
    log "🔍 Scanning for projects..."
    for dir in "$PROJECTS_DIR"/*/; do
        if [ -d "$dir" ]; then
            PROJECT_NAME=$(basename "$dir")
            deploy_project "$PROJECT_NAME"
        fi
    done

    log "✅ Done!"
}

# Simple HTTP server for webhooks
log "🚀 Starting webhook listener on port 8888..."
log "   Webhook URL: https://webhook.apps.elkayam.me"

while true; do
    # Use Python (usually available) as a simple HTTP server
    python3 -c "
import sys
import json
import subprocess
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

SECRET = '$WEBHOOK_SECRET'

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)

        # Check secret
        if self.headers.get('X-Hub-Signature', '') != 'sha1=' + self.simple_hash(body, SECRET):
            self.send_response(403)
            self.end_headers()
            return

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'OK')

        # Trigger deploy
        subprocess.run(['$BASE_DIR/deploy-all.sh'], capture_output=True)

    def simple_hash(self, data, secret):
        import hashlib
        return hashlib.sha1(secret.encode() + data).hexdigest()

    def log_message(self, format, *args):
        pass  # Suppress default logging

HTTPServer(('0.0.0.0', 8888), WebhookHandler).serve_forever()
" 2>/dev/null || {
        # Fallback: simple netcat-based approach
        log "Using netcat fallback..."
        while true; do
            echo -e "HTTP/1.1 200 OK\r\n\r\nOK" | nc -l -p 8888 -q 0 2>/dev/null || true
            handle_webhook
        done
    }
done
