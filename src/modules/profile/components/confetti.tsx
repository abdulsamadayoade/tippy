export function fireConfetti(canvas: HTMLCanvasElement | null) {
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const bounds = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = bounds.width * dpr;
  canvas.height = bounds.height * dpr;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = [
    "oklch(0.68 0.155 145)",
    "oklch(0.88 0.09 145)",
    "oklch(0.32 0.07 145)",
    "oklch(0.76 0.16 145)",
  ];
  const centerX = bounds.width / 2;
  const centerY = bounds.height * 0.34;
  const particles = Array.from({ length: 130 }, (_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 9 + 3;

    return {
      x: centerX,
      y: centerY,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed - 6,
      size: 5 + Math.random() * 7,
      rotation: Math.random() * Math.PI * 2,
      rotationVelocity: (Math.random() - 0.5) * 0.45,
      color: colors[index % colors.length],
      circle: Math.random() > 0.5,
    };
  });

  let frame = 0;
  let animationFrame = 0;

  const tick = () => {
    frame += 1;
    context.clearRect(0, 0, bounds.width, bounds.height);

    for (const particle of particles) {
      particle.velocityY += 0.28;
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityX *= 0.99;
      particle.rotation += particle.rotationVelocity;

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.globalAlpha = Math.max(0, 1 - frame / 125);

      if (particle.circle) {
        context.beginPath();
        context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        context.fill();
      } else {
        context.fillRect(
          -particle.size / 2,
          -particle.size / 2,
          particle.size,
          particle.size * 0.62,
        );
      }

      context.restore();
    }

    if (frame < 125) animationFrame = window.requestAnimationFrame(tick);
  };

  tick();

  return () => {
    window.cancelAnimationFrame(animationFrame);
    context.clearRect(0, 0, bounds.width, bounds.height);
  };
}
