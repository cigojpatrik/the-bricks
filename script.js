const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");

const paddleImg = new Image();
paddleImg.src = "img/paddle.png";

const bgImg = new Image();
bgImg.src = "img/background.png";

bgImg.onload = () => {
  draw();
};
paddleImg.onload = () => {
  draw();
};

const levels = [
  {
    name: "LEVEL 1",
    cols: 8,
    brickHeight: 24,
    speedX: 4,
    speedY: -4,
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0]
    ]
  },
  {
    name: "LEVEL 2",
    cols: 8,
    brickHeight: 24,
    speedX: 4.8,
    speedY: -4.8,
    layout: [
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [0, 1, 0, 1, 1, 0, 1, 0]
    ]
  },
  {
    name: "LEVEL 3",
    cols: 10,
    brickHeight: 22,
    speedX: 5.6,
    speedY: -5.6,
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
      [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0]
    ]
  }
];

const game = {
  width: canvas.width,
  height: canvas.height,
  animationId: null,
  timerId: null,
  transitionTimeout: null,
  running: false,
  paused: false,
  ended: false,
  transitioning: false,
  score: 0,
  seconds: 0,
  levelIndex: 0,
  totalBricksOverall: 0,
  bricksLeft: 0,
  brickPadding: 8,
  brickOffsetTop: 60,
  brickOffsetLeft: 20,
  brickWidth: 0,
  brickHeight: 24,
  paddle: {
    width: 130,
    height: 14,
    x: 0,
    y: 0,
    speed: 8,
    color: "#dbeafe"
  },
  ball: {
    radius: 10,
    x: 0,
    y: 0,
    dx: 4,
    dy: -4,
    color: "#67e8f9"
  },
  keys: {
    left: false,
    right: false
  },
  bricks: [],
  rowColors: ["#f97316", "#facc15", "#22c55e", "#38bdf8", "#8b5cf6", "#f472b6"]
};

game.totalBricksOverall = levels.reduce((sum, level) => {
  return sum + level.layout.flat().filter(Boolean).length;
}, 0);

function resetBallAndPaddle() {
  game.paddle.x = (game.width - game.paddle.width) / 2;
  game.paddle.y = game.height - 34;

  const level = levels[game.levelIndex];
  const horizontalDirection = Math.sign(level.speedX) || 1;

  game.ball.x = game.width / 2;
  game.ball.y = game.height - 70;
  game.ball.dx = Math.abs(level.speedX) * horizontalDirection;
  game.ball.dy = level.speedY;
}

function resetGame() {
  stopLoop();
  game.running = false;
  game.paused = false;
  game.ended = false;
  game.transitioning = false;
  game.score = 0;
  game.seconds = 0;
  game.levelIndex = 0;
  game.keys.left = false;
  game.keys.right = false;
  scoreEl.textContent = "0";
  timerEl.textContent = "00:00";
  pauseBtn.textContent = "Pavza";

  loadLevel(game.levelIndex);
  statusEl.textContent = "READY";
  draw();
  hideOverlay();
}

function loadLevel(levelIndex) {
  const level = levels[levelIndex];
  game.levelIndex = levelIndex;
  game.brickHeight = level.brickHeight;
  levelEl.textContent = String(levelIndex + 1);
  buildBricks(level);
  resetBallAndPaddle();
}

function buildBricks(level) {
  const rows = level.layout.length;
  const cols = level.cols;
  const usableWidth = game.width - game.brickOffsetLeft * 2;
  const brickWidth = (usableWidth - (cols - 1) * game.brickPadding) / cols;

  game.brickWidth = brickWidth;
  game.bricks = [];
  game.bricksLeft = 0;

  for (let row = 0; row < rows; row += 1) {
    const rowBricks = [];
    for (let col = 0; col < cols; col += 1) {
      const active = level.layout[row][col] === 1;
      if (active) {
        game.bricksLeft += 1;
      }
      rowBricks.push({
        x: game.brickOffsetLeft + col * (brickWidth + game.brickPadding),
        y: game.brickOffsetTop + row * (game.brickHeight + game.brickPadding),
        status: active ? 1 : 0,
        color: game.rowColors[row % game.rowColors.length]
      });
    }
    game.bricks.push(rowBricks);
  }
}

