import type { Vehicle } from '$lib/engine/types';

export interface HistoryFrame {
    vehicle: Vehicle;
    time: number;
}

/**
 * Deep-clone a plain-data Vehicle without structuredClone so that
 * Svelte 5 $state Proxy objects are also handled correctly.
 */
function cloneVehicleData(vehicle: Vehicle): Vehicle {
    return {
        position: { ...vehicle.position },
        velocity: { ...vehicle.velocity },
        acceleration: { ...vehicle.acceleration },
        mass: vehicle.mass,
        angle: vehicle.angle,
        width: vehicle.width,
        height: vehicle.height,
        groundedSurface: vehicle.groundedSurface
            ? {
                  segment: {
                      start: { ...vehicle.groundedSurface.segment.start },
                      end: { ...vehicle.groundedSurface.segment.end },
                      angle: vehicle.groundedSurface.segment.angle,
                      friction: vehicle.groundedSurface.segment.friction
                  },
                  angle: vehicle.groundedSurface.angle,
                  normal: { ...vehicle.groundedSurface.normal },
                  tangent: { ...vehicle.groundedSurface.tangent },
                  height: vehicle.groundedSurface.height
              }
            : undefined
    };
}

export function createInitialHistory(
    vehicle: Vehicle
): HistoryFrame[] {
    return [
        {
            vehicle: cloneVehicleData(vehicle),
            time: 0
        }
    ];
}

export function pushHistoryFrame(
    history: HistoryFrame[],
    vehicle: Vehicle,
    time: number
) {
    history.push({
        vehicle: cloneVehicleData(vehicle),
        time
    });
}

export function getHistoryFrame(
    history: HistoryFrame[],
    frameIndex: number
): HistoryFrame | null {
    const frame = history[frameIndex];
    if (!frame) return null;

    return {
        vehicle: cloneVehicleData(frame.vehicle),
        time: frame.time
    };
}
