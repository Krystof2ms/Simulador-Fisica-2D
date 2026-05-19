import type { Vec2D, Vehicle } from '../types';

export function getWheelAnchor(vehicle: Vehicle): Vec2D {
  return {
    x: vehicle.position.x,
    y: vehicle.position.y + vehicle.height / 2
  };
}
