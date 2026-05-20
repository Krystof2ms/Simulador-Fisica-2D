import type { Particle } from './particles';
import type { Vec2D } from '../../engine/types';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraX: number
): void {
  ctx.save();
  ctx.translate(-cameraX % 40, 0);
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.25)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width + 40; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-cameraX % 200, 0);
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < width + 200; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFloorLimit(
  ctx: CanvasRenderingContext2D,
  width: number,
  cameraX: number,
  floorY: number
): void {
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(cameraX - 100, floorY);
  ctx.lineTo(cameraX + width + 100, floorY);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  segments: any[],
  height: number,
  selectedSegmentIndex: number | null,
  hoveredSegmentIndex: number | null,
  activeTool: string,
  getSegmentAngleDegrees: (i: number) => number | null
): void {
  if (segments.length === 0) return;

  ctx.save();
  // Create ground body shape and fill with earth gradient
  ctx.beginPath();
  ctx.moveTo(segments[0].start.x, height);
  ctx.lineTo(segments[0].start.x, segments[0].start.y);
  for (const seg of segments) {
    ctx.lineTo(seg.end.x, seg.end.y);
  }
  ctx.lineTo(segments[segments.length - 1].end.x, height);
  ctx.closePath();

  const groundGradient = ctx.createLinearGradient(0, 200, 0, height);
  groundGradient.addColorStop(0, '#be185d0d');
  groundGradient.addColorStop(0, '#c2410c30');
  groundGradient.addColorStop(1, '#78350fdf');
  ctx.fillStyle = groundGradient;
  ctx.fill();

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const f = seg.friction;
    const angleDeg = getSegmentAngleDegrees(i) ?? 0;
    const midX = (seg.start.x + seg.end.x) / 2;
    const midY = (seg.start.y + seg.end.y) / 2;

    ctx.beginPath();
    ctx.moveTo(seg.start.x, seg.start.y);
    ctx.lineTo(seg.end.x, seg.end.y);

    let color = '#0ea5e9';
    let strokeWidth = 3;

    if (f < 0.25) {
      color = '#38bdf8';
      strokeWidth = 5;
    } else if (f < 0.6) {
      color = '#94a3b8';
      strokeWidth = 4;
    } else if (f < 1.2) {
      color = '#0d9488';
      strokeWidth = 3.5;
    } else {
      color = '#ea580c';
      strokeWidth = 5;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (selectedSegmentIndex === i) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = strokeWidth + 3.5;
      ctx.beginPath();
      ctx.moveTo(seg.start.x, seg.start.y);
      ctx.lineTo(seg.end.x, seg.end.y);
      ctx.stroke();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = strokeWidth + 1.5;
      ctx.stroke();
    } else if (hoveredSegmentIndex === i && activeTool === 'friction') {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.lineWidth = strokeWidth + 3;
      ctx.stroke();
    }

    ctx.save();
    ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = `${angleDeg >= 0 ? '+' : ''}${angleDeg.toFixed(1)}°`;
    const isSelected = selectedSegmentIndex === i;
    ctx.fillStyle = isSelected ? '#0f172a' : 'rgba(15, 23, 42, 0.72)';
    ctx.fillText(label, midX, midY - 14);
    ctx.restore();
  }
  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  ctx.save();
  for (const p of particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawStartPosition(
  ctx: CanvasRenderingContext2D,
  startPos: Vec2D
): void {
  ctx.save();
  ctx.strokeStyle = '#0891b2';
  ctx.fillStyle = 'rgba(8, 145, 178, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(startPos.x, startPos.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '700 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillStyle = '#0e7490';
  ctx.fillText('INICIO', startPos.x, startPos.y - 18);
  ctx.restore();
}

export function drawTerrainHandles(
  ctx: CanvasRenderingContext2D,
  points: Vec2D[],
  selectedPointIndex: number | null,
  hoveredPointIndex: number | null
): void {
  points.forEach((pt, i) => {
    const isSelected = selectedPointIndex === i;
    const isHovered = hoveredPointIndex === i;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, isSelected ? 8.5 : isHovered ? 7.5 : 5, 0, Math.PI * 2);

    if (isSelected) {
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (isHovered) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    }
  });
}

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  vehicle: any,
  wheelRotation: number
): void {
  ctx.save();
  ctx.translate(vehicle.position.x, vehicle.position.y);
  ctx.rotate(vehicle.angle);

  // 1. Vehicle body / chassis shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
  ctx.fillRect(-vehicle.width / 2 + 2, -vehicle.height / 2 + 5, vehicle.width, vehicle.height);

  // 2. Main chassis body
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.roundRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height, [4, 6, 2, 2]);
  ctx.fill();

  // 3. Windshield and Cabin
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(0, -vehicle.height / 2 - 8, vehicle.width * 0.42, 8, [6, 6, 0, 0]);
  ctx.fill();

  ctx.fillStyle = '#67e8f9';
  ctx.beginPath();
  ctx.roundRect(6, -vehicle.height / 2 - 6, vehicle.width * 0.28, 6, [4, 4, 0, 0]);
  ctx.fill();

  // 4. Stylised headlight
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(vehicle.width / 2 - 3, -vehicle.height / 4, 3, 5);

  // 5. Stylised taillight
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-vehicle.width / 2, -vehicle.height / 4, 2, 5);

  // 6. Orange cargo detail
  ctx.fillStyle = '#f97316';
  ctx.fillRect(-vehicle.width * 0.4, -vehicle.height * 0.2, vehicle.width * 0.35, 3);

  // 7. Wheels
  const rearWheelX = -vehicle.width / 3.2;
  const frontWheelX = vehicle.width / 3.2;
  const wheelY = vehicle.height / 2.2;
  const wheelRadius = 8.5;

  const drawWheel = (wx: number, wy: number) => {
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(wheelRotation);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(0, 0, wheelRadius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    for (let spoke = 0; spoke < 4; spoke++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const spokeAngle = (spoke * Math.PI) / 2;
      ctx.lineTo(Math.cos(spokeAngle) * wheelRadius * 0.55, Math.sin(spokeAngle) * wheelRadius * 0.55);
      ctx.stroke();
    }
    ctx.restore();
  };

  drawWheel(rearWheelX, wheelY);
  drawWheel(frontWheelX, wheelY);

  ctx.restore();
}