function startGame() {
  if (game.running && !game.paused && !game.transitioning) {
    return;
  }

  if (game.ended) {
    resetGame();
  }

  game.running = true;
  game.paused = false;
  game.transitioning = false;
  statusEl.textContent = levels[game.levelIndex].name;
  hideOverlay();

  if (!game.timerId) {
    game.timerId = window.setInterval(updateTimer, 1000);
  }

  gameLoop();
}

function pauseGame() {
  if (!game.running || game.ended || game.transitioning) {
    return;
  }

  game.paused = !game.paused;
  statusEl.textContent = game.paused ? "Pavza" : levels[game.levelIndex].name;
  pauseBtn.textContent = game.paused ? "Nadaljuj" : "Pavza";

  if (game.paused) {
    showOverlay("Pavza misije", "Ladja čaka na ukaz. Pritisni Nadaljuj ali tipko P.", true);
    stopAnimationOnly();
  } else {
    hideOverlay();
    gameLoop();
  }
}

function endGame(win) {
  game.running = false;
  game.paused = false;
  game.ended = true;
  game.transitioning = false;
  stopLoop();
  pauseBtn.textContent = "Pavza";
  statusEl.textContent = win ? "Galaksija rešena" : "FAILED";

  if (win) {
    showOverlay(
      "Galaksija rešena!",
      `Počistil si vse ${levels.length} sektorje. Rezultat: ${game.score}/${game.totalBricksOverall}.`,
      true
    );
  } else {
    showOverlay(
      "Misija neuspešna",
      `Izpadel si v sektorju ${game.levelIndex + 1}. Rezultat: ${game.score}/${game.totalBricksOverall}.`,
      true
    );
  }
}

function nextLevel() {
  stopAnimationOnly();
  game.running = false;
  game.paused = false;
  game.transitioning = false;

  loadLevel(game.levelIndex + 1);
  statusEl.textContent = `Pripravljen na ${levels[game.levelIndex].name}`;

  showOverlay(
    `Sektor ${game.levelIndex} očiščen`,
    `Napreduješ v ${levels[game.levelIndex].name}. Klikni "Nova misija" za začetek.`,
    false
  );

  draw();
}

function stopAnimationOnly() {
  if (game.animationId) {
    cancelAnimationFrame(game.animationId);
    game.animationId = null;
  }
}

function stopLoop() {
  stopAnimationOnly();
  if (game.timerId) {
    clearInterval(game.timerId);
    game.timerId = null;
  }
  if (game.transitionTimeout) {
    clearTimeout(game.transitionTimeout);
    game.transitionTimeout = null;
  }
}

