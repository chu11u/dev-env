#!/bin/bash
# ============================================================
# Build Arcade Project - Fully Local Family Arcade
# No Supabase, no Vercel - just our home lab!
# ============================================================
# Usage: ./build-arcade.sh
# ============================================================

set -e

cd "$(dirname "$0")"

PROJECT_NAME="arcade"
PROJECT_PORT="3003"
PROJECT_DIR="projects/$PROJECT_NAME"

if [ -d "$PROJECT_DIR" ]; then
    echo "Project '$PROJECT_NAME' already exists! Remove it first."
    exit 1
fi

echo ""
echo "========================================"
echo "   Building Arcade Project"
echo "   Port: $PROJECT_PORT"
echo "   URL: https://$PROJECT_NAME.apps.elkayam.me"
echo "========================================"

# Create directory structure
mkdir -p "$PROJECT_DIR/frontend/src/components"
mkdir -p "$PROJECT_DIR/backend/data"

# ============================================================
# BACKEND - Express + lowdb (simple JSON database)
# ============================================================

cat > "$PROJECT_DIR/backend/package.json" << 'EOF'
{
  "name": "arcade-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "lowdb": "^5.2.1",
    "Lowdb": "^1.0.0"
  }
}
EOF

cat > "$PROJECT_DIR/backend/server.js" << 'SERVERJS'
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = '/app/data/data.json';
const DEFAULT_DATA = { players: [], games: [], scores: [] };

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading data:', e);
  }
  return { ...DEFAULT_DATA };
}

function saveData(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ===== Players =====

app.get('/api/players', (req, res) => {
  const data = loadData();
  res.json(data.players);
});

app.post('/api/players', (req, res) => {
  const { username, avatar } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });

  const data = loadData();
  if (data.players.find(p => p.username === username)) {
    return res.status(409).json({ error: 'player exists' });
  }

  const player = {
    id: Date.now().toString(36),
    username,
    avatar: avatar || '🦊',
    createdAt: new Date().toISOString()
  };
  data.players.push(player);
  saveData(data);
  res.json(player);
});

app.delete('/api/players/:id', (req, res) => {
  const data = loadData();
  data.players = data.players.filter(p => p.id !== req.params.id);
  data.scores = data.scores.filter(s => s.playerId !== req.params.id);
  saveData(data);
  res.json({ ok: true });
});

// ===== Scores =====

app.get('/api/scores', (req, res) => {
  const data = loadData();
  res.json(data.scores);
});

app.get('/api/scores/:gameId', (req, res) => {
  const data = loadData();
  const gameScores = data.scores
    .filter(s => s.gameId === req.params.gameId)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  res.json(gameScores);
});

app.post('/api/scores', (req, res) => {
  const { playerId, gameId, score } = req.body;
  if (!playerId || !gameId || score == null) {
    return res.status(400).json({ error: 'playerId, gameId, score required' });
  }

  const data = loadData();

  // Ensure game exists
  if (!data.games.find(g => g.id === gameId)) {
    data.games.push({ id: gameId, name: gameId });
  }

  // Update or create score
  const existing = data.scores.find(s => s.playerId === playerId && s.gameId === gameId);
  if (existing) {
    if (score > existing.score) {
      existing.score = score;
      existing.isHighScore = true;
    }
    existing.playCount = (existing.playCount || 0) + 1;
    existing.lastPlayed = new Date().toISOString();
  } else {
    data.scores.push({
      playerId, gameId, score,
      isHighScore: true,
      playCount: 1,
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString()
    });
  }

  saveData(data);
  res.json({ ok: true });
});

// ===== Games =====

app.get('/api/games', (req, res) => {
  const data = loadData();
  res.json(data.games);
});

// ===== Health =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Arcade API running on port ${PORT}`);
});
SERVERJS

cat > "$PROJECT_DIR/backend/Dockerfile" << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["node", "server.js"]
EOF

# ============================================================
# FRONTEND - React + Vite (Game Lobby + Games)
# ============================================================

cat > "$PROJECT_DIR/frontend/package.json" << 'EOF'
{
  "name": "arcade-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "vite preview --host 0.0.0.0 --port 3000"
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
EOF

cat > "$PROJECT_DIR/frontend/vite.config.js" << 'EOF'
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
EOF

cat > "$PROJECT_DIR/frontend/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🕹️ Family Arcade</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF

cat > "$PROJECT_DIR/frontend/src/main.jsx" << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

cat > "$PROJECT_DIR/frontend/src/index.css" << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%);
  color: #e0e0e0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.game-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.game-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--card-color);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.player-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  cursor: pointer;
  transition: transform 0.2s;
}

.player-avatar:hover {
  transform: scale(1.1);
}

