import type { Vec2D, Vehicle } from '../types';

export function integrateSemiImplicitEuler(vehicle: Vehicle, acceleration: Vec2D, dt: number): Vehicle {
  const velocity = {
    x: vehicle.velocity.x + acceleration.x * dt,
    y: vehicle.velocity.y + acceleration.y * dt
  };

  const position = {
    x: vehicle.position.x + velocity.x * dt,
    y: vehicle.position.y + velocity.y * dt
  };

  return {
    ...vehicle,
    position,
    velocity,
    acceleration: acceleration
  };
}
