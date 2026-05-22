import type { Vehicle } from '$lib/engine/types';

export interface HistoryFrame {
    vehicle: Vehicle;
    time: number;
}

export function createInitialHistory(
    vehicle: Vehicle
): HistoryFrame[] {
    return [
        {
            vehicle: structuredClone(vehicle),
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
        vehicle: structuredClone(vehicle),
        time
    });
}

export function getHistoryFrame(
    history: HistoryFrame[],
    frameIndex: number
) {
    return history[frameIndex]
        ? structuredClone(history[frameIndex])
        : null;
}
