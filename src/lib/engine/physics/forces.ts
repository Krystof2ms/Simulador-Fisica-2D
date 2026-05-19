import type { Vec2D, Vehicle } from '../types';
import { clamp } from '../utils/clamp';

export type ForceParams = {
  gravity: number;
  throttle: number;
  brake: number;
  maxDriveForce: number;
  drag: number;
};

export function computeAcceleration(vehicle: Vehicle, params: ForceParams): Vec2D {
  const throttle = clamp(params.throttle, -1, 1);
  const brake = clamp(params.brake, 0, 1);

  const drive = throttle * params.maxDriveForce;
  const braking = Math.sign(vehicle.velocity.x) * brake * params.maxDriveForce;
  const drag = vehicle.velocity.x * params.drag;

  return {
    x: (drive - braking - drag) / vehicle.mass,
    y: params.gravity
  };
}
