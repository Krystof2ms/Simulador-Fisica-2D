import type { Vec2D } from '../../engine/types';

export function getPointNear(
  coords: Vec2D,
  points: ReadonlyArray<Vec2D>,
  maxDist = 12
): number | null {
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const dist = Math.hypot(pt.x - coords.x, pt.y - coords.y);
    if (dist < maxDist) return i;
  }
  return null;
}

export function getSegmentNear(
  coords: Vec2D,
  segments: ReadonlyArray<{ start: Vec2D; end: Vec2D }>,
  maxDist = 24
): number | null {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const l2 = Math.pow(seg.end.x - seg.start.x, 2) + Math.pow(seg.end.y - seg.start.y, 2);
    if (l2 === 0) continue;

    let t = ((coords.x - seg.start.x) * (seg.end.x - seg.start.x) + (coords.y - seg.start.y) * (seg.end.y - seg.start.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projX = seg.start.x + t * (seg.end.x - seg.start.x);
    const projY = seg.start.y + t * (seg.end.y - seg.start.y);

    const dist = Math.hypot(coords.x - projX, coords.y - projY);
    if (dist < maxDist) {
      return i;
    }
  }
  return null;
}
