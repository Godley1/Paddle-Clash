const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");
const rallyCountEl = document.getElementById("rallyCount");
const ballCountEl = document.getElementById("ballCount");

const state = {
  keys: {},
  playerScore: 0,
  cpuScore: 0,
  winner: null,
  rallyHits: 0,
};

const paddle = {
  width: 22,
  height: 120,
  speed: 420,
};

const player = {
  x: 35,
  y: canvas.height / 2 - paddle.height / 2,
  width: paddle.width,
  height: paddle.height,
  speed: paddle.speed,
};

const cpu = {
  x: canvas.width - 35 - paddle.width,
  y: canvas.height / 2 - paddle.height / 2,
  width: paddle.width,
  height: paddle.height,
  speed: 340,
};

let balls = [];

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function clamp(value, min, max) {
  if (!isFiniteNumber(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function updateHud() {
  if (playerScoreEl) playerScoreEl.textContent = String(state.playerScore);
  if (cpuScoreEl) cpuScoreEl.textContent = String(state.cpuScore);
  if (rallyCountEl) rallyCountEl.textContent = String(state.rallyHits);
  if (ballCountEl) ballCountEl.textContent = String(balls.length);
}

function createBall(direction = 1, speedMultiplier = 1) {
  const baseSpeed = 330 * speedMultiplier;
  const verticalOptions = [-190, -150, -110, 110, 150, 190];
  const vy = verticalOptions[Math.floor(Math.random() * verticalOptions.length)];

  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 12,
    vx: baseSpeed * direction,
    vy,
    glow: Math.random() > 0.5 ? "#ffd166" : "#ffffff",
  };
}

function sanitizeBall(ball) {
  if (!isFiniteNumber(ball.r) || ball.r <= 0) ball.r = 12;
  if (!isFiniteNumber(ball.x)) ball.x = canvas.width / 2;
  if (!isFiniteNumber(ball.y)) ball.y = canvas.height / 2;
  if (!isFiniteNumber(ball.vx) || ball.vx === 0) ball.vx = 330;
  if (!isFiniteNumber(ball.vy)) ball.vy = 120;

  ball.x = clamp(ball.x, -200, canvas.width + 200);
  ball.y = clamp(ball.y, 0, canvas.height);
}

function resetBalls(lastScoredBy = "player") {
  const direction = lastScoredBy === "player" ? -1 : 1;
  balls = [createBall(direction, 1)];
  state.rallyHits = 0;
  updateHud();
}

function setWinner() {
  if (state.playerScore >= 5) state.winner = "You Win";
  if (state.cpuScore >= 5) state.winner = "CPU Wins";
}

function spawnExtraBall() {
  const direction = Math.random() > 0.5 ? 1 : -1;
  const speedMultiplier = 1 + Math.min(0.5, balls.length * 0.08);
  balls.push(createBall(direction, speedMultiplier));
  updateHud();
}

function registerPaddleHit() {
  state.rallyHits += 1;
  if (state.rallyHits % 5 === 0) {
    spawnExtraBall();
  }
  updateHud();
}

function updatePlayer(dt) {
  if (state.keys.w || state.keys.arrowup) player.y -= player.speed * dt;
  if (state.keys.s || state.keys.arrowdown) player.y += player.speed * dt;
  player.y = clamp(player.y, 0, canvas.height - player.height);
}

function getLeadBall() {
  if (balls.length === 0) return null;

  let leadBall = balls[0];
  let closestDistance = Math.abs(cpu.x - balls[0].x);

  for (let i = 1; i < balls.length; i += 1) {
    const distance = Math.abs(cpu.x - balls[i].x);
    if (distance < closestDistance) {
      closestDistance = distance;
      leadBall = balls[i];
    }
  }

  return leadBall;
}

function updateCPU(dt) {
  const targetBall = getLeadBall();
  if (!targetBall) return;

  const targetY = targetBall.y - cpu.height / 2;
  if (targetY > cpu.y + 10) cpu.y += cpu.speed * dt;
  else if (targetY < cpu.y - 10) cpu.y -= cpu.speed * dt;

  cpu.y = clamp(cpu.y, 0, canvas.height - cpu.height);
}

function circleRectCollision(ball, rect) {
  const nearestX = clamp(ball.x, rect.x, rect.x + rect.width);
  const nearestY = clamp(ball.y, rect.y, rect.y + rect.height);
  const dx = ball.x - nearestX;
  const dy = ball.y - nearestY;
  return (dx * dx + dy * dy) <= ball.r * ball.r;
}

function bounceFromPaddle(ball, rect, isPlayer) {
  const relativeIntersectY =
    (ball.y - (rect.y + rect.height / 2)) / (rect.height / 2);
  const normalized = clamp(relativeIntersectY, -1, 1);
  const speed = Math.min(Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) + 18, 720);
  const direction = isPlayer ? 1 : -1;

  ball.vx = direction * speed * 0.95;
  ball.vy = normalized * speed * 0.85;

  if (isPlayer) {
    ball.x = rect.x + rect.width + ball.r;
  } else {
    ball.x = rect.x - ball.r;
  }

  registerPaddleHit();
}

function updateBalls(dt) {
  for (let i = balls.length - 1; i >= 0; i -= 1) {
    const ball = balls[i];
    sanitizeBall(ball);

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.y - ball.r <= 0) {
      ball.y = ball.r;
      ball.vy *= -1;
    }

    if (ball.y + ball.r >= canvas.height) {
      ball.y = canvas.height - ball.r;
      ball.vy *= -1;
    }

    if (circleRectCollision(ball, player) && ball.vx < 0) {
      bounceFromPaddle(ball, player, true);
    }

    if (circleRectCollision(ball, cpu) && ball.vx > 0) {
      bounceFromPaddle(ball, cpu, false);
    }

    if (ball.x + ball.r < 0) {
      state.cpuScore += 1;
      setWinner();
      if (!state.winner) {
        resetBalls("cpu");
      }
      updateHud();
      return;
    }

    if (ball.x - ball.r > canvas.width) {
      state.playerScore += 1;
      setWinner();
      if (!state.winner) {
        resetBalls("player");
      }
      updateHud();
      return;
    }
  }
}

