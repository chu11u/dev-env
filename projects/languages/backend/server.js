import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = '/app/data/data.json';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

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
  },
  conversationSettings: {
    model: 'hybrid', // 'local', 'openai', 'openrouter', 'hybrid'
    useOpenRouter: false,
    openRouterModel: 'deepseek/deepseek-v3'
  }
};

// ===== Health =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    project: 'languages', 
    uptime: process.uptime(),
    openaiConfigured: !!OPENAI_API_KEY
  });
});

// ===== Configuration =====
app.get('/api/settings', (req, res) => {
  res.json(loadData().languageSettings);
});

app.put('/api/settings', (req, res) => {
  const data = loadData();
  data.languageSettings = req.body.languageSettings;
  saveData(data);
  res.json({ success: true, languageSettings: data.languageSettings });
});

app.get('/api/conversation-config', (req, res) => {
  const data = loadData();
  res.json({
    currentLanguage: data.currentLanguage,
    conversationSettings: data.conversationSettings,
    languageSettings: data.languageSettings
  });
});

app.put('/api/conversation-config', (req, res) => {
  const data = loadData();
  // Accept both {conversationSettings: {...}} and flat {model: ...} payloads
  const incoming = req.body.conversationSettings || req.body;
  data.conversationSettings = {
    ...(data.conversationSettings || {}),
    ...incoming
  };
  saveData(data);
  res.json({ success: true, conversationSettings: data.conversationSettings });
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
    language: data.currentLanguage,
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

// ===== Generate AI Response =====
app.post('/api/generate-response', async (req, res) => {
  const { message, conversationId, language } = req.body;
  
  if (!message || !conversationId) {
    return res.status(400).json({ error: 'Missing message or conversationId' });
  }

  const data = loadData();
  const conversationSettings = data.conversationSettings;
  const convos = data.conversations || [];
  const conversation = convos.find(c => c.id === conversationId);

  const systemPrompt = buildSystemPrompt(language);

  try {
    let response;
    
    if (conversationSettings.model === 'openai') {
      response = await generateOpenAIResponse(message, conversation?.messages || [], systemPrompt);
    } else if (conversationSettings.model === 'openrouter' || conversationSettings.model === 'local' || conversationSettings.model === 'hybrid') {
      // hybrid/local: skip Ollama (not in container), go straight to OpenRouter
      response = await generateOpenRouterResponse(message, conversation?.messages || [], systemPrompt, conversationSettings.openRouterModel);
    }

    if (conversation) {
      conversation.messages.push(
        { id: Date.now().toString() + '-u', role: 'user', content: message, timestamp: new Date().toISOString() },
        { id: Date.now().toString() + '-a', role: 'assistant', content: response, timestamp: new Date().toISOString() }
      );
      saveData(data);
    }

    res.json({ response });
  } catch (error) {
    console.error('AI generation failed:', error.message);
    res.status(500).json({ error: 'Failed to generate response: ' + error.message });
  }
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

// ===== Helper Functions =====
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

function buildSystemPrompt(language) {
  const prompts = {
    hebrew: `You are a friendly Hebrew conversation partner helping a child learn Hebrew.
    Your main goal is to help the child improve their Hebrew spelling.
    Rules:
    - Write ONLY in Hebrew (no English, no mixing)
    - Keep responses simple and encouraging
    - Use common words and phrases
    - Be friendly and patient
    - PAY ATTENTION TO SPELLING: If the child misspells a word, gently show the correct spelling. Format corrections like: "המילה הנכונה היא: [word]" (The correct word is: [word])
    - For small typos, just continue the conversation naturally using the correct spelling
    - For repeated mistakes, gently point out the pattern
    - Use context from previous messages
    - Keep responses short (1-2 sentences)
    - Ask follow-up questions to keep the conversation going

    Examples:
    User: שלום, מה שלומך?
    AI: שלום! אני בסדר, תודה! ואתה? מה שלומך היום?
    User: אני למד בבית ספר
    AI: יפה מאוד! "למדת" בבית ספר 😊 מה למדת היום?
    User: למדתי מתמטיקה
    AI: מתמטика זה כיף! אתה אוהב מתמטיקה?`,

    english: `You are a friendly English conversation partner helping a child learn English.
    Rules:
    - Write ONLY in English (no Hebrew, no mixing)
    - Keep responses simple and encouraging
    - Use common words and basic grammar
    - Be friendly and patient
    - If child makes a mistake, gently correct without discouraging
    - Use context from previous messages
    - Keep responses short (1-2 sentences)

    Examples:
    User: What is your favorite color?
    AI: That's great! What is your favorite color, please?
    User: Blue
    AI: Blue is beautiful! What is your name?`,

    spanish: `You are a friendly Spanish conversation partner helping a child learn Spanish.
    Rules:
    - Write ONLY in Spanish (no English, no mixing)
    - Keep responses simple and encouraging
    - Use common words and basic grammar
    - Be friendly and patient
    - If child makes a mistake, gently correct without discouraging
    - Use context from previous messages
    - Keep responses short (1-2 sentences)

    Examples:
    User: ¿Cuál es tu color favorito?
    AI: ¡Qué bien! ¿Cuál es tu color favorito, por favor?
    User: Azul
    AI: ¡El azul es hermoso! ¿Cómo te llamas?`,

    french: `You are a friendly French conversation partner helping a child learn French.
    Rules:
    - Write ONLY in French (no English, no mixing)
    - Keep responses simple and encouraging
    - Use common words and basic grammar
    - Be friendly and patient
    - If child makes a mistake, gently correct without discouraging
    - Use context from previous messages
    - Keep responses short (1-2 sentences)

    Examples:
    User: Quel est ton couleur préférée?
    AI: C'est génial! Quelle est votre couleur préférée, s'il vous plaît?
    User: Bleu
    AI: Le bleu est magnifique! Comment tu t'appelles?`
  };

  return prompts[language] || prompts.english;
}

async function generateLocalResponse(message, context, systemPrompt) {
  try {
    const checkProcess = spawn('which', ['ollama']);
    checkProcess.on('close', (code) => {
      if (code !== 0) throw new Error('Ollama not installed');
    });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...context.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    const ollamaProcess = spawn('ollama', ['run', 'llama3', '--format', 'json']);

    return new Promise((resolve, reject) => {
      let output = '';
      let error = '';

      ollamaProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      ollamaProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      ollamaProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Ollama error: ${error}`));
          return;
        }

        try {
          const response = JSON.parse(output);
          const text = response.response || output;
          resolve(text);
        } catch (e) {
          const text = output.trim().replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          resolve(text || output);
        }
      });

      ollamaProcess.stdin.write(JSON.stringify(messages));
      ollamaProcess.stdin.end();
    });
  } catch (error) {
    throw new Error(`Local generation failed: ${error.message}`);
  }
}

async function generateOpenAIResponse(message, context, systemPrompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateOpenRouterResponse(message, context, systemPrompt, model = 'deepseek/deepseek-v3') {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: message }
  ];

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 150,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenRouter API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Languages API running on port ${PORT}`);
});
