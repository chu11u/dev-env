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
    echo "         $0 arcade 3003"
    exit 1
fi

if [ -d "$PROJECT_DIR" ]; then
    echo "Project '$PROJECT_NAME' already exists at $PROJECT_DIR"
    exit 1
fi

echo ""
echo "========================================"
echo "   Building: $PROJECT_NAME"
echo "  Port: $PROJECT_PORT"
echo "  URL: https://$PROJECT_NAME.apps.elkayam.me"
echo "========================================"

# Create directory
mkdir -p "$PROJECT_DIR"

echo ""
echo -e "${YELLOW}Creating files...${NC}"

# --- Generate based on project type ---
if [ "$PROJECT_NAME" = "clock" ]; then

# ==============================
# Clock - Static HTML Dashboard
# ==============================
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

# ==============================
# Arcade - Multi-service project
# (Frontend + Backend API)
# ==============================
elif [ "$PROJECT_NAME" = "arcade" ]; then

# Frontend directory
mkdir -p "$PROJECT_DIR/frontend/src"
mkdir -p "$PROJECT_DIR/backend/data"

# --- Frontend: Game Lobby UI (React + Vite) ---
cat > "$PROJECT_DIR/frontend/package.json" << 'PKGJSON'
{
  "name": "arcade-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 3000"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.1"
  }
}
PKGJSON

cat > "$PROJECT_DIR/frontend/vite.config.js" << 'VITECONFIG'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['arcade.apps.elkayam.me']
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  }
})
VITECONFIG

cat > "$PROJECT_DIR/frontend/index.html" << 'INDEXHTML'
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Family Arcade</title>
     <style>
         * { margin: 0; padding: 0; box-sizing: border-box; }
         body {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f0f23, #1a1a3e, #0f0f23);
            font-family: 'Press Start 2P', monospace;
            color: #fff;
            overflow-x: hidden;
          }
         .stars {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 0;
          }
         .star {
            position: absolute;
            width: 2px; height: 2px;
            background: #fff;
            border-radius: 50%;
            animation: twinkle 2s infinite alternate;
          }
         @keyframes twinkle { from { opacity: 0.2; } to { opacity: 1; } }
     </style>
</head>
<body>
     <div class="stars" id="stars"></div>
     <div id="root"></div>
     <script type="module" src="/src/main.jsx"></script>
</body>
</html>
INDEXHTML

# --- Frontend: Main entry point ---
cat > "$PROJECT_DIR/frontend/src/main.jsx" << 'MAINJSX'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
MAINJSX

# --- Frontend: App component ---
cat > "$PROJECT_DIR/frontend/src/App.jsx" << 'APPJSX'
import { useState, useEffect } from 'react'
import GameGrid from './components/GameGrid'
import PlayerModal from './components/PlayerModal'
import Leaderboard from './components/Leaderboard'

const API = '/api'

