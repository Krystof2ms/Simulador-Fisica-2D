import type { Vehicle } from '../types';

export function applyGroundedFriction(vehicle: Vehicle, friction = 0.9): Vehicle {
  if (!vehicle.groundedSurface) return vehicle;

  const segmentFriction = vehicle.groundedSurface.segment.friction ?? friction;
  
  // High-fidelity rolling resistance model:
  // Deceleration factor based on segment friction (lower friction = less damping = slides more!)
  // This avoids the infinite acceleration bug for friction > 1.0, and makes ice slide beautifully!
  const baseDamping = 0.015;
  const rollingResistance = Math.max(0.002, Math.min(0.08, baseDamping * segmentFriction));
  const damping = 1.0 - rollingResistance;

  return {
    ...vehicle,
    velocity: {
      x: vehicle.velocity.x * damping,
      y: vehicle.velocity.y
    }
  };
}
