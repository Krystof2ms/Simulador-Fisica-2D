import type { Vec2D, Vehicle } from '../types';

export type ForceParams = {
  gravity: number;
  maxDriveForce: number;
  propulsionForce: number;
  propulsionOscillation: number;
  propulsionFrequencyHz: number;
  propulsionDropFactor: number;
  drag: number;
};

export function computeAcceleration(vehicle: Vehicle, params: ForceParams, time: number): Vec2D {
  let tractionLimit = Number.POSITIVE_INFINITY;
  let slopeGravityX = 0;

  if (vehicle.groundedSurface) {
    const f = vehicle.groundedSurface.segment.friction;
    const normalForce = vehicle.mass * params.gravity;
    // Traction from weight over terrain: F_max = mu * N
    // If traction is very low, propulsion still works (thruster-like behavior).
    tractionLimit = Math.max(0, f * normalForce);

    const angle = vehicle.groundedSurface.angle;
    slopeGravityX = params.gravity * Math.sin(angle);
  }

  const oscillation = params.propulsionOscillation * Math.sin(2 * Math.PI * params.propulsionFrequencyHz * time);
  const rawPropulsion = params.propulsionForce + oscillation;
  const dropDenominator = 1 + Math.max(0, params.propulsionDropFactor) * Math.abs(vehicle.velocity.x);
  const propulsion = rawPropulsion / dropDenominator;
  const tractionDrive = Math.max(-tractionLimit, Math.min(tractionLimit, propulsion));
  const drive = tractionLimit > 0 ? tractionDrive : propulsion;
  const drag = vehicle.velocity.x * params.drag;

  return {
    x: (drive - drag) / vehicle.mass + slopeGravityX,
    y: params.gravity
  };
}
