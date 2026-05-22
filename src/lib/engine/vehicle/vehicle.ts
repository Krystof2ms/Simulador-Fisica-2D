import type { Vehicle } from '../types';

export function createVehicle(initial?: Partial<Vehicle>): Vehicle {
  return {
    position: { x: 100, y: 120 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    mass: 1000,
    angle: 0,
    width: 42,
    height: 20,
    groundedSurface: undefined,
    ...initial
  };
}
