import type { PointTerrain } from '../types';

export function smoothTerrain(points: ReadonlyArray<PointTerrain>, iterations = 1): PointTerrain[] {
  let current = points.slice();

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    if (current.length < 3) return current;

    const next: PointTerrain[] = [current[0]];

    for (let i = 0; i < current.length - 1; i += 1) {
      const p0 = current[i];
      const p1 = current[i + 1];

      next.push({ x: 0.75 * p0.x + 0.25 * p1.x, y: 0.75 * p0.y + 0.25 * p1.y });
      next.push({ x: 0.25 * p0.x + 0.75 * p1.x, y: 0.25 * p0.y + 0.75 * p1.y });
    }

    next.push(current[current.length - 1]);
    current = next;
  }

  return current;
}
