function GameLobby({ player, games, scores, onPlay, onBack }) {
  const getPlayerStats = () => {
    const playerScores = scores.filter((s) => s.playerId === player.id);
    const totalPlays = playerScores.reduce(
      (sum, s) => sum + (s.playCount || 1),
      0,
    );
    const bestScore = playerScores.length
      ? Math.max(...playerScores.map((s) => s.score))
      : 0;
    return { totalPlays, bestScore };
  };

  const stats = getPlayerStats();

  return (
    <div
      style={{
        padding: "1rem",
        maxWidth: "900px",
        margin: "0 auto",
        animation: "slideUp 0.3s ease",
      }}
    >
      {/* Player info with back button */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <button onClick={onBack} className="btn-secondary">
          ← Players
        </button>

        <div className="player-avatar" style={{ margin: "0" }}>
          {player.avatar || "🦊"}
        </div>

        <div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            Hey, {player.username}!
          </h2>
          <p style={{ color: "#888" }}>Choose a game</p>
        </div>
      </div>

      {stats.totalPlays > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#888", marginBottom: "0.5rem" }}>
              Games Played
            </p>
            <p
              style={{ fontSize: "2rem", fontWeight: "bold", color: "#6366f1" }}
            >
              {stats.totalPlays}
            </p>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#888", marginBottom: "0.5rem" }}>Best Score</p>
            <p
              style={{ fontSize: "2rem", fontWeight: "bold", color: "#22c55e" }}
            >
              {stats.bestScore}
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            style={{ "--card-color": game.color }}
            onClick={() => onPlay(game)}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              {game.name.split(" ")[0]}
            </div>
            <h3
              style={{
                fontSize: "1.3rem",
                marginBottom: "0.5rem",
                color: game.color,
              }}
            >
              {game.name}
            </h3>
            <p style={{ color: "#888" }}>{game.desc}</p>
            <button className="btn-primary" style={{ marginTop: "1rem" }}>
              ▶ Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameLobby;
