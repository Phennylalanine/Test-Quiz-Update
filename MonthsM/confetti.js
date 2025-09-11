let confettiParticles = [];

export function triggerConfetti() {
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      dx: (Math.random() - 0.5) * 4,
      dy: Math.random() * 4,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }
  drawConfetti();
}

function drawConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiParticles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 5, 5);
    p.x += p.dx;
    p.y += p.dy;
  });
  requestAnimationFrame(drawConfetti);
}