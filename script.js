/* CYBER SNAKE - OMNI ENGINE v2.0
   Purpleguy © 2026 - tablet power 
*/

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400; 
canvas.height = 400;
const GRID = 20;

// OYUN VE EKONOMİ
let snake, food, dx, dy, score, gameActive = false;
let currentSpeed = 130;
let difficultyBase = 130; 
let lastSpeedMilestone = 0;
let money = parseInt(localStorage.getItem("cyberMoney")) || 0;
let snakeColor = localStorage.getItem("cyberSkin") || "#38bdf8";
let highScore = parseInt(localStorage.getItem("cyberBest")) || 0;

// GOD MODE & SİGNATURE
let godMode = false;
let sigClickCount = 0;
let sigTimer;

// 🍎 10 YEMEK + ⚡️ 4 GÜÇLENDİRİCİ
const normalFoods = [
    { c: '🍎', s: 10 }, { c: '🍔', s: 15 }, { c: '🍕', s: 20 }, 
    { c: '🍣', s: 25 }, { c: '🍦', s: 10 }, { c: '🍩', s: 12 },
    { c: '🌮', s: 18 }, { c: '🍓', s: 8 }, { c: '🍗', s: 22 }, { c: '🍪', s: 5 }
];
const powerUps = [
    { c: '⚡️', s: 2, m: -15 }, { c: '⭐️', s: 5, m: -25 }, 
    { c: '❄️', s: 2, m: 15 },  { c: '💠', s: 5, m: 25 }
];

// --- BİLDİRİM SİSTEMİ ---
window.notify = (msg) => {
    const toast = document.getElementById("cyber-toast");
    toast.innerText = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
};

// --- FIREBASE SKOR KAYDI (KOTA DOSTU) ---
async function saveToFirebase(val) {
    if (window.db && window.dbSet) {
        try {
            await window.dbSet(window.dbRef(window.db, 'scores/' + 'Efe'), {
                score: val,
                timestamp: Date.now()
            });
        } catch (e) {
            console.log("Firebase Kotası Dolu, Yerel Kaydedildi.");
        }
    }
}

function init() {
    snake = [{x: 200, y: 200}, {x: 180, y: 200}, {x: 160, y: 200}];
    dx = GRID; dy = 0; score = 0; 
    currentSpeed = difficultyBase; 
    lastSpeedMilestone = 0;
    document.getElementById("score").innerText = "000";
    document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');
    spawnFood();
}

function spawnFood() {
    const isPower = Math.random() < 0.3;
    const pool = isPower ? powerUps : normalFoods;
    const f = pool[Math.floor(Math.random() * pool.length)];
    food = {
        x: Math.floor(Math.random() * 19) * GRID,
        y: Math.floor(Math.random() * 19) * GRID,
        char: f.c, score: f.s, mod: f.m || 0
    };
    if(snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
}

// --- MENÜ KONTROLLERİ ---
window.startGame = () => { document.getElementById("mainMenu").classList.add("hidden"); init(); gameActive = true; window.notify("SİSTEM BAŞLATILDI"); };
window.showSettings = () => { document.getElementById("mainMenu").classList.add("hidden"); document.getElementById("settingsMenu").classList.remove("hidden"); };
window.hideSettings = () => { document.getElementById("settingsMenu").classList.add("hidden"); document.getElementById("mainMenu").classList.remove("hidden"); };
window.setDiff = (val) => { difficultyBase = [180, 130, 80][val]; window.notify("ZORLUK AYARLANDI"); window.hideSettings(); };
window.showMarket = () => { document.getElementById("mainMenu").classList.add("hidden"); document.getElementById("marketMenu").classList.remove("hidden"); document.getElementById("marketMoney").innerText = money; };
window.hideMarket = () => { document.getElementById("marketMenu").classList.add("hidden"); document.getElementById("mainMenu").classList.remove("hidden"); };

window.buySkin = (color, price) => {
    if (money >= price) {
        if(price > 0) money -= price;
        snakeColor = color;
        localStorage.setItem("cyberMoney", money);
        localStorage.setItem("cyberSkin", color);
        document.getElementById("moneyDisplay").innerText = money;
        document.getElementById("marketMoney").innerText = money;
        window.notify("GÖRÜNÜM AKTİF EDİLDİ");
    } else { window.notify("YETERSİZ NAKİT!"); }
};

window.toggleGodMode = () => {
    sigClickCount++;
    clearTimeout(sigTimer);
    sigTimer = setTimeout(() => sigClickCount = 0, 1000);
    if(sigClickCount === 3) {
        godMode = !godMode;
        window.notify(godMode ? "GOD MODE: AKTİF" : "GOD MODE: PASİF");
    }
};

// --- SWIPE KONTROLLERİ ---
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; }, {passive: false});
canvas.addEventListener('touchend', e => {
    if(!gameActive) return;
    const dX = e.changedTouches[0].screenX - touchStartX;
    const dY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dX) > Math.abs(dY)) { if (Math.abs(dX) > 30 && dx === 0) { dx = dX > 0 ? GRID : -GRID; dy = 0; } }
    else { if (Math.abs(dY) > 30 && dy === 0) { dy = dY > 0 ? GRID : -GRID; dx = 0; } }
}, {passive: false});

// --- OYUN DÖNGÜSÜ ---
function update() {
    if (!gameActive) return;
    let nx = snake[0].x + dx, ny = snake[0].y + dy;

    if (godMode) {
        if (nx < 0) nx = 380; if (nx > 380) nx = 0;
        if (ny < 0) ny = 380; if (ny > 380) ny = 0;
    } else if (nx < 0 || nx >= 400 || ny < 0 || ny >= 400 || snake.some(s => s.x === nx && s.y === ny)) {
        gameActive = false;
        if (score > highScore) { 
            highScore = score; 
            localStorage.setItem("cyberBest", highScore);
            saveToFirebase(highScore);
            window.notify("YENİ REKOR!"); 
        }
        document.getElementById("mainMenu").classList.remove("hidden");
        document.getElementById("menuTitle").innerText = "SİSTEM ÇÖKTÜ";
        return;
    }

    const head = { x: nx, y: ny };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += food.score;
        money += 5; 
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        document.getElementById("moneyDisplay").innerText = money;
        localStorage.setItem("cyberMoney", money);
        
        currentSpeed = Math.max(35, currentSpeed + food.mod);
        if(Math.floor(score / 50) > lastSpeedMilestone) {
            currentSpeed -= 3;
            lastSpeedMilestone = Math.floor(score / 50);
            window.notify("HIZ ARTIRILDI!");
        }
        spawnFood();
    } else { snake.pop(); }
}

function draw() {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 400, 400);
    ctx.font = "18px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(food.char, food.x + GRID/2, food.y + GRID/2);

    snake.forEach((s, i) => {
        ctx.fillStyle = godMode ? "#fbbf24" : (i === 0 ? snakeColor : "#0c4a6e");
        ctx.shadowBlur = (i === 0) ? 15 : 0;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(s.x + 1, s.y + 1, GRID - 2, GRID - 2);
    });
    ctx.shadowBlur = 0;
}

function loop() { update(); draw(); setTimeout(loop, currentSpeed); }
document.getElementById("moneyDisplay").innerText = money;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');
loop();