function updateTimer() {
  if (!game.running || game.paused || game.ended || game.transitioning) {
    return;
  }

  game.seconds += 1;
  const minutes = String(Math.floor(game.seconds / 60)).padStart(2, "0");
  const seconds = String(game.seconds % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;
}

function gameLoop() {
  if (!game.running || game.paused || game.ended || game.transitioning) {
    return;
  }

  update();
  draw();
  game.animationId = requestAnimationFrame(gameLoop);
}

function update() {
  movePaddle();
  moveBall();
  wallCollision();
  paddleCollision();
  brickCollision();
}

function movePaddle() {
  if (game.keys.left) {
    game.paddle.x -= game.paddle.speed;
  }
  if (game.keys.right) {
    game.paddle.x += game.paddle.speed;
  }

  if (game.paddle.x < 0) {
    game.paddle.x = 0;
  }
  if (game.paddle.x + game.paddle.width > game.width) {
    game.paddle.x = game.width - game.paddle.width;
  }
}

function moveBall() {
  game.ball.x += game.ball.dx;
  game.ball.y += game.ball.dy;
}

function wallCollision() {
  if (game.ball.x + game.ball.radius >= game.width || game.ball.x - game.ball.radius <= 0) {
    game.ball.dx *= -1;
  }

  if (game.ball.y - game.ball.radius <= 0) {
    game.ball.dy *= -1;
  }

  if (game.ball.y - game.ball.radius > game.height) {
    endGame(false);
  }
}

function paddleCollision() {
  const ballBottom = game.ball.y + game.ball.radius;
  const paddleTop = game.paddle.y;
  const paddleBottom = game.paddle.y + game.paddle.height;
  const withinX = game.ball.x >= game.paddle.x && game.ball.x <= game.paddle.x + game.paddle.width;

  if (ballBottom >= paddleTop && ballBottom <= paddleBottom + 8 && withinX && game.ball.dy > 0) {
    const hitPoint = (game.ball.x - (game.paddle.x + game.paddle.width / 2)) / (game.paddle.width / 2);
    game.ball.dx = hitPoint * 7;
    game.ball.dy = -Math.max(4, Math.abs(game.ball.dy));
    game.ball.y = paddleTop - game.ball.radius;
  }
}

function brickCollision() {
  for (let row = 0; row < game.bricks.length; row += 1) {
    for (let col = 0; col < game.bricks[row].length; col += 1) {
      const brick = game.bricks[row][col];
      if (!brick.status) {
        continue;
      }

      const hitX = game.ball.x + game.ball.radius > brick.x && game.ball.x - game.ball.radius < brick.x + game.brickWidth;
      const hitY = game.ball.y + game.ball.radius > brick.y && game.ball.y - game.ball.radius < brick.y + game.brickHeight;

      if (hitX && hitY) {
        brick.status = 0;
        game.bricksLeft -= 1;
        game.ball.dy *= -1;
        game.score += 1;
        scoreEl.textContent = String(game.score);

        if (game.bricksLeft === 0) {
          if (game.levelIndex < levels.length - 1) {
            nextLevel();
          } else {
            endGame(true);
          }
        }
        return;
      }
    }
  }
}

function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBackground() {
  ctx.clearRect(0, 0, game.width, game.height);

  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, game.width, game.height);

    // po želji temen sloj čez sliko, da se žoga in bloki lepše vidijo
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, game.width, game.height);
  } else {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, game.width, game.height);
  }
}

function drawBricks() {
  for (const row of game.bricks) {
    for (const brick of row) {
      if (!brick.status) continue;

      const brickGradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + game.brickHeight);
      brickGradient.addColorStop(0, brick.color);
      brickGradient.addColorStop(1, "rgba(15, 23, 42, 0.92)");

      ctx.fillStyle = brickGradient;
      ctx.fillRect(brick.x, brick.y, game.brickWidth, game.brickHeight);

      ctx.strokeStyle = "rgba(224, 242, 254, 0.28)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, game.brickWidth - 1, game.brickHeight - 1);

      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fillRect(brick.x + 6, brick.y + 4, game.brickWidth - 12, 4);
      ctx.fillRect(brick.x + 6, brick.y + game.brickHeight - 8, game.brickWidth - 18, 2);
    }
  }
}

function drawPaddle() {
  ctx.drawImage(
    paddleImg,
    game.paddle.x,
    game.paddle.y,
    game.paddle.width,
    game.paddle.height
  );
}

function drawBall() {
  ctx.save();
  ctx.shadowColor = "rgba(103, 232, 249, 0.8)";
  ctx.shadowBlur = 18;
  const ballGradient = ctx.createRadialGradient(
    game.ball.x - 3,
    game.ball.y - 3,
    2,
    game.ball.x,
    game.ball.y,
    game.ball.radius + 2
  );
  ballGradient.addColorStop(0, "#ecfeff");
  ballGradient.addColorStop(0.45, "#67e8f9");
  ballGradient.addColorStop(1, "#0284c7");
  ctx.fillStyle = ballGradient;
  ctx.beginPath();
  ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}

function draw() {
  drawBackground();
  drawBricks();
  drawPaddle();
  drawBall();
}

function showOverlay(title, text, showButton) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  restartBtn.style.display = showButton ? "inline-block" : "none";
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") {
    game.keys.left = true;
  }
  if (key === "arrowright" || key === "d") {
    game.keys.right = true;
  }
  if (key === "p") {
    pauseGame();
  }
  if ((key === " " || key === "enter") && (!game.running || game.ended)) {
    startGame();
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") {
    game.keys.left = false;
  }
  if (key === "arrowright" || key === "d") {
    game.keys.right = false;
  }
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

resetGame();

