<script lang="ts">
  import { sim } from "$lib/stores/simulation.svelte";
  import SeriesUPlot from "$lib/components/SeriesUPlot.svelte";
  import { exportToCSV, type ExportOptions } from "$lib/utils/export";

  interface Props {
    isDocked: boolean;
    projectName: string;
  }
  let { isDocked = $bindable(true), projectName }: Props = $props();

  let isCollapsed = $state(false);
  let activeTab = $state<"estado" | "serie" | "export">("estado");
  let seriesMode = $state<"dist" | "vel" | "acc">("vel");

  $inspect(seriesMode);

  let exportOptions = $state<ExportOptions>({
    distance: true,
    velocity: true,
    acceleration: true,
    friction: true,
  });
  let isExporting = $state(false);
  let exportSuccess = $state<boolean | undefined>(undefined);

  const SCALE = 30;

  const posX = $derived((sim.vehicle.position.x / SCALE).toFixed(2));
  const posY = $derived(((760 - sim.vehicle.position.y) / SCALE).toFixed(2));

  const velX = $derived((sim.vehicle.velocity.x / SCALE).toFixed(2));
  const velY = $derived((-sim.vehicle.velocity.y / SCALE).toFixed(2));
  const totalSpeed = $derived(
    (
      Math.hypot(sim.vehicle.velocity.x, sim.vehicle.velocity.y) / SCALE
    ).toFixed(2),
  );

  const accX = $derived((sim.vehicle.aceleration.x / SCALE).toFixed(2));
  const accY = $derived((-sim.vehicle.aceleration.y / SCALE).toFixed(2));
  const netAcc = $derived(
    (
      Math.hypot(sim.vehicle.aceleration.x, sim.vehicle.aceleration.y) / SCALE
    ).toFixed(2),
  );

  const slopeAngle = $derived(
    sim.vehicle.groundedSurface
      ? ((sim.vehicle.groundedSurface.angle * 180) / Math.PI).toFixed(1)
      : "0.0",
  );

  const surfaceFriction = $derived(
    sim.vehicle.groundedSurface
      ? sim.vehicle.groundedSurface.segment.friction.toFixed(2)
      : "N/A (Aire)",
  );

  const seriesTitle = $derived(
    seriesMode === "dist"
      ? "Distancia / Tiempo"
      : seriesMode === "acc"
        ? "Aceleración / Tiempo"
        : "Velocidad / Tiempo",
  );

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }

  function toggleDock() {
    isDocked = !isDocked;
  }

  function setSeriesMode(mode: "dist" | "vel" | "acc") {
    seriesMode = mode;
  }

  async function handleExport() {
    if (sim.history.length === 0) return;
    isExporting = true;
    exportSuccess = undefined;
    try {
      const result = await exportToCSV(sim.history, exportOptions, projectName);
      exportSuccess = result;
      if (result) {
        setTimeout(() => (exportSuccess = undefined), 3000);
      }
    } catch (e) {
      console.error("Error al exportar CSV:", e);
      exportSuccess = false;
    } finally {
      isExporting = false;
    }
  }
</script>

<div
  class="relative h-full flex items-stretch transition-all duration-300 ease-out select-none {isCollapsed
    ? 'w-0'
    : 'w-107.5'} {!isDocked && !isCollapsed
    ? 'absolute top-0 right-2 z-20 drop-shadow-2xl'
    : ''}"
