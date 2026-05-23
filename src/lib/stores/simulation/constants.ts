import type { PointTerrain } from '$lib/engine/types';

export const DEFAULT_CONFIG = {
    gravity: 9.8 * 30,
    maxDriveForce: 1800,
    propulsionForce: 900,
    propulsionOscillation: 0,
    propulsionFrequencyHz: 0,
    propulsionDropFactor: 0,
    drag: 0.0,
    friction: 0.9,
    fixedDt: 1 / 60,
    snapDistance: 15
};

export const DEFAULT_TERRAIN: PointTerrain[] = [
    { x: 0, y: 360, friction: 0.9 },
    { x: 175, y: 360, friction: 0.9 },
    { x: 350, y: 360, friction: 0.9 },
    { x: 525, y: 360, friction: 0.9 },
    { x: 700, y: 360, friction: 0.9 },
    { x: 875, y: 360, friction: 0.9 },
    { x: 1050, y: 360, friction: 0.9 },
    { x: 1225, y: 360, friction: 0.9 },
    { x: 1400, y: 360, friction: 0.9 }
];

export const CANVAS_WIDTH = 1400;
export const FLOOR_LIMIT_Y = 510;
export const MIN_TERRAIN_Y = 0;
