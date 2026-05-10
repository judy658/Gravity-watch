const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

const GRAVITY = 0.15;
const JUMP = -4.5;

let bird = {
    x: 50,
    y: 150,
    width: 34,
    height: 24,
    velocity: 0
};

function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function updateBird() {
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
    }
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        bird.velocity = JUMP;
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird();
    updateBird();
    requestAnimationFrame(gameLoop);
}

gameLoop();