import type { Vec2D, Vehicle } from '../types';

export type Camera = {
  center: Vec2D;
  zoom: number;
};

export function followVehicle(vehicle: Vehicle, zoom = 1): Camera {
  return {
    center: { ...vehicle.position },
    zoom
  };
}
