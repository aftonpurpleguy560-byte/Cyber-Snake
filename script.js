/* CYBER SNAKE - OYUN MANTIĞI v1.2
   Purpleguy © 2026 - tablet power 
*/

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const mainMenu = document.getElementById("mainMenu");
const settingsMenu = document.getElementById("settingsMenu");
const menuTitle = document.getElementById("menuTitle");

// Çözünürlük Sabitleri
canvas.width = 400; 
canvas.height = 400;
const GRID = 20;

// Değişkenler
let snake, food, dx, dy, score, gameActive = false;
let currentSpeed = 130;
let difficultyBase = 130; // Orta Varsayılan

// --- SES MOTORU (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type; 
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// --- MENÜ KONTROLLERİ ---
window.showSettings = function() {
    mainMenu.classList.add("hidden");
    settingsMenu.classList.remove("hidden");
    playSound(440, 'sine', 0.1);
};

window.hideSettings = function() {
    settingsMenu.classList.add("hidden");
    mainMenu.classList.remove("hidden");
    playSound(330, 'sine', 0.1);
};

window.setDiff = function(level) {
    const speeds = [180, 130, 80]; // Kolay, Orta, Zor
    difficultyBase = speeds[level];
    
    // Buton stilini güncelle
    for(let i=0; i<3; i++) {
        document.getElementById(`diff${i}`).classList.remove("active-opt");
    }
    document.getElementById(`diff${level}`).classList.add("active-opt");
    
    playSound(550, 'sine', 0.1);
};

window.startGame = function() {
    mainMenu.classList.add("hidden");
    init();
    gameActive = true;
    playSound(660, 'sine', 0.2);
};

// --- OYUN MANTIĞI ---
function init() {
    snake = [{x: 200, y: 200}, {x: 180, y: 200}];
    dx = GRID; 
    dy = 0; 
    score = 0;
    currentSpeed = difficultyBase;
    document.getElementById("score").innerText = "000";
    spawnFood();
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / GRID)) * GRID,
        y: Math.floor(Math.random() * (canvas.height / GRID)) * GRID
    };
    // Yılanın içinde yemek çıkmasın
    if(snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
}

// --- MOBİL SWIPE (KAYDIRMA) ---
let touchStartX = 0, touchStartY = 0;

window.addEventListener('touchstart', e => { 
    touchStartX = e.changedTouches[0].screenX; 
    touchStartY = e.changedTouches[0].screenY; 
}, {passive: false});

window.addEventListener('touchend', e => {
    if(!gameActive) return;
    
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    
    // Yatay mı dikey mi daha çok kaydı?
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30 && dx === 0) {
            dx = diffX > 0 ? GRID : -GRID;
            dy = 0;
        }
    } else {
        if (Math.abs(diffY) > 30 && dy === 0) {
            dy = diffY > 0 ? GRID : -GRID;
            dx = 0;
        }
    }
}, {passive: false});

// --- GÜNCELLEME VE ÇİZİM ---
function update() {
    if (!gameActive) return;
    
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Duvara veya kendine çarpma
    if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400 || 
        snake.some(s => s.x === head.x && s.y === head.y)) {
        
        gameActive = false;
        playSound(150, 'sawtooth', 0.5); // Failure sesi
        menuTitle.innerText = "SYSTEM FAILURE";
        mainMenu.classList.remove("hidden");
        
        // Skor Kaydı
        if(score > highScore) {
            highScore = score;
            localStorage.setItem("cyberSwipeBest", highScore);
            document.getElementById("highScore").innerText = highScore.toString().padStart(3, "0");
        }
        return;
    }

    snake.unshift(head);

    // Yemek yeme
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        playSound(880, 'square', 0.1); // Beep sesi
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        
        // Hızlanma mekaniği
        if(currentSpeed > 40) currentSpeed -= 1; 
        spawnFood();
    } else {
        snake.pop();
    }
}

function draw() {
    // Arka Plan
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Siber Izgara (Grid)
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1;
    for(let i=0; i<400; i+=20) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,400); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(400,i); ctx.stroke();
    }

    // Yemek (Neon Beyaz)
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#38bdf8";
    ctx.fillRect(food.x+5, food.y+5, GRID-10, GRID-10);

    // Yılan (Neon Mavi)
    snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#38bdf8" : "#0c4a6e";
        ctx.fillRect(s.x+1, s.y+1, GRID-2, GRID-2);
    });
    ctx.shadowBlur = 0;
}

// --- ANA DÖNGÜ ---
function loop() {
    update();
    draw();
    setTimeout(loop, currentSpeed);
}

// Rekoru Yükle ve Başlat
let highScore = localStorage.getItem("cyberSwipeBest") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');
loop();

