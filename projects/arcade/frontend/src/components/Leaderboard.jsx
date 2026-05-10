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
