#!/bin/bash
# ============================================================
# Local Project Builder - Run on your Mac
# Creates project files, commits & pushes to GitHub
# Server auto-deploys via cron (every 5 minutes)
# ============================================================

set -e

cd "$(dirname "$0")"

PROJECT_NAME="${1}"
PROJECT_PORT="${2:-3000}"
PROJECT_DIR="projects/$PROJECT_NAME"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 <project-name> [port]"
    echo "Example: $0 clock 3002"
    exit 1
fi

if [ -d "$PROJECT_DIR" ]; then
    echo "Project '$PROJECT_NAME' already exists at $PROJECT_DIR"
    exit 1
fi

echo ""
echo "========================================"
echo "  🛠️  Building: $PROJECT_NAME"
echo "  Port: $PROJECT_PORT"
echo "  URL: https://$PROJECT_NAME.apps.elkayam.me"
echo "========================================"

# Create directory
mkdir -p "$PROJECT_DIR/src"

echo ""
echo -e "${YELLOW}Creating files...${NC}"

# --- Generate based on project type ---
if [ "$PROJECT_NAME" = "clock" ]; then

# Clock project - single HTML with nginx
cat > "$PROJECT_DIR/index.html" << 'HTML'
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

cat > "$PROJECT_DIR/Dockerfile" << 'DOCKERFILE'
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE

cat > "$PROJECT_DIR/docker-compose.yml" << COMPOSE
version: '3.8'
services:
  app:
    build: .
    container_name: ${PROJECT_NAME}
    restart: unless-stopped
    ports:
         - "127.0.0.1:${PROJECT_PORT}:80"
COMPOSE

echo -e "    ${GREEN}✓ index.html${NC}"
echo -e "    ${GREEN}✓ Dockerfile${NC}"
echo -e "    ${GREEN}✓ docker-compose.yml${NC}"

# Default HTML project (for anything else)
else
    cat > "$PROJECT_DIR/index.html" << HTML
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>${PROJECT_NAME}</title>
     <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            font-family: 'Segoe UI', sans-serif;
         }
        .card {
            text-align: center;
            padding: 3rem;
            background: rgba(255,255,255,0.05);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
         }
        h1 { color: #e0e7ff; font-size: 3rem; }
        p { color: #60a5fa; }
     </style>
</head>
<body>
     <div class="card">
        <h1>Hello from ${PROJECT_NAME}!</h1>
        <p>https://${PROJECT_NAME}.apps.elkayam.me</p>
     </div>
</body>
</html>
HTML

cat > "$PROJECT_DIR/Dockerfile" << 'DOCKERFILE'
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE

cat > "$PROJECT_DIR/docker-compose.yml" << COMPOSE
version: '3.8'
services:
  app:
    build: .
    container_name: ${PROJECT_NAME}
    restart: unless-stopped
    ports:
         - "127.0.0.1:${PROJECT_PORT}:80"
COMPOSE

echo -e "    ${GREEN}✓ index.html${NC}"
echo -e "    ${GREEN}✓ Dockerfile${NC}"
echo -e "    ${GREEN}✓ docker-compose.yml${NC}"
fi

# Git
echo ""
echo -e "${CYAN}Git operations...${NC}"

# Add .gitignore
cat > "$PROJECT_DIR/.gitignore" << 'GITIGNORE'
node_modules/
dist/
.env
.DS_Store
GITIGNORE

cd "$PROJECT_DIR"
cd "$(dirname "$0")"

echo ""
echo "========================================"
echo -e "   📦 Project ready!"
echo "========================================"
echo ""
echo "  Files created at: $PROJECT_DIR"
echo "  Port: $PROJECT_PORT"
echo "  URL: https://$PROJECT_NAME.apps.elkayam.me"
echo ""
echo "  Push to GitHub & auto-deploy:"
echo "    ./sync-push.sh"
echo ""
echo "  Or manually:"
echo "    git add . && git commit -m 'message' && git push"
echo ""
