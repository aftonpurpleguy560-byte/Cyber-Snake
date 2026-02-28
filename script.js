/* CYBER SNAKE - THE ULTIMATE EDITION
   Purpleguy © 2026 - tablet power 
*/

const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const mainMenu = document.getElementById("mainMenu");
const settingsMenu = document.getElementById("settingsMenu");
const marketMenu = document.getElementById("marketMenu");
const menuTitle = document.getElementById("menuTitle");

canvas.width = 400; 
canvas.height = 400;
const GRID = 20;

// OYUN VE EKONOMİ DEĞİŞKENLERİ
let snake, food, dx, dy, score, gameActive = false;
let currentSpeed = 130;
let difficultyBase = 130;
let lastSpeedMilestone = 0;
let money = parseInt(localStorage.getItem("cyberMoney")) || 0;
let snakeColor = localStorage.getItem("cyberSkin") || "#38bdf8";

// GOD MODE DEĞİŞKENLERİ
let godMode = false;
let sigClickCount = 0;
let sigClickTimer;

// YEMEK LİSTELERİ (14 Çeşit Toplam)
const normalFoods = [
    { char: '🍎', score: 10 }, { char: '🍔', score: 15 }, { char: '🍕', score: 20 }, 
    { char: '🍣', score: 25 }, { char: '🍦', score: 10 }, { char: '🍩', score: 12 },
    { char: '🌮', score: 18 }, { char: '🍓', score: 8 }, { char: '🍗', score: 22 }, 
    { char: '🍪', score: 5 }
];

const powerUps = [
    { char: '⚡️', score: 2, speedMod: -15 }, // Hızlandırıcı
    { char: '⭐️', score: 5, speedMod: -25 }, // Büyük Hızlandırıcı
    { char: '❄️', score: 2, speedMod: 15 },  // Yavaşlatıcı
    { char: '💠', score: 5, speedMod: 25 }   // Büyük Yavaşlatıcı
];

// SES MOTORU
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}

// MENÜ VE MARKET FONKSİYONLARI
window.startGame = function() { 
    mainMenu.classList.add("hidden"); 
    init(); 
    gameActive = true; 
};

window.showSettings = function() { 
    mainMenu.classList.add("hidden"); 
    settingsMenu.classList.remove("hidden"); 
};

window.hideSettings = function() { 
    settingsMenu.classList.add("hidden"); 
    mainMenu.classList.remove("hidden"); 
};

window.showMarket = function() {
    mainMenu.classList.add("hidden");
    marketMenu.classList.remove("hidden");
    document.getElementById("marketMoney").innerText = money;
};

window.hideMarket = function() {
    marketMenu.classList.add("hidden");
    mainMenu.classList.remove("hidden");
};

window.setDiff = function(l) { 
    difficultyBase = [180, 130, 80][l]; 
    document.querySelectorAll('.difficulty-row .btn').forEach(b => b.classList.remove('active-opt'));
    document.getElementById(`diff${l}`).classList.add('active-opt');
    playSound(440, 'sine', 0.1);
};

window.buySkin = function(color, price) {
    if (money >= price) {
        if(price > 0) money -= price;
        snakeColor = color;
        localStorage.setItem("cyberMoney", money);
        localStorage.setItem("cyberSkin", color);
        document.getElementById("marketMoney").innerText = money;
        document.getElementById("moneyDisplay").innerText = money;
        playSound(1000, 'sine', 0.2);
    } else {
        playSound(200, 'sawtooth', 0.3);
        alert("YETERSİZ BAKİYE!");
    }
};

window.toggleGodMode = function() {
    sigClickCount++;
    clearTimeout(sigClickTimer);
    sigClickTimer = setTimeout(() => { sigClickCount = 0; }, 1000);
    if (sigClickCount === 3) {
        godMode = !godMode;
        sigClickCount = 0;
        if(godMode) { playSound(1200, 'sine', 0.5); alert("GOD MODE ACTIVE"); }
        else { playSound(300, 'sawtooth', 0.5); alert("GOD MODE INACTIVE"); }
    }
};

