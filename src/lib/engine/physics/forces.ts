import type { Vec2D, Vehicle } from '../types';

export type ForceParams = {
  gravity: number;
  maxDriveForce: number;
  propulsionForce: number;
  propulsionOscillation: number;
  propulsionFrequencyHz: number;
  drag: number;
};

export function computeAcceleration(vehicle: Vehicle, params: ForceParams, time: number): Vec2D {
  let tractionLimit = params.maxDriveForce;
  let slopeGravityX = 0;

  if (vehicle.groundedSurface) {
    const f = vehicle.groundedSurface.segment.friction;
    const normalForce = vehicle.mass * params.gravity;
    // Traction from weight over terrain: F_max = mu * N
    tractionLimit = Math.max(0, Math.min(params.maxDriveForce, f * normalForce));

    const angle = vehicle.groundedSurface.angle;
    slopeGravityX = params.gravity * Math.sin(angle);
  }

  const oscillation = params.propulsionOscillation * Math.sin(2 * Math.PI * params.propulsionFrequencyHz * time);
  const propulsion = params.propulsionForce + oscillation;
  const drive = Math.max(-tractionLimit, Math.min(tractionLimit, propulsion));
  const drag = vehicle.velocity.x * params.drag;

  return {
    x: (drive - drag) / vehicle.mass + slopeGravityX,
    y: params.gravity
  };
}
