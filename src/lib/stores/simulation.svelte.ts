import { createVehicle } from '../engine/vehicle/vehicle';
import { fixedUpdate } from '../engine/core/fixedUpdate';
import { buildTerrainSegments } from '../engine/terrain/interpolation';
import type { Vehicle, PointTerrain, TerrainSegment, ControlsState } from '../engine/types';

export type ToolType = 'elevate' | 'lower' | 'smooth' | 'points' | 'friction';

export class SimulationStore {
  private readonly canvasWidth = 900;
  private readonly floorLimitY = 510;
  private readonly minTerrainY = 0;

  // Physical constants
  config = {
    gravity: 9.8 * 30, // scaled for canvas height
    maxDriveForce: 1800,
    propulsionForce: 900,
    propulsionOscillation: 250,
    propulsionFrequencyHz: 0.6,
    drag: 0.1,
    friction: 0.9,
    fixedDt: 1 / 60,
    snapDistance: 15,
  };

  // Svelte 5 Runes for Reactivity
  isPlaying = $state(false);
  time = $state(0);
  maxTime = 16.00;
  activeTool = $state<ToolType>('points');
  
  // Selection/Hover indices
  selectedPointIndex = $state<number | null>(null);
  selectedSegmentIndex = $state<number | null>(null);
  hoveredPointIndex = $state<number | null>(null);
  hoveredSegmentIndex = $state<number | null>(null);

  // Editable Terrain Points
  terrainPoints = $state<PointTerrain[]>([
    { x: 0, y: 360, friction: 0.9 },
    { x: 120, y: 360, friction: 0.9 },
    { x: 240, y: 360, friction: 0.9 },
    { x: 360, y: 360, friction: 0.9 },
    { x: 480, y: 360, friction: 0.9 },
    { x: 600, y: 360, friction: 0.9 },
    { x: 720, y: 360, friction: 0.9 },
    { x: 840, y: 360, friction: 0.9 },
    { x: 900, y: 360, friction: 0.9 }
  ]);

  // Derived Segments
  segments = $derived(buildTerrainSegments(this.terrainPoints));

  // Controls State
  controls = $state<ControlsState>({ throttle: 0, brake: 0 });

  // Main Vehicle State
  vehicle = $state<Vehicle>(createVehicle({
    position: { x: 50, y: 200 },
    velocity: { x: 0, y: 0 },
    aceleration: { x: 0, y: 0 },
    angle: 0,
    mass: 800,
    width: 44,
    height: 22
  }));

  // Initial State parameters for resetting
  initialVehicleState = {
    position: { x: 50, y: 200 },
    velocity: { x: 0, y: 0 },
    aceleration: { x: 0, y: 0 },
    angle: 0,
    mass: 800,
    width: 44,
    height: 22
  };

  // State history buffer for timeline scrubbing
  history = $state<{ vehicle: Vehicle; time: number }[]>([]);

  constructor() {
    this.resetSimulation();
  }

  // Resets the mobile to start and prepares the timeline buffer
  resetSimulation() {
    this.isPlaying = false;
    this.time = 0;
    this.controls = { throttle: 0, brake: 0 };
    this.terrainPoints = this.terrainPoints.map((p) => ({
      ...p,
      y: Math.min(this.floorLimitY, Math.max(0, p.y))
    }));
    
    // Find perfect Y-coordinate start to snap vehicle to terrain segment at x=50
    const startSegments = this.segments;
    let initialY = 200;
    const seg = startSegments.find(s => 50 >= s.start.x && 50 <= s.end.x);
    if (seg) {
      const dx = seg.end.x - seg.start.x;
      const t = (50 - seg.start.x) / (dx || 1);
      const height = seg.start.y + (seg.end.y - seg.start.y) * t;
      initialY = height - this.initialVehicleState.height / 2 - 4;
    }

    this.vehicle = createVehicle({
      ...this.initialVehicleState,
      position: { x: 50, y: initialY }
    });

    // Reset history to Frame 0
    this.history = [{ vehicle: JSON.parse(JSON.stringify(this.vehicle)), time: 0 }];
  }