.memory-card {
  aspect-ratio: 1;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.memory-card.flipped {
  background: rgba(255, 255, 255, 0.1);
  transform: rotateY(180deg);
}

.memory-card.matched {
  background: rgba(34, 197, 94, 0.3);
  border: 2px solid #22c55e;
}
EOF

cat > "$PROJECT_DIR/frontend/src/App.jsx" << 'EOF'
import { useState, useEffect } from 'react'
import GameLobby from './components/GameLobby'
import PlayerSelect from './components/PlayerSelect'
import SkyJumper from './components/SkyJumper'
import MemoryMatch from './components/MemoryMatch'
import Leaderboard from './components/Leaderboard'

const API = '/api'

const GAMES = [
  { id: 'sky-jumper', name: '🚀 Sky Jumper', color: '#6366f1', desc: 'Jump as high as you can!' },
  { id: 'memory-match', name: '🧠 Memory Match', color: '#8b5cf6', desc: 'Find matching pairs!' },
]

const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐸', '🦄', '🐉', '🐙', '🦋', '🐨']

function App() {
  const [screen, setScreen] = useState('player-select')
  const [players, setPlayers] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [scores, setScores] = useState([])

  useEffect(() => {
    fetchPlayers()
    fetchScores()
  }, [])

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${API}/players`)
      setPlayers(await res.json())
    } catch (e) { console.error(e) }
  }

  const fetchScores = async () => {
    try {
      const res = await fetch(`${API}/scores`)
      setScores(await res.json())
    } catch (e) { console.error(e) }
  }

  const registerPlayer = async (username, avatar) => {
    const res = await fetch(`${API}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, avatar })
    })
    const player = await res.json()
    fetchPlayers()
    setCurrentPlayer(player)
    setScreen('lobby')
  }

  const selectPlayer = (player) => {
    setCurrentPlayer(player)
    setScreen('lobby')
  }

  const playGame = (game) => {
    setSelectedGame(game)
    setScreen('game')
  }

  const submitScore = async (gameId, score) => {
    await fetch(`${API}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: currentPlayer.id, gameId, score })
    })
    fetchScores()
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Stars background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '2px', height: '2px',
            background: 'white',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s infinite alternate`
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🕹️ Family Arcade</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {screen !== 'player-select' && (
              <button className="btn-secondary" onClick={() => setScreen('lobby')}>
                ← Lobby
              </button>
            )}
            {screen !== 'game' && screen !== 'leaderboard' && (
              <button className="btn-secondary" onClick={() => setScreen('leaderboard')}>
                🏆 Scores
              </button>
            )}
          </div>
        </header>

        {/* Screens */}
        {screen === 'player-select' && (
          <PlayerSelect
            players={players}
            avatars={AVATARS}
            onSelect={selectPlayer}
            onRegister={registerPlayer}
          />
        )}

        {screen === 'lobby' && currentPlayer && (
          <GameLobby
            player={currentPlayer}
            games={GAMES}
            scores={scores}
            onPlay={playGame}
          />
        )}

        {screen === 'game' && selectedGame && currentPlayer && (
          selectedGame.id === 'sky-jumper' ? (
            <SkyJumper player={currentPlayer} onScore={submitScore} />
          ) : (
            <MemoryMatch player={currentPlayer} onScore={submitScore} />
          )
        )}

        {screen === 'leaderboard' && (
          <Leaderboard players={players} scores={scores} games={GAMES} />
        )}
      </div>
    </div>
  )
}

export default App
EOF

cat > "$PROJECT_DIR/frontend/src/components/PlayerSelect.jsx" << 'EOF'
import { useState } from 'react'

