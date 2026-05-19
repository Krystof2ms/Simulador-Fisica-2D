import type { Vehicle } from '../types';

export function applyGroundedFriction(vehicle: Vehicle, friction = 0.9): Vehicle {
  if (!vehicle.groundedSurface) return vehicle;

  return {
    ...vehicle,
    velocity: {
      x: vehicle.velocity.x * friction,
      y: vehicle.velocity.y
    }
  };
}
