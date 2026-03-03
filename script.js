/* CYBER SNAKE - CORE ENGINE
   Purpleguy © 2026 - tablet power 
*/

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400; 
canvas.height = 400;
const GRID = 20;

// Değişkenler
let snake, food, dx, dy, score, gameActive = false;
let currentSpeed = 130;
let difficultyBase = 130;
let lastSpeedMilestone = 0;
let money = parseInt(localStorage.getItem("cyberMoney")) || 0;
let snakeColor = localStorage.getItem("cyberSkin") || "#38bdf8";
let godMode = false;
let sigClickCount = 0;
let sigTimer;

// Yemek Çeşitleri
const normalFoods = [
    { c: '🍎', s: 10 }, { c: '🍕', s: 20 }, { c: '🍣', s: 25 }, 
    { c: '🍗', s: 22 }, { c: '🍔', s: 15 }, { c: '🍩', s: 12 }
];
const powerUps = [
    { c: '⚡️', s: 2, m: -15 }, // Hızlandırıcı
    { c: '❄️', s: 2, m: 15 }   // Yavaşlatıcı
];

// Başlatma
function init() {
    snake = [{x: 200, y: 200}, {x: 180, y: 200}];
    dx = GRID; dy = 0; score = 0; 
    currentSpeed = difficultyBase; 
    lastSpeedMilestone = 0;
    document.getElementById("score").innerText = "000";
    spawnFood();
}

function spawnFood() {
    const isPower = Math.random() < 0.2;
    const pool = isPower ? powerUps : normalFoods;
    const f = pool[Math.floor(Math.random() * pool.length)];
    food = {
        x: Math.floor(Math.random() * 20) * GRID,
        y: Math.floor(Math.random() * 20) * GRID,
        char: f.c, score: f.s, mod: f.m || 0
    };
    // Yılanın üstünde çıkmasın
    if(snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
}

// Menü Kontrolleri
window.startGame = () => { document.getElementById("mainMenu").classList.add("hidden"); init(); gameActive = true; };
window.showMarket = () => { document.getElementById("mainMenu").classList.add("hidden"); document.getElementById("marketMenu").classList.remove("hidden"); document.getElementById("marketMoney").innerText = money; };
window.hideMarket = () => { document.getElementById("marketMenu").classList.add("hidden"); document.getElementById("mainMenu").classList.remove("hidden"); };
window.showSettings = () => { document.getElementById("mainMenu").classList.add("hidden"); document.getElementById("settingsMenu").classList.remove("hidden"); };
window.hideSettings = () => { document.getElementById("settingsMenu").classList.add("hidden"); document.getElementById("mainMenu").classList.remove("hidden"); };
window.setDiff = (val) => { difficultyBase = [180, 130, 80][val]; alert("Zorluk Ayarlandı!"); };

// Market Sistemi
window.buySkin = (color, price) => {
    if (money >= price) {
        if(price > 0) money -= price;
        snakeColor = color;
        localStorage.setItem("cyberMoney", money);
        localStorage.setItem("cyberSkin", color);
        document.getElementById("moneyDisplay").innerText = money;
        document.getElementById("marketMoney").innerText = money;
    } else { alert("Yetersiz Nakit!"); }
};

// Gizli God Mode (3 Tık)
window.toggleGodMode = () => {
    sigClickCount++;
    clearTimeout(sigTimer);
    sigTimer = setTimeout(() => sigClickCount = 0, 1000);
    if(sigClickCount === 3) {
        godMode = !godMode;
        alert(godMode ? "GOD MODE: AKTİF" : "GOD MODE: PASİF");
    }
};

// Hareket (Swipe Desteği için basit klavye ekliyorum, Swipe zaten kodunda vardı)
window.addEventListener('keydown', e => {
    if(e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -GRID; }
    if(e.key === "ArrowDown" && dy === 0) { dx = 0; dy = GRID; }
    if(e.key === "ArrowLeft" && dx === 0) { dx = -GRID; dy = 0; }
    if(e.key === "ArrowRight" && dx === 0) { dx = GRID; dy = 0; }
});

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
        money += 5; // Her yemekte 5 para
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        document.getElementById("moneyDisplay").innerText = money;
        localStorage.setItem("cyberMoney", money);

        // Hızlanma Mantığı
        currentSpeed += food.mod;
        if(Math.floor(score / 50) > lastSpeedMilestone) {
            currentSpeed -= 3;
            lastSpeedMilestone = Math.floor(score / 50);
        }
        currentSpeed = Math.max(30, currentSpeed);
        spawnFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 400, 400);

    // Yemek
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(food.char, food.x + 10, food.y + 15);

    // Yılan
    snake.forEach((s, i) => {
        ctx.fillStyle = godMode ? "#fbbf24" : (i === 0 ? snakeColor : shadeColor(snakeColor, -30));
        ctx.fillRect(s.x + 1, s.y + 1, 18, 18);
    });
}

function shadeColor(color, percent) {
    let num = parseInt(color.replace("#",""),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

function loop() {
    update();
    draw();
    setTimeout(loop, currentSpeed);
}

document.getElementById("moneyDisplay").innerText = money;
loop();

