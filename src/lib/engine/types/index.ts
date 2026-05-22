export type Vec2D = { x: number; y: number };

export type PointTerrain = {
  readonly x: number;
  readonly y: number;
  readonly friction?: number;
};

export type TerrainSegment = { start: PointTerrain; end: PointTerrain; angle: number; friction: number };

export type Vehicle = {
  position: Vec2D;
  velocity: Vec2D;
  acceleration: Vec2D;
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

export type ControlsState = {
  throttle: number;
  brake: number;
};
