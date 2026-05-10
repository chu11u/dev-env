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
