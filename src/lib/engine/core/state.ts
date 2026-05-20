import type { TerrainSegment, Vehicle, ControlsState } from '../types';

export type EngineConfig = {
  gravity: number;
  maxDriveForce: number;
  drag: number;
  friction: number;
  fixedDt: number;
  snapDistance: number;
};

export type EngineState = {
  vehicle: Vehicle;
  terrain: TerrainSegment[];
  controls: ControlsState;
  config: EngineConfig;
  time: number;
};