function PlayerSelect({ players, avatars, onSelect, onRegister }) {
  const [mode, setMode] = useState('list')
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState(avatars[0])

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', animation: 'slideUp 0.3s ease' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: '#8b5cf6' }}>
        Who's playing?
      </h2>

      {mode === 'list' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {players.map(player => (
              <button key={player.id} onClick={() => onSelect(player)} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '150px'
              }}>
                <span style={{ fontSize: '3rem' }}>{player.avatar || '🦊'}</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{player.username}</span>
              </button>
            ))}
          </div>

          <button className="btn-primary" style={{ display: 'block', width: '100%' }} onClick={() => setMode('register')}>
            ➕ New Player
          </button>
        </>
      )}

      {mode === 'register' && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#8b5cf6' }}>New Player</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your name..."
              style={{
                width: '100%', padding: '0.75rem',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '10px', color: 'white',
                fontSize: '1rem'
              }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Choose avatar</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {avatars.map(a => (
                <button key={a} onClick={() => setAvatar(a)} style={{
                  fontSize: '2rem', padding: '0.5rem',
                  background: avatar === a ? 'rgba(99,102,241,0.3)' : 'transparent',
                  borderRadius: '10px', border: avatar === a ? '2px solid #6366f1' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setMode('list')}>Back</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => username && onRegister(username, avatar)}>
              Register & Play
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerSelect
EOF

cat > "$PROJECT_DIR/frontend/src/components/GameLobby.jsx" << 'EOF'
function GameLobby({ player, games, scores, onPlay }) {
  const getPlayerStats = () => {
    const playerScores = scores.filter(s => s.playerId === player.id)
    const totalPlays = playerScores.reduce((sum, s) => sum + (s.playCount || 1), 0)
    const bestScore = playerScores.length ? Math.max(...playerScores.map(s => s.score)) : 0
    return { totalPlays, bestScore }
  }

  const stats = getPlayerStats()

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', animation: 'slideUp 0.3s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="player-avatar" style={{ margin: '0 auto 1rem' }}>
          {player.avatar || '🦊'}
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Hey, {player.username}!
        </h2>
        <p style={{ color: '#888' }}>Choose a game to play</p>
      </div>

      {stats.totalPlays > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#888', marginBottom: '0.5rem' }}>Games Played</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{stats.totalPlays}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#888', marginBottom: '0.5rem' }}>Best Score</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>{stats.bestScore}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {games.map(game => (
          <div key={game.id} className="game-card" style={{ '--card-color': game.color }} onClick={() => onPlay(game)}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{game.name.split(' ')[0]}</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: game.color }}>{game.name}</h3>
            <p style={{ color: '#888' }}>{game.desc}</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }}>▶ Play</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameLobby
EOF

cat > "$PROJECT_DIR/frontend/src/components/SkyJumper.jsx" << 'GAMEJS'
import { useState, useEffect, useRef, useCallback } from 'react'

function SkyJumper({ player, onScore }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)
  const gameRef = useRef(null)

  const startGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const W = canvas.width
    const H = canvas.height

    // Game state
    let player_x = W / 2
    let player_y = H - 100
    let player_vy = 0
    let platforms = []
    let gameScore = 0
    let gameSpeed = 0.5
    let running = true

    // Generate initial platforms
    for (let i = 0; i < 6; i++) {
      platforms.push({
        x: Math.random() * (W - 80),
        y: H - 100 - i * (H / 5),
        w: 80,
        h: 10
      })
    }

    const animate = () => {
      if (!running) return

      // Physics
      player_vy += 0.3 // gravity
      player_y += player_vy

      // Platform movement
      platforms.forEach(p => { p.y += gameSpeed })

      // Score
      gameScore = Math.floor((gameSpeed - 0.5) * 100)
      gameSpeed += 0.001

      // Collision detection
      platforms.forEach(p => {
        if (player_vy > 0 && // falling
            player_x > p.x - 15 && player_x < p.x + p.w + 15 &&
            player_y > p.y - p.h && player_y < p.y + 10) {
          player_vy = -8 // bounce!
        }
      })

      // Remove off-screen platforms & add new ones
      platforms = platforms.filter(p => p.y < H)
      while (platforms.length < 6) {
        platforms.push({
          x: Math.random() * (W - 80),
          y: platforms.length ? Math.min(...platforms.map(p => p.y)) - H / 5 : H - 100,
          w: 80,
          h: 10
        })
      }

      // Check if player fell off screen
      if (player_y > H) {
        running = false
        setScore(gameScore)
        onScore('sky-jumper', gameScore)
        return
      }

      // Draw
      ctx.clearRect(0, 0, W, H)

      // Draw platforms
      ctx.fillStyle = '#6366f1'
      platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h)
      })

      // Draw player
      ctx.fillStyle = '#ff6b6b'
      ctx.beginPath()
      ctx.arc(player_x, player_y, 10, 0, Math.PI * 2)
      ctx.fill()

      // Draw score
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px monospace'
      ctx.fillText(`Score: ${gameScore}`, 10, 30)

      requestAnimationFrame(animate)
    }

    gameRef.current = { running, animate }
    setGameState('playing')
    animate()
  }, [onScore])

  const handleJump = useCallback(() => {
    if (gameState === 'idle') {
      startGame()
    } else if (gameRef.current?.running) {
      gameRef.current.player_vy = -10
    }
  }, [gameState, startGame])

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleJump()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleJump])

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', animation: 'slideUp 0.3s ease' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#6366f1' }}>
        🚀 Sky Jumper
      </h2>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: '1rem' }}>
        Press Space or tap to jump. Don't fall!
      </p>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '400px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '16px',
          cursor: gameState === 'playing' ? 'pointer' : 'default'
        }}
        onClick={handleJump}
      />

      {gameState === 'playing' && (
        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#22c55e' }}>
          Score: {score}
        </p>
      )}

      {gameState !== 'playing' && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn-primary" onClick={handleJump}>
            {score > 0 ? `Play Again (Score: ${score})` : 'Start Game'}
          </button>
        </div>
      )}
    </div>
  )
}

export default SkyJumper
GAMEJS

