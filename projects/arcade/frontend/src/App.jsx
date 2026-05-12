import { useState, useEffect } from "react";
import GameLobby from "./components/GameLobby";
import PlayerSelect from "./components/PlayerSelect";
import SkyJumper from "./components/SkyJumper";
import MemoryMatch from "./components/MemoryMatch";
import TetrisGame from "./components/TetrisGame";
import Leaderboard from "./components/Leaderboard";

const API = "/api";

const GAMES = [
  {
    id: "sky-jumper",
    name: "🚀 Sky Jumper",
    color: "#6366f1",
    desc: "Jump as high as you can!",
  },
  {
    id: "memory-match",
    name: "🧠 Memory Match",
    color: "#8b5cf6",
    desc: "Find matching pairs!",
  },
  {
    id: "tetris",
    name: "🧱 Tetris",
    color: "#00d4ff",
    desc: "Classic block-stacking fun!",
  },
];

const AVATARS = ["🦊", "🐼", "🦁", "🐯", "🐸", "🦄", "🐉", "🐙", "🦋", "🐨"];

function App() {
  const [screen, setScreen] = useState("player-select");
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetchPlayers();
    fetchScores();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${API}/players`);
      const data = await res.json();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch players:", e);
    }
  };

  const fetchScores = async () => {
    try {
      const res = await fetch(`${API}/scores`);
      const data = await res.json();
      setScores(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch scores:", e);
    }
  };

  const registerPlayer = async (username, avatar) => {
    try {
      const res = await fetch(`${API}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, avatar }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to register");
      }

      const player = await res.json();
      await fetchPlayers();
      setCurrentPlayer(player);
      setScreen("lobby");
    } catch (e) {
      console.error("Registration failed:", e);
      throw e;
    }
  };

  const selectPlayer = (player) => {
    setCurrentPlayer(player);
    setScreen("lobby");
  };

  const playGame = (game) => {
    setSelectedGame(game);
    setScreen("game");
  };

  const submitScore = async (gameId, score) => {
    try {
      await fetch(`${API}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: currentPlayer.id, gameId, score }),
      });
      await fetchScores();
    } catch (e) {
      console.error("Failed to submit score:", e);
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Stars background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "2px",
              height: "2px",
              background: "white",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              🕹️ Family Arcade
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {screen !== "player-select" && (
              <button
                className="btn-secondary"
                onClick={() => setScreen("lobby")}
              >
                ← Lobby
              </button>
            )}
            {screen !== "game" && screen !== "leaderboard" && (
              <button
                className="btn-secondary"
                onClick={() => setScreen("leaderboard")}
              >
                🏆 Scores
              </button>
            )}
          </div>
        </header>

        {/* Screens */}
        {screen === "player-select" && (
          <PlayerSelect
            players={players}
            avatars={AVATARS}
            onSelect={selectPlayer}
            onRegister={registerPlayer}
          />
        )}

        {screen === "lobby" && currentPlayer && (
          <GameLobby
            player={currentPlayer}
            games={GAMES}
            scores={scores}
            onPlay={playGame}
            onBack={() => {
              setCurrentPlayer(null);
              setScreen("player-select");
            }}
          />
        )}

        {screen === "game" &&
          selectedGame &&
          currentPlayer &&
          (selectedGame.id === "sky-jumper" ? (
            <SkyJumper player={currentPlayer} onScore={submitScore} />
          ) : selectedGame.id === "memory-match" ? (
            <MemoryMatch player={currentPlayer} onScore={submitScore} />
          ) : selectedGame.id === "tetris" ? (
            <TetrisGame player={currentPlayer} onScore={submitScore} />
          ) : null)}

        {screen === "leaderboard" && (
          <Leaderboard players={players} scores={scores} games={GAMES} />
        )}
      </div>
    </div>
  );
}

export default App;
