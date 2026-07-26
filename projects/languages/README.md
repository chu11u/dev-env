# LanguageTalk (Lingo) - Language Learning Conversation App

A web-based language learning application designed to help users improve their language skills through conversation practice, vocabulary building, and progress tracking.

**Primary use case**: Help a child improve Hebrew spelling by chatting with an AI that gently corrects misspellings.

## Features

- 🌍 **Multi-language Support**: Hebrew, English, Spanish, French
- 💬 **Conversation Mode**: AI-powered conversations with spelling correction
- 📚 **Vocabulary Building**: Add and track new words with translations and examples
- 📊 **Progress Tracking**: Monitor your learning journey with session history
- 🎯 **Progress Dashboard**: View your daily and total progress

## Tech Stack

- **Frontend**: React 18, Vite, React Router DOM
- **Backend**: Node.js, Express.js
- **AI**: OpenRouter API (DeepSeek V3) with fallback logic
- **Deployment**: Docker Compose on Games server (192.168.131.134)
- **URL**: http://lingo.elkayam.fun (via nginx)

## Project Structure

```
languages/
├── docker-compose.yml
├── .env                    # OPENROUTER_API_KEY (gitignored)
├── nginx.lingo.elkayam.fun.conf
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js      # Dev proxy + preview config
│   ├── Dockerfile
│   └── src/
│       ├── main.jsx
│       ├── App.jsx          # All components in single file
│       └── index.css
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── data/
│       └── data.json
└── README.md
```

## Deployment

### Access URLs

- Frontend: `http://192.168.131.134:3007/` (or http://lingo.elkayam.fun via nginx)
- Backend API: `http://192.168.131.134:30071/`

### Deploy Commands

```bash
# From Mac
cd ~/Environments/Zed/dev-env
git add projects/languages
git commit -m "description"
git push

# Deploy to Games server
~/Environments/Zed/HomeLab/scripts/ssh.sh games "cd /home/elkayam/dev-env && git pull && cd projects/languages && docker compose down && docker compose build --no-cache && docker compose up -d"
```

### Environment Variables

The backend requires an OpenRouter API key. The `.env` file must exist on the Games server at `/home/elkayam/dev-env/projects/languages/.env`:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

This file is gitignored for security. If missing after deploy, create it:
```bash
~/Environments/Zed/HomeLab/scripts/ssh.sh games "echo 'OPENROUTER_API_KEY=your-key' > /home/elkayam/dev-env/projects/languages/.env"
```

## Configuration

### AI Model Settings

The backend supports multiple AI backends via `conversationSettings.model` in `data.json`:

- **`hybrid`** (default) → Routes to OpenRouter directly
- **`openrouter`** → OpenRouter API (DeepSeek V3 default)
- **`openai`** → OpenAI API (requires OPENAI_API_KEY)
- **`local`** → Routes to OpenRouter (Ollama not available in Docker)

### Port Configuration

Edit `docker-compose.yml` to change ports:
- Frontend: `3007` → container `4173` (vite preview)
- Backend: `30071` → container `3001` (express)

### Language Settings

Edit `backend/data/data.json` to:
- Set default language (`currentLanguage`)
- Enable/disable languages (`languageSettings`)
- Customize language names

## Changelog (2026-07-26)

### Bugs Fixed

1. **`OPENAI_API_KEY` ReferenceError** — Variable was referenced (server.js:43) but never declared. Added declaration on line 17.

2. **No API key in Docker container** — `docker-compose.yml` had no `env_file` directive. Added `env_file: .env` to backend service.

3. **Ollama not in Docker** — `generateLocalResponse()` tried to `spawn('ollama')` inside a `node:20-alpine` container where Ollama doesn't exist. Simplified hybrid mode to skip Ollama and route directly to OpenRouter.

4. **Hardcoded localhost URLs** — Frontend had 13 hardcoded `http://127.0.0.1:30071/api/` URLs. Replaced with relative `/api/` paths (nginx proxies `/api/` to backend).

5. **Hebrew prompt weak on spelling** — Original prompt only said "gently correct without discouraging". Enhanced to explicitly detect and correct misspellings with formatted corrections (`המילה הנכונה היא: [word]`).

6. **No Vite dev proxy** — Added `proxy: { '/api': 'http://127.0.0.1:3001' }` to `vite.config.js` for local development.

### Files Changed

| File | Changes |
|------|---------|
| `backend/server.js` | +OPENAI_API_KEY declaration, simplified hybrid mode, improved Hebrew prompt, fixed config nesting, fixed validation, fixed default model ID |
| `docker-compose.yml` | +`env_file: .env` for backend |
| `frontend/src/App.jsx` | 13 hardcoded URLs → relative `/api/` paths, JSON error handling, collapsible model selector, auto-create conversation |
| `frontend/vite.config.js` | +dev proxy for `/api` |
| `frontend/src/index.css` | +collapsible model toggle styles |
| `.env` | Created with OpenRouter key (gitignored) |
| `.github/workflows/deploy-languages.yml` | Auto-deploy on push (needs secrets setup) |

### Verification Results (2026-07-26)

- [x] Backend health endpoint returns data — ✅ `http://192.168.131.134:30071/api/health` returns `{"status":"ok"}`
- [x] Frontend loads and renders correctly — ✅ Title: "🌟 LingoTalk - Learn Languages Through Fun! 🌟"
- [x] Conversation flow works end-to-end — ✅ Hebrew message → AI response generated via OpenRouter
- [x] OpenRouter model ID fixed — Changed from invalid `deepseek/deepseek-v3` to `deepseek/deepseek-chat`
- [x] `conversationId: null` error — Backend now accepts null conversation IDs
- [x] Config nesting bug — Fixed PUT /api/conversation-config duplicate keys
- [x] Auto-create conversation — Frontend creates conversation before first message
- [ ] Hebrew spelling correction actually triggers on misspelled words (needs manual testing)
- [ ] Nginx config deployed on Games server for http://lingo.elkayam.fun
- [ ] GitHub Actions auto-deploy workflow secrets configured (GAMES_HOST, GAMES_SSH_KEY, OPENROUTER_API_KEY)

### Diagnostic Tools

- `HomeLab/scripts/lingo-diagnose.sh` — Runs remote diagnostics, saves results to `HomeLab/tmp-lingo-check/`
- `HomeLab/scripts/lingo-deploy.py` — Deploy script (writes results to files)
- `HomeLab/tmp-lingo-check/TERMINAL_TOOL_FAILURES.md` — Documents terminal tool SSH limitation

## License

MIT
