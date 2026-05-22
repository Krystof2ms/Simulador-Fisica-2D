import type { Vehicle } from '$lib/engine/types';

export function computeSpawnY(
    startX: number,
    vehicleHeight: number,
    segments: any[],
    fallbackY: number
) {
    const seg = segments.find(
        (s) => startX >= s.start.x && startX <= s.end.x
    );

    if (!seg) return fallbackY;

    const dx = seg.end.x - seg.start.x;

    const t = (startX - seg.start.x) / (dx || 1);

    const height =
        seg.start.y + (seg.end.y - seg.start.y) * t;

    return height - vehicleHeight / 2 - 4;
}

export function cloneVehicle(vehicle: Vehicle): Vehicle {
    return structuredClone(vehicle);
}
