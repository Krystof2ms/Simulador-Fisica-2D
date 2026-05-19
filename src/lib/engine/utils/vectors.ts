import type { Vec2D } from '../types';
import { EPSILON } from './math';

export function vec(x = 0, y = 0): Vec2D {
  return { x, y };
}

export function add(a: Vec2D, b: Vec2D): Vec2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2D, b: Vec2D): Vec2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vec2D, factor: number): Vec2D {
  return { x: v.x * factor, y: v.y * factor };
}

export function dot(a: Vec2D, b: Vec2D): number {
  return a.x * b.x + a.y * b.y;
}

export function length(v: Vec2D): number {
  return Math.hypot(v.x, v.y);
}

export function normalize(v: Vec2D): Vec2D {
  const len = length(v);
  if (len < EPSILON) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function perpendicular(v: Vec2D): Vec2D {
  return { x: -v.y, y: v.x };
}
