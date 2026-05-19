export const EPSILON = 1e-6;

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function nearlyEqual(a: number, b: number, epsilon = EPSILON): boolean {
  return Math.abs(a - b) <= epsilon;
}
