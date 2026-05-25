import type { PointTerrain, Vehicle } from "$lib/engine";
import type { DEFAULT_CONFIG } from "./constants";
import type { HistoryFrame } from "./timeline";

export type SimulationData = {
    config: typeof DEFAULT_CONFIG;
    terrainPoints: PointTerrain[];
    history: HistoryFrame[];
    vehicle: Vehicle;
    time: number;
    maxTime: number;
};
