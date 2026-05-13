import { useState, useEffect, useRef } from "react";

// Tetromino definitions
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00d4ff",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#ffd700",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#9370db",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#32cd32",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#ff4444",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#4169e1",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#ff8c00",
  },
};

const TETROMINO_KEYS = Object.keys(TETROMINOES);

// Game config
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;
const SIDEBAR_W = 12; // blocks wide for sidebar
const CANVAS_W = (COLS + SIDEBAR_W) * BLOCK_SIZE;
const CANVAS_H = ROWS * BLOCK_SIZE;
const INITIAL_SPEED = 800;
const SPEED_INCREMENT = 50;
const MIN_SPEED = 100;
const POINTS = { 1: 100, 2: 300, 3: 500, 4: 800 };

function TetrisGame({ player, onScore }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("menu");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const gameRef = useRef(null);

  const createEmptyBoard = () =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(0));

  const getRandomTetromino = () => {
    const key =
      TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
    return { ...TETROMINOES[key], key };
  };

  const rotate = (matrix) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = matrix[r][c];
      }
    }
    return rotated;
  };

  const isValidMove = (board, piece, offsetX, offsetY) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const newX = c + offsetX;
          const newY = r + offsetY;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
          if (newY >= 0 && board[newY][newX]) return false;
        }
      }
    }
    return true;
  };

  const mergePiece = (board, piece, offsetX, offsetY) => {
    const newBoard = board.map((row) => [...row]);
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const y = r + offsetY;
          const x = c + offsetX;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            newBoard[y][x] = piece.color;
          }
        }
      }
    }
    return newBoard;
  };

  const clearLines = (board) => {
    let linesCleared = 0;
    const newBoard = board.filter((row) => row.some((cell) => cell === 0));
    linesCleared = board.length - newBoard.length;
    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(0));
    }
    return { newBoard, linesCleared };
  };

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // All game state in a mutable object
    const game = {
      board: createEmptyBoard(),
      currentPiece: getRandomTetromino(),
      nextPiece: getRandomTetromino(),
      pieceX: Math.floor((COLS - getRandomTetromino().shape[0].length) / 2),
      pieceY: 0,
      gameScore: 0,
      gameLines: 0,
      gameLevel: 1,
      gameSpeed: INITIAL_SPEED,
      lastDrop: 0,
      speedBoost: false,
      running: true,
    };

    // Recalculate pieceX for the actual first piece
    game.pieceX = Math.floor((COLS - game.currentPiece.shape[0].length) / 2);

    if (!isValidMove(game.board, game.currentPiece, game.pieceX, game.pieceY)) {
      setGameState("gameover");
      return;
    }

    const drawBlock = (x, y, color, size = BLOCK_SIZE) => {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      ctx.shadowBlur = 0;
    };

    const drawBoard = () => {
      // Game area background
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, COLS * BLOCK_SIZE, CANVAS_H);

      // Sidebar background
      ctx.fillStyle = "#111122";
      ctx.fillRect(COLS * BLOCK_SIZE, 0, SIDEBAR_W * BLOCK_SIZE, CANVAS_H);

      // Grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * BLOCK_SIZE);
        ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
        ctx.stroke();
      }
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * BLOCK_SIZE, 0);
        ctx.lineTo(c * BLOCK_SIZE, CANVAS_H);
        ctx.stroke();
      }

      // Placed blocks
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (game.board[r][c]) drawBlock(c, r, game.board[r][c]);
        }
      }

      // Ghost piece
      let ghostY = game.pieceY;
      while (
        isValidMove(game.board, game.currentPiece, game.pieceX, ghostY + 1)
      )
        ghostY++;
      if (ghostY !== game.pieceY) {
        ctx.globalAlpha = 0.2;
        for (let r = 0; r < game.currentPiece.shape.length; r++) {
          for (let c = 0; c < game.currentPiece.shape[r].length; c++) {
            if (game.currentPiece.shape[r][c])
              drawBlock(game.pieceX + c, ghostY + r, game.currentPiece.color);
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // Current piece
      for (let r = 0; r < game.currentPiece.shape.length; r++) {
        for (let c = 0; c < game.currentPiece.shape[r].length; c++) {
          if (game.currentPiece.shape[r][c])
            drawBlock(
              game.pieceX + c,
              game.pieceY + r,
              game.currentPiece.color,
            );
        }
      }
    };

    const drawNextPiece = () => {
      const offsetX = COLS + 3;
      const offsetY = 3;

      // Next piece box
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(
        offsetX * BLOCK_SIZE,
        offsetY * BLOCK_SIZE,
        5 * BLOCK_SIZE,
        5 * BLOCK_SIZE,
      );
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.strokeRect(
        offsetX * BLOCK_SIZE,
        offsetY * BLOCK_SIZE,
        5 * BLOCK_SIZE,
        5 * BLOCK_SIZE,
      );

      for (let r = 0; r < game.nextPiece.shape.length; r++) {
        for (let c = 0; c < game.nextPiece.shape[r].length; c++) {
          if (game.nextPiece.shape[r][c])
            drawBlock(offsetX + c, offsetY + r, game.nextPiece.color);
        }
      }
    };

    const drawUI = () => {
      const x = COLS + 3;
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "bold 13px monospace";
      ctx.fillText("NEXT", x, 2.3 * BLOCK_SIZE);

      ctx.fillStyle = "white";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`${game.gameScore}`, x, 7.3 * BLOCK_SIZE);
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText("SCORE", x, 8.5 * BLOCK_SIZE);

      ctx.fillStyle = "white";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`${game.gameLines}`, x, 10.3 * BLOCK_SIZE);
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText("LINES", x, 11.5 * BLOCK_SIZE);

      ctx.fillStyle = "white";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`${game.gameLevel}`, x, 13.3 * BLOCK_SIZE);
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText("LEVEL", x, 14.5 * BLOCK_SIZE);
    };

    const drop = () => {
      if (
        isValidMove(game.board, game.currentPiece, game.pieceX, game.pieceY + 1)
      ) {
        game.pieceY++;
      } else {
        game.board = mergePiece(
          game.board,
          game.currentPiece,
          game.pieceX,
          game.pieceY,
        );
        const { newBoard, linesCleared } = clearLines(game.board);
        game.board = newBoard;

        if (linesCleared > 0) {
          game.gameLines += linesCleared;
          game.gameScore += (POINTS[linesCleared] || 0) * game.gameLevel;
          game.gameLevel = Math.floor(game.gameLines / 10) + 1;
          game.gameSpeed = Math.max(
            MIN_SPEED,
            INITIAL_SPEED - (game.gameLevel - 1) * SPEED_INCREMENT,
          );
        }

        game.currentPiece = game.nextPiece;
        game.nextPiece = getRandomTetromino();
        game.pieceX = Math.floor(
          (COLS - game.currentPiece.shape[0].length) / 2,
        );
        game.pieceY = 0;

        if (
          !isValidMove(game.board, game.currentPiece, game.pieceX, game.pieceY)
        ) {
          game.running = false;
          setScore(game.gameScore);
          setLines(game.gameLines);
          setLevel(game.gameLevel);

          const hs = parseInt(localStorage.getItem("tetrisHS") || "0");
          if (game.gameScore > hs) {
            localStorage.setItem("tetrisHS", game.gameScore.toString());
            setHighScore(game.gameScore);
          }

          setGameState("gameover");
          onScore("tetris", game.gameScore);
          return;
        }
      }
    };

    const gameLoop = (timestamp) => {
      if (!game.running) return;

      if (
        timestamp - game.lastDrop >
        (game.speedBoost ? game.gameSpeed / 10 : game.gameSpeed)
      ) {
        drop();
        game.lastDrop = timestamp;
      }

      if (game.running) {
        drawBoard();
        drawNextPiece();
        drawUI();
        requestAnimationFrame(gameLoop);
      }
    };

    gameRef.current = game;
    setGameState("playing");
    requestAnimationFrame(gameLoop);
  };

  // Keyboard controls
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e) => {
      const g = gameRef.current;
      if (!g || !g.running) return;

      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          e.preventDefault();
          if (isValidMove(g.board, g.currentPiece, g.pieceX - 1, g.pieceY))
            g.pieceX--;
          break;
        case "ArrowRight":
        case "KeyD":
          e.preventDefault();
          if (isValidMove(g.board, g.currentPiece, g.pieceX + 1, g.pieceY))
            g.pieceX++;
          break;
        case "ArrowDown":
        case "KeyS":
          e.preventDefault();
          g.speedBoost = true;
          break;
        case "ArrowUp":
        case "KeyW":
          e.preventDefault();
          const rotated = rotate(g.currentPiece.shape);
          const newPiece = { ...g.currentPiece, shape: rotated };
          if (isValidMove(g.board, newPiece, g.pieceX, g.pieceY))
            g.currentPiece = newPiece;
          break;
        case "Space":
          e.preventDefault();
          g.running = !g.running;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        gameRef.current.speedBoost = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  // Load high score on mount
  useEffect(() => {
    setHighScore(parseInt(localStorage.getItem("tetrisHS") || "0"));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameRef.current) gameRef.current.running = false;
    };
  }, []);

  // Touch controls
  const handleTouch = (e) => {
    const g = gameRef.current;
    if (gameState !== "playing" || !g) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (y < rect.height * 0.25) {
      // Top 25% — rotate
      const rotated = rotate(g.currentPiece.shape);
      const newPiece = { ...g.currentPiece, shape: rotated };
      if (isValidMove(g.board, newPiece, g.pieceX, g.pieceY))
        g.currentPiece = newPiece;
    } else if (x < rect.width * 0.33) {
      // Left third — move left
      if (isValidMove(g.board, g.currentPiece, g.pieceX - 1, g.pieceY))
        g.pieceX--;
    } else if (x > rect.width * 0.66) {
      // Right third — move right
      if (isValidMove(g.board, g.currentPiece, g.pieceX + 1, g.pieceY))
        g.pieceX++;
    } else {
      // Center — speed boost
      g.speedBoost = true;
      setTimeout(() => {
        g.speedBoost = false;
      }, 200);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        animation: "slideUp 0.3s ease",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "0.5rem",
          color: "#00d4ff",
        }}
      >
        🧱 Tetris
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "#888",
          marginBottom: "0.5rem",
          fontSize: "0.9rem",
        }}
      >
        Desktop: ← → move | ↑ rotate | ↓ soft drop | Space pause
      </p>
      <p
        style={{
          textAlign: "center",
          color: "#888",
          marginBottom: "0.5rem",
          fontSize: "0.9rem",
        }}
      >
        Mobile: tap left/right to move | center to drop | top to rotate
      </p>
      {highScore > 0 && (
        <p
          style={{
            textAlign: "center",
            color: "#9370db",
            marginBottom: "1rem",
            fontWeight: "bold",
          }}
        >
          🏆 Best: {highScore}
        </p>
      )}

      <div style={{ display: "inline-block", position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            maxWidth: "500px",
            height: "auto",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "12px",
            border: "2px solid rgba(0, 212, 255, 0.3)",
            touchAction: "none",
            cursor: gameState === "playing" ? "pointer" : "default",
          }}
          onTouchStart={handleTouch}
          onClick={() => {
            if (gameState === "menu" || gameState === "gameover") startGame();
          }}
        />

        {gameState === "menu" && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.85)",
                padding: "2.5rem",
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
              }}
            >
              <h2
                style={{
                  color: "#00d4ff",
                  marginBottom: "1rem",
                  fontSize: "1.8rem",
                }}
              >
                🧱 Tetris
              </h2>
              <p style={{ color: "#888", marginBottom: "1.5rem" }}>
                Classic block-stacking fun!
              </p>
              <button
                className="btn-primary"
                onClick={startGame}
                style={{ fontSize: "1.2rem", padding: "1rem 2rem" }}
              >
                🎮 Start Game
              </button>
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.9)",
                padding: "2.5rem",
                borderRadius: "16px",
                backdropFilter: "blur(10px)",
              }}
            >
              <h2
                style={{
                  color: "#ff4444",
                  marginBottom: "0.5rem",
                  fontSize: "1.5rem",
                }}
              >
                Game Over!
              </h2>
              <p
                style={{
                  marginBottom: "0.5rem",
                  fontSize: "1.5rem",
                  color: "white",
                }}
              >
                Score: {score}
                {score >= highScore && score > 0 ? " 🎉 New High Score!" : ""}
              </p>
              <p style={{ color: "#888", marginBottom: "1.5rem" }}>
                Lines: {lines} | Level: {level}
              </p>
              <button
                className="btn-primary"
                onClick={startGame}
                style={{ fontSize: "1.2rem", padding: "1rem 2rem" }}
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TetrisGame;
