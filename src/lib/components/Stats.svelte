<script lang="ts">
  import { sim } from '../stores/simulation.svelte';
  import SeriesUPlot from './SeriesUPlot.svelte';

  interface Props {
    isDocked: boolean;
  }
  let { isDocked = $bindable(true) }: Props = $props();

  let isCollapsed = $state(false);
  let activeTab = $state<'estado' | 'serie'>('estado');
  let seriesMode = $state<'dist' | 'vel' | 'acc'>('vel');

  const SCALE = 30;

  const posX = $derived((sim.vehicle.position.x / SCALE).toFixed(2));
  const posY = $derived(((760 - sim.vehicle.position.y) / SCALE).toFixed(2));

  const velX = $derived((sim.vehicle.velocity.x / SCALE).toFixed(2));
  const velY = $derived((-sim.vehicle.velocity.y / SCALE).toFixed(2));
  const totalSpeed = $derived((Math.hypot(sim.vehicle.velocity.x, sim.vehicle.velocity.y) / SCALE).toFixed(2));

  const accX = $derived((sim.vehicle.aceleration.x / SCALE).toFixed(2));
  const accY = $derived((-sim.vehicle.aceleration.y / SCALE).toFixed(2));
  const netAcc = $derived((Math.hypot(sim.vehicle.aceleration.x, sim.vehicle.aceleration.y) / SCALE).toFixed(2));

  const slopeAngle = $derived(
    sim.vehicle.groundedSurface ? (sim.vehicle.groundedSurface.angle * 180 / Math.PI).toFixed(1) : '0.0'
  );

  const surfaceFriction = $derived(
    sim.vehicle.groundedSurface ? sim.vehicle.groundedSurface.segment.friction.toFixed(2) : 'N/A (Aire)'
  );

  const seriesTitle = $derived(
    seriesMode === 'dist' ? 'Distancia / Tiempo' : seriesMode === 'acc' ? 'Aceleración / Tiempo' : 'Velocidad / Tiempo'
  );

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }

  function toggleDock() {
    isDocked = !isDocked;
  }

  function setSeriesMode(mode: 'dist' | 'vel' | 'acc') {
    seriesMode = mode;
  }
</script>

<div
  class="relative h-full flex items-stretch transition-all duration-300 ease-out select-none {
    isCollapsed ? 'w-0' : 'w-107.5'
  } {
    !isDocked && !isCollapsed ? 'absolute top-0 right-2 z-20 drop-shadow-2xl' : ''
  }"