function App() {
  const [players, setPlayers] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

   // Fetch players on mount
  useEffect(() => {
    fetchPlayers()
   }, [])

   const fetchPlayers = async () => {
    try {
      const res = await fetch(`${API}/players`)
      const data = await res.json()
      setPlayers(data)
     } catch (err) {
      console.error('Failed to fetch players:', err)
     }
   }

   const registerPlayer = async (name) => {
    try {
      await fetch(`${API}/players`, {
         method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
       })
     fetchPlayers()
     setShowModal(false)
    } catch (err) {
      console.error('Failed to register:', err)
    }
   }

   return (
     <div style={{ position: 'relative', zIndex: 1 }}>
         {/* Header */}
        <header style={{
            padding: '2rem',
            textAlign: 'center',
            borderBottom: '2px solid #ff0066',
            background: 'rgba(0,0,0,0.3)'
          }}>
           <h1 style={{
               fontSize: '3rem',
               background: 'linear-gradient(45deg, #ff0066, #ff6600, #ffcc00, #00ff66, #0066ff, #9900ff)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               textShadow: 'none'
              }}>
              🕹️ Family Arcade
             </h1>
           <p style={{ color: '#888', marginTop: '1rem' }}>Choose your player to start!</p>

           <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
             <button onClick={() => setShowModal(true)} style={btnStyle}>
                ➕ New Player
             </button>
             <button onClick={() => setShowLeaderboard(!showLeaderboard)} style={btnStyle}>
                🏆 Leaderboard
             </button>
             {currentPlayer && (
               <div style={{ ...btnStyle, background: '#00cc66' }}>
                  👤 {currentPlayer}
               </div>
              )}
           </div>
         </header>

         {/* Player Selection */}
         {players.length > 0 && !currentPlayer && (
           <div style={{ padding: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
             {players.map(player => (
               <button key={player} onClick={() => setCurrentPlayer(player)} style={playerBtnStyle}>
                  👤 {player}
               </button>
              ))}
           </div>
          )}

         {/* Game Grid */}
         <GameGrid currentPlayer={currentPlayer} api={API} />

         {/* Leaderboard */}
         {showLeaderboard && <Leaderboard players={players} api={API} />}

         {/* Player Registration Modal */}
         {showModal && <PlayerModal onRegister={registerPlayer} onClose={() => setShowModal(false)} />}
       </div>
     )
}

const btnStyle = {
  padding: '0.5rem 1rem',
  background: '#333',
  color: '#fff',
  border: '2px solid #ff0066',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: '1rem'
}

const playerBtnStyle = {
  ...btnStyle,
  padding: '1rem 2rem',
  fontSize: '1.2rem',
  background: 'linear-gradient(45deg, #333, #555)',
  border: '2px solid #00ff66'
}

export default App
APPJSX

# --- Frontend: GameGrid component ---
mkdir -p "$PROJECT_DIR/frontend/src/components"

cat > "$PROJECT_DIR/frontend/src/components/GameGrid.jsx" << 'GAMEGRID'
import { useState } from 'react'

const games = [
  { id: 'pong', name: '🏓 Pong', color: '#ff0066', description: 'Classic 2-player pong!' },
  { id: 'tictactoe', name: '❌⭕ Tic Tac Toe', color: '#00ccff', description: 'Xs and Os' },
  { id: 'memory', name: '🧠 Memory Match', color: '#ffcc00', description: 'Find the pairs!' },
  { id: 'snake', name: '🐍 Snake', color: '#00ff66', description: 'Eat and grow!' },
]

function GameGrid({ currentPlayer, api }) {
  const [selectedGame, setSelectedGame] = useState(null)

   if (!currentPlayer) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
        <p>👆 Select a player above to start playing!</p>
      </div>
     )
   }

  return (
     <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
       <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#ff0066' }}>
          🎮 Select a Game
        </h2>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {games.map(game => (
            <div key={game.id} style={{
                ...cardStyle,
                borderLeft: `4px solid ${game.color}`,
                cursor: 'pointer'
              }}
              onClick={() => setSelectedGame(game)}
            >
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{game.name}</h3>
              <p style={{ color: '#888', marginBottom: '1rem' }}>{game.description}</p>
              <button style={{
                  ...playBtnStyle,
                  background: game.color,
                  border: `2px solid ${game.color}`
                }}>
                ▶ Play
              </button>
            </div>
           ))}
        </div>
     </div>
   )
}

const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  padding: '1.5rem',
  borderRadius: '12px',
  transition: 'transform 0.2s, box-shadow 0.2s',
  ':hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 32px rgba(255,0,102,0.3)' }
}

const playBtnStyle = {
  padding: '0.5rem 1.5rem',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: '1rem',
  fontWeight: 'bold'
}

export default GameGrid
GAMEGRID

# --- Frontend: PlayerModal component ---
cat > "$PROJECT_DIR/frontend/src/components/PlayerModal.jsx" << 'PLAYERMODAL'
import { useState } from 'react'

