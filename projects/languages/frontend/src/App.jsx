import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/progress" element={<Progress />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function Header() {
  const [languageSettings, setLanguageSettings] = useState({
    hebrew: { name: 'עברית', active: true, emoji: '🇮🇱' },
    english: { name: 'English', active: false, emoji: '🇺🇸' },
    spanish: { name: 'Español', active: false, emoji: '🇪🇸' },
    french: { name: 'Français', active: false, emoji: '🇫🇷' }
  })
  const [conversationConfig, setConversationConfig] = useState({
    currentLanguage: 'he',
    conversationSettings: {
      model: 'hybrid',
      useOpenRouter: false,
      openRouterModel: 'deepseek/deepseek-v3'
    }
  })
  const [loading, setLoading] = useState(true)
  const [showModelOptions, setShowModelOptions] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchLanguageSettings()
    fetchConversationConfig()
  }, [])

  const fetchLanguageSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setLanguageSettings(data.languageSettings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const fetchConversationConfig = async () => {
    try {
      const response = await fetch('/api/conversation-config')
      if (response.ok) {
        const data = await response.json()
        setConversationConfig(data)
      }
    } catch (error) {
      console.error('Failed to fetch conversation config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = async (lang) => {
    try {
      await fetch('/api/current-language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
      })
      setConversationConfig(prev => ({ ...prev, currentLanguage: lang }))
      navigate('/')
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  const handleModelChange = async (model, useOpenRouter, openRouterModel) => {
    try {
      await fetch('/api/conversation-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationSettings: {
            model,
            useOpenRouter,
            openRouterModel
          }
        })
      })
      setConversationConfig(prev => ({
        ...prev,
        conversationSettings: {
          model,
          useOpenRouter,
          openRouterModel
        }
      }))
    } catch (error) {
      console.error('Failed to update model:', error)
    }
  }

  if (loading) return <div className="container">Loading...</div>

  return (
    <header className="header">
      <div className="container header-content">
        <h1 className="logo">
          <Link to="/">🌟 LingoTalk 🌟</Link>
        </h1>
        <nav className="nav">
          <Link to="/" className="nav-link">🏠 Home</Link>
          <Link to="/conversation" className="nav-link">💬 Chat</Link>
          <Link to="/vocabulary" className="nav-link">📚 Words</Link>
          <Link to="/progress" className="nav-link">📊 Progress</Link>
        </nav>
        <div className="language-selector">
          {Object.entries(languageSettings).map(([key, lang]) => (
            <button
              key={key}
              className={`lang-btn ${key === conversationConfig.currentLanguage && lang.active ? 'active' : ''}`}
              onClick={() => lang.active && handleLanguageChange(key)}
              disabled={!lang.active}
            >
              {lang.emoji} {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selector - Collapsible */}
      {conversationConfig.conversationSettings && (
        <div className="model-selector">
          <button
            className="model-toggle"
            onClick={() => setShowModelOptions(!showModelOptions)}
            type="button"
          >
            <span className="model-toggle-label">
              🤖 AI Model: <span className="model-toggle-current">{conversationConfig.conversationSettings.model === 'local' ? '🏠 Local' : conversationConfig.conversationSettings.model === 'openai' ? '🌐 OpenAI' : conversationConfig.conversationSettings.model === 'openrouter' ? '🚀 OpenRouter' : '⚡ Hybrid'}</span>
            </span>
            <span className={`model-toggle-arrow ${showModelOptions ? 'open' : ''}`}>▾</span>
          </button>
          {showModelOptions && (
            <div className="model-options">
              <label className={`model-option ${conversationConfig.conversationSettings.model === 'local' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="model"
                  value="local"
                  checked={conversationConfig.conversationSettings.model === 'local'}
                  onChange={() => handleModelChange('local', false, conversationConfig.conversationSettings.openRouterModel)}
                />
                <span className="radio-indicator"></span>
                <span className="model-name">🏠 Local (Fast)</span>
                <span className="model-status">⚡ Free</span>
              </label>
              <label className={`model-option ${conversationConfig.conversationSettings.model === 'openai' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="model"
                  value="openai"
                  checked={conversationConfig.conversationSettings.model === 'openai'}
                  onChange={() => handleModelChange('openai', false, conversationConfig.conversationSettings.openRouterModel)}
                />
                <span className="radio-indicator"></span>
                <span className="model-name">🌐 OpenAI (Power)</span>
                <span className="model-status">✨ Best Quality</span>
              </label>
              <label className={`model-option ${conversationConfig.conversationSettings.model === 'openrouter' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="model"
                  value="openrouter"
                  checked={conversationConfig.conversationSettings.model === 'openrouter'}
                  onChange={() => handleModelChange('openrouter', true, conversationConfig.conversationSettings.openRouterModel)}
                />
                <span className="radio-indicator"></span>
                <span className="model-name">🚀 OpenRouter (Free)</span>
                <span className="model-status">🎯 DeepSeek Free</span>
              </label>
              <label className={`model-option ${conversationConfig.conversationSettings.model === 'hybrid' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="model"
                  value="hybrid"
                  checked={conversationConfig.conversationSettings.model === 'hybrid'}
                  onChange={() => handleModelChange('hybrid', false, conversationConfig.conversationSettings.openRouterModel)}
                />
                <span className="radio-indicator"></span>
                <span className="model-name">⚡⚡ Hybrid (Auto)</span>
                <span className="model-status">🎯 Best of Both</span>
              </label>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

function Home() {
  const [stats, setStats] = useState({ conversations: 0, words: 0, progress: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [convsResponse, wordsResponse, progressResponse] = await Promise.all([
        fetch('/api/conversations'),
        fetch('/api/words?language=he'),
        fetch('/api/progress')
      ])

      const convs = await convsResponse.json()
      const words = await wordsResponse.json()
      const progress = await progressResponse.json()

      setStats({
        conversations: convs.length,
        words: words.length,
        progress: progress.length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container home">
      <div className="hero">
        <h2>🎉 Welcome to LingoTalk! 🎉</h2>
        <p className="subtitle">Learn languages through fun conversations and exciting challenges!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <h3>💬 Conversations</h3>
          {loading ? <div className="loading"><span></span><span></span><span></span></div> : <p className="stat-number">{stats.conversations}</p>}
        </div>
        <div className="stat-card card">
          <h3>📚 Words Learned</h3>
          {loading ? <div className="loading"><span></span><span></span><span></span></div> : <p className="stat-number">{stats.words}</p>}
        </div>
        <div className="stat-card card">
          <h3>📊 Sessions</h3>
          {loading ? <div className="loading"><span></span><span></span><span></span></div> : <p className="stat-number">{stats.progress}</p>}
        </div>
      </div>

      <div className="actions">
        <Link to="/conversation" className="btn btn-primary btn-large">🚀 Start Chatting</Link>
        <Link to="/vocabulary" className="btn btn-secondary btn-large">📖 Learn New Words</Link>
      </div>
    </div>
  )
}

function Conversation() {
  const [currentConversation, setCurrentConversation] = useState({
    id: null,
    messages: []
  })
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modelStatus, setModelStatus] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const convos = await response.json()
        if (convos.length > 0) {
          setCurrentConversation(convos[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isRecording || isThinking) return

    const message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setCurrentConversation(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))
    setInput('')
    setIsThinking(true)
    setError('')
    setResponse('')

    try {
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationId: currentConversation.id,
          language: currentConversation.language || 'he'
        })
      })

      if (!response.ok) {
        let errorData = {}
        try { errorData = await response.json() } catch (e) {}
        throw new Error(errorData.error || 'Failed to generate response')
      }

      const data = await response.json()
      setResponse(data.response)
      setModelStatus(data.fallback === 'openrouter' ? '🔄 Switched to OpenRouter' : data.fallback === 'openai' ? '🌐 OpenAI Used' : '✅ Local Model')

      setTimeout(() => {
        setCurrentConversation(prev => ({
          ...prev,
          messages: [...prev.messages, {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString()
          }]
        }))
        setIsThinking(false)
        setResponse('')
      }, 1000)

    } catch (err) {
      setError(err.message)
      setIsThinking(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="container conversation">
      <h2>💬 Have Fun Conversations! 🌟</h2>
      <div className="conversation-container card">
        <div className="messages">
          {currentConversation.messages.length === 0 && (
            <div className="no-messages">
              <p>💬 Start talking and have fun!</p>
              <p style={{ marginTop: '1rem', opacity: 0.7 }}>Type your message and start chatting!</p>
            </div>
          )}
          {currentConversation.messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <span className="role-label">{msg.role === 'user' ? 'You' : 'AI Friend'}</span>
              <span className="message-content">{msg.content}</span>
              <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {isThinking && (
            <div className="message assistant loading">
              <span className="message-content">🤔 Thinking... ✨</span>
            </div>
          )}
          {response && !isThinking && (
            <div className="message assistant">
              <span className="role-label">AI Friend</span>
              <span className="message-content">{response}</span>
              <span className="model-status">{modelStatus}</span>
            </div>
          )}
          {error && (
            <div className="message assistant error">
              <span className="message-content">❌ {error}</span>
            </div>
          )}
        </div>

        <form className="input-area" onSubmit={handleSubmit}>
          <button
            type="button"
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={() => setIsRecording(!isRecording)}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="✍️ Type your message here..."
            disabled={isRecording || isThinking}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || isRecording || isThinking}>
            Send 💬
          </button>
        </form>
      </div>
    </div>
  )
}

function Vocabulary() {
  const [words, setWords] = useState([])
  const [newWord, setNewWord] = useState({ word: '', translation: '', pronunciation: '', examples: '' })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWords()
  }, [])

  const fetchWords = async () => {
    try {
      const response = await fetch('/api/words?language=he')
      if (response.ok) {
        setWords(await response.json())
      }
    } catch (error) {
      console.error('Failed to fetch words:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWord = async (e) => {
    e.preventDefault()
    const exampleArray = newWord.examples.split(',').map(s => s.trim()).filter(Boolean)

    try {
      await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: newWord.word,
          translation: newWord.translation,
          pronunciation: newWord.pronunciation,
          examples: exampleArray
        })
      })

      setWords([...words, {
        id: Date.now().toString(),
        language: 'he',
        word: newWord.word,
        translation: newWord.translation,
        pronunciation: newWord.pronunciation,
        examples: exampleArray,
        learned: false
      }])

      setNewWord({ word: '', translation: '', pronunciation: '', examples: '' })
      setShowForm(false)
      fetchWords()
    } catch (error) {
      console.error('Failed to add word:', error)
    }
  }

  return (
    <div className="container vocabulary">
      <h2>📚 Learn New Words! 🌈</h2>

      {showForm && (
        <form className="add-word-form card" onSubmit={handleAddWord}>
          <h3>➕ Add a New Word</h3>
          <input
            type="text"
            placeholder="🔤 Word (e.g., ילד)"
            value={newWord.word}
            onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
          />
          <input
            type="text"
            placeholder="🌐 Translation (e.g., child)"
            value={newWord.translation}
            onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
          />
          <input
            type="text"
            placeholder="🔊 Pronunciation (optional)"
            value={newWord.pronunciation}
            onChange={(e) => setNewWord({ ...newWord, pronunciation: e.target.value })}
          />
          <input
            type="text"
            placeholder="💡 Examples (comma separated)"
            value={newWord.examples}
            onChange={(e) => setNewWord({ ...newWord, examples: e.target.value })}
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">✅ Add Word</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              ❌ Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          🌟 + Add New Word
        </button>
      )}

      {loading ? (
        <div className="loading">📚 Loading words...</div>
      ) : (
        <div className="words-grid">
          {words.map((word) => (
            <div key={word.id} className="word-card card">
              <div className="word-content">
                <h3 className="word-word">{word.word}</h3>
                <p className="word-translation">{word.translation}</p>
                {word.pronunciation && (
                  <p className="word-pronunciation">🔊 {word.pronunciation}</p>
                )}
              </div>
              {word.examples.length > 0 && (
                <div className="word-examples">
                  <span className="examples-label">💡 Examples:</span>
                  <ul>
                    {word.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}
              <span className={`learned-badge ${word.learned ? 'success' : ''}`}>
                {word.learned ? '✅ Learned' : '🌟 New'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Progress() {
  const [progress, setProgress] = useState([])
  const [todayProgress, setTodayProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/progress')
      if (response.ok) {
        const data = await response.json()
        setProgress(data)
        
        const today = new Date().toISOString().split('T')[0]
        const todayEntry = data.find(p => p.date.startsWith(today))
        setTodayProgress(todayEntry?.minutesSpent || 0)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationsCompleted: 0,
          wordsLearned: 0,
          minutesSpent: 0
        })
      })
      fetchProgress()
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  return (
    <div className="container progress">
      <h2>📊 Your Learning Journey! 🎯</h2>

      <div className="progress-summary card">
        <h3>Today's Learning</h3>
        <p className="progress-value">{todayProgress} min</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          🌟 Keep up the great work!
        </p>
      </div>

      <button className="btn btn-primary" onClick={startSession}>
        🚀 Start Learning Session
      </button>

      <div className="progress-history">
        <h3>📜 Session History</h3>
        {loading ? (
          <div className="loading">📚 Loading history...</div>
        ) : (
          <div className="history-list">
            {progress.slice().reverse().map((entry) => (
              <div key={entry.id} className="history-item card">
                <div className="history-info">
                  <span className="history-date">📅 {new Date(entry.date).toLocaleDateString()}</span>
                  <span className="history-time">⏰ {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="history-stats">
                  <div className="history-stat">
                    <span>💬 Conversations</span>
                    <span>{entry.conversationsCompleted}</span>
                  </div>
                  <div className="history-stat">
                    <span>📚 Words</span>
                    <span>{entry.wordsLearned}</span>
                  </div>
                  <div className="history-stat">
                    <span>⏱️ Time</span>
                    <span>{entry.minutesSpent} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
