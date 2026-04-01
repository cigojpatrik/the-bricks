const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreText = document.getElementById('score');
const livesText = document.getElementById('lives');
const messageText = document.getElementById('message');

// Žogica
let ball = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  radius: 10,
  dx: 6,
  dy: -6
};

// Plošček
let paddle = {
  width: 120,
  height: 15,
  x: canvas.width / 2 - 60,
  speed: 13,
  movingLeft: false,
  movingRight: false
};

// Opeke
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 85;
const brickHeight = 25;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 25;

let bricks = [];

function createBricks() {
  bricks = [];

  for (let r = 0; r < brickRowCount; r++) {
    bricks[r] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      const x = brickOffsetLeft + c * (brickWidth + brickPadding);
      const y = brickOffsetTop + r * (brickHeight + brickPadding);

      bricks[r][c] = {
        x: x,
        y: y,
        visible: true
      };
    }
  }
}

createBricks();

let score = 0;
let lives = 3;
let gameStarted = false;
let gameOver = false;
let win = false;

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#2563eb';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.fillStyle = '#111827';
  ctx.fillRect(paddle.x, canvas.height - 30, paddle.width, paddle.height);
}

function drawBricks() {
  for (let r = 0; r < brickRowCount; r++) {
    for (let c = 0; c < brickColumnCount; c++) {
      let brick = bricks[r][c];

      if (brick.visible) {
        ctx.fillStyle = '#89CFF0';
        ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
      }
    }
  }
}

function movePaddle() {
  if (paddle.movingLeft && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }

  if (paddle.movingRight && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.speed;
  }
}

function moveBall() {
  if (!gameStarted || gameOver || win) {
    return;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;
}

function wallCollision() {
  // Leva in desna stena
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }

  // Zgornja stena
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Spodnji rob
  if (ball.y + ball.radius > canvas.height) {
    lives--;
    livesText.textContent = lives;

    if (lives <= 0) {
      gameOver = true;
      messageText.textContent = 'Konec igre! Za novo igro pritisni R.';
    } else {
      resetBallAndPaddle();
      gameStarted = false;
      messageText.textContent = 'Izgubil si življenje. Pritisni presledek za nadaljevanje.';
    }
  }
}

function paddleCollision() {
  const paddleTop = canvas.height - 30;
  const paddleBottom = paddleTop + paddle.height;

  if (
    ball.y + ball.radius >= paddleTop &&
    ball.y - ball.radius <= paddleBottom &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width &&
    ball.dy > 0
  ) {
    ball.dy *= -1;

    // Malo spremeni smer glede na mesto zadetka
    let hitPosition = ball.x - (paddle.x + paddle.width / 2);
    ball.dx = hitPosition * 0.12;
  }
}

function brickCollision() {
  for (let r = 0; r < brickRowCount; r++) {
    for (let c = 0; c < brickColumnCount; c++) {
      let brick = bricks[r][c];

      if (
        brick.visible &&
        ball.x > brick.x &&
        ball.x < brick.x + brickWidth &&
        ball.y > brick.y &&
        ball.y < brick.y + brickHeight
      ) {
        ball.dy *= -1;
        brick.visible = false;
        score++;
        scoreText.textContent = score;

        if (score === brickRowCount * brickColumnCount) {
          win = true;
          messageText.textContent = 'Zmaga! Vse opeke so podrte. Za novo igro pritisni R.';
        }
      }
    }
  }
}

function resetBallAndPaddle() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 60;
  ball.dx = 6;
  ball.dy = -6;
  paddle.x = canvas.width / 2 - paddle.width / 2;
}

function resetGame() {
  score = 0;
  lives = 3;
  gameStarted = false;
  gameOver = false;
  win = false;

  scoreText.textContent = score;
  livesText.textContent = lives;
  messageText.textContent = 'Pritisni presledek za začetek igre.';

  resetBallAndPaddle();
  createBricks();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();

  movePaddle();
  moveBall();

  wallCollision();
  paddleCollision();
  brickCollision();

  requestAnimationFrame(draw);
}

// Tipke
window.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    paddle.movingLeft = true;
  }

  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    paddle.movingRight = true;
  }

  if (e.code === 'Space' && !gameOver && !win) {
    gameStarted = true;
    messageText.textContent = 'Igra poteka...';
  }

  if ((e.key === 'r' || e.key === 'R') && (gameOver || win)) {
    resetGame();
  }
});

window.addEventListener('keyup', function (e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    paddle.movingLeft = false;
  }

  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    paddle.movingRight = false;
  }
});

resetGame();
draw();
