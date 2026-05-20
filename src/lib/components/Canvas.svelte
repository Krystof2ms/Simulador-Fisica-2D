<script lang="ts">
  import { onMount } from 'svelte';
  import { sim } from '../stores/simulation.svelte';
  import type { Vec2D } from '../engine/types';

  let canvasElement: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let isDragging = false;
  let dragPointIndex: number | null = null;
  let isPainting = false;
  let isDraggingStartPosition = false;

  // Particle system for vehicle wheel dust
  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    size: number;
    color: string;
  };
  let particles: Particle[] = [];

  // Dimensions
  let width = 1400;
  let height = 760;

  // Camera horizontal offset (fixed viewport)
  let cameraX = 0;

  // Track wheel rotation angle
  let wheelRotation = 0;

  function spawnDust(x: number, y: number, isSlippery: boolean) {
    const count = isSlippery ? 3 : 1;
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: -sim.vehicle.velocity.x * 0.2 + (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.5 - 0.5,
        alpha: 0.7,
        size: Math.random() * 4 + 2,
        color: isSlippery ? 'rgba(180, 220, 240, 0.6)' : 'rgba(160, 130, 100, 0.5)'
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      p.size += 0.05;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  // Find a terrain point near coordinate
  function getPointNear(coords: Vec2D, maxDist = 12): number | null {
    for (let i = 0; i < sim.terrainPoints.length; i++) {
      const pt = sim.terrainPoints[i];
      const dist = Math.hypot(pt.x - coords.x, pt.y - coords.y);
      if (dist < maxDist) return i;
    }
    return null;
  }

  // Find a segment near coordinate
  function getSegmentNear(coords: Vec2D, maxDist = 16): number | null {
    const segments = sim.segments;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      // Distance from point to line segment
      const l2 = Math.pow(seg.end.x - seg.start.x, 2) + Math.pow(seg.end.y - seg.start.y, 2);
      if (l2 === 0) continue;
      
      let t = ((coords.x - seg.start.x) * (seg.end.x - seg.start.x) + (coords.y - seg.start.y) * (seg.end.y - seg.start.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      
      const projX = seg.start.x + t * (seg.end.x - seg.start.x);
      const projY = seg.start.y + t * (seg.end.y - seg.start.y);
      
      const dist = Math.hypot(coords.x - projX, coords.y - projY);
      if (dist < maxDist && coords.x >= seg.start.x && coords.x <= seg.end.x) {
        return i;
      }
    }
    return null;
  }

  function getMouseCoords(e: MouseEvent): Vec2D {
    const rect = canvasElement.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const localX = (e.clientX - rect.left) * scaleX;
    const localY = (e.clientY - rect.top) * scaleY;
    // Map local X to world coordinates by adding camera position
    return { x: localX + cameraX, y: localY };
  }

  function handleMouseDown(e: MouseEvent) {
    const coords = getMouseCoords(e);
    if (sim.startPositionEditMode) {
      isDraggingStartPosition = true;
      sim.setInitialVehiclePosition(coords.x, coords.y);
      return;
    }

    if (sim.activeTool === 'points') {
      const index = getPointNear(coords);
      if (index !== null) {
        isDragging = true;
        dragPointIndex = index;
        sim.selectedPointIndex = index;
        sim.selectedSegmentIndex = null;
      } else {
        sim.selectedPointIndex = null;
      }
    } else if (sim.activeTool === 'friction') {
      const index = getSegmentNear(coords);
      if (index !== null) {
        sim.selectedSegmentIndex = index;
        sim.selectedPointIndex = null;
      } else {
        sim.selectedSegmentIndex = null;
      }
    } else if (['elevate', 'lower', 'smooth'].includes(sim.activeTool)) {
      isPainting = true;
      applyPaintTool(coords.x);
    }
  }

  function handleMouseMove(e: MouseEvent) {
    const coords = getMouseCoords(e);
    if (sim.startPositionEditMode && isDraggingStartPosition) {
      sim.setInitialVehiclePosition(coords.x, coords.y);
      return;
    }

    // Update hovers
    if (sim.activeTool === 'points') {
      sim.hoveredPointIndex = getPointNear(coords);
      sim.hoveredSegmentIndex = null;
    } else if (sim.activeTool === 'friction') {
      sim.hoveredSegmentIndex = getSegmentNear(coords);
      sim.hoveredPointIndex = null;
    } else {
      sim.hoveredPointIndex = null;
      sim.hoveredSegmentIndex = null;
    }

    if (isDragging && dragPointIndex !== null) {
      sim.updatePointPosition(dragPointIndex, coords.x, coords.y);
    } else if (isPainting) {
      applyPaintTool(coords.x);
    }
  }

  function handleMouseUp() {
    isDragging = false;
    dragPointIndex = null;
    isPainting = false;
    isDraggingStartPosition = false;
  }

  function handleDoubleClick(e: MouseEvent) {
    if (sim.activeTool === 'points') {
      const coords = getMouseCoords(e);
      sim.addPoint(coords.x, coords.y);
    }
  }

  function applyPaintTool(worldX: number) {
    if (sim.activeTool === 'elevate') {
      sim.elevateTerrain(worldX);
    } else if (sim.activeTool === 'lower') {
      sim.lowerTerrain(worldX);
    } else if (sim.activeTool === 'smooth') {
      sim.smoothTerrain(worldX);
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

    // Technical grid background
    c.save();
    c.translate(-cameraX % 40, 0);
    c.strokeStyle = 'rgba(203, 213, 225, 0.25)'; // delicate grid lines
    c.lineWidth = 1;
    for (let x = 0; x < width + 40; x += 20) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, height);
      c.stroke();
    }
    c.restore();

    c.save();
    c.translate(-cameraX % 200, 0);
    c.strokeStyle = 'rgba(203, 213, 225, 0.45)'; // thicker guide lines
    c.lineWidth = 1.5;
    for (let x = 0; x < width + 200; x += 100) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, height);
      c.stroke();
    }
    c.restore();

    // Render soil filled terrain block under world coordinates
    c.save();
    c.translate(-cameraX, 0);

    // Draw the technical floor limit line at y = 510px!
    c.beginPath();
    c.setLineDash([5, 5]);
    c.moveTo(cameraX - 100, 510);
    c.lineTo(cameraX + width + 100, 510);
    c.strokeStyle = 'rgba(148, 163, 184, 0.45)'; // Slate 400 with opacity
    c.lineWidth = 1.5;
    c.stroke();
    c.setLineDash([]); // Reset line dash

    const segments = sim.segments;
    if (segments.length > 0) {
      // Create ground body shape and fill with earth gradient
      c.beginPath();
      c.moveTo(segments[0].start.x, height);
      c.lineTo(segments[0].start.x, segments[0].start.y);
      for (const seg of segments) {
        c.lineTo(seg.end.x, seg.end.y);
      }
      c.lineTo(segments[segments.length - 1].end.x, height);
      c.closePath();

      const groundGradient = c.createLinearGradient(0, 200, 0, height);
      groundGradient.addColorStop(0, '#be185d0d'); // soft earth pink overlay
      groundGradient.addColorStop(0, '#c2410c30'); // soft orange glow
      groundGradient.addColorStop(1, '#78350fdf'); // deep rich brown
      c.fillStyle = groundGradient;
      c.fill();

      // Draw custom visual overlay per segment based on its friction level
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const f = seg.friction;
        const angleDeg = sim.getSegmentAngleDegrees(i) ?? 0;
        const midX = (seg.start.x + seg.end.x) / 2;
        const midY = (seg.start.y + seg.end.y) / 2;

        c.beginPath();
        c.moveTo(seg.start.x, seg.start.y);
        c.lineTo(seg.end.x, seg.end.y);

        // Color coding:
        // Ice (f < 0.25): Luminous sky blue
        // Mud/Slick (0.25 <= f < 0.6): Light greyish blue
        // Normal (0.6 <= f < 1.2): Bright teal
        // Sticky/Rough (f >= 1.2): Warm red/orange
        let color = '#0ea5e9'; // standard sky blue fallback
        let strokeWidth = 3;
        
        if (f < 0.25) {
          color = '#38bdf8'; // icy sky-cyan
          strokeWidth = 5;
        } else if (f < 0.6) {
          color = '#94a3b8'; // damp blue-grey
          strokeWidth = 4;
        } else if (f < 1.2) {
          color = '#0d9488'; // standard teal
          strokeWidth = 3.5;
        } else {
          color = '#ea580c'; // rough orange-red
          strokeWidth = 5;
        }

        c.strokeStyle = color;
        c.lineWidth = strokeWidth;
        c.lineCap = 'round';
        c.stroke();

        // Extra glowing accent for selected or hovered segments
        if (sim.selectedSegmentIndex === i) {
          c.strokeStyle = '#ffffff';
          c.lineWidth = strokeWidth + 3.5;
          c.beginPath();
          c.moveTo(seg.start.x, seg.start.y);
          c.lineTo(seg.end.x, seg.end.y);
          c.stroke();
          
          c.strokeStyle = '#f43f5e'; // red border
          c.lineWidth = strokeWidth + 1.5;
          c.stroke();
        } else if (sim.hoveredSegmentIndex === i && sim.activeTool === 'friction') {
          c.strokeStyle = 'rgba(244, 63, 94, 0.45)';
          c.lineWidth = strokeWidth + 3;
          c.stroke();
        }

        c.save();
        c.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        const label = `${angleDeg >= 0 ? '+' : ''}${angleDeg.toFixed(1)}°`;
        const isSelected = sim.selectedSegmentIndex === i;
        c.fillStyle = isSelected ? '#0f172a' : 'rgba(15, 23, 42, 0.72)';
        c.fillText(label, midX, midY - 14);
        c.restore();
      }
    }

    // Render Dust Particles
    for (const p of particles) {
      c.fillStyle = p.color;
      c.globalAlpha = p.alpha;
      c.beginPath();
      c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1.0; // reset alpha

    if (sim.startPositionEditMode) {
      const startPos = sim.initialVehicleState.position;
      c.save();
      c.strokeStyle = '#0891b2';
      c.fillStyle = 'rgba(8, 145, 178, 0.15)';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(startPos.x, startPos.y, 14, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.font = '700 11px ui-monospace, SFMono-Regular, Menlo, monospace';
      c.fillStyle = '#0e7490';
      c.fillText('INICIO', startPos.x, startPos.y - 18);
      c.restore();
    }

    // Draw the Interactive Terrain Vértices Handles
    if (sim.activeTool === 'points' || sim.activeTool === 'friction') {
      sim.terrainPoints.forEach((pt, i) => {
        const isSelected = sim.selectedPointIndex === i;
        const isHovered = sim.hoveredPointIndex === i;

        c.beginPath();
        c.arc(pt.x, pt.y, isSelected ? 8.5 : isHovered ? 7.5 : 5, 0, Math.PI * 2);

        // Styling
        if (isSelected) {
          c.fillStyle = '#f43f5e'; // solid pink-red
          c.strokeStyle = '#ffffff';
          c.lineWidth = 2.5;
          c.fill();
          c.stroke();

          // Outer pulsing ring
          c.beginPath();
          c.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
          c.strokeStyle = 'rgba(244, 63, 94, 0.35)';
          c.lineWidth = 2;
          c.stroke();
        } else if (isHovered) {
          c.fillStyle = '#ffffff';
          c.strokeStyle = '#f43f5e';
          c.lineWidth = 2.5;
          c.fill();
          c.stroke();
        } else {
          c.fillStyle = '#0f172a'; // dark slate
          c.strokeStyle = '#ffffff';
          c.lineWidth = 1.5;
          c.fill();
          c.stroke();
        }
      });
    }

    // Render the Vehicle (highly styled chassis and rotating tires)
    const veh = sim.vehicle;
    c.save();
    c.translate(veh.position.x, veh.position.y);
    c.rotate(veh.angle);

    // 1. Vehicle body / chassis shadow
    c.fillStyle = 'rgba(15, 23, 42, 0.15)';
    c.fillRect(-veh.width / 2 + 2, -veh.height / 2 + 5, veh.width, veh.height);

    // 2. Main chassis body (beautiful truck/SUV silhouette)
    c.fillStyle = '#06b6d4'; // premium energetic cyan
    c.beginPath();
    c.roundRect(-veh.width / 2, -veh.height / 2, veh.width, veh.height, [4, 6, 2, 2]);
    c.fill();

    // 3. Windshield and Cabin
    c.fillStyle = '#1e293b'; // dark indigo
    c.beginPath();
    c.roundRect(0, -veh.height / 2 - 8, veh.width * 0.42, 8, [6, 6, 0, 0]);
    c.fill();

    // Inner glass
    c.fillStyle = '#67e8f9'; // shiny cyan glass
    c.beginPath();
    c.roundRect(6, -veh.height / 2 - 6, veh.width * 0.28, 6, [4, 4, 0, 0]);
    c.fill();

    // 4. Stylised headlight (front is right)
    c.fillStyle = '#fef08a'; // bright yellow
    c.fillRect(veh.width / 2 - 3, -veh.height / 4, 3, 5);

    // 5. Stylised taillight (back is left)
    c.fillStyle = '#ef4444'; // deep red
    c.fillRect(-veh.width / 2, -veh.height / 4, 2, 5);

    // 6. Orange cargo detail (chassis stripe)
    c.fillStyle = '#f97316'; // accent orange
    c.fillRect(-veh.width * 0.4, -veh.height * 0.2, veh.width * 0.35, 3);

    // 7. Rotating Wheels
    const rearWheelX = -veh.width / 3.2;
    const frontWheelX = veh.width / 3.2;
    const wheelY = veh.height / 2.2;
    const wheelRadius = 8.5;

    // Increment wheel rotation angle based on vehicle velocity
    if (veh.groundedSurface) {
      wheelRotation += veh.velocity.x * sim.config.fixedDt * 0.3;
    }

    const drawWheel = (wx: number, wy: number) => {
      c.save();
      c.translate(wx, wy);
      c.rotate(wheelRotation);

      // Tire rubber (dark circle)
      c.fillStyle = '#0f172a';
      c.beginPath();
      c.arc(0, 0, wheelRadius, 0, Math.PI * 2);
      c.fill();

      // Rim metallic core
      c.fillStyle = '#cbd5e1';
      c.beginPath();
      c.arc(0, 0, wheelRadius * 0.55, 0, Math.PI * 2);
      c.fill();

      // Rim details (spokes)
      c.strokeStyle = '#334155';
      c.lineWidth = 1.5;
      for (let spoke = 0; spoke < 4; spoke++) {
        c.beginPath();
        c.moveTo(0, 0);
        const spokeAngle = (spoke * Math.PI) / 2;
        c.lineTo(Math.cos(spokeAngle) * wheelRadius * 0.55, Math.sin(spokeAngle) * wheelRadius * 0.55);
        c.stroke();
      }

      c.restore();
    };

    drawWheel(rearWheelX, wheelY);
    drawWheel(frontWheelX, wheelY);

    c.restore(); // end vehicle context

    // Trigger tyre dust particles when moving and grounded
    if (veh.groundedSurface && Math.abs(veh.velocity.x) > 0.4) {
      // Find absolute position of the back tyre
      const absRearWheel = {
        x: veh.position.x + (-veh.width / 3.2) * Math.cos(veh.angle) - (veh.height / 2.2) * Math.sin(veh.angle),
        y: veh.position.y + (-veh.width / 3.2) * Math.sin(veh.angle) + (veh.height / 2.2) * Math.cos(veh.angle)
      };
      
      const isIce = veh.groundedSurface.segment.friction < 0.25;
      if (Math.random() < 0.45) {
        spawnDust(absRearWheel.x, absRearWheel.y, isIce);
      }
    }

    c.restore(); // end world coordinates camera translation

    // Advance particles animation
    updateParticles();

    // Call update loop inside simulation if running
    if (sim.isPlaying) {
      sim.update();
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  // Keyboard shortcut binding (conduccion manual desactivada)
  function setupKeyboard(e: KeyboardEvent, pressed: boolean) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'KeyA', 'KeyD', 'KeyS'].includes(e.code)) {
      e.preventDefault();
      
      let nextThrottle = sim.controls.throttle;
      let nextBrake = sim.controls.brake;

      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        nextThrottle = pressed ? 1.0 : 0;
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        nextThrottle = pressed ? -1.0 : 0;
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        nextBrake = pressed ? 1.0 : 0;
      }

      sim.controls = { throttle: nextThrottle, brake: nextBrake };
    }
  }

  onMount(() => {
    ctx = canvasElement.getContext('2d');
    
    // Start continuous requestAnimationFrame draw loop
    draw();

    // Global Key Events
    window.addEventListener('keydown', handleKeyDown);
    // Conduccion manual desactivada:
    // const keydownHandler = (e: KeyboardEvent) => setupKeyboard(e, true);
    // const keyupHandler = (e: KeyboardEvent) => setupKeyboard(e, false);
    // window.addEventListener('keydown', keydownHandler);
    // window.addEventListener('keyup', keyupHandler);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      // window.removeEventListener('keydown', keydownHandler);
      // window.removeEventListener('keyup', keyupHandler);
    };
  });
</script>

<div class="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner select-none flex justify-center items-center p-2">
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
    class="block bg-transparent w-full h-auto cursor-crosshair rounded-xl"
  ></canvas>
</div>
