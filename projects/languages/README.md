# LanguageTalk - Language Learning Conversation App

A web-based language learning application designed to help users improve their language skills through conversation practice, vocabulary building, and progress tracking.

## Features

- 🌍 **Multi-language Support**: Hebrew, English, Spanish, French
- 💬 **Conversation Mode**: Practice speaking with simulated AI conversations
- 📚 **Vocabulary Building**: Add and track new words with translations and examples
- 📊 **Progress Tracking**: Monitor your learning journey with session history
- 🎯 **Progress Dashboard**: View your daily and total progress

## Tech Stack

- **Frontend**: React 18, Vite, React Router DOM
- **Backend**: Node.js, Express.js
- **Deployment**: Docker Compose

## Project Structure

```
languages/
├── docker-compose.yml
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── index.css
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── data/
│       └── data.json
└── README.md
```

## Development

### Local Development

```bash
cd frontend
npm install
npm run dev
```

### Build for Production

```bash
cd frontend
npm run build
```

## Deployment

### On Games Server

1. Add this project to your `projects/languages/` directory on the Games server

2. Commit and push changes to GitHub:
```bash
cd /Users/elnaor/Environments/Zed/dev-env
git add projects/languages
git commit -m "languages: initial version - Hebrew learning conversation app"
git push origin main
```

3. Deploy to server:
```bash
./scripts/ssh.sh games "cd /home/elkayam/dev-env && ./deploy-all.sh"
```

### Access URLs

- Frontend: `http://games:3007/` (internal)
- Backend API: `http://games:30071/`

## Configuration

### Port Configuration

Edit `docker-compose.yml` to change ports:
- Frontend: `3007` → `127.0.0.1:3007:3000`
- Backend: `30071` → `127.0.0.1:30071:3001`

### Language Settings

Edit `backend/data/data.json` to:
- Set default language
- Enable/disable languages
- Customize language names

## Usage

1. **Select Language**: Use the language selector in the header
2. **Start Conversation**: Go to Conversation tab to practice dialogues
3. **Build Vocabulary**: Add new words to your vocabulary list
4. **Track Progress**: Monitor your learning sessions

## Future Enhancements

- [ ] Real AI integration (OpenAI API)
- [ ] Voice recognition and speech synthesis
- [ ] Gamification elements (achievements, streaks)
- [ ] More language support
- [ ] Conversation templates and scenarios
- [ ] Offline mode support

## License

MIT