function PlayerModal({ onRegister, onClose }) {
  const [name, setName] = useState('')

   const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onRegister(name.trim())
     }
   }

   return (
     <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
       }}
       onClick={onClose}
     >
       <div style={{
          background: '#1a1a3e',
          padding: '2rem',
          borderRadius: '16px',
          border: '2px solid #ff0066',
          minWidth: '400px'
         }}
         onClick={e => e.stopPropagation()}
       >
         <h2 style={{ marginBottom: '1rem', color: '#ff0066' }}>🆕 New Player</h2>
         <form onSubmit={handleSubmit}>
           <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter player name..."
              style={{
                width: '100%',
                padding: '0.8rem',
                marginBottom: '1rem',
                background: '#0f0f23',
                border: '2px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '1.1rem'
               }}
              autoFocus
           />
           <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
             <button type="button" onClick={onClose} style={btnCancel}>Cancel</button>
             <button type="submit" style={btnSubmit}>Register</button>
           </div>
         </form>
       </div>
     </div>
   )
}

const btnCancel = {
  padding: '0.5rem 1rem',
  background: 'transparent',
  color: '#888',
  border: '2px solid #333',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'monospace'
}

const btnSubmit = {
  padding: '0.5rem 1rem',
  background: '#ff0066',
  color: '#fff',
  border: '2px solid #ff0066',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'monospace'
}

export default PlayerModal
PLAYERMODAL

# --- Frontend: Leaderboard component ---
cat > "$PROJECT_DIR/frontend/src/components/Leaderboard.jsx" << 'LEADERBOARD'
import { useState, useEffect } from 'react'

