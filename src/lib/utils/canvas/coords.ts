import type { Vec2D } from '../../engine/types';

export function getMouseCoords(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  cameraX: number
): Vec2D {
  const rect = canvas.getBoundingClientRect();
  
  // Calculate the scale and offsets caused by CSS 'object-contain'
  const canvasRatio = width / height;
  const elementRatio = rect.width / rect.height;
  
  let scale: number;
  let offsetX = 0;
  let offsetY = 0;

  if (elementRatio > canvasRatio) {
    // Height is the limiting factor (pillarboxing)
    scale = rect.height / height;
    offsetX = (rect.width - width * scale) / 2;
  } else {
    // Width is the limiting factor (letterboxing)
    scale = rect.width / width;
    offsetY = (rect.height - height * scale) / 2;
  }

  const localX = (e.clientX - rect.left - offsetX) / scale;
  const localY = (e.clientY - rect.top - offsetY) / scale;
  
  return { x: localX + cameraX, y: localY };
}
