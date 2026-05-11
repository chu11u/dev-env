import { useState, useEffect, useRef, useCallback } from "react";

// Platform types
const PLATFORM_NORMAL = 0;
const PLATFORM_MOVING = 1;
const PLATFORM_BREAKING = 2;

// Game config
const GRAVITY = 0.4;
const JUMP_FORCE = -12;
const MOVE_SPEED = 6;
const PLATFORM_WIDTH = 65;
const PLATFORM_HEIGHT = 10;
const PLAYER_SIZE = 18;

function SkyJumper({ player, onScore }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("menu"); // menu, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const keysRef = useRef({ left: false, right: false });
  const gameRef = useRef(null);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);

    // Player starts centered
    let px = W / 2;
    let py = H - 80;
    let pvx = 0;
    let pvy = 0;

    let gameScore = 0;
    let gameSpeed = 0.8;
    let running = true;

    // Generate platforms - first one is GUARANTEED under the player
    let platforms = [
      {
        x: W / 2 - PLATFORM_WIDTH / 2,
        y: H - 40,
        w: PLATFORM_WIDTH,
        h: PLATFORM_HEIGHT,
        type: PLATFORM_NORMAL,
        speed: 0,
        broken: false,
      },
    ];

    // Generate more platforms above
    for (let i = 1; i < 8; i++) {
      platforms.push({
        x: Math.random() * (W - PLATFORM_WIDTH),
        y: H - 40 - i * (H / 8),
        w: PLATFORM_WIDTH,
        h: PLATFORM_HEIGHT,
        type: Math.random() < 0.3 ? PLATFORM_MOVING : PLATFORM_NORMAL,
        speed: Math.random() * 2 + 1,
        broken: false,
      });
    }

    const animate = () => {
      if (!running) return;

      // Handle movement
      if (keysRef.current.left) px -= MOVE_SPEED;
      if (keysRef.current.right) px += MOVE_SPEED;

      // Wrap around edges
      if (px < 0) px = W - PLAYER_SIZE;
      if (px > W) px = 0 - PLAYER_SIZE;

      // Physics
      pvy += GRAVITY;
      py += pvy;

      // Platform movement
      platforms.forEach((p) => {
        if (p.type === PLATFORM_MOVING) {
          p.x += p.speed;
          if (p.x <= 0 || p.x + p.w >= W) p.speed *= -1;
        }
      });

      // Score
      gameScore = Math.floor(gameSpeed * 100);
      gameSpeed += 0.002;

      // Collision (only when falling)
      if (pvy > 0) {
        platforms.forEach((p) => {
          if (p.broken) return;
          if (
            px + PLAYER_SIZE > p.x &&
            px < p.x + p.w &&
            py + PLAYER_SIZE > p.y &&
            py + PLAYER_SIZE < p.y + p.h + pvy
          ) {
            if (p.type === PLATFORM_BREAKING) {
              p.broken = true;
            } else {
              pvy = JUMP_FORCE;
            }
          }
        });
      }

      // Screen scrolling
      if (py < H / 3) {
        const offset = H / 3 - py;
        py = H / 3;
        platforms.forEach((p) => (p.y += offset));
      }

      // Generate new platforms
      const minY = Math.min(...platforms.map((p) => p.y));
      if (minY > 30) {
        platforms.push({
          x: Math.random() * (W - PLATFORM_WIDTH),
          y: minY - H / 8,
          w: PLATFORM_WIDTH,
          h: PLATFORM_HEIGHT,
          type: Math.random() < 0.2 ? PLATFORM_MOVING : PLATFORM_NORMAL,
          speed: Math.random() * 2 + 1,
          broken: false,
        });
      }

      // Remove off-screen platforms
      platforms = platforms.filter((p) => p.y < H);

      // Game over
      if (py > H) {
        running = false;
        setScore(gameScore);
        const hs = parseInt(localStorage.getItem("skyJumperHS") || "0");
        if (gameScore > hs) {
          localStorage.setItem("skyJumperHS", gameScore.toString());
          setHighScore(gameScore);
        }
        setHighScore(Math.max(hs, gameScore));
        setGameState("gameover");
        onScore("sky-jumper", gameScore);
        return;
      }

      // Draw
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0a0a1a");
      grad.addColorStop(0.5, "#1a0a2e");
      grad.addColorStop(1, "#0a1a2e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Platforms
      platforms.forEach((p) => {
        if (p.broken) return;
        ctx.fillStyle = p.type === PLATFORM_MOVING ? "#22c55e" : "#6366f1";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.shadowBlur = 0;
      });

      // Player
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(
        px + PLAYER_SIZE / 2,
        py + PLAYER_SIZE / 2,
        PLAYER_SIZE / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Face
      ctx.fillStyle = "#000";
      ctx.fillRect(px + 4, py + 5, 4, 4);
      ctx.fillRect(px + PLAYER_SIZE - 8, py + 5, 4, 4);
      ctx.fillRect(px + 5, py + 11, PLAYER_SIZE - 10, 2);

      // Score
      ctx.fillStyle = "white";
      ctx.font = "bold 20px monospace";
      ctx.fillText(`Score: ${gameScore}`, 10, 30);
      ctx.font = "14px monospace";
      ctx.fillStyle = "#888";
      ctx.fillText(`Best: ${Math.max(hs, gameScore)}`, 10, 50);

      requestAnimationFrame(animate);
    };

    keysRef.current = { left: false, right: false };
    gameRef.current = { running };
    setGameState("playing");
    animate();
  }, [onScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA")
        keysRef.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD")
        keysRef.current.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA")
        keysRef.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD")
        keysRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Load high score
  useEffect(() => {
    setHighScore(parseInt(localStorage.getItem("skyJumperHS") || "0"));
  }, []);

  const handleTap = () => {
    if (gameState === "menu" || gameState === "gameover") {
      startGame();
    }
  };

  const handleTouchStart = (e) => {
    if (gameState !== "playing") return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    if (x < rect.width / 2) {
      keysRef.current.left = true;
      keysRef.current.right = false;
    } else {
      keysRef.current.left = false;
      keysRef.current.right = true;
    }
  };

  const handleTouchEnd = () => {
    keysRef.current.left = false;
    keysRef.current.right = false;
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "500px",
        margin: "0 auto",
        animation: "slideUp 0.3s ease",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "0.5rem",
          color: "#f59e0b",
        }}
      >
        🚀 Sky Jumper
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "#888",
          marginBottom: "0.5rem",
          fontSize: "0.9rem",
        }}
      >
        Desktop: ← → to move | Mobile: tap left/right side
      </p>
      {highScore > 0 && (
        <p
          style={{
            textAlign: "center",
            color: "#6366f1",
            marginBottom: "1rem",
            fontWeight: "bold",
          }}
        >
          🏆 Best: {highScore}
        </p>
      )}

      <canvas
        ref={canvasRef}
        width="500"
        height="600"
        style={{
          width: "100%",
          height: "auto",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "16px",
          border: "2px solid rgba(99,102,241,0.3)",
          touchAction: "none",
          cursor: gameState === "playing" ? "pointer" : "default",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      />

      {/* Mobile controls */}
      {gameState === "playing" && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "1rem",
            justifyContent: "center",
          }}
        >
          <button
            className="btn-primary"
            style={{
              flex: 1,
              padding: "1rem",
              fontSize: "1.5rem",
              userSelect: "none",
            }}
            onTouchStart={() => {
              keysRef.current.left = true;
            }}
            onTouchEnd={() => {
              keysRef.current.left = false;
            }}
            onMouseDown={() => {
              keysRef.current.left = true;
            }}
            onMouseUp={() => {
              keysRef.current.left = false;
            }}
            onMouseLeave={() => {
              keysRef.current.left = false;
            }}
          >
            ← Left
          </button>
          <button
            className="btn-primary"
            style={{
              flex: 1,
              padding: "1rem",
              fontSize: "1.5rem",
              userSelect: "none",
            }}
            onTouchStart={() => {
              keysRef.current.right = true;
            }}
            onTouchEnd={() => {
              keysRef.current.right = false;
            }}
            onMouseDown={() => {
              keysRef.current.right = true;
            }}
            onMouseUp={() => {
              keysRef.current.right = false;
            }}
            onMouseLeave={() => {
              keysRef.current.right = false;
            }}
          >
            Right →
          </button>
        </div>
      )}

      {gameState === "menu" && (
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            className="btn-primary"
            onClick={startGame}
            style={{ fontSize: "1.2rem", padding: "1rem 2rem" }}
          >
            🎮 Start Game
          </button>
        </div>
      )}

      {gameState === "gameover" && (
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <h3 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
            Game Over!
          </h3>
          <p style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
            Score: {score}{" "}
            {score >= highScore && score > 0 ? " 🎉 New High Score!" : ""}
          </p>
          <button
            className="btn-primary"
            onClick={startGame}
            style={{ fontSize: "1.2rem", padding: "1rem 2rem" }}
          >
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default SkyJumper;
