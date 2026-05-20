<script lang="ts">
  import { sim } from '../stores/simulation.svelte';

  // Svelte 5 props for docking communication
  interface Props {
    isDocked: boolean;
  }
  let { isDocked = $bindable(true) }: Props = $props();

  let isCollapsed = $state(false);
  let activeTab = $state<'estado' | 'serie'>('estado');

  // Convert pixels to meters (scale: 30px = 1m)
  const SCALE = 30;

  // Derived telemetry values in metric units
  const posX = $derived((sim.vehicle.position.x / SCALE).toFixed(2));
  const posY = $derived(((550 - sim.vehicle.position.y) / SCALE).toFixed(2)); // inverted Y
  
  const velX = $derived((sim.vehicle.velocity.x / SCALE).toFixed(2));
  const velY = $derived((-sim.vehicle.velocity.y / SCALE).toFixed(2)); // inverted Y
  const totalSpeed = $derived((Math.hypot(sim.vehicle.velocity.x, sim.vehicle.velocity.y) / SCALE).toFixed(2));

  // Acceleration telemetry (requested!)
  const accX = $derived((sim.vehicle.aceleration.x / SCALE).toFixed(2));
  const accY = $derived((-sim.vehicle.aceleration.y / SCALE).toFixed(2)); // gravity pulls down in engine
  const totalAcc = $derived((Math.hypot(sim.vehicle.aceleration.x, sim.vehicle.aceleration.y) / SCALE).toFixed(2));

  // Slope and Contact segment properties
  const slopeAngle = $derived(
    sim.vehicle.groundedSurface 
      ? (sim.vehicle.groundedSurface.angle * 180 / Math.PI).toFixed(1)
      : '0.0'
  );
  
  const surfaceFriction = $derived(
    sim.vehicle.groundedSurface 
      ? sim.vehicle.groundedSurface.segment.friction.toFixed(2)
      : 'N/A (Aire)'
  );

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }

  function toggleDock() {
    isDocked = !isDocked;
  }

  // Generate SVG path for vehicle speed over history (for the 'Serie' tab)
  const speedHistoryPath = $derived.by(() => {
    if (sim.history.length === 0) return '';
    
    const maxSpeedVal = Math.max(...sim.history.map(h => Math.hypot(h.vehicle.velocity.x, h.vehicle.velocity.y) / SCALE), 1);
    const canvasW = 260;
    const canvasH = 140;
    
    // Scale indices to X and speeds to Y
    const points = sim.history.map((h, i) => {
      const x = (i / (sim.maxTime / sim.config.fixedDt)) * canvasW;
      const speed = Math.hypot(h.vehicle.velocity.x, h.vehicle.velocity.y) / SCALE;
      const y = canvasH - (speed / (maxSpeedVal * 1.25)) * canvasH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')}`;
  });
</script>

<div
  class="relative h-[550px] flex items-stretch transition-all duration-300 ease-out select-none {
    isCollapsed ? 'w-0' : 'w-[320px]'
  } {
    !isDocked && !isCollapsed ? 'absolute top-0 right-2 z-20 drop-shadow-2xl' : ''
  }"
>
  <!-- Collapse toggle tab -->
  <button
    onclick={toggleCollapse}
    class="absolute left-[-26px] top-6 w-[26px] h-14 bg-slate-900 border-y border-l border-slate-700/80 hover:bg-slate-800 text-white rounded-l-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-md z-30"
    title={isCollapsed ? 'Desplegar Panel' : 'Colapsar Panel'}
  >
    {#if isCollapsed}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    {:else}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    {/if}
  </button>

  {#if !isCollapsed}
    <div class="w-[320px] bg-white border border-slate-200 rounded-2xl flex flex-col items-stretch shadow-lg overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      <!-- Title & Docking Pin Header -->
      <div class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div class="flex flex-col">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Telemetría</span>
          <span class="text-base font-extrabold text-slate-800 mt-1">Estado de Dinámica</span>
        </div>

        <button
          onclick={toggleDock}
          class="p-2 rounded-lg border transition-all cursor-pointer focus:outline-none {
            isDocked 
              ? 'bg-slate-900 border-slate-800 text-white shadow-sm' 
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }"
          title={isDocked ? 'Desanclar Panel (Flotar)' : 'Anclar Panel (Lado a Lado)'}
        >
          <!-- Pin Icon -->
          <svg class="w-4 h-4 rotate-45" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 text-sm font-semibold">
        <button
          onclick={() => activeTab = 'estado'}
          class="py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none {
            activeTab === 'estado'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
          }"
        >
          Estado
        </button>
        <button
          onclick={() => activeTab = 'serie'}
          class="py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none {
            activeTab === 'serie'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
          }"
        >
          Serie
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {#if activeTab === 'estado'}
          <!-- Telemetry Grid -->
          <div class="flex flex-col gap-3">
            <!-- Position -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posición (x, y)</span>
              <div class="flex items-baseline justify-between">
                <span class="text-sm font-bold text-slate-600">X: <span class="text-base font-extrabold text-slate-900 font-mono">{posX}</span> m</span>
                <span class="text-sm font-bold text-slate-600">Y: <span class="text-base font-extrabold text-slate-900 font-mono">{posY}</span> m</span>
              </div>
            </div>

            <!-- Velocities -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Velocidad</span>
              
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1">
                <span>Componente X</span>
                <span class="font-mono text-slate-800 font-extrabold">{velX} m/s</span>
              </div>
              
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1">
                <span>Componente Y</span>
                <span class="font-mono text-slate-800 font-extrabold">{velY} m/s</span>
              </div>
              
              <div class="flex items-center justify-between text-sm font-extrabold text-slate-800 pt-0.5">
                <span>Velocidad Total</span>
                <span class="font-mono text-emerald-600 text-base">{totalSpeed} m/s</span>
              </div>
            </div>

            <!-- Accelerations -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aceleración</span>
              
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1">
                <span>Componente X</span>
                <span class="font-mono text-slate-800 font-extrabold">{accX} m/s²</span>
              </div>
              
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1">
                <span>Componente Y</span>
                <span class="font-mono text-slate-800 font-extrabold">{accY} m/s²</span>
              </div>
              
              <div class="flex items-center justify-between text-sm font-extrabold text-slate-800 pt-0.5">
                <span>Aceleración Total</span>
                <span class="font-mono text-blue-600 text-base">{totalAcc} m/s²</span>
              </div>
            </div>

            <!-- Ground details -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contacto de Terreno</span>
              
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1">
                <span>Pendiente</span>
                <span class="font-mono text-slate-800 font-extrabold">{slopeAngle} °</span>
              </div>
              
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 pt-0.5">
                <span>Fricción (Rozamiento)</span>
                <span class="font-mono text-slate-800 font-extrabold">{surfaceFriction}</span>
              </div>
            </div>
          </div>
        {:else}
          <!-- Series Speed Chart -->
          <div class="flex-1 flex flex-col justify-between h-full py-1">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gráfico de Velocidad</span>
              <span class="text-xs text-slate-500 mt-1 leading-normal font-semibold">Muestra la magnitud del móvil ($|v|$) a lo largo del tiempo de recorrido histórico.</span>
            </div>

            <!-- SVG Graph Container -->
            <div class="w-full h-[200px] border border-slate-200 bg-slate-50 rounded-xl relative shadow-inner p-2 flex items-center justify-center mt-3">
              {#if sim.history.length > 1}
                {@const maxSpeedVal = Math.max(...sim.history.map(h => Math.hypot(h.vehicle.velocity.x, h.vehicle.velocity.y) / SCALE), 1)}
                
                <!-- Speed Axis Y label -->
                <div class="absolute left-2 top-2 text-[9px] font-mono font-bold text-slate-400">
                  {maxSpeedVal.toFixed(1)} m/s
                </div>

                <div class="absolute left-2 bottom-2 text-[9px] font-mono font-bold text-slate-400">
                  0.0 m/s
                </div>

                <svg class="w-full h-full" viewBox="0 0 260 140">
                  <!-- Shaded area fill underneath the curve -->
                  {#if speedHistoryPath}
                    <path
                      d="{speedHistoryPath} L 260,140 L 0,140 Z"
                      fill="url(#areaGrad)"
                      stroke="none"
                    />
                    <!-- Bright line curve -->
                    <path
                      d={speedHistoryPath}
                      fill="none"
                      stroke="#059669"
                      stroke-width="3"
                      stroke-linecap="round"
                    />
                  {/if}

                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <value></value>
                      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3" />
                      <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              {:else}
                <div class="text-xs font-semibold text-slate-400 text-center px-4">
                  Inicia la simulación para registrar y graficar curvas de dinámica.
                </div>
              {/if}
            </div>

            <!-- Additional dynamic specs -->
            <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Configuración de Física</span>
              <div class="flex justify-between text-xs font-bold text-slate-500 mt-1">
                <span>Gravedad</span>
                <span class="font-mono text-slate-800 font-extrabold">9.8 m/s²</span>
              </div>
              <div class="flex justify-between text-xs font-bold text-slate-500">
                <span>Masa Móvil</span>
                <span class="font-mono text-slate-800 font-extrabold">{sim.vehicle.mass} kg</span>
              </div>
              <div class="flex justify-between text-xs font-bold text-slate-500">
                <span>Pasos por Segundo</span>
                <span class="font-mono text-slate-800 font-extrabold">60 Hz</span>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Quick status indicator footer -->
      <div class="p-3 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-slate-500 flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full {sim.isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}"></span>
          {sim.isPlaying ? 'Simulación Activa' : 'Simulación Pausada'}
        </span>
        <span class="font-mono text-[10px] text-slate-400 font-bold uppercase">v1.1</span>
      </div>
    </div>
  {/if}
</div>
