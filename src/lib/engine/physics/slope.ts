import type { Vehicle } from '../types';

export function alignVehicleToSurface(vehicle: Vehicle): Vehicle {
  if (!vehicle.groundedSurface) return vehicle;

  return {
    ...vehicle,
    angle: vehicle.groundedSurface.angle
  };
}