  // Advance simulation by a fixed physics step
  step(dt: number) {
    if (this.time >= this.maxTime) {
      this.isPlaying = false;
      return;
    }

    const engineState = {
      vehicle: this.vehicle,
      terrain: this.segments,
      controls: this.controls,
      config: this.config,
      time: this.time
    };

    const nextState = fixedUpdate(engineState, dt);
    this.vehicle = nextState.vehicle;
    this.time = nextState.time;

    const halfWidth = this.vehicle.width / 2;
    const leftLimit = halfWidth;
    const rightLimit = this.canvasWidth - halfWidth;
    if (this.vehicle.position.x <= leftLimit || this.vehicle.position.x >= rightLimit) {
      this.vehicle = {
        ...this.vehicle,
        position: {
          x: Math.max(leftLimit, Math.min(rightLimit, this.vehicle.position.x)),
          y: this.vehicle.position.y
        },
        velocity: { ...this.vehicle.velocity, x: 0 },
        aceleration: { ...this.vehicle.aceleration, x: 0 }
      };
      this.isPlaying = false;
    }

    // Save to scrubbing history
    this.history.push({
      vehicle: JSON.parse(JSON.stringify(this.vehicle)),
      time: this.time
    });
  }

  // Scrub through the timeline instantly using history
  scrubTo(targetTime: number) {
    targetTime = Math.max(0, Math.min(this.maxTime, targetTime));
    this.isPlaying = false;

    const frameIndex = Math.round(targetTime / this.config.fixedDt);
    
    if (frameIndex < this.history.length) {
      // Fetch matching historical state
      this.vehicle = JSON.parse(JSON.stringify(this.history[frameIndex].vehicle));
      this.time = this.history[frameIndex].time;
    } else {
      // Simulate forward from the last cached frame to meet targetTime
      let lastFrame = this.history[this.history.length - 1];
      this.vehicle = JSON.parse(JSON.stringify(lastFrame.vehicle));
      this.time = lastFrame.time;

      while (this.time < targetTime && this.time < this.maxTime) {
        this.step(this.config.fixedDt);
      }
    }
  }

  // Tick step for play update
  update() {
    if (!this.isPlaying) return;
    this.step(this.config.fixedDt);
  }

  // Update position of a single terrain point
  updatePointPosition(index: number, x: number, y: number) {
    if (index < 0 || index >= this.terrainPoints.length) return;
    
    // Maintain x-ordering
    const minX = index > 0 ? this.terrainPoints[index - 1].x + 10 : 0;
    const maxX = index < this.terrainPoints.length - 1 ? this.terrainPoints[index + 1].x - 10 : 2000;
    const isEdgePoint = index === 0 || index === this.terrainPoints.length - 1;
    const clampedX = isEdgePoint
      ? this.terrainPoints[index].x
      : Math.max(minX, Math.min(maxX, x));
    
    this.terrainPoints[index] = {
      ...this.terrainPoints[index],
      x: clampedX,
      y: Math.min(this.floorLimitY, Math.max(this.minTerrainY, y))
    };
    
    this.resetSimulation();
  }

  getSegmentAngleDegrees(index: number): number | null {
    if (index < 0 || index >= this.terrainPoints.length - 1) return null;
    const start = this.terrainPoints[index];
    const end = this.terrainPoints[index + 1];
    const dx = end.x - start.x;
    if (Math.abs(dx) < 1e-9) return 0;
    const radians = Math.atan2(-(end.y - start.y), dx);
    return (radians * 180) / Math.PI;
  }

