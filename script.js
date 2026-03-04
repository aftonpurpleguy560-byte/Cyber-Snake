/* CYBER SNAKE - FULL MENU & REPAIR EDITION
   Purpleguy © 2026 - tablet power 
*/

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400; 
canvas.height = 400;
const GRID = 20;

let snake, food, dx, dy, score, gameActive = false;
let currentSpeed = 130;
let money = parseInt(localStorage.getItem("cyberMoney")) || 0;
let snakeColor = localStorage.getItem("cyberSkin") || "#38bdf8";
let godMode = false;
let sigClickCount = 0;
let lastSpeedMilestone = 0;

// 🍎 NORMAL YEMEK LİSTESİ (10 Çeşit)
const normalFoods = [
    { c: '🍎', s: 10 }, { c: '🍔', s: 15 }, { c: '🍕', s: 20 }, 
    { c: '🍣', s: 25 }, { c: '🍦', s: 10 }, { c: '🍩', s: 12 },
    { c: '🌮', s: 18 }, { c: '🍓', s: 8 }, { c: '🍗', s: 22 }, 
    { c: '🍪', s: 5 }
];

// ⚡️ GÜÇLENDİRİCİ LİSTESİ (4 Çeşit)
const powerUps = [
    { c: '⚡️', s: 2, m: -15 }, // +2 Puan, +2 Hız (Süre azalır)
    { c: '⭐️', s: 5, m: -25 }, // +5 Puan, +5 Hız
    { c: '❄️', s: 2, m: 15 },  // +2 Puan, -2 Hız (Süre artar)
    { c: '💠', s: 5, m: 25 }   // +5 Puan, -5 Hız
];

function init() {
    snake = [{x: 200, y: 200}, {x: 180, y: 200}, {x: 160, y: 200}];
    dx = GRID; dy = 0; score = 0; 
    currentSpeed = 130; 
    lastSpeedMilestone = 0;
    document.getElementById("score").innerText = "000";
    spawnFood();
}

function spawnFood() {
    // %30 ihtimalle Power-up, %70 ihtimalle normal yemek
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

window.startGame = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    init();
    gameActive = true;
};

// Market ve God Mode fonksiyonlarını önceki tam koddan buraya ekleyebilirsin...

function update() {
    if (!gameActive) return;
    let nx = snake[0].x + dx;
    let ny = snake[0].y + dy;

    if (godMode) {
        if (nx < 0) nx = 380; if (nx > 380) nx = 0;
        if (ny < 0) ny = 380; if (ny > 380) ny = 0;
    } else if (nx < 0 || nx >= 400 || ny < 0 || ny >= 400 || snake.some(s => s.x === nx && s.y === ny)) {
        gameActive = false;
        document.getElementById("mainMenu").classList.remove("hidden");
        document.getElementById("menuTitle").innerText = "SİSTEM ÇÖKTÜ";
        return;
    }

    const head = { x: nx, y: ny };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += food.score;
        money += 5; // 10 puan = 5 para kuralı
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        document.getElementById("moneyDisplay").innerText = money;
        localStorage.setItem("cyberMoney", money);

        // HIZ MEKANİĞİ
        currentSpeed += food.mod; // Güçlendirici etkisi
        
        // Her 50 puanda bir otomatik hız +3 artar
        if(Math.floor(score / 50) > lastSpeedMilestone) {
            currentSpeed -= 3;
            lastSpeedMilestone = Math.floor(score / 50);
        }
        
        currentSpeed = Math.max(30, currentSpeed); // Hız sınırı
        spawnFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 400, 400);

    // Yemek Çizimi (Emoji)
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(food.char, food.x + GRID/2, food.y + GRID/2);

    // Yılan Çizimi
    snake.forEach((s, i) => {
        ctx.fillStyle = godMode ? "#fbbf24" : (i === 0 ? snakeColor : "#0c4a6e");
        ctx.shadowBlur = (i === 0) ? 10 : 0;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(s.x + 1, s.y + 1, GRID - 2, GRID - 2);
    });
    ctx.shadowBlur = 0;
}

function loop() {
    update();
    draw();
    setTimeout(loop, currentSpeed);
}
loop();
