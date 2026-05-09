#!/bin/bash
# ============================================================
# Dev Environment - Initial Setup Script
# Run this ONCE on the server to set up the dev environment
# ============================================================

set -e

echo "========================================"
echo "  Dev Environment Setup - elkayam.me"
echo "========================================"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_DIR="/home/elkayam/dev-env"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
SERVER_IP="$(hostname -I | awk '{print $1}')"

# --- 1. Install docker-compose plugin ---
echo ""
echo -e "${YELLOW}[1/5] Installing docker-compose plugin...${NC}"
COMPOSE_PLUGIN="/usr/local/lib/docker/cli-plugins/docker-compose"
if [ ! -f "$COMPOSE_PLUGIN" ]; then
    COMPOSE_VERSION="v2.29.2"
    curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
         -o "$COMPOSE_PLUGIN"
    chmod +x "$COMPOSE_PLUGIN"
    echo -e "${GREEN}docker-compose plugin installed.${NC}"
else
    echo -e "${GREEN}docker-compose plugin already installed.${NC}"
fi

# Verify it works
docker compose version

# --- 2. Clean up old Docker images ---
echo ""
echo -e "${YELLOW}[2/5] Cleaning up old Docker images...${NC}"
docker system prune -a --filter "until=30d" -f 2>/dev/null || true
echo -e "${GREEN}Cleanup done. Check savings with: docker system df${NC}"

# --- 3. Create directory structure ---
echo ""
echo -e "${YELLOW}[3/5] Setting up directories...${NC}"
mkdir -p "$BASE_DIR/data/code-server"
mkdir -p "$BASE_DIR/projects"
echo -e "${GREEN}Created at ${BASE_DIR}${NC}"

# --- 4. Set up nginx ---
echo ""
echo -e "${YELLOW}[4/5] Configuring nginx...${NC}"
cp "$BASE_DIR/nginx-dev.apps.elkayam.me.conf" "$NGINX_AVAILABLE/dev.apps.elkayam.me.conf"
ln -sf "$NGINX_AVAILABLE/dev.apps.elkayam.me.conf" "$NGINX_ENABLED/"
nginx -t && systemctl reload nginx 2>/dev/null || true
echo -e "${GREEN}nginx configured for dev.apps.elkayam.me${NC}"

# --- 5. Set up code-server password ---
echo ""
echo -e "${YELLOW}[5/5] Setting up code-server...${NC}"
echo ""
echo "Generate a secure password:"
echo "  openssl rand -base64 32"
echo ""
read -p "Enter password for dev.apps.elkayam.me: " -s CODE_PASSWORD
echo ""

# Create .env file
cat > "$BASE_DIR/.env" << EOF
PASSWORD=${CODE_PASSWORD}
EOF

echo -e "${GREEN}Password saved to .env${NC}"

# --- Start services ---
echo ""
echo -e "${YELLOW}Starting services...${NC}"
cd "$BASE_DIR"
docker compose up -d

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  IDE:       https://dev.apps.elkayam.me"
echo "  (NPM routes *.apps.elkayam.me → this server)"
echo "  Projects:    $BASE_DIR/projects/"
echo ""
echo "DNS Setup (Technitium):"
echo "  Add A record: *.apps → $SERVER_IP (wildcard)"
echo ""
echo "NPM Setup:"
echo "  Forward *.apps.elkayam.me → 192.168.131.134:80"
echo "  Enable SSL with wildcard cert for *.apps.elkayam.me"
echo ""
echo "Then visit: https://dev.apps.elkayam.me"
