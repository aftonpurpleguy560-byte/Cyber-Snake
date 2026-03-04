/* CYBER SNAKE - ABSOLUTE VISIBILITY ENGINE
   Purpleguy © 2026 - tablet power 
*/

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400; 
canvas.height = 400;
const GRID = 20;

// OYUN DURUMU
let snake, food, dx, dy, score, gameActive = false;
let currentSpeed = 130;
let lastSpeedMilestone = 0;
let money = parseInt(localStorage.getItem("cyberMoney")) || 0;
let snakeColor = localStorage.getItem("cyberSkin") || "#38bdf8";
let godMode = false;
let sigClickCount = 0;

// 🍎 ZENGİN MENÜ (10 Normal Yemek)
const normalFoods = [
    { c: '🍎', s: 10 }, { c: '🍔', s: 15 }, { c: '🍕', s: 20 }, 
    { c: '🍣', s: 25 }, { c: '🍦', s: 10 }, { c: '🍩', s: 12 },
    { c: '🌮', s: 18 }, { c: '🍓', s: 8 }, { c: '🍗', s: 22 }, 
    { c: '🍪', s: 5 }
];

// ⚡️ GÜÇLENDİRİCİLER (4 Tane)
const powerUps = [
    { c: '⚡️', s: 2, m: -15 }, { c: '⭐️', s: 5, m: -25 }, 
    { c: '❄️', s: 2, m: 15 },  { c: '💠', s: 5, m: 25 }
];

function init() {
    // Yılanı ekranın tam ortasında, görünür şekilde başlat
    snake = [
        {x: 200, y: 200},
        {x: 180, y: 200},
        {x: 160, y: 200}
    ];
    dx = GRID; 
    dy = 0; 
    score = 0; 
    currentSpeed = 130;
    lastSpeedMilestone = 0;
    document.getElementById("score").innerText = "000";
    spawnFood();
}

function spawnFood() {
    const isPower = Math.random() < 0.3;
    const pool = isPower ? powerUps : normalFoods;
    const f = pool[Math.floor(Math.random() * pool.length)];
    
    // Rastgele ama GRID'e tam oturan koordinatlar
    food = {
        x: Math.floor(Math.random() * 19) * GRID,
        y: Math.floor(Math.random() * 19) * GRID,
        char: f.c, score: f.s, mod: f.m || 0
    };
    // Yemek yılanın içinde doğmasın
    if(snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
}

// BUTON KOMUTLARI
window.startGame = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    init();
    gameActive = true;
};

window.showMarket = () => {
    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("marketMenu").classList.remove("hidden");
    document.getElementById("marketMoney").innerText = money;
};

window.hideMarket = () => {
    document.getElementById("marketMenu").classList.add("hidden");
    document.getElementById("mainMenu").classList.remove("hidden");
};

window.buySkin = (color, price) => {
    if (money >= price) {
        if(price > 0) money -= price;
        snakeColor = color;
        localStorage.setItem("cyberMoney", money);
        localStorage.setItem("cyberSkin", color);
        document.getElementById("moneyDisplay").innerText = money;
        document.getElementById("marketMoney").innerText = money;
    }
};

window.toggleGodMode = () => {
    sigClickCount++;
    if(sigClickCount === 3) {
        godMode = !godMode;
        sigClickCount = 0;
        alert(godMode ? "GOD MODE: ON" : "GOD MODE: OFF");
    }
};

// ÇİZİM MOTORU (Yılan burada görünüyor)
function draw() {
    // Siyah Arka Plan
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yemeği Çiz (Emojiler)
    if (food) {
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(food.char, food.x + GRID/2, food.y + GRID/2);
    }

    // YILANI ÇİZ
    if (snake) {
        snake.forEach((s, i) => {
            // God Mode sarı, normalde senin seçtiğin renk
            ctx.fillStyle = godMode ? "#fbbf24" : (i === 0 ? snakeColor : "#0c4a6e");
            ctx.shadowBlur = 15;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(s.x + 1, s.y + 1, GRID - 2, GRID - 2);
        });
        ctx.shadowBlur = 0;
    }
}

function update() {
    if (!gameActive) return;

    let nx = snake[0].x + dx;
    let ny = snake[0].y + dy;

    // Duvar Kontrolü ve Teleport (God Mode)
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

    // Yemek Yeme
    if (head.x === food.x && head.y === food.y) {
        score += food.score;
        money += 5; // Her yemekte 5 para
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        document.getElementById("moneyDisplay").innerText = money;
        localStorage.setItem("cyberMoney", money);

        // Hızlanma
        currentSpeed = Math.max(35, currentSpeed + food.mod);
        if(Math.floor(score / 50) > lastSpeedMilestone) {
            currentSpeed -= 3;
            lastSpeedMilestone = Math.floor(score / 50);
        }
        spawnFood();
    } else {
        snake.pop();
    }
}

function loop() {
    update();
    draw();
    setTimeout(loop, currentSpeed);
}

// PARA GÖSTERGESİNİ YÜKLE VE DÖNGÜYÜ BAŞLAT
document.getElementById("moneyDisplay").innerText = money;
loop();

