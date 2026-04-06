const canvas = document.getElementById("stars-canvas");
const ctx = canvas.getContext("2d");

let stars = [];
let shootingStars = [];

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createStars();
}

function createStars() {
  stars = [];

  const total = Math.floor((window.innerWidth * window.innerHeight) / 6000);

  for (let i = 0; i < total; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.3,
      speed: Math.random() * 0.4 + 0.05,
      alpha: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.01
    });
  }
}

function spawnShootingStar() {
  shootingStars.push({
    x: Math.random() * window.innerWidth,
    y: -50,
    length: Math.random() * 150 + 80,
    speed: Math.random() * 8 + 6,
    size: Math.random() * 1.5 + 0.5,
    life: 0
  });
}

function drawStar(star) {
  const pulse = (Math.sin(star.pulse) + 1) / 2;
  const alpha = star.alpha * (0.6 + pulse * 0.8);
  const size = star.size * (0.8 + pulse * 0.5);

  // núcleo
  ctx.beginPath();
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
  ctx.fill();

  // glow
  ctx.beginPath();
  ctx.fillStyle = `rgba(120,180,255,${alpha * 0.2})`;
  ctx.arc(star.x, star.y, size * 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawShootingStars() {
  shootingStars = shootingStars.filter(s => s.y < window.innerHeight + 200);

  shootingStars.forEach(s => {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = s.size;

    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.length * 0.3, s.y - s.length);

    ctx.stroke();

    s.y += s.speed;
    s.x -= s.speed * 0.3;
    s.life++;

    if (s.life > 60) {
      s.y = window.innerHeight + 300;
    }
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    star.y += star.speed;
    star.pulse += star.pulseSpeed;

    if (star.y > window.innerHeight) {
      star.y = 0;
      star.x = Math.random() * window.innerWidth;
    }

    drawStar(star);
  });

  drawShootingStars();

  if (Math.random() < 0.015) {
    spawnShootingStar();
  }

  requestAnimationFrame(animate);
}

// INIT
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animate();
