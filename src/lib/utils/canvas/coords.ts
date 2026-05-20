import type { Vec2D } from '../../engine/types';

export function getMouseCoords(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  cameraX: number
): Vec2D {
  const rect = canvas.getBoundingClientRect();
  const scaleX = width / rect.width;
  const scaleY = height / rect.height;
  const localX = (e.clientX - rect.left) * scaleX;
  const localY = (e.clientY - rect.top) * scaleY;
  return { x: localX + cameraX, y: localY };
}
