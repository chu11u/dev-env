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
