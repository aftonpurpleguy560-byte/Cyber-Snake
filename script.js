const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");

canvas.width = 400;
canvas.height = 400;
const GRID = 20;

let snake, food, dx, dy, score, gameActive = false;
let speed = 130;
let highScore = localStorage.getItem("cyberSwipeBest") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');

function init() {
  snake = [{x: 200, y: 200}, {x: 180, y: 200}];
  dx = GRID; dy = 0; score = 0; speed = 130;
  document.getElementById("score").innerText = "000";
  spawnFood();
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / GRID)) * GRID,
    y: Math.floor(Math.random() * (canvas.height / GRID)) * GRID
  };
  if(snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
}

// DOKUNMATİK (SWIPE) ALGILAYICI
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: false});

window.addEventListener('touchend', e => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, {passive: false});

function handleSwipe(startX, startY, endX, endY) {
    if (!gameActive) {
        init();
        gameActive = true;
        overlay.classList.add("hidden");
    }

    const diffX = endX - startX;
    const diffY = endY - startY;

    // Yatay mı dikey mi daha büyük hareket var?
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) < 30) return; // Çok küçük hareketleri yoksay
        if (diffX > 0 && dx === 0) { dx = GRID; dy = 0; } // Sağ
        else if (diffX < 0 && dx === 0) { dx = -GRID; dy = 0; } // Sol
    } else {
        if (Math.abs(diffY) < 30) return;
        if (diffY > 0 && dy === 0) { dx = 0; dy = GRID; } // Aşağı
        else if (diffY < 0 && dy === 0) { dx = 0; dy = -GRID; } // Yukarı
    }
}

function update() {
  if (!gameActive) return;
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};

  // Çarpışma
  if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400 || 
      snake.some(s => s.x === head.x && s.y === head.y)) {
    gameActive = false;
    overlay.classList.remove("hidden");
    document.getElementById("title").innerText = "SYSTEM FAILURE";
    if(score > highScore) {
        highScore = score;
        localStorage.setItem("cyberSwipeBest", highScore);
        document.getElementById("highScore").innerText = highScore.toString().padStart(3, "0");
    }
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById("score").innerText = score.toString().padStart(3, '0');
    if(speed > 60) speed -= 2; // Hızlanma mekanizması
    spawnFood();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Arka plan ızgarası
  ctx.strokeStyle = "#0f172a";
  for(let i=0; i<400; i+=20) {
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(400,i); ctx.stroke();
  }

  // Neon Yem
  ctx.fillStyle = "#fff";
  ctx.shadowBlur = 10; ctx.shadowColor = "#38bdf8";
  ctx.fillRect(food.x+5, food.y+5, GRID-10, GRID-10);

  // Neon Yılan
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#38bdf8" : "#0c4a6e";
    ctx.fillRect(s.x+1, s.y+1, GRID-2, GRID-2);
  });
  ctx.shadowBlur = 0;
}

function loop() { update(); draw(); setTimeout(loop, speed); }
init(); loop();

