import type { EngineState } from './state';
import { computeAcceleration } from '../physics/forces';
import { integrateSemiImplicitEuler } from '../physics/integrator';
import { resolveGroundContact } from '../physics/collision';
import { alignVehicleToSurface } from '../physics/slope';
import { applyGroundedFriction } from '../vehicle/grounded';

export function fixedUpdate(state: EngineState, dt = state.config.fixedDt): EngineState {
  const acceleration = computeAcceleration(state.vehicle, {
    gravity: state.config.gravity,
    throttle: state.controls.throttle,
    brake: state.controls.brake,
    maxDriveForce: state.config.maxDriveForce,
    drag: state.config.drag
  });

  const integrated = integrateSemiImplicitEuler(state.vehicle, acceleration, dt);
  const withGround = resolveGroundContact(integrated, state.terrain, state.config.snapDistance);
  const aligned = alignVehicleToSurface(withGround);
  const finalVehicle = applyGroundedFriction(aligned, state.config.friction);

  return {
    ...state,
    vehicle: finalVehicle,
    time: state.time + dt
  };
}
