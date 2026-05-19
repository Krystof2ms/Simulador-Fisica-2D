import type { Vec2D } from '../types';

export function canvasPointFromMouse(event: MouseEvent, canvas: HTMLCanvasElement): Vec2D {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}
