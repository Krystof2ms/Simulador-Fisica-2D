import type { Vehicle } from '../types';

export function drawVehicle(ctx: CanvasRenderingContext2D, vehicle: Vehicle): void {
  ctx.save();
  ctx.translate(vehicle.position.x, vehicle.position.y);
  ctx.rotate(vehicle.angle);

  ctx.fillRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height);
  ctx.restore();
}
