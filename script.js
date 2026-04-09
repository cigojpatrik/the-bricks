const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const startBtn = document.getElementById("startBtn");

let animationId = null;
let running = false;

let score = 0;
let lives = 3;

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 90,
  radius: 9,
  dx: 3.2,
  dy: -3.2
};

const paddle = {
  width: 120,
  height: 14,
  x: (canvas.width - 120) / 2,
  y: canvas.height - 34,
  speed: 7
};

const brick = {
  rows: 6,
  cols: 9,
  width: 78,
  height: 18,
  padding: 10,
  offsetTop: 48,
  offsetLeft: 20
};

let bricks = [];
let moveLeft = false;
let moveRight = false;

function buildBricks() {
  bricks = [];
  for (let c = 0; c < brick.cols; c++) {
    bricks[c] = [];
    for (let r = 0; r < brick.rows; r++) {
      bricks[c][r] = { x: 0, y: 0, active: true };
    }
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 90;
  ball.dx = 3.2 * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = -3.2;
  paddle.x = (canvas.width - paddle.width) / 2;
}

function resetWholeGame() {
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  buildBricks();
  resetBall();
  drawScene();
}

function drawBackgroundLines() {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  for (let i = 40; i < canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#6cf6ff";
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}

function drawPaddle() {
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
  ctx.fillStyle = "#8c7bff";
  ctx.shadowColor = "#8c7bff";
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}

function brickColor(row) {
  const colors = ["#6cf6ff", "#67d7ff", "#7fb2ff", "#8c7bff", "#b06fff", "#ff78c8"];
  return colors[row % colors.length];
}

function drawBricks() {
  for (let c = 0; c < brick.cols; c++) {
    for (let r = 0; r < brick.rows; r++) {
      const b = bricks[c][r];
      if (!b.active) continue;

      const x = c * (brick.width + brick.padding) + brick.offsetLeft;
      const y = r * (brick.height + brick.padding) + brick.offsetTop;
      b.x = x;
      b.y = y;

      ctx.beginPath();
      ctx.roundRect(x, y, brick.width, brick.height, 6);
      ctx.fillStyle = brickColor(r);
      ctx.shadowColor = brickColor(r);
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0;
    }
  }
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackgroundLines();
  drawBricks();
  drawBall();
  drawPaddle();
}

function collisionWithBricks() {
  for (let c = 0; c < brick.cols; c++) {
    for (let r = 0; r < brick.rows; r++) {
      const b = bricks[c][r];
      if (!b.active) continue;

      if (
        ball.x + ball.radius > b.x &&
        ball.x - ball.radius < b.x + brick.width &&
        ball.y + ball.radius > b.y &&
        ball.y - ball.radius < b.y + brick.height
      ) {
        b.active = false;
        ball.dy = -ball.dy;
        score += 1;
        scoreEl.textContent = score;

        if (score === brick.rows * brick.cols) {
          drawScene();
          alert("You win!");
          stopGame();
        }
        return;
      }
    }
  }
}

function updatePaddle() {
  if (moveRight && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.speed;
  }
  if (moveLeft && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }
}

function updateBall() {
  if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
    ball.dx = -ball.dx;
  }

  if (ball.y + ball.dy < ball.radius) {
    ball.dy = -ball.dy;
  } else if (ball.y + ball.dy > paddle.y - ball.radius) {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      const hit = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      ball.dx = hit * 5;
      ball.dy = -Math.abs(ball.dy);
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
      lives -= 1;
      livesEl.textContent = lives;

      if (lives <= 0) {
        drawScene();
        alert("Game over");
        stopGame();
        return;
      }
      resetBall();
    }
  }

  ball.x += ball.dx;
  ball.y += ball.dy;
}

function loop() {
  updatePaddle();
  updateBall();
  collisionWithBricks();
  drawScene();
  animationId = requestAnimationFrame(loop);
}

function startGame() {
  if (running) return;
  running = true;
  loop();
}

function stopGame() {
  running = false;
  cancelAnimationFrame(animationId);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight = true;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight = false;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft = false;
});

startBtn.addEventListener("click", () => {
  stopGame();
  resetWholeGame();
  startGame();
});

buildBricks();
drawScene();
