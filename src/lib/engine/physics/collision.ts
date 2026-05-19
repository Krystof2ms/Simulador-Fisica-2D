import type { SurfaceInfo, TerrainSegment, Vehicle } from '../types';
import { normalize } from '../utils/vectors';

function between(value: number, a: number, b: number): boolean {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return value >= min && value <= max;
}

function segmentHeightAtX(segment: TerrainSegment, x: number): number | null {
  if (!between(x, segment.start.x, segment.end.x)) return null;

  const dx = segment.end.x - segment.start.x;
  if (Math.abs(dx) < 1e-9) return Math.min(segment.start.y, segment.end.y);

  const t = (x - segment.start.x) / dx;
  return segment.start.y + (segment.end.y - segment.start.y) * t;
}

export function resolveGroundContact(
  vehicle: Vehicle,
  segments: ReadonlyArray<TerrainSegment>,
  snapDistance = 8
): Vehicle {
  const halfHeight = vehicle.height / 2;
  const wheelX = vehicle.position.x;
  const wheelY = vehicle.position.y + halfHeight;

  let best: SurfaceInfo | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const segment of segments) {
    const height = segmentHeightAtX(segment, wheelX);
    if (height === null) continue;

    const distance = wheelY - height;
    if (distance < -snapDistance || distance > snapDistance) continue;
    if (Math.abs(distance) >= Math.abs(bestDistance)) continue;

    const tangent = normalize({
      x: segment.end.x - segment.start.x,
      y: segment.end.y - segment.start.y
    });

    const normal = normalize({ x: -tangent.y, y: tangent.x });

    best = {
      segment,
      angle: segment.angle,
      normal,
      tangent,
      height
    };

    bestDistance = distance;
  }

  if (!best) {
    return { ...vehicle, groundedSurface: undefined };
  }

  return {
    ...vehicle,
    position: { x: vehicle.position.x, y: best.height - halfHeight },
    velocity: { x: vehicle.velocity.x, y: Math.min(0, vehicle.velocity.y) },
    groundedSurface: best
  };
}
