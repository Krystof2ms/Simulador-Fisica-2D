export type Vec2D = { x: number; y: number };

export type PointTerain = Readonly<Vec2D>;

export type TerrainSegment = { start: PointTerain; end: PointTerain; angle: number };

export type Vehicle = {
  position: Vec2D;
  velocity: Vec2D;
  aceleration: Vec2D;
  mass: number;
  angle: number;
};
