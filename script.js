const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");

// Watch 5 Active Çözünürlüğü
canvas.width = 320;
canvas.height = 385;
const GRID = 16; // 320 ve 384'e tam bölünür

let snake, food, dx, dy, score, gameActive = false;
let speed = 130;
let highScore = localStorage.getItem("purpleSwipeBest") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');

function init() {
  // Başlangıç pozisyonu saatin ortası
  snake = [{x: GRID * 10, y: GRID * 12}, {x: GRID * 9, y: GRID * 12}];
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

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) < 20) return; // Saat ekranı için hassasiyet artırıldı
        if (diffX > 0 && dx === 0) { dx = GRID; dy = 0; } 
        else if (diffX < 0 && dx === 0) { dx = -GRID; dy = 0; } 
    } else {
        if (Math.abs(diffY) < 20) return;
        if (diffY > 0 && dy === 0) { dx = 0; dy = GRID; } 
        else if (diffY < 0 && dy === 0) { dx = 0; dy = -GRID; } 
    }
}

function update() {
  if (!gameActive) return;
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};

  // Çarpışma Kontrolü (Watch 5 Active Sınırları)
  if (head.x < 0 || head.x >= 320 || head.y < 0 || head.y >= 385 || 
      snake.some(s => s.x === head.x && s.y === head.y)) {
    gameActive = false;
    overlay.classList.remove("hidden");
    document.getElementById("title").innerText = "SYSTEM FAILURE";
    if(score > highScore) {
        highScore = score;
        localStorage.setItem("purpleSwipeBest", highScore);
        document.getElementById("highScore").innerText = highScore.toString().padStart(3, "0");
    }
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById("score").innerText = score.toString().padStart(3, '0');
    if(speed > 60) speed -= 2; 
    spawnFood();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Purple Grid Arka Plan
  ctx.strokeStyle = "#1e1b4b";
  ctx.lineWidth = 0.5;
  for(let i=0; i<385; i+=GRID) {
    ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(320,i); ctx.stroke();
  }
  for(let i=0; i<320; i+=GRID) {
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,385); ctx.stroke();
  }

  // Neon Yem
  ctx.fillStyle = "#fff";
  ctx.shadowBlur = 10; ctx.shadowColor = "#a855f7";
  ctx.fillRect(food.x+4, food.y+4, GRID-8, GRID-8);

  // Purpleguy Yılanı
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#d8b4fe" : "#7e22ce";
    ctx.shadowBlur = i === 0 ? 10 : 0;
    ctx.fillRect(s.x+1, s.y+1, GRID-2, GRID-2);
  });
  ctx.shadowBlur = 0;
}

function loop() { update(); draw(); setTimeout(loop, speed); }
init(); loop();

