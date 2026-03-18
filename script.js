const canvas = document.getElementById("cyberCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");

canvas.width = 320;
canvas.height = 385;

const GRID = 16; 
let snake, food, dx, dy, score, gameActive = false;
let speed = 140;
let highScore = localStorage.getItem("purpleSnakeBest") || 0;
document.getElementById("highScore").innerText = highScore.toString().padStart(2, '0');

function init() {
    snake = [{x: GRID * 10, y: GRID * 12}, {x: GRID * 9, y: GRID * 12}];
    dx = GRID; dy = 0; score = 0; speed = 140;
    document.getElementById("score").innerText = "00";
    spawnFood();
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / GRID)) * GRID,
        y: Math.floor(Math.random() * (canvas.height / GRID)) * GRID
    };
    if(snake.some(s => s.x === food.x && s.y === food.y)) spawnFood();
}

let startX, startY;
window.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}, {passive: false});

window.addEventListener('touchend', e => {
    if(!gameActive) { 
        gameActive = true; 
        overlay.classList.add("hidden"); 
        init(); 
        return; 
    }
    const diffX = e.changedTouches[0].clientX - startX;
    const diffY = e.changedTouches[0].clientY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 15 && dx === 0) { dx = diffX > 0 ? GRID : -GRID; dy = 0; }
    } else {
        if (Math.abs(diffY) > 15 && dy === 0) { dy = diffY > 0 ? GRID : -GRID; dx = 0; }
    }
}, {passive: false});

function update() {
    if (!gameActive) return;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (head.x < 0 || head.x >= 320 || head.y < 0 || head.y >= 385 || 
        snake.some(s => s.x === head.x && s.y === head.y)) {
        gameActive = false;
        overlay.classList.remove("hidden");
        document.getElementById("overlay").querySelector("h1").innerText = "SYSTEM HALTED";
        if(score > highScore) {
            highScore = score;
            localStorage.setItem("purpleSnakeBest", highScore);
            document.getElementById("highScore").innerText = highScore.toString().padStart(2, '0');
        }
        return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById("score").innerText = score.toString().padStart(2, '0');
        speed = Math.max(70, speed - 2);
        spawnFood();
    } else { snake.pop(); }
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1e1b4b";
    ctx.lineWidth = 0.5;
    for(let x=0; x<320; x+=GRID) { ctx.strokeRect(x, 0, GRID, 385); }

    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 10; ctx.shadowColor = "#a855f7";
    ctx.fillRect(food.x+4, food.y+4, GRID-8, GRID-8);

    snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#d8b4fe" : "#7e22ce";
        ctx.shadowBlur = i === 0 ? 12 : 0;
        ctx.fillRect(s.x+1, s.y+1, GRID-2, GRID-2);
    });
    ctx.shadowBlur = 0;
}

function loop() { 
    update(); 
    draw(); 
    setTimeout(() => requestAnimationFrame(loop), speed); 
}
loop();

