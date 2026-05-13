import { useState } from "react";

function PlayerSelect({ players, avatars, onSelect, onRegister, onDelete }) {
  const [mode, setMode] = useState("list");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!username.trim()) {
      setError("Please enter a name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onRegister(username.trim(), avatar);
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        animation: "slideUp 0.3s ease",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "2rem",
          marginBottom: "2rem",
          color: "#8b5cf6",
        }}
      >
        Who's playing?
      </h2>

      {mode === "list" && (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
              marginBottom: "2rem",
            }}
          >
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "2px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  minWidth: "150px",
                  position: "relative",
                }}
              >
                {players.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(player);
                    }}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(239,68,68,0.2)",
                      border: "1px solid rgba(239,68,68,0.4)",
                      borderRadius: "8px",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "4px 8px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    ✕
                  </button>
                )}
                <span
                  onClick={() => onSelect(player)}
                  style={{ fontSize: "3rem", cursor: "pointer" }}
                >
                  {player.avatar || "🦊"}
                </span>
                <span
                  onClick={() => onSelect(player)}
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                  }}
                >
                  {player.username}
                </span>
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            style={{ display: "block", width: "100%" }}
            onClick={() => setMode("register")}
          >
            ➕ New Player
          </button>
        </>
      )}

      {mode === "register" && (
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
            padding: "2rem",
          }}
        >
          <h3 style={{ marginBottom: "1rem", color: "#8b5cf6" }}>New Player</h3>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255,255,255,0.1)",
                border: "2px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                color: "white",
                fontSize: "1rem",
              }}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Choose avatar
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {avatars.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  style={{
                    fontSize: "2rem",
                    padding: "0.5rem",
                    background:
                      avatar === a ? "rgba(99,102,241,0.3)" : "transparent",
                    borderRadius: "10px",
                    border: avatar === a ? "2px solid #6366f1" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              style={{
                color: "#ef4444",
                marginBottom: "1rem",
                padding: "0.5rem",
                background: "rgba(239,68,68,0.1)",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn-secondary"
              onClick={() => {
                setMode("list");
                setError("");
              }}
            >
              Back
            </button>
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={handleRegister}
              disabled={loading || !username.trim()}
            >
              {loading ? "⏳ Registering..." : "Register & Play"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerSelect;
