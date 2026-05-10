/**
 * J.A.R.V.I.S. MASTERWORK EDITION v6.2
 * Otonom Mühendislik Birimi | Stark Industries
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const scoreEl = document.getElementById('score');
const statAlt = document.getElementById('stat-alt');
const statVel = document.getElementById('stat-vel');
const statDist = document.getElementById('stat-dist');
const pwrFill = document.getElementById('pwr-fill');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const loadingOverlay = document.getElementById('loading-overlay');
const finalScoreVal = document.getElementById('final-score-val');

// Config
canvas.width = 400;
canvas.height = 600;

// FİZİK PROTOKOLÜ (Kaptan'ın Kırmızı Çizgisi)
const GRAVITY = 0.15;
const JUMP = -4.5;
const PIPE_SPAWN_INTERVAL = 110;
const PIPE_SPEED = 2.4;
const PIPE_GAP = 150;

// Game State
let bird, pipes, particles, stars, score, dist, frames, gameState;

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2 - 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.color = color;
        this.life = 1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
    }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.speed = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x -= this.speed;
        if (this.x < 0) this.x = canvas.width;
    }
    draw() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

function init() {
    bird = {
        x: 60,
        y: 300,
        w: 36,
        h: 24,
        vel: 0,
        rot: 0,
        pwr: 100
    };
    pipes = [];
    particles = [];
    stars = Array.from({ length: 50 }, () => new Star());
    score = 0;
    dist = 0;
    frames = 0;
    gameState = 'START';
    
    // UI Reset
    scoreEl.innerText = '00';
    statAlt.innerText = '300';
    statVel.innerText = '0.0';
    statDist.innerText = '0';
    pwrFill.style.width = '100%';
}

function spawnPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    pipes.push({ x: canvas.width, top: height, passed: false });
}

function update() {
    if (gameState !== 'PLAYING') return;

    frames++;
    dist += 1;
    
    // Bird Physics
    bird.vel += GRAVITY;
    bird.y += bird.vel;
    bird.rot = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.vel * 0.1));
    
    // Telemetry Sync
    statAlt.innerText = Math.floor(canvas.height - bird.y).toString().padStart(3, '0');
    statVel.innerText = bird.vel.toFixed(1);
    statDist.innerText = Math.floor(dist / 10);
    
    // Particle Engine (Bird Tail)
    if (frames % 2 === 0) {
        particles.push(new Particle(bird.x + 5, bird.y + bird.h / 2, "#00d2ff"));
    }

    // Death check
    if (bird.y + bird.h > canvas.height || bird.y < 0) endByCrash();

    // Star parallax
    stars.forEach(s => s.update());

    // Pipes
    if (frames % PIPE_SPAWN_INTERVAL === 0) spawnPipe();
    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= PIPE_SPEED;

        // Collision
        if (bird.x + bird.w - 8 > p.x && bird.x + 8 < p.x + 60 && 
            (bird.y + 6 < p.top || bird.y + bird.h - 6 > p.top + PIPE_GAP)) {
            endByCrash();
        }

        if (!p.passed && bird.x > p.x + 60) {
            score++;
            p.passed = true;
            scoreEl.innerText = score.toString().padStart(2, '0');
            // Flash effect on score
            scoreEl.style.color = "#fff";
            setTimeout(() => scoreEl.style.color = "#00d2ff", 100);
        }

        if (p.x < -100) pipes.splice(i, 1);
    }

    // Particles cleanup
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background Layer 1 (Stars)
    stars.forEach(s => s.draw());

    // Particles Overlay
    particles.forEach(p => p.draw());

    // Pipes Layer
    pipes.forEach(p => {
        // Stark Pipe Design
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00d2ff";
        
        let pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + 60, 0);
        pipeGrad.addColorStop(0, "#0f172a");
        pipeGrad.addColorStop(0.5, "#00d2ff");
        pipeGrad.addColorStop(1, "#0f172a");
        
        ctx.fillStyle = pipeGrad;
        // Top Pipe
        ctx.fillRect(p.x, 0, 60, p.top);
        // Bottom Pipe
        ctx.fillRect(p.x, p.top + PIPE_GAP, 60, canvas.height - (p.top + PIPE_GAP));
        
        // Detail Lines
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, 0, 60, p.top);
        ctx.strokeRect(p.x, p.top + PIPE_GAP, 60, canvas.height - (p.top + PIPE_GAP));
        
        ctx.shadowBlur = 0;
    });

    // Bird Layer (Drone Concept)
    ctx.save();
    ctx.translate(bird.x + bird.w / 2, bird.y + bird.h / 2);
    ctx.rotate(bird.rot);
    
    // Drone Body
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00d2ff";
    ctx.fillStyle = "#fff";
    
    // Main Body (Rounder Stark style)
    ctx.beginPath();
    ctx.roundRect(-bird.w/2, -bird.h/2, bird.w, bird.h, 5);
    ctx.fill();
    
    // Core Reactor
    ctx.fillStyle = "#00d2ff";
    ctx.beginPath();
    ctx.arc(-bird.w/4, 0, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    
    // Wing/Fin Detail
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(-bird.w/2, -bird.h/2, 5, bird.h);
    
    ctx.restore();
    ctx.shadowBlur = 0;
}

function endByCrash() {
    gameState = 'GAMEOVER';
    finalScoreVal.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function performAction() {
    if (gameState === 'START') {
        gameState = 'PLAYING';
        startScreen.classList.add('hidden');
    } else if (gameState === 'PLAYING') {
        bird.vel = JUMP;
    } else if (gameState === 'GAMEOVER') {
        init();
        gameOverScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }
}

// Controls
window.addEventListener('keydown', (e) => { 
    if (e.code === 'Space' || e.code === 'ArrowUp') performAction(); 
});
canvas.addEventListener('mousedown', performAction);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    performAction();
});

// Stark Boot Sequence
window.onload = () => {
    init();
    setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.style.display = 'none', 500);
        gameLoop();
    }, 1500); // Simulate system check
};