function drawArena() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#08152d");
  grad.addColorStop(1, "#030712");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 14]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let i = 0; i < 28; i += 1) {
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(54,243,255,0.03)" : "rgba(255,79,216,0.03)";
    ctx.fillRect((i * 50) % canvas.width, (i * 37) % canvas.height, 2, 2);
  }
}

function drawPaddle(p, color1, color2) {
  const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.width, p.y + p.height);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.shadowBlur = 20;
  ctx.shadowColor = color1;
  ctx.fillRect(p.x, p.y, p.width, p.height);
  ctx.shadowBlur = 0;
}

function drawBall(ball) {
  sanitizeBall(ball);

  if (!isFiniteNumber(ball.x) || !isFiniteNumber(ball.y) || !isFiniteNumber(ball.r)) {
    return;
  }

  const innerRadius = Math.max(1, Math.min(ball.r * 0.2, ball.r - 1));
  const outerRadius = Math.max(ball.r + 10, ball.r + 1);
  const grad = ctx.createRadialGradient(
    ball.x - 3,
    ball.y - 3,
    innerRadius,
    ball.x,
    ball.y,
    outerRadius
  );

  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.35, "#ffd166");
  grad.addColorStop(1, "#ff8a00");

  ctx.fillStyle = grad;
  ctx.shadowBlur = 24;
  ctx.shadowColor = ball.glow;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawWinner() {
  if (!state.winner) return;

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px Arial";
  ctx.textAlign = "center";
  ctx.fillText(state.winner, canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = "24px Arial";
  ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 40);
}

function gameLoop(timestamp) {
  if (!gameLoop.lastTime) gameLoop.lastTime = timestamp;
  const rawDt = (timestamp - gameLoop.lastTime) / 1000;
  const dt = Math.min(Math.max(rawDt, 0), 0.02);
  gameLoop.lastTime = timestamp;

  if (!state.winner) {
    updatePlayer(dt);
    updateCPU(dt);
    updateBalls(dt);
  }

  drawArena();
  drawPaddle(player, "#36f3ff", "#007cf0");
  drawPaddle(cpu, "#ff4fd8", "#7c3aed");

  for (const ball of balls) {
    drawBall(ball);
  }

  drawWinner();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  state.playerScore = 0;
  state.cpuScore = 0;
  state.winner = null;
  state.rallyHits = 0;

  player.y = canvas.height / 2 - player.height / 2;
  cpu.y = canvas.height / 2 - cpu.height / 2;

  resetBalls("player");
  updateHud();
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  state.keys[key] = true;

  if (key === "r") {
    restartGame();
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  state.keys[key] = false;
});

restartGame();
requestAnimationFrame(gameLoop);
