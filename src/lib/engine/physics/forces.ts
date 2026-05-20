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

  let maxForce = params.maxDriveForce;
  let slopeGravityX = 0;

  if (vehicle.groundedSurface) {
    const f = vehicle.groundedSurface.segment.friction;
    // Traction limits based on grip coefficient (slippery ground has low grip)
    const gripFactor = Math.min(1.5, f / 0.9);
    maxForce = params.maxDriveForce * gripFactor;

    // Component of gravity parallel to the slope: g * sin(angle)
    // If angle > 0 (downhill), it accelerates in +x. If angle < 0 (uphill), it opposes movement.
    const angle = vehicle.groundedSurface.angle;
    slopeGravityX = params.gravity * Math.sin(angle);
  }

  const drive = throttle * maxForce;
  const braking = Math.sign(vehicle.velocity.x) * brake * params.maxDriveForce;
  const drag = vehicle.velocity.x * params.drag;

  return {
    x: (drive - braking - drag) / vehicle.mass + slopeGravityX,
    y: params.gravity
  };
}
