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