>
  <button
    onclick={toggleCollapse}
    class="absolute -left-6.5 top-6 w-6.5 h-14 bg-slate-900 border-y border-l border-slate-700/80 hover:bg-slate-800 text-white rounded-l-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-md z-30"
    title={isCollapsed ? "Desplegar Panel" : "Colapsar Panel"}
  >
    {#if isCollapsed}
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        /></svg
      >
    {:else}
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        /></svg
      >
    {/if}
  </button>

  {#if !isCollapsed}
    <div
      class="w-107.5 bg-white border border-slate-200 rounded-2xl flex flex-col items-stretch shadow-lg overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div
        class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50"
      >
        <div class="flex flex-col">
          <span
            class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none"
            >Telemetría</span
          >
          <span class="text-base font-extrabold text-slate-800 mt-1"
            >Estado de Dinámica</span
          >
        </div>

        <button
          onclick={toggleDock}
          aria-label={isDocked ? "Desanclar Panel" : "Anclar Panel"}
          title={isDocked ? "Desanclar Panel" : "Anclar Panel"}
          class="p-2 rounded-lg border transition-all cursor-pointer focus:outline-none {isDocked
            ? 'bg-slate-900 border-slate-800 text-white shadow-sm'
            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}"
        >
          <svg
            class="w-4 h-4 rotate-45"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 12h-15m0 0l3-3m-3 3l3 3"
            /></svg
          >
        </button>
      </div>

      <div
        class="grid grid-cols-3 p-2 bg-slate-100 border-b border-slate-200 text-sm font-semibold"
      >
        <button
          onclick={() => (activeTab = "estado")}
          class="py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none {activeTab ===
          'estado'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}"
          >Estado</button
        >
        <button
          onclick={() => (activeTab = "serie")}
          class="py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none {activeTab ===
          'serie'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}"
          >Serie</button
        >
        <button
          onclick={() => (activeTab = "export")}
          class="py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none {activeTab ===
          'export'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}"
          >Exportar</button
        >
      </div>

      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {#if activeTab === "estado"}
          <div class="flex flex-col gap-3">
            <div
              class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-inner"
            >
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >Posición (x, y)</span
              >
              <div class="flex items-baseline justify-between">
                <span class="text-sm font-bold text-slate-600"
                  >X: <span
                    class="text-base font-extrabold text-slate-900 font-mono"
                    >{posX}</span
                  > m</span
                >
                <span class="text-sm font-bold text-slate-600"
                  >Y: <span
                    class="text-base font-extrabold text-slate-900 font-mono"
                    >{posY}</span
                  > m</span
                >
              </div>
            </div>

            <div
              class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner"
            >
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >Velocidad</span
              >
              <div
                class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"
              >
                <span>Componente X</span><span
                  class="font-mono text-slate-800 font-extrabold"
                  >{velX} m/s</span
                >
              </div>
              <div
                class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"
              >
                <span>Componente Y</span><span
                  class="font-mono text-slate-800 font-extrabold"
                  >{velY} m/s</span
                >
              </div>
              <div
                class="flex items-center justify-between text-sm font-extrabold text-slate-800 pt-0.5"
              >
                <span>Velocidad Total</span><span
                  class="font-mono text-emerald-600 text-base"
                  >{totalSpeed} m/s</span
                >
              </div>
            </div>

            <div
              class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner"
            >
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >Aceleración</span
              >
              <div
                class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"
              >
                <span>Componente X</span><span
                  class="font-mono text-slate-800 font-extrabold"
                  >{accX} m/s²</span
                >
              </div>
              <div
                class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"
              >
                <span>Componente Y</span><span
                  class="font-mono text-slate-800 font-extrabold"
                  >{accY} m/s²</span
                >
              </div>
              <div
                class="flex items-center justify-between text-sm font-extrabold text-slate-800 pt-0.5"
              >
                <span>neta</span><span class="font-mono text-blue-600 text-base"
                  >{netAcc} m/s²</span
                >
              </div>
            </div>

            <div
              class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner"
            >
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >Contacto de Terreno</span
              >
              <div
                class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"
              >
                <span>Pendiente</span><span
                  class="font-mono text-slate-800 font-extrabold"
                  >{slopeAngle} °</span
                >
              </div>
              <div
                class="flex items-center justify-between text-xs font-bold text-slate-500 pt-0.5"
              >
                <span>Fricción</span><span
                  class="font-mono text-slate-800 font-extrabold"
                  >{surfaceFriction}</span
                >
              </div>
            </div>
          </div>
        {:else if activeTab === "serie"}
          <div
            class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold"
          >
            <button
              type="button"
              onclick={() => setSeriesMode("dist")}
              class="px-2 py-1 rounded-md transition-colors cursor-pointer {seriesMode ===
              'dist'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}"
              >Dist/Tiempo</button
            >
            <button
              type="button"
              onclick={() => setSeriesMode("vel")}
              class="px-2 py-1 rounded-md transition-colors cursor-pointer {seriesMode ===
              'vel'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}"
              >Vel/Tiempo</button
            >
            <button
              type="button"
              onclick={() => setSeriesMode("acc")}
              class="px-2 py-1 rounded-md transition-colors cursor-pointer {seriesMode ===
              'acc'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}"
              >Acc/Tiempo</button
            >
          </div>

          <div class="flex-1 flex flex-col justify-between h-full py-1">
            <div class="flex flex-col">
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >Gráfico de Serie</span
              >
              <span
                class="text-xs text-slate-500 mt-1 leading-normal font-semibold"
                >{seriesTitle}</span
              >
            </div>

            <div
              class="w-full h-80 border border-slate-200 bg-slate-50 rounded-xl relative shadow-inner p-2 flex items-center justify-center mt-3"
            >
              <SeriesUPlot
                history={sim.history}
                mode={seriesMode}
                scale={SCALE}
                width={380}
                height={250}
              />
            </div>

            <div
              class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner"
            >
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none"
                >Configuración de Física</span
              >
              <div
                class="flex justify-between text-xs font-bold text-slate-500 mt-1"
              >
                <span>Masa Móvil</span><span
                  class="font-mono text-slate-800 font-extrabold"
                  >{sim.vehicle.mass} kg</span
                >
              </div>
              <div
                class="flex justify-between text-xs font-bold text-slate-500"
              >
                <span>Paso de tiempo</span><span
                  class="font-mono text-slate-800 font-extrabold"
                  >{sim.config.fixedDt.toFixed(3)} s</span
                >
              </div>
              <div
                class="flex justify-between text-xs font-bold text-slate-500"
              >
                <span>FPS físico</span><span
                  class="font-mono text-slate-800 font-extrabold"
                  >{(1 / sim.config.fixedDt).toFixed(0)} Hz</span
                >
              </div>
            </div>
          </div>
        {:else}
          <div class="flex flex-col gap-4">
            <div
              class="p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner"
            >
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3"
                >Series a Exportar</span
              >
              <div class="flex flex-col gap-3">
                <label
                  class="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    bind:checked={exportOptions.distance}
                    class="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  Distancia y Posición
                </label>
                <label
                  class="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    bind:checked={exportOptions.velocity}
                    class="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  Velocidad (X, Y, Total)
                </label>
                <label
                  class="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    bind:checked={exportOptions.acceleration}
                    class="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  Aceleración (X, Y, Neta)
                </label>
                <label
                  class="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    bind:checked={exportOptions.friction}
                    class="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  Fricción y Pendiente
                </label>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <button
                onclick={handleExport}
                disabled={sim.history.length === 0 || isExporting}
                class="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {#if isExporting}
                  <svg
                    class="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Exportando...
                {:else}
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    /></svg
                  >
                  Generar CSV de Telemetría
                {/if}
              </button>

              {#if exportSuccess === true}
                <div
                  class="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-2 animate-in fade-in zoom-in-95"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                    ><path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    /></svg
                  >
                  ¡Exportación completada con éxito!
                </div>
              {:else if exportSuccess === false}
                <div
                  class="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2 animate-in fade-in zoom-in-95"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                    ><path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    /></svg
                  >
                  Error al exportar. Intente de nuevo.
                </div>
              {/if}

              <p
                class="text-[11px] text-slate-400 font-medium leading-relaxed px-1"
              >
                Seleccione los datos que desea incluir en el archivo CSV. El
                archivo incluirá una fila por cada paso de tiempo de la
                simulación.
              </p>
            </div>
          </div>
        {/if}
      </div>

      <div
        class="p-3 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-slate-500 flex items-center justify-between"
      >
        <span class="flex items-center gap-1.5">
          <span
            class="w-2.5 h-2.5 rounded-full {sim.isPlaying
              ? 'bg-emerald-500 animate-pulse'
              : sim.isFinished
                ? 'bg-indigo-500'
                : 'bg-slate-400'}"
          ></span>
          {sim.isPlaying
            ? "Simulación Activa"
            : sim.isFinished
              ? "Simulación Terminada"
              : "Simulación Pausada"}
        </span>
        <span class="font-mono text-[10px] text-slate-400 font-bold uppercase"
          >v1.2</span
        >
      </div>
    </div>
  {/if}
</div>