>
  <button
    onclick={toggleCollapse}
    class="absolute -left-6.5 top-6 w-6.5 h-14 bg-slate-900 border-y border-l border-slate-700/80 hover:bg-slate-800 text-white rounded-l-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-md z-30"
    title={isCollapsed ? 'Desplegar Panel' : 'Colapsar Panel'}
  >
    {#if isCollapsed}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
    {:else}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
    {/if}
  </button>

  {#if !isCollapsed}
    <div class="w-107.5 bg-white border border-slate-200 rounded-2xl flex flex-col items-stretch shadow-lg overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      <div class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div class="flex flex-col">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Telemetría</span>
          <span class="text-base font-extrabold text-slate-800 mt-1">Estado de Dinámica</span>
        </div>

        <button
          onclick={toggleDock}
          aria-label={isDocked ? 'Desanclar Panel' : 'Anclar Panel'}
          title={isDocked ? 'Desanclar Panel' : 'Anclar Panel'}
          class="p-2 rounded-lg border transition-all cursor-pointer focus:outline-none {
            isDocked
              ? 'bg-slate-900 border-slate-800 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }"
        >
          <svg class="w-4 h-4 rotate-45" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15m0 0l3-3m-3 3l3 3" /></svg>
        </button>
      </div>

      <div class="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 text-sm font-semibold">
        <button onclick={() => activeTab = 'estado'} class="py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none {activeTab === 'estado' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}">Estado</button>
        <button onclick={() => activeTab = 'serie'} class="py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none {activeTab === 'serie' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}">Serie</button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {#if activeTab === 'estado'}
          <div class="flex flex-col gap-3">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posición (x, y)</span>
              <div class="flex items-baseline justify-between">
                <span class="text-sm font-bold text-slate-600">X: <span class="text-base font-extrabold text-slate-900 font-mono">{posX}</span> m</span>
                <span class="text-sm font-bold text-slate-600">Y: <span class="text-base font-extrabold text-slate-900 font-mono">{posY}</span> m</span>
              </div>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Velocidad</span>
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"><span>Componente X</span><span class="font-mono text-slate-800 font-extrabold">{velX} m/s</span></div>
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"><span>Componente Y</span><span class="font-mono text-slate-800 font-extrabold">{velY} m/s</span></div>
              <div class="flex items-center justify-between text-sm font-extrabold text-slate-800 pt-0.5"><span>Velocidad Total</span><span class="font-mono text-emerald-600 text-base">{totalSpeed} m/s</span></div>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aceleración</span>
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"><span>Componente X</span><span class="font-mono text-slate-800 font-extrabold">{accX} m/s²</span></div>
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"><span>Componente Y</span><span class="font-mono text-slate-800 font-extrabold">{accY} m/s²</span></div>
              <div class="flex items-center justify-between text-sm font-extrabold text-slate-800 pt-0.5"><span>neta</span><span class="font-mono text-blue-600 text-base">{netAcc} m/s²</span></div>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contacto de Terreno</span>
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"><span>Pendiente</span><span class="font-mono text-slate-800 font-extrabold">{slopeAngle} °</span></div>
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 pt-0.5"><span>Fricción</span><span class="font-mono text-slate-800 font-extrabold">{surfaceFriction}</span></div>
            </div>
          </div>
        {:else}
          <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onclick={() => setSeriesMode('dist')}
              class="px-2 py-1 rounded-md transition-colors cursor-pointer {seriesMode === 'dist' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}"
            >Dist/Tiempo</button>
            <button
              type="button"
              onclick={() => setSeriesMode('vel')}
              class="px-2 py-1 rounded-md transition-colors cursor-pointer {seriesMode === 'vel' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}"
            >Vel/Tiempo</button>
            <button
              type="button"
              onclick={() => setSeriesMode('acc')}
              class="px-2 py-1 rounded-md transition-colors cursor-pointer {seriesMode === 'acc' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}"
            >Acc/Tiempo</button>
          </div>

          <div class="flex-1 flex flex-col justify-between h-full py-1">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gráfico de Serie</span>
              <span class="text-xs text-slate-500 mt-1 leading-normal font-semibold">{seriesTitle}</span>
            </div>

            <div class="w-full h-80 border border-slate-200 bg-slate-50 rounded-xl relative shadow-inner p-2 flex items-center justify-center mt-3">
              <SeriesUPlot history={sim.history} mode={seriesMode} scale={SCALE} width={380} height={250} />
            </div>

            <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Configuración de Física</span>
              <div class="flex justify-between text-xs font-bold text-slate-500 mt-1"><span>Masa Móvil</span><span class="font-mono text-slate-800 font-extrabold">{sim.vehicle.mass} kg</span></div>
              <div class="flex justify-between text-xs font-bold text-slate-500"><span>Paso de tiempo</span><span class="font-mono text-slate-800 font-extrabold">{sim.config.fixedDt.toFixed(3)} s</span></div>
              <div class="flex justify-between text-xs font-bold text-slate-500"><span>FPS físico</span><span class="font-mono text-slate-800 font-extrabold">{(1 / sim.config.fixedDt).toFixed(0)} Hz</span></div>
            </div>
          </div>
        {/if}
      </div>

      <div class="p-3 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-slate-500 flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full {sim.isPlaying ? 'bg-emerald-500 animate-pulse' : sim.isFinished ? 'bg-indigo-500' : 'bg-slate-400'}"></span>
          {sim.isPlaying ? 'Simulación Activa' : sim.isFinished ? 'Simulación Terminada' : 'Simulación Pausada'}
        </span>
        <span class="font-mono text-[10px] text-slate-400 font-bold uppercase">v1.2</span>
      </div>
    </div>
  {/if}
</div>