  setSegmentAngleDegrees(index: number, angleDeg: number) {
    if (index < 0 || index >= this.terrainPoints.length - 1) return;

    const end = this.terrainPoints[index + 1];
    const start = this.terrainPoints[index];
    const dx = end.x - start.x;
    if (Math.abs(dx) < 1e-9) return;

    const radians = (angleDeg * Math.PI) / 180;
    const rawStartY = end.y + Math.tan(radians) * dx;
    const clampedStartY = Math.min(this.floorLimitY, Math.max(this.minTerrainY, rawStartY));

    this.terrainPoints[index] = {
      ...start,
      y: clampedStartY
    };

    this.resetSimulation();
  }

  // Double click to add a point
  addPoint(x: number, y: number) {
    const clampedY = Math.min(this.floorLimitY, Math.max(0, y));
    let insertIndex = -1;
    for (let i = 0; i < this.terrainPoints.length; i++) {
      if (this.terrainPoints[i].x > x) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex === -1) {
      this.terrainPoints.push({ x, y: clampedY, friction: 0.9 });
    } else {
      const prevFriction = this.terrainPoints[insertIndex - 1]?.friction ?? 0.9;
      this.terrainPoints.splice(insertIndex, 0, { x, y: clampedY, friction: prevFriction });
    }

    this.resetSimulation();
  }

  // Delete a point (cannot delete first or last point)
  deletePoint(index: number) {
    if (index <= 0 || index >= this.terrainPoints.length - 1) return;
    
    this.terrainPoints.splice(index, 1);
    this.selectedPointIndex = null;
    
    this.resetSimulation();
  }

  // Edit friction for selected segment starting at index
  updateSegmentFriction(index: number, friction: number) {
    if (index < 0 || index >= this.terrainPoints.length - 1) return;
    
    this.terrainPoints[index] = {
      ...this.terrainPoints[index],
      friction
    };
    
    this.resetSimulation();
  }

  // Raise Terrain shaping tool
  elevateTerrain(centerX: number, radius = 100, strength = 2.0) {
    this.terrainPoints = this.terrainPoints.map(p => {
      const dist = Math.abs(p.x - centerX);
      if (dist < radius) {
        const factor = (1 - dist / radius);
        return { ...p, y: Math.max(50, p.y - strength * factor * 10) };
      }
      return p;
    });
    this.resetSimulation();
  }

  // Lower Terrain shaping tool
  lowerTerrain(centerX: number, radius = 100, strength = 2.0) {
    this.terrainPoints = this.terrainPoints.map(p => {
      const dist = Math.abs(p.x - centerX);
      if (dist < radius) {
        const factor = (1 - dist / radius);
        return { ...p, y: Math.min(this.floorLimitY, p.y + strength * factor * 10) };
      }
      return p;
    });
    this.resetSimulation();
  }

  // Localized average smoothing shaping tool
  smoothTerrain(centerX: number, radius = 100) {
    const nextPoints = [...this.terrainPoints];
    for (let i = 1; i < this.terrainPoints.length - 1; i++) {
      const p = this.terrainPoints[i];
      if (Math.abs(p.x - centerX) < radius) {
        const prev = this.terrainPoints[i - 1];
        const next = this.terrainPoints[i + 1];
        const smoothedY = (prev.y + next.y) / 2;
        nextPoints[i] = { ...p, y: p.y * 0.65 + smoothedY * 0.35 };
      }
    }
    this.terrainPoints = nextPoints;
    this.resetSimulation();
  }

  // Reset terrain to starting shape
  resetTerrainToDefault() {
    this.terrainPoints = [
      { x: 0, y: 360, friction: 0.9 },
      { x: 120, y: 360, friction: 0.9 },
      { x: 240, y: 360, friction: 0.9 },
      { x: 360, y: 360, friction: 0.9 },
      { x: 480, y: 360, friction: 0.9 },
      { x: 600, y: 360, friction: 0.9 },
      { x: 720, y: 360, friction: 0.9 },
      { x: 840, y: 360, friction: 0.9 },
      { x: 900, y: 360, friction: 0.9 }
    ];
    this.selectedPointIndex = null;
    this.selectedSegmentIndex = null;
    this.resetSimulation();
  }
}

export const sim = new SimulationStore();
