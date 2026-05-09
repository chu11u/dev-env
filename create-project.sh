#!/bin/bash
# ============================================================
# Full Pipeline: Create → Validate → Deploy → GitHub
# ============================================================
# Usage: ./create-project.sh <project-name> [port]
# Example: ./create-project.sh clock 3002
#
# This script:
#  1. Creates the project with all files
#  2. Validates everything is in place
#  3. Sets up nginx routing
#  4. Initializes git
#  5. Tests Docker build locally
#  6. Asks for your approval
#  7. Pushes to GitHub & deploys (if approved)
# ============================================================

set -e

PROJECT_NAME="${1}"
PROJECT_PORT="${2:-3000}"
BASE_DIR="/home/elkayam/dev-env"
PROJECT_DIR="$BASE_DIR/projects/$PROJECT_NAME"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
GITHUB_USER="chu11u"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# --- Pre-flight checks ---
if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 <project-name> [port]"
    echo "Example: $0 clock 3002"
    exit 1
fi

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Project '$PROJECT_NAME' already exists!${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo "  🚀 Creating: $PROJECT_NAME"
echo "  Port: $PROJECT_PORT"
echo "  URL: https://$PROJECT_NAME.apps.elkayam.me"
echo "========================================"

# --- Step 1: Create project ---
echo ""
echo -e "${YELLOW}[1/6] Creating project files...${NC}"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# --- index.html (Clock Dashboard) ---
cat > index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Clock Dashboard</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #0f172a, #1e1b4b, #0f172a);
              font-family: 'Courier New', monospace;
              overflow: hidden;
          }
          .container { text-align: center; position: relative; z-index: 1; }
          .date { color: #60a5fa; font-size: 1.5rem; margin-bottom: 1rem; opacity: 0.8; }
          .clock { display: flex; align-items: center; gap: 0.5rem; }
          .time-segment {
              font-size: 8rem;
              font-weight: bold;
              color: #e0e7ff;
              text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
          }
          .separator {
              font-size: 8rem;
              font-weight: bold;
              color: #6366f1;
              animation: blink 1s infinite;
          }
          @keyframes blink { 50% { opacity: 0.3; } }
          .seconds { font-size: 3rem; color: #818cf8; margin-top: 1rem; }
          .particles {
              position: absolute;
              top: 0; left: 0;
              width: 100%; height: 100%;
              pointer-events: none;
              z-index: 0;
          }
          .particle {
              position: absolute;
              width: 4px; height: 4px;
              background: #6366f1;
              border-radius: 50%;
              animation: float linear infinite;
              opacity: 0.3;
          }
          @keyframes float {
              0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
              10% { opacity: 0.3; }
              90% { opacity: 0.3; }
              100% { transform: translateY(-10vh) rotate(720deg); opacity: 0; }
          }
      </style>
</head>
<body>
      <div class="particles" id="particles"></div>
      <div class="container">
          <div class="date" id="date"></div>
          <div class="clock">
              <span class="time-segment" id="hours">00</span>
              <span class="separator">:</span>
              <span class="time-segment" id="minutes">00</span>
          </div>
          <div class="seconds" id="seconds">00</div>
      </div>
      <script>
          function updateClock() {
              const now = new Date();
              const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
              const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              document.getElementById('date').textContent =
                  days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate();
              document.getElementById('hours').textContent = String(now.getHours()).padStart(2, '0');
              document.getElementById('minutes').textContent = String(now.getMinutes()).padStart(2, '0');
              document.getElementById('seconds').textContent = String(now.getSeconds()).padStart(2, '0');
          }
          function createParticles() {
              const container = document.getElementById('particles');
              for (let i = 0; i < 50; i++) {
                  const p = document.createElement('div');
                  p.className = 'particle';
                  p.style.left = Math.random() * 100 + '%';
                  p.style.animationDuration = (Math.random() * 10 + 5) + 's';
                  p.style.animationDelay = Math.random() * 5 + 's';
                  container.appendChild(p);
              }
          }
          updateClock();
          setInterval(updateClock, 1000);
          createParticles();
      </script>
</body>
</html>
HTML

# --- Dockerfile ---
cat > Dockerfile << 'DOCKERFILE'
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE

# --- docker-compose.yml ---
cat > docker-compose.yml << COMPOSE
version: '3.8'
services:
  app:
    build: .
    container_name: ${PROJECT_NAME}
    restart: unless-stopped
    ports:
         - "127.0.0.1:${PROJECT_PORT}:80"
COMPOSE

# --- .gitignore ---
cat > .gitignore << 'GITIGNORE'
.env
.DS_Store
GITIGNORE

echo -e "  ${GREEN}✓ index.html${NC}"
echo -e "  ${GREEN}✓ Dockerfile${NC}"
echo -e "  ${GREEN}✓ docker-compose.yml${NC}"
echo -e "  ${GREEN}✓ .gitignore${NC}"

# --- Step 2: Validate ---
echo ""
echo -e "${YELLOW}[2/6] Validating files...${NC}"
FILES_OK=true
for f in index.html Dockerfile docker-compose.yml .gitignore; do
    if [ ! -f "$f" ]; then
        echo -e "  ${RED}✗ Missing: $f${NC}"
        FILES_OK=false
    else
        echo -e "  ${GREEN}✓ $f${NC}"
    fi
done

if [ "$FILES_OK" = "false" ]; then
    echo -e "${RED}Validation failed! Aborting.${NC}"
    exit 1
fi
echo -e "  ${GREEN}All files valid ✓${NC}"

# --- Step 3: Nginx setup ---
echo ""
echo -e "${YELLOW}[3/6] Setting up nginx routing...${NC}"
cp "$BASE_DIR/nginx-project-template.conf" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
sed -i "s/{{PROJECT_NAME}}/${PROJECT_NAME}/g; s/{{PROJECT_PORT}}/${PROJECT_PORT}/g" "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf"
ln -sf "$NGINX_AVAILABLE/${PROJECT_NAME}.apps.elkayam.me.conf" "$NGINX_ENABLED/"
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
echo -e "  ${GREEN}✓ $PROJECT_NAME.apps.elkayam.me → port $PROJECT_PORT${NC}"

# --- Step 4: Git init ---
echo ""
echo -e "${YELLOW}[4/6] Initializing git...${NC}"
git init
git add .
git commit -m "Initial: $PROJECT_NAME project"
echo -e "  ${GREEN}✓ Git initialized${NC}"

# --- Step 5: Test Docker build ---
echo ""
echo -e "${YELLOW}[5/6] Testing Docker build...${NC}"
if docker build -t "${PROJECT_NAME}-test" . -q 2>/dev/null; then
    docker image rm "${PROJECT_NAME}-test" 2>/dev/null || true
    echo -e "  ${GREEN}✓ Build successful${NC}"
else
    echo -e "  ${RED}✗ Build failed!${NC}"
    exit 1
fi

# --- Step 6: Summary & Approval ---
echo ""
echo -e "${CYAN}[6/6] Project Summary${NC}"
echo "========================================"
echo "  Project:    $PROJECT_NAME"
echo "  URL:        https://$PROJECT_NAME.apps.elkayam.me"
echo "  GitHub:     github.com/$GITHUB_USER/$PROJECT_NAME"
echo "  Files:"
ls -la
echo "========================================"
echo ""
echo -e "${YELLOW}Push to GitHub and deploy?${NC}"
echo ""
read -p "Type 'yes' to proceed: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo ""
    echo "Cancelled. Project saved at: $PROJECT_DIR"
    echo "To deploy manually later:"
    echo "  cd $PROJECT_DIR"
    echo "  git remote add origin https://github.com/$GITHUB_USER/$PROJECT_NAME.git"
    echo "  git push -u origin master"
    echo "  docker compose up -d --build"
    echo ""
    exit 0
fi

# --- Push to GitHub ---
echo ""
echo "========================================"
echo "  🚀 Deploying to GitHub..."
echo "========================================"
git remote add origin "https://github.com/$GITHUB_USER/$PROJECT_NAME.git"
git push -u origin master 2>&1

# --- Deploy with Docker ---
echo ""
echo "========================================"
echo "  🐳 Deploying container..."
echo "========================================"
docker compose up -d --build

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🎉 Project is LIVE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  Visit:      https://$PROJECT_NAME.apps.elkayam.me"
echo "  Code:       Open in code-server at https://dev.apps.elkayam.me"
echo "              → Open folder: $PROJECT_DIR"
echo "  GitHub:     https://github.com/$GITHUB_USER/$PROJECT_NAME"
echo ""
