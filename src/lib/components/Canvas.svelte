<script lang="ts">
  import { onMount } from 'svelte';
  import { sim } from '../stores/simulation.svelte';
  import type { Vec2D } from '../engine/types';
  import { createDustParticle, updateParticles, type Particle } from '../utils/canvas/particles';
  import { getPointNear, getSegmentNear } from '../utils/canvas/terrain';
  import { getMouseCoords } from '../utils/canvas/coords';
  import * as render from '../utils/canvas/render';

  let canvasElement: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let isDragging = false;
  let dragPointIndex: number | null = null;
  let isPainting = false;
  let isDraggingStartPosition = false;

  // Particle system for vehicle wheel dust
  let particles: Particle[] = [];

  // Dimensions
  let width = 1400;
  let height = 760;

  // Camera horizontal offset (fixed viewport)
  let cameraX = 0;

  // Track wheel rotation angle
  let wheelRotation = 0;

  function spawnDust(x: number, y: number, isSlippery: boolean) {
    if (particles.length > 450) {
      particles.splice(0, particles.length - 450);
    }

    const count = isSlippery ? 3 : 1;
    for (let i = 0; i < count; i++) {
      particles.push(createDustParticle(x, y, sim.vehicle.velocity.x, isSlippery));
    }
  }

  function handleMouseDown(e: MouseEvent) {
    if (sim.isPlaying) return;
    const coords = getMouseCoords(e, canvasElement, width, height, cameraX);
    if (sim.startPositionEditMode) {
      isDraggingStartPosition = true;
      sim.setInitialVehiclePosition(coords.x, coords.y);
      return;
    }

    if (sim.activeTool === 'points') {
      const index = getPointNear(coords, sim.terrainPoints);
      if (index !== null) {
        isDragging = true;
        dragPointIndex = index;
        sim.selectedPointIndex = index;
        sim.selectedSegmentIndex = null;
      } else {
        sim.selectedPointIndex = null;
      }
    } else if (sim.activeTool === 'friction') {
      const index = getSegmentNear(coords, sim.segments);
      if (index !== null) {
        sim.selectedSegmentIndex = index;
        sim.selectedPointIndex = null;
      } else {
        sim.selectedSegmentIndex = null;
      }
    } else if (sim.activeTool === 'elevate') {
      isPainting = true;
      sim.elevateTerrain(coords.x);
    } else if (sim.activeTool === 'lower') {
      isPainting = true;
      sim.lowerTerrain(coords.x);
    } else if (sim.activeTool === 'smooth') {
      isPainting = true;
      sim.smoothTerrain(coords.x);
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (sim.isPlaying) return;
    const coords = getMouseCoords(e, canvasElement, width, height, cameraX);
    if (sim.startPositionEditMode && isDraggingStartPosition) {
      sim.setInitialVehiclePosition(coords.x, coords.y);
      return;
    }

    // Update hovers
    if (sim.activeTool === 'points') {
      sim.hoveredPointIndex = getPointNear(coords, sim.terrainPoints);
      sim.hoveredSegmentIndex = null;
    } else if (sim.activeTool === 'friction') {
      sim.hoveredSegmentIndex = getSegmentNear(coords, sim.segments);
      sim.hoveredPointIndex = null;
    } else {
      sim.hoveredPointIndex = null;
      sim.hoveredSegmentIndex = null;
    }

    if (isDragging && dragPointIndex !== null) {
      sim.updatePointPosition(dragPointIndex, coords.x, coords.y);
    } else if (isPainting) {
      if (sim.activeTool === 'elevate') {
        sim.elevateTerrain(coords.x);
      } else if (sim.activeTool === 'lower') {
        sim.lowerTerrain(coords.x);
      } else if (sim.activeTool === 'smooth') {
        sim.smoothTerrain(coords.x);
      }
    }
  }

  function handleMouseUp() {
    isDragging = false;
    dragPointIndex = null;
    isPainting = false;
    isDraggingStartPosition = false;
  }

  function handleDoubleClick(e: MouseEvent) {
    if (sim.isPlaying) return;
    if (sim.activeTool === 'points') {
      const coords = getMouseCoords(e, canvasElement, width, height, cameraX);
      sim.addPoint(coords.x, coords.y);
    }
  }

  // Keyboard delete listener
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (sim.selectedPointIndex !== null) {
        sim.deletePoint(sim.selectedPointIndex);
      }
    }
  }

  // Svelte 5 engine loop update synchronizer
  let animationFrameId: number;

  function draw() {
    const c = ctx;
    if (!c) return;

    // Fixed camera: no horizontal follow
    cameraX = 0;

    // Background clearing
    c.fillStyle = '#f8fafc'; // modern stone color
    c.fillRect(0, 0, width, height);

    render.drawGrid(c, width, height, cameraX);

    c.save();
    c.translate(-cameraX, 0);

    render.drawFloorLimit(c, width, cameraX, 510);
    render.drawTerrain(
      c,
      sim.segments,
      height,
      sim.selectedSegmentIndex,
      sim.hoveredSegmentIndex,
      sim.activeTool,
      sim.getSegmentAngleDegrees.bind(sim)
    );
    render.drawParticles(c, particles);

    if (sim.startPositionEditMode) {
      render.drawStartPosition(c, sim.initialVehicleState.position);
    }

    if (sim.activeTool === 'points' || sim.activeTool === 'friction') {
      render.drawTerrainHandles(c, sim.terrainPoints, sim.selectedPointIndex, sim.hoveredPointIndex);
    }

    // Render the Vehicle
    const veh = sim.vehicle;
    if (veh.groundedSurface) {
      wheelRotation += veh.velocity.x * sim.config.fixedDt * 0.3;
    }
    render.drawVehicle(c, veh, wheelRotation);

    // Trigger tyre dust particles when moving and grounded
    if (sim.isPlaying && veh.groundedSurface && Math.abs(veh.velocity.x) > 0.4) {
      const absRearWheel = {
        x: veh.position.x + (-veh.width / 3.2) * Math.cos(veh.angle) - (veh.height / 2.2) * Math.sin(veh.angle),
        y: veh.position.y + (-veh.width / 3.2) * Math.sin(veh.angle) + (veh.height / 2.2) * Math.cos(veh.angle)
      };

      const isIce = veh.groundedSurface.segment.friction < 0.25;
      if (Math.random() < 0.45) {
        spawnDust(absRearWheel.x, absRearWheel.y, isIce);
      }
    }

    c.restore();

    // Advance particles animation
    updateParticles(particles);

    // Call update loop inside simulation if running
    if (sim.isPlaying) {
      sim.update();
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  onMount(() => {
    ctx = canvasElement.getContext('2d');
    draw();
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<div class="relative w-full h-full overflow-hidden select-none flex flex-col">
  <div class="relative flex-1 min-h-0 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner flex justify-center items-center p-2">
  <!-- Key bindings hint badge -->
  <div class="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-xs font-medium text-slate-200 shadow border border-slate-700/50 flex items-center gap-1.5">
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
    <span>Conducción manual desactivada • simulación por peso + fuerza impulsora</span>
  </div>

  {#if sim.activeTool === 'points'}
    <div class="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-xs font-medium text-slate-200 shadow border border-slate-700/50">
      <span>Doble clic para crear punto • <kbd class="px-1 bg-slate-700 rounded text-rose-400 font-mono font-bold">Supr</kbd> para borrar</span>
    </div>
  {/if}

  <canvas
    bind:this={canvasElement}
    {width}
    {height}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
    ondblclick={handleDoubleClick}
    class="block bg-transparent w-full h-full object-contain cursor-crosshair rounded-xl"
  ></canvas>
</div>
</div>
