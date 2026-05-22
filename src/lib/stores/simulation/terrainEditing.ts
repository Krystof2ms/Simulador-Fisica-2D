import type { PointTerrain } from '$lib/engine/types';

export function elevateTerrain(
    points: PointTerrain[],
    centerX: number,
    floorLimitY: number,
    radius = 100,
    strength = 2
) {
    return points.map((p) => {
        const dist = Math.abs(p.x - centerX);

        if (dist < radius) {
            const factor = 1 - dist / radius;

            return {
                ...p,
                y: Math.max(50, p.y - strength * factor * 10)
            };
        }

        return p;
    });
}

export function lowerTerrain(
    points: PointTerrain[],
    centerX: number,
    floorLimitY: number,
    radius = 100,
    strength = 2
) {
    return points.map((p) => {
        const dist = Math.abs(p.x - centerX);

        if (dist < radius) {
            const factor = 1 - dist / radius;

            return {
                ...p,
                y: Math.min(floorLimitY, p.y + strength * factor * 10)
            };
        }

        return p;
    });
}

export function smoothTerrain(
    points: PointTerrain[],
    centerX: number,
    radius = 100
) {
    const nextPoints = [...points];

    for (let i = 1; i < points.length - 1; i++) {
        const p = points[i];

        if (Math.abs(p.x - centerX) < radius) {
            const prev = points[i - 1];
            const next = points[i + 1];

            const smoothedY = (prev.y + next.y) / 2;

            nextPoints[i] = {
                ...p,
                y: p.y * 0.65 + smoothedY * 0.35
            };
        }
    }

    return nextPoints;
}