function Leaderboard({ players, api }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true)
      try {
        const results = await Promise.all(
          players.map(player =>
            fetch(`${api}/progress?player=${player}&game=any`)
              .then(r => r.json())
              .then(data => ({ player, score: data.score || 0 }))
              .catch(() => ({ player, score: 0 }))
           )
         )
        setScores(results.sort((a, b) => b.score - a.score))
       } catch (err) {
        console.error('Failed to fetch scores:', err)
       } finally {
        setLoading(false)
      }
     }
     if (players.length > 0) fetchScores()
   }, [players, api])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>🏆 Loading scores...</div>
  if (scores.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>No scores yet!</div>

  return (
     <div style={{
        maxWidth: '600px',
        margin: '2rem auto',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '2rem',
        border: '2px solid #ffcc00'
       }}>
       <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#ffcc00' }}>🏆 Leaderboard</h2>
       {scores.map((entry, index) => (
         <div key={entry.player} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.8rem',
            marginBottom: '0.5rem',
            background: index === 0 ? 'rgba(255,204,0,0.2)' : 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            border: index === 0 ? '1px solid #ffcc00' : '1px solid transparent'
           }}>
           <span>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`} {entry.player}</span>
           <span style={{ color: '#00ff66', fontFamily: 'monospace' }}>{entry.score} pts</span>
         </div>
        ))}
     </div>
   )
}

export default Leaderboard
LEADERBOARD

# --- Backend: Game API (Express + lowdb) ---
cat > "$PROJECT_DIR/backend/package.json" << 'BACKENDPKG'
{
  "name": "arcade-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "lowdb": "^7.0.1"
  }
}
BACKENDPKG

cat > "$PROJECT_DIR/backend/server.js" << 'SERVERJS'
const express = require('express');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
app.use(express.json());

// DB setup
const adapter = new JSONFile('/app/data/data.json');
const db = new Low(adapter, { players: [], games: [], progress: [] });

async function initDB() {
  await db.read();
  db.data ||= { players: [], games: [], progress: [] };
  await db.write();
}

initDB();

// ===== ROUTES =====

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Save progress
app.post('/api/progress', async (req, res) => {
  const { player, game, score = 0, level = 1, data = {} } = req.body;

  if (!player || !game) {
    return res.status(400).json({ error: 'missing player/game' });
   }

  await db.read();

   // ensure player
  if (!db.data.players.includes(player)) {
    db.data.players.push(player);
   }

   // ensure game
  if (!db.data.games.includes(game)) {
    db.data.games.push(game);
   }

   // update progress
  const existing = db.data.progress.find(
    p => p.player === player && p.game === game
   );

  if (existing) {
    existing.score = score;
    existing.level = level;
    existing.data = data;
   } else {
    db.data.progress.push({ player, game, score, level, data });
   }

  await db.write();
  res.json({ ok: true });
});

// Get progress
app.get('/api/progress', async (req, res) => {
  const { player, game } = req.query;

  if (!player || !game) return res.json({});

  await db.read();
  const result = db.data.progress.find(
    p => p.player === player && p.game === game
   );

  res.json(result || {});
});

// Get players
app.get('/api/players', async (req, res) => {
  await db.read();
  res.json(db.data.players || []);
});

// Add player
app.post('/api/players', async (req, res) => {
  const { name } = req.body;

  await db.read();

  if (!db.data.players.includes(name)) {
    db.data.players.push(name);
    await db.write();
   }

  res.json({ ok: true });
});

// Delete player
app.delete('/api/players', async (req, res) => {
  const { name } = req.body;

  await db.read();
  db.data.players = db.data.players.filter(p => p !== name);
  await db.write();

  res.json({ ok: true });
});

// Get all games
app.get('/api/games', async (req, res) => {
  await db.read();
  res.json(db.data.games || []);
});

// Get all progress
app.get('/api/all-progress', async (req, res) => {
  await db.read();
  res.json(db.data.progress || []);
});

app.listen(3000, () => {
  console.log('✅ Arcade API running on port 3000');
});
SERVERJS

# --- Dockerfile for frontend ---
cat > "$PROJECT_DIR/frontend/Dockerfile" << 'FRONTDOCK'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
FRONTDOCK

# --- Dockerfile for backend ---
cat > "$PROJECT_DIR/backend/Dockerfile" << 'BACKDOCK'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
BACKDOCK

# --- docker-compose for arcade (2 services) ---
cat > "$PROJECT_DIR/docker-compose.yml" << COMPOSE
version: '3.8'
services:
  frontend:
    build: ./frontend
    container_name: ${PROJECT_NAME}-frontend
    restart: unless-stopped
    ports:
          - "127.0.0.1:${PROJECT_PORT}:3000"
    depends_on:
          - backend

  backend:
    build: ./backend
    container_name: ${PROJECT_NAME}-backend
    restart: unless-stopped
    volumes:
          - ./backend/data:/app/data
    ports:
          - "127.0.0.1:${PROJECT_PORT}1:3000"
COMPOSE

# --- Nginx config to proxy API to backend ---
# (The auto-deploy script sets up the main frontend route)
# We need a second route for /api/ -> backend
cat > "$PROJECT_DIR/nginx-api.conf" << NGINXAPI
# Arcade API proxy
# This gets set up by deploy-all.sh
server {
    listen 80;
    server_name ${PROJECT_NAME}.apps.elkayam.me;

     location /api/ {
        proxy_pass http://127.0.0.1:${PROJECT_PORT}1/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
     }

     location / {
        proxy_pass http://127.0.0.1:${PROJECT_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
     }
}
NGINXAPI

echo -e "    ${GREEN}✓ frontend/ (React + Vite game lobby)${NC}"
echo -e "    ${GREEN}✓ backend/ (Node.js API + lowdb)${NC}"
echo -e "    ${GREEN}✓ docker-compose.yml (2 services)${NC}"
echo -e "    ${GREEN}✓ nginx-api.conf (API proxy)${NC}"

# ==============================
# Default: Simple HTML Project
# ==============================
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
           card {
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
build/
.env
.DS_Store
GITIGNORE

git add -A

# Check if this is a new commit
if git status --porcelain | grep -q .; then
    git commit -m "Create $PROJECT_NAME project"
fi

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
echo "     ./sync-push.sh"
echo ""