cat > "$PROJECT_DIR/frontend/src/components/MemoryMatch.jsx" << 'MEMORYJS'
import { useState, useEffect } from 'react'

const EMOJIS = ['🎮', '🕹️', '👾', '🎲', '🎯', '🏆', '⭐', '🚀']

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function MemoryMatch({ player, onScore }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [startTime, setStartTime] = useState(null)

  const initGame = () => {
    const pairs = shuffle([...EMOJIS, ...EMOJIS])
    setCards(pairs.map((emoji, i) => ({ id: i, emoji, matched: false }))
      .sort(() => Math.random() - 0.5))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameStarted(true)
    setGameOver(false)
    setStartTime(Date.now())
  }

  const handleClick = (cardId) => {
    if (flipped.length >= 2) return
    if (flipped.includes(cardId)) return
    if (cards.find(c => c.id === cardId)?.matched) return

    const newFlipped = [...flipped, cardId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id))

      if (first.emoji === second.emoji) {
        setMatched(m => [...m, first.id, second.id])
        setFlipped([])

        // Check win
        if (matched.length + 2 === cards.length) {
          const time = Math.floor((Date.now() - startTime) / 1000)
          const score = Math.max(0, 10000 - (moves * 500) - (time * 100))
          setGameOver(true)
          onScore('memory-match', score)
        }
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  const score = gameOver ? Math.max(0, 10000 - (moves * 500) - (Math.floor((Date.now() - startTime) / 1000) * 100)) : null

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', animation: 'slideUp 0.3s ease' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#8b5cf6' }}>
        🧠 Memory Match
      </h2>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: '1rem' }}>
        Match all pairs in as few moves as possible!
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
        <span>Moves: {moves}</span>
        <span>Matched: {matched.length / 2}/{cards.length / 2}</span>
      </div>

      {!gameStarted && (
        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary" onClick={initGame}>Start Game</button>
        </div>
      )}

      {gameStarted && !gameOver && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxWidth: '400px', margin: '0 auto' }}>
          {cards.map(card => (
            <div
              key={card.id}
              className={`memory-card ${flipped.includes(card.id) ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
              onClick={() => handleClick(card.id)}
            >
              {card.matched || flipped.includes(card.id) ? card.emoji : '❓'}
            </div>
          ))}
        </div>
      )}

      {gameOver && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Game Complete!</h3>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            {moves} moves • Score: {score}
          </p>
          <button className="btn-primary" onClick={initGame}>Play Again</button>
        </div>
      )}
    </div>
  )
}

export default MemoryMatch
MEMORYJS

cat > "$PROJECT_DIR/frontend/src/components/Leaderboard.jsx" << 'LEADERBOARD'
function Leaderboard({ players, scores, games }) {
  const getHighScores = (gameId) => {
    return scores
      .filter(s => s.gameId === gameId)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  const getPlayerName = (playerId) => {
    return players.find(p => p.id === playerId)?.username || 'Unknown'
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', animation: 'slideUp 0.3s ease' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: '#fbbf24' }}>
        🏆 Leaderboard
      </h2>

      {games.map(game => (
        <div key={game.id} style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: game.color }}>{game.name}</h3>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
            {getHighScores(game.id).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '1rem' }}>No scores yet</p>
            ) : (
              getHighScores(game.id).map((score, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <span>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    {' '}{getPlayerName(score.playerId)}
                  </span>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{score.score}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Leaderboard
LEADERBOARD

cat > "$PROJECT_DIR/frontend/Dockerfile" << 'EOF'
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
EOF

# ============================================================
# DOCKER COMPOSE
# ============================================================

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

# ============================================================
# NGINX CONFIG (route /api to backend, everything else to frontend)
# ============================================================

cat > "$PROJECT_DIR/nginx-api.conf" << NGINXCONF
server {
    listen 80;
    server_name ${PROJECT_NAME}.apps.elkayam.me;

    location /api/ {
        proxy_pass http://127.0.0.1:${PROJECT_PORT}1/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:${PROJECT_PORT};
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
NGINXCONF

# ============================================================
# GITIGNORE
# ============================================================

cat > "$PROJECT_DIR/.gitignore" << 'EOF'
node_modules/
dist/
build/
.env
.DS_Store
EOF

echo ""
echo "========================================"
echo "   Arcade Project Built!"
echo "========================================"
echo ""
echo "  Frontend: React + Vite (Game Lobby, 2 games)"
echo "  Backend:  Express + lowdb (JSON storage)"
echo "  Games:    Sky Jumper, Memory Match"
echo "  URL:      https://arcade.apps.elkayam.me"
echo ""
echo "  Push to deploy:"
echo "    cd $PROJECT_DIR"
echo "    git init && git add . && git commit -m 'Arcade project'"
echo "    cd ../.."
echo "    ./sync-push.sh"
echo ""