// OYUN MANTIĞI
function init() {
    snake = [{x: 200, y: 200}, {x: 180, y: 200}];
    dx = GRID; dy = 0; score = 0; 
    currentSpeed = difficultyBase; 
    lastSpeedMilestone = 0;
    document.getElementById("score").innerText = "000";
    spawnFood();
}

function spawnFood() {
    const isPowerUp = Math.random() < 0.25;
    const pool = isPowerUp ? powerUps : normalFoods;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    food = { x: Math.floor(Math.random() * (canvas.width / GRID)) * GRID, y: Math.floor(Math.random() * (canvas.height / GRID)) * GRID, ...selected };
    if(snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
}

// SWIPE KONTROLÜ
let touchStartX = 0, touchStartY = 0;
window.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; }, {passive: false});
window.addEventListener('touchend', e => {
    if(!gameActive) return;
    const dX = e.changedTouches[0].screenX - touchStartX;
    const dY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dX) > Math.abs(dY)) { if (Math.abs(dX) > 30 && dx === 0) { dx = dX > 0 ? GRID : -GRID; dy = 0; } }
    else { if (Math.abs(dY) > 30 && dy === 0) { dy = dY > 0 ? GRID : -GRID; dx = 0; } }
}, {passive: false});

function update() {
    if (!gameActive) return;
    let nextX = snake[0].x + dx;
    let nextY = snake[0].y + dy;

    // Çarpışma ve God Mode Duvar Geçişi
    if (godMode) {
        if (nextX < 0) nextX = 380; else if (nextX >= 400) nextX = 0;
        if (nextY < 0) nextY = 380; else if (nextY >= 400) nextY = 0;
    } else {
        if (nextX < 0 || nextX >= 400 || nextY < 0 || nextY >= 400 || snake.some(s => s.x === nextX && s.y === nextY)) {
            gameActive = false; playSound(150, 'sawtooth', 0.5);
            menuTitle.innerText = "SİSTEM ÇÖKTÜ"; mainMenu.classList.remove("hidden");
            return;
        }
    }

    const head = {x: nextX, y: nextY};
    snake.unshift(head);

    // Yemek Yeme ve Ekonomi
    if (head.x === food.x && head.y === food.y) {
        score += food.score;
        money += Math.floor(food.score / 2); // 10 puan = 5 para kuralı
        localStorage.setItem("cyberMoney", money);
        
        document.getElementById("score").innerText = score.toString().padStart(3, '0');
        document.getElementById("moneyDisplay").innerText = money;

        // Hız Kontrolü
        if(food.speedMod) { currentSpeed += food.speedMod; playSound(1200, 'sine', 0.1); }
        else { playSound(880, 'square', 0.1); }

        // Her 50 Puan Eşiği
        let currentMilestone = Math.floor(score / 50);
        if (currentMilestone > lastSpeedMilestone) {
            currentSpeed -= 3;
            lastSpeedMilestone = currentMilestone;
            playSound(1500, 'sine', 0.05);
        }
        currentSpeed = Math.max(25, Math.min(250, currentSpeed));
        spawnFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0f172a";
    for(let i=0; i<400; i+=20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,400); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(400,i); ctx.stroke(); }
    
    // Yemek Çizimi
    ctx.font = "16px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(food.char, food.x + GRID/2, food.y + GRID/2);

    // Yılan Çizimi
    snake.forEach((s, i) => {
        ctx.fillStyle = godMode ? "#fbbf24" : (i === 0 ? snakeColor : shadeColor(snakeColor, -30));
        ctx.shadowBlur = (i === 0) ? 10 : 0;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(s.x+1, s.y+1, GRID-2, GRID-2);
    });
    ctx.shadowBlur = 0;
}

function shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);
    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);
    return `rgb(${R},${G},${B})`;
}

function loop() { update(); draw(); setTimeout(loop, currentSpeed); }

// BAŞLATMA
document.getElementById("moneyDisplay").innerText = money;
let highScore = localStorage.getItem("cyberSwipeBest") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(3, '0');
loop();
