export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
};

export function createDustParticle(
  x: number,
  y: number,
  vx: number,
  isSlippery: boolean
): Particle {
  return {
    x,
    y,
    vx: -vx * 0.2 + (Math.random() - 0.5) * 1.5,
    vy: -Math.random() * 1.5 - 0.5,
    alpha: 0.7,
    size: Math.random() * 4 + 2,
    color: isSlippery ? 'rgba(180, 220, 240, 0.6)' : 'rgba(160, 130, 100, 0.5)'
  };
}

export function updateParticles(particles: Particle[]): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;
    p.size += 0.05;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}
