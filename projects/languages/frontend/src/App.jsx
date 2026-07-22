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
    hebrew: { name: 'עברית', active: true },
    english: { name: 'English', active: false },
    spanish: { name: 'Español', active: false },
    french: { name: 'Français', active: false }
  })
  const [currentLanguage, setCurrentLanguage] = useState('he')
  const navigate = useNavigate()

  useEffect(() => {
    fetchLanguageSettings()
  }, [])

  const fetchLanguageSettings = async () => {
    try {
      const response = await fetch('http://127.0.0.1:30071/api/settings')
      if (response.ok) {
        const data = await response.json()
        setLanguageSettings(data.languageSettings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleLanguageChange = async (lang) => {
    try {
      const response = await fetch('http://127.0.0.1:30071/api/current-language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
      })
      if (response.ok) {
        setCurrentLanguage(lang)
        navigate('/')
      }
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  return (
    <header className="header">
      <div className="container header-content">
        <h1 className="logo">
          <Link to="/">LanguageTalk</Link>
        </h1>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/conversation" className="nav-link">Conversation</Link>
          <Link to="/vocabulary" className="nav-link">Vocabulary</Link>
          <Link to="/progress" className="nav-link">Progress</Link>
        </nav>
        <div className="language-selector">
          {Object.entries(languageSettings).map(([key, lang]) => (
            <button
              key={key}
              className={`lang-btn ${key === currentLanguage && lang.active ? 'active' : ''}`}
              onClick={() => lang.active && handleLanguageChange(key)}
              disabled={!lang.active}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
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
        fetch('http://127.0.0.1:30071/api/conversations'),
        fetch('http://127.0.0.1:30071/api/words?language=he'),
        fetch('http://127.0.0.1:30071/api/progress')
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
        <h2>Welcome to LanguageTalk</h2>
        <p className="subtitle">Learn languages through conversation, practice vocabulary, and track your progress</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <h3>Conversations</h3>
          {loading ? <div className="loading"><span></span><span></span><span></span></div> : <p className="stat-number">{stats.conversations}</p>}
        </div>
        <div className="stat-card card">
          <h3>Words Learned</h3>
          {loading ? <div className="loading"><span></span><span></span><span></span></div> : <p className="stat-number">{stats.words}</p>}
        </div>
        <div className="stat-card card">
          <h3>Progress Sessions</h3>
          {loading ? <div className="loading"><span></span><span></span><span></span></div> : <p className="stat-number">{stats.progress}</p>}
        </div>
      </div>

      <div className="actions">
        <Link to="/conversation" className="btn btn-primary btn-large">Start Conversation</Link>
        <Link to="/vocabulary" className="btn btn-secondary btn-large">Learn Vocabulary</Link>
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:30071/api/conversations')
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

    // Simulate AI response (would be replaced with real AI API)
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: currentConversation.language === 'he' 
          ? 'תודה על השיחה! נמשיך בעוד משפט בעברית...' 
          : 'Thanks for the conversation! Let me continue with an English sentence...',
        timestamp: new Date().toISOString()
      }

      setCurrentConversation(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }))
      setIsThinking(false)
    }, 1000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="container conversation">
      <h2>Conversation Mode</h2>
      <div className="conversation-container card">
        <div className="messages">
          {currentConversation.messages.length === 0 && (
            <div className="no-messages">Start a conversation!</div>
          )}
          {currentConversation.messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <span className="role-label">{msg.role}</span>
              <span className="message-content">{msg.content}</span>
              <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
          {isThinking && (
            <div className="message assistant loading">
              <span>AI is thinking...</span>
            </div>
          )}
        </div>

        <form className="input-area" onSubmit={handleSubmit}>
          <button 
            type="button"
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? '🔴' : '🎤'}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isRecording || isThinking}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || isRecording || isThinking}>
            Send
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
      const response = await fetch('http://127.0.0.1:30071/api/words?language=he')
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
      await fetch('http://127.0.0.1:30071/api/words', {
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
      <h2>Vocabulary</h2>

      {showForm && (
        <form className="add-word-form card" onSubmit={handleAddWord}>
          <h3>Add New Word</h3>
          <input
            type="text"
            placeholder="Word"
            value={newWord.word}
            onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
          />
          <input
            type="text"
            placeholder="Translation"
            value={newWord.translation}
            onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
          />
          <input
            type="text"
            placeholder="Pronunciation (optional)"
            value={newWord.pronunciation}
            onChange={(e) => setNewWord({ ...newWord, pronunciation: e.target.value })}
          />
          <input
            type="text"
            placeholder="Examples (comma separated)"
            value={newWord.examples}
            onChange={(e) => setNewWord({ ...newWord, examples: e.target.value })}
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Add Word</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Word
        </button>
      )}

      {loading ? (
        <div className="loading">Loading words...</div>
      ) : (
        <div className="words-grid">
          {words.map((word) => (
            <div key={word.id} className="word-card card">
              <div className="word-content">
                <h3 className="word-word">{word.word}</h3>
                <p className="word-translation">{word.translation}</p>
                {word.pronunciation && (
                  <p className="word-pronunciation">{word.pronunciation}</p>
                )}
              </div>
              {word.examples.length > 0 && (
                <div className="word-examples">
                  <span className="examples-label">Examples:</span>
                  <ul>
                    {word.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}
              <span className={`learned-badge ${word.learned ? 'success' : ''}`}>
                {word.learned ? '✓ Learned' : 'New'}
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
      const response = await fetch('http://127.0.0.1:30071/api/progress')
      if (response.ok) {
        const data = await response.json()
        setProgress(data)
        
        // Calculate today's progress
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
      await fetch('http://127.0.0.1:30071/api/progress', {
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
      <h2>Learning Progress</h2>

      <div className="progress-summary">
        <div className="progress-card card">
          <h3>Today's Progress</h3>
          <p className="progress-value">{todayProgress} min</p>
        </div>
      </div>

      <button className="btn btn-primary" onClick={startSession}>
        + Start Learning Session
      </button>

      <div className="progress-history">
        <h3>Session History</h3>
        {loading ? (
          <div className="loading">Loading history...</div>
        ) : (
          <div className="history-list">
            {progress.slice().reverse().map((entry) => (
              <div key={entry.id} className="history-item card">
                <div className="history-info">
                  <span className="history-date">{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="history-time">{new Date(entry.date).toLocaleTimeString()}</span>
                </div>
                <div className="history-stats">
                  <div className="history-stat">
                    <span>Conversations:</span>
                    <span>{entry.conversationsCompleted}</span>
                  </div>
                  <div className="history-stat">
                    <span>Words Learned:</span>
                    <span>{entry.wordsLearned}</span>
                  </div>
                  <div className="history-stat">
                    <span>Time:</span>
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
