import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = '/app/data/data.json';
const DEFAULT_DATA = {
  conversations: [],
  words: [],
  progress: [],
  currentLanguage: 'he',
  languageSettings: {
    hebrew: { name: 'עברית', active: true },
    english: { name: 'English', active: false },
    spanish: { name: 'Español', active: false },
    french: { name: 'Français', active: false }
  }
};

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

// ===== Health =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'languages', uptime: process.uptime() });
});

// ===== Language Settings =====
app.get('/api/settings', (req, res) => {
  res.json(loadData().languageSettings);
});

app.put('/api/settings', (req, res) => {
  const data = loadData();
  data.languageSettings = req.body.languageSettings;
  saveData(data);
  res.json({ success: true, languageSettings: data.languageSettings });
});

// ===== Current Language =====
app.get('/api/current-language', (req, res) => {
  res.json({ language: loadData().currentLanguage });
});

app.put('/api/current-language', (req, res) => {
  const data = loadData();
  data.currentLanguage = req.body.language;
  saveData(data);
  res.json({ success: true, language: data.currentLanguage });
});

// ===== Conversations =====
app.get('/api/conversations', (req, res) => {
  res.json(loadData().conversations || []);
});

app.get('/api/conversations/:id', (req, res) => {
  const conversations = loadData().conversations || [];
  const conversation = conversations.find(c => c.id === req.params.id);
  if (!conversation) return res.status(404).json({ error: 'Not found' });
  res.json(conversation);
});

app.post('/api/conversations', (req, res) => {
  const data = loadData();
  const conversation = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    messages: [],
    ...req.body
  };
  (data.conversations || (data.conversations = [])).push(conversation);
  saveData(data);
  res.status(201).json(conversation);
});

app.put('/api/conversations/:id', (req, res) => {
  const data = loadData();
  const arr = data.conversations || [];
  const idx = arr.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  arr[idx] = { ...arr[idx], ...req.body };
  saveData(data);
  res.json(arr[idx]);
});

app.delete('/api/conversations/:id', (req, res) => {
  const data = loadData();
  data.conversations = (data.conversations || []).filter(c => c.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// ===== Words =====
app.get('/api/words', (req, res) => {
  const data = loadData();
  const currentLang = req.query.language || data.currentLanguage;
  const words = (data.words || []).filter(w => w.language === currentLang);
  res.json(words);
});

app.post('/api/words', (req, res) => {
  const data = loadData();
  const word = {
    id: Date.now().toString(),
    language: data.currentLanguage,
    word: '',
    translation: '',
    pronunciation: '',
    examples: [],
    learned: false,
    ...req.body
  };
  (data.words || (data.words = [])).push(word);
  saveData(data);
  res.status(201).json(word);
});

app.put('/api/words/:id', (req, res) => {
  const data = loadData();
  const arr = data.words || [];
  const idx = arr.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  arr[idx] = { ...arr[idx], ...req.body };
  saveData(data);
  res.json(arr[idx]);
});

app.delete('/api/words/:id', (req, res) => {
  const data = loadData();
  data.words = (data.words || []).filter(w => w.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// ===== Progress =====
app.get('/api/progress', (req, res) => {
  res.json(loadData().progress || []);
});

app.post('/api/progress', (req, res) => {
  const data = loadData();
  const entry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    conversationsCompleted: 0,
    wordsLearned: 0,
    minutesSpent: 0,
    ...req.body
  };
  (data.progress || (data.progress = [])).push(entry);
  saveData(data);
  res.status(201).json(entry);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Languages API running on port ${PORT}`);
});
