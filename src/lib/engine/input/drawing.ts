import type { PointTerrain } from '../types';

export function addTerrainPoint(points: PointTerrain[], next: PointTerrain, minDistance = 4): PointTerrain[] {
  const last = points[points.length - 1];
  if (!last) return [next];

  const dx = next.x - last.x;
  const dy = next.y - last.y;
  if (Math.hypot(dx, dy) < minDistance) return points;

  return [...points, next];
}
