import type { PointTerrain, TerrainSegment } from '../types';
import { buildTerrainSegments } from './interpolation';
import { smoothTerrain } from './smoothing';

export type Terrain = {
  points: PointTerrain[];
  segments: TerrainSegment[];
};

export function createTerrain(points: ReadonlyArray<PointTerrain>, smoothIterations = 0): Terrain {
  const smoothed = smoothIterations > 0 ? smoothTerrain(points, smoothIterations) : points.slice();
  return {
    points: smoothed,
    segments: buildTerrainSegments(smoothed)
  };
}
