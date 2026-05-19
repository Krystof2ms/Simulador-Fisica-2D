import type { TerrainSegment } from '../types';

export function drawTerrain(ctx: CanvasRenderingContext2D, segments: ReadonlyArray<TerrainSegment>): void {
  if (segments.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(segments[0].start.x, segments[0].start.y);

  for (const segment of segments) {
    ctx.lineTo(segment.end.x, segment.end.y);
  }

  ctx.stroke();
}
