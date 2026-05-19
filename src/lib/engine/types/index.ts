export type Vec2D = { x: number; y: number };

export type PointTerrain = Readonly<Vec2D>;

export type TerrainSegment = { start: PointTerrain; end: PointTerrain; angle: number };

export type Vehicle = {
  position: Vec2D;
  velocity: Vec2D;
  aceleration: Vec2D;
  mass: number;
  angle: number;
  width: number;
  height: number;
  groundedSurface?: SurfaceInfo;
};

export type SurfaceInfo = {
  segment: TerrainSegment;
  angle: number;
  normal: Vec2D;
  tangent: Vec2D;
  height: number;
};
