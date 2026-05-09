#!/bin/bash
# ============================================================
# Create a new project and deploy it
# Usage: ./new-project.sh <project-name> [port]
# Example: ./new-project.sh myapp 3000
# ============================================================

set -e

PROJECT_NAME="${1}"
PROJECT_PORT="${2:-3000}"
BASE_DIR="/home/elkayam/dev-env"
PROJECT_DIR="$BASE_DIR/projects/$PROJECT_NAME"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
SUBDOMAIN_SUFFIX="apps.elkayam.me"

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 <project-name> [port]"
    echo "Example: $0 myapp 3000"
    echo ""
    echo "Creates project at: $BASE_DIR/projects/"
    echo "Accessible at: https://$PROJECT_NAME.apps.elkayam.me"
    exit 1
fi

if [ -d "$PROJECT_DIR" ]; then
    echo "Project '$PROJECT_NAME' already exists at $PROJECT_DIR"
    exit 1
fi

echo "Creating project: $PROJECT_NAME"
echo "============================"

# 1. Create project directory
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 2. Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
dist/
build/
.DS_Store
EOF

# 3. Create Dockerfile template
cat > Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# 4. Create project docker-compose
cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    container_name: ${PROJECT_NAME}
    restart: unless-stopped
    ports:
      - "127.0.0.1:${PROJECT_PORT}:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=production
EOF

# 5. Set up nginx config
cp "$BASE_DIR/nginx-project-template.conf" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
sed -i "s/{{PROJECT_NAME}}/$PROJECT_NAME/g; s/{{PROJECT_PORT}}/$PROJECT_PORT/g" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
ln -sf "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf" "$NGINX_ENABLED/"
nginx -t && systemctl reload nginx 2>/dev/null || true

# 6. Initialize git
git init
git add .
git commit -m "Initial project setup"

echo ""
echo "========================================"
echo "  Project Created: $PROJECT_NAME"
echo "========================================"
echo ""
echo "  Location:   $PROJECT_DIR"
echo "  Subdomain: https://$PROJECT_NAME.apps.elkayam.me"
echo "  Port:       $PROJECT_PORT"
echo ""
echo "Next steps:"
echo "  2. cd $PROJECT_DIR"
echo "  3. npm init (or set up your project)"
echo "  4. docker compose up -d --build"
echo "  5. Visit https://$PROJECT_NAME.apps.elkayam.me"
echo ""
echo "Connect to GitHub:"
echo "  git remote add origin https://github.com/YOUR_USER/$PROJECT_NAME.git"
echo "  git push -u origin main"
