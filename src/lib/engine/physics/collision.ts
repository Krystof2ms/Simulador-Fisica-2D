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

  // 1. Try to find ground contact on terrain segments
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

  // 2. If grounded on a terrain segment, snap to it
  if (best) {
    return {
      ...vehicle,
      position: { x: vehicle.position.x, y: best.height - halfHeight },
      velocity: { x: vehicle.velocity.x, y: Math.min(0, vehicle.velocity.y) },
      groundedSurface: best
    };
  }

  // 3. Otherwise, check for Floor Limit at Y = 510px (stretching infinitely)
  const floorY = 510;
  if (wheelY >= floorY) {
    const floorSegment: TerrainSegment = {
      start: { x: -100000, y: floorY, friction: 0.9 },
      end: { x: 100000, y: floorY, friction: 0.9 },
      angle: 0,
      friction: 0.9
    };

    return {
      ...vehicle,
      position: { x: vehicle.position.x, y: floorY - halfHeight },
      velocity: { x: vehicle.velocity.x, y: Math.min(0, vehicle.velocity.y) },
      groundedSurface: {
        segment: floorSegment,
        angle: 0,
        normal: { x: 0, y: -1 },
        tangent: { x: 1, y: 0 },
        height: floorY
      }
    };
  }

  // 4. Otherwise, vehicle is in the air (flying)
  return {
    ...vehicle,
    groundedSurface: undefined
  };
}
