import type { PointTerrain, TerrainSegment } from '../types';

export function buildTerrainSegments(points: ReadonlyArray<PointTerrain>): TerrainSegment[] {
  const segments: TerrainSegment[] = [];

  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    segments.push({ start, end, angle });
  }

  return segments;
}
