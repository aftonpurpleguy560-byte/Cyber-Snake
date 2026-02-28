/* CYBER SNAKE - OYUN MANTIĞI
   Purpleguy © 2026 - tablet power 
*/

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");

// Çözünürlük ve Grid Ayarları
canvas.width = 400;
canvas.height = 400;
const GRID = 20;

let snake, food, dx, dy, score, gameActive = false;
let speed = 130;

// En Yüksek Skoru Yükle
let highScore = localStorage.getItem("cyberSwipeBest") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');

// Oyunu Başlat/Sıfırla
function init() {
  snake = [{x: 200, y: 200}, {x: 180, y: 200}];
  dx = GRID; 
  dy = 0; 
  score = 0; 
  speed = 130;
  document.getElementById("score").innerText = "000";
  spawnFood();
}

// Rastgele Yemek Oluştur
function spawnFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / GRID)) * GRID,
    y: Math.floor(Math.random() * (canvas.height / GRID)) * GRID
  };
  // Yılanın vücudunda yemek çıkmasını engelle
  if(snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
}

// MOBİL DOKUNMATİK (SWIPE) KONTROLLERİ
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

    // Hangi yöne daha çok kaydırıldığını hesapla
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) < 30) return; // Çok kısa kaydırmaları yok say
        if (diffX > 0 && dx === 0) { dx = GRID; dy = 0; } // Sağ
        else if (diffX < 0 && dx === 0) { dx = -GRID; dy = 0; } // Sol
    } else {
        if (Math.abs(diffY) < 30) return;
        if (diffY > 0 && dy === 0) { dx = 0; dy = GRID; } // Aşağı
        else if (diffY < 0 && dy === 0) { dx = 0; dy = -GRID; } // Yukarı
    }
}

// Oyun Döngüsü Güncelleme
function update() {
  if (!gameActive) return;
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};

  // Çarpışma Kontrolü (Duvarlar veya Kendi Kuyruğu)
  if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400 || 
      snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Yemek Yeme Kontrolü
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById("score").innerText = score.toString().padStart(3, '0');
    // Zorluk seviyesini artır (hızlan)
    if(speed > 60) speed -= 2;
    spawnFood();
  } else {
    snake.pop(); // Yemek yemediyse kuyruğu sil (hareket illüzyonu)
  }
}

function gameOver() {
    gameActive = false;
    overlay.classList.remove("hidden");
    document.getElementById("title").innerText = "SYSTEM FAILURE";
    
    if(score > highScore) {
        highScore = score;
        localStorage.setItem("cyberSwipeBest", highScore);
        document.getElementById("highScore").innerText = highScore.toString().padStart(3, "0");
    }
}

// Çizim İşlemleri
function draw() {
  // Arka Plan
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Izgara Çizgileri (Grid)
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1;
  for(let i=0; i<400; i+=20) {
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(400,i); ctx.stroke();
  }

  // Yemek (Parlayan Beyaz Kare)
  ctx.fillStyle = "#fff";
  ctx.shadowBlur = 10; 
  ctx.shadowColor = "#38bdf8";
  ctx.fillRect(food.x+5, food.y+5, GRID-10, GRID-10);

  // Yılan (Neon Mavi Tonları)
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#38bdf8" : "#0c4a6e";
    ctx.fillRect(s.x+1, s.y+1, GRID-2, GRID-2);
  });
  ctx.shadowBlur = 0; // Diğer çizimler için parlamayı kapat
}

// Ana Döngü
function loop() {
  update();
  draw();
  setTimeout(loop, speed);
}

// İlk Çalıştırma
init();
loop();
