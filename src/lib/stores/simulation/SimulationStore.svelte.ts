import { createVehicle } from "$lib/engine/vehicle/vehicle";
import { fixedUpdate } from "$lib/engine/core/fixedUpdate";
import { buildTerrainSegments } from "$lib/engine/terrain/interpolation";
import type { Vehicle, PointTerrain, ControlsState } from "$lib/engine/types";
import {
  DEFAULT_CONFIG,
  DEFAULT_TERRAIN,
  CANVAS_WIDTH,
  FLOOR_LIMIT_Y,
  MIN_TERRAIN_Y,
} from "./constants";
import { elevateTerrain, lowerTerrain, smoothTerrain } from "./terrainEditing";
import { computeSpawnY, cloneVehicle } from "./vehicleReset";
import {
  createInitialHistory,
  pushHistoryFrame,
  getHistoryFrame,
  type HistoryFrame,
} from "./timeline";
import { editor } from "./EditorStore.svelte";
import type { SimulationData } from "./type";

export class SimulationStore {
  private readonly canvasWidth = CANVAS_WIDTH;
  private readonly floorLimitY = FLOOR_LIMIT_Y;
  private readonly minTerrainY = MIN_TERRAIN_Y;

  config = $state(structuredClone(DEFAULT_CONFIG));

  isPlaying = $state(false);
  isFinished = $state(false);

  time = $state(0);

  maxTime = $state(16);
  configuredMaxTime = 16;

  terrainPoints = $state<PointTerrain[]>(structuredClone(DEFAULT_TERRAIN));

  segments = $derived(buildTerrainSegments(this.terrainPoints));

  controls = $state<ControlsState>({
    throttle: 0,
    brake: 0,
  });

  vehicle = $state<Vehicle>(
    createVehicle({
      position: { x: 50, y: 200 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      angle: 0,
      mass: 800,
      width: 44,
      height: 22,
    }),
  );

  initialVehicleState = $state({
    position: { x: 50, y: 200 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    angle: 0,
    mass: 800,
    width: 44,
    height: 22,
  });

  history = $state<HistoryFrame[]>([]);

  constructor() {
    this.resetSimulation();
  }

  exportSimulationData(): SimulationData {
    return {
      config: this.config,
      terrainPoints: this.terrainPoints,
      initialVehicleState: this.initialVehicleState,
      history: this.history,
      vehicle: this.vehicle,
      time: this.time,
      maxTime: this.maxTime,
    };
  }

  loadSimulationData(data: SimulationData) {
    this.config = data.config;
    this.terrainPoints = data.terrainPoints;
    this.initialVehicleState = data.initialVehicleState;
    this.history = data.history;
    this.vehicle = data.vehicle;
    this.time = data.time;
    this.maxTime = data.maxTime;
  }

  resetSimulation() {
    this.isPlaying = false;
    this.isFinished = false;

    this.time = 0;

    this.maxTime = this.configuredMaxTime;

    this.controls = {
      throttle: 0,
      brake: 0,
    };

    this.terrainPoints = this.terrainPoints.map((p) => ({
      ...p,
      y: Math.min(this.floorLimitY, Math.max(this.minTerrainY, p.y)),
    }));

    const startX = Math.max(
      0,
      Math.min(this.canvasWidth, this.initialVehicleState.position.x),
    );

    const initialY = computeSpawnY(
      startX,
      this.initialVehicleState.height,
      this.segments,
      this.initialVehicleState.position.y,
    );

    this.vehicle = createVehicle({
      ...this.initialVehicleState,
      position: {
        x: startX,
        y: initialY,
      },
    });

    this.history = createInitialHistory(this.vehicle);
  }

  update() {
    if (!this.isPlaying) return;

    this.step(this.config.fixedDt);
  }

  finishSimulation() {
    this.isPlaying = false;
    this.isFinished = true;

    this.maxTime = Math.max(this.config.fixedDt, this.time);
  }

  step(dt: number) {
    const engineState = {
      vehicle: this.vehicle,
      terrain: this.segments,
      controls: this.controls,
      config: this.config,
      time: this.time,
    };

    const nextState = fixedUpdate(engineState, dt);

    this.vehicle = nextState.vehicle;
    this.time = nextState.time;

    this.maxTime = Math.max(this.configuredMaxTime, this.time);

    const halfWidth = this.vehicle.width / 2;
    const leftLimit = halfWidth;
    const rightLimit = this.canvasWidth - halfWidth;

    if (this.vehicle.position.x <= leftLimit || this.vehicle.position.x >= rightLimit) {
      this.vehicle = {
        ...this.vehicle,
        position: {
          x: Math.max(leftLimit, Math.min(rightLimit, this.vehicle.position.x)),
          y: this.vehicle.position.y,
        },
        velocity: {
          ...this.vehicle.velocity,
          x: 0,
        },
        acceleration: {
          ...this.vehicle.acceleration,
          x: 0,
        },
      };

      this.finishSimulation();
    }

    pushHistoryFrame(this.history, this.vehicle, this.time);
  }

  scrubTo(targetTime: number) {
    targetTime = Math.max(0, Math.min(this.maxTime, targetTime));

    this.isPlaying = false;

    const frameIndex = Math.round(targetTime / this.config.fixedDt);

    const frame = getHistoryFrame(this.history, frameIndex);

    if (frame) {
      this.vehicle = cloneVehicle(frame.vehicle);
      this.time = frame.time;

      return;
    }

    const lastFrame = this.history[this.history.length - 1];

    this.vehicle = cloneVehicle(lastFrame.vehicle);
    this.time = lastFrame.time;

    while (this.time < targetTime && this.time < this.maxTime) {
      this.step(this.config.fixedDt);
    }
  }

  elevateTerrain(centerX: number, radius = 100, strength = 2) {
    if (this.isPlaying) return;

    this.terrainPoints = elevateTerrain(
      this.terrainPoints,
      centerX,
      this.floorLimitY,
      radius,
      strength,
    );

    this.resetSimulation();
  }

  lowerTerrain(centerX: number, radius = 100, strength = 2) {
    if (this.isPlaying) return;

    this.terrainPoints = lowerTerrain(
      this.terrainPoints,
      centerX,
      this.floorLimitY,
      radius,
      strength,
    );

    this.resetSimulation();
  }

  smoothTerrain(centerX: number, radius = 100) {
    if (this.isPlaying) return;

    this.terrainPoints = smoothTerrain(this.terrainPoints, centerX, radius);

    this.resetSimulation();
  }

  resetTerrainToDefault() {
    if (this.isPlaying) return;

    this.terrainPoints = structuredClone(DEFAULT_TERRAIN);

    editor.clearSelection();

    this.resetSimulation();
  }

  setInitialVehiclePosition(x: number, y: number) {
    if (this.isPlaying) return;

    const clampedX = Math.max(0, Math.min(this.canvasWidth, x));

    const clampedY = Math.max(this.minTerrainY, Math.min(this.floorLimitY, y));

    this.initialVehicleState = {
      ...this.initialVehicleState,
      position: {
        x: clampedX,
        y: clampedY,
      },
    };

    this.resetSimulation();
  }

  updatePointPosition(index: number, x: number, y: number) {
    if (this.isPlaying) return;

    if (index < 0 || index >= this.terrainPoints.length) {
      return;
    }

    const minX = index > 0 ? this.terrainPoints[index - 1].x + 10 : 0;

    const maxX =
      index < this.terrainPoints.length - 1
        ? this.terrainPoints[index + 1].x - 10
        : this.canvasWidth;

    const isEdgePoint = index === 0 || index === this.terrainPoints.length - 1;

    const clampedX = isEdgePoint
      ? this.terrainPoints[index].x
      : Math.max(minX, Math.min(maxX, x));

    this.terrainPoints[index] = {
      ...this.terrainPoints[index],
      x: clampedX,
      y: Math.min(this.floorLimitY, Math.max(this.minTerrainY, y)),
    };

    this.resetSimulation();
  }

  addPoint(x: number, y: number) {
    if (this.isPlaying) return;

    const clampedY = Math.min(this.floorLimitY, Math.max(this.minTerrainY, y));

    let insertIndex = -1;

    for (let i = 0; i < this.terrainPoints.length; i++) {
      if (this.terrainPoints[i].x > x) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex === -1) {
      this.terrainPoints.push({
        x,
        y: clampedY,
        friction: 0.9,
      });
    } else {
      const prevFriction = this.terrainPoints[insertIndex - 1]?.friction ?? 0.9;

      this.terrainPoints.splice(insertIndex, 0, {
        x,
        y: clampedY,
        friction: prevFriction,
      });
    }

    this.resetSimulation();
  }

  deletePoint(index: number) {
    if (this.isPlaying) return;

    if (index <= 0 || index >= this.terrainPoints.length - 1) {
      return;
    }

    this.terrainPoints.splice(index, 1);

    editor.clearSelection();

    this.resetSimulation();
  }

  getSegmentAngleDegrees(index: number): number | null {
    if (index < 0 || index >= this.terrainPoints.length - 1) {
      return null;
    }

    const start = this.terrainPoints[index];
    const end = this.terrainPoints[index + 1];

    const dx = end.x - start.x;

    if (Math.abs(dx) < 1e-9) {
      return 0;
    }

    const radians = Math.atan2(-(end.y - start.y), dx);

    return (radians * 180) / Math.PI;
  }

  setSegmentAngleDegrees(index: number, angleDeg: number) {
    if (this.isPlaying) return;

    if (index < 0 || index >= this.terrainPoints.length - 1) {
      return;
    }

    const start = this.terrainPoints[index];
    const end = this.terrainPoints[index + 1];

    const dx = end.x - start.x;

    if (Math.abs(dx) < 1e-9) {
      return;
    }

    const radians = (angleDeg * Math.PI) / 180;
    const rawStartY = end.y + Math.tan(radians) * dx;

    const clampedStartY = Math.min(
      this.floorLimitY,
      Math.max(this.minTerrainY, rawStartY),
    );

    this.terrainPoints[index] = {
      ...start,
      y: clampedStartY,
    };

    this.resetSimulation();
  }

  updateSegmentFriction(index: number, friction: number) {
    if (this.isPlaying) return;

    if (index < 0 || index >= this.terrainPoints.length - 1) {
      return;
    }

    this.terrainPoints[index] = {
      ...this.terrainPoints[index],
      friction,
    };

    this.resetSimulation();
  }
}

export const sim = new SimulationStore();
