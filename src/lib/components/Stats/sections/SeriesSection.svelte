<script lang="ts">
  import { sim } from "$lib/stores/simulation";
  import SeriesUPlot from "$lib/components/SeriesUPlot.svelte";

  const SCALE = 30;

  let seriesMode = $state<"dist" | "vel" | "acc">("vel");

  const seriesTitle = $derived(
    seriesMode === "dist"
      ? "Distancia / Tiempo"
      : seriesMode === "acc"
        ? "Aceleración / Tiempo"
        : "Velocidad / Tiempo",
  );

  function setSeriesMode(mode: "dist" | "vel" | "acc") {
    seriesMode = mode;
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Mode selector -->
  <div
    class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold"
  >
    {#each [{ id: "dist", label: "Dist/Tiempo" }, { id: "vel", label: "Vel/Tiempo" }, { id: "acc", label: "Acc/Tiempo" }] as btn}
      <button
        type="button"
        onclick={() => setSeriesMode(btn.id as "dist" | "vel" | "acc")}
        class="px-2 py-1 rounded-md transition-colors cursor-pointer {seriesMode ===
        btn.id
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}"
      >
        {btn.label}
      </button>
    {/each}
  </div>

  <div class="flex-1 flex flex-col justify-between h-full py-1">
    <div class="flex flex-col">
      <span
        class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
      >
        Gráfico de Serie
      </span>
      <span class="text-xs text-slate-500 mt-1 leading-normal font-semibold">
        {seriesTitle}
      </span>
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

    <!-- Physics config summary -->
    <div
      class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner"
    >
      <span
        class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none"
      >
        Configuración de Física
      </span>
      <div class="flex justify-between text-xs font-bold text-slate-500 mt-1">
        <span>Masa Móvil</span>
        <span class="font-mono text-slate-800 font-extrabold"
          >{sim.vehicle.mass} kg</span
        >
      </div>
      <div class="flex justify-between text-xs font-bold text-slate-500">
        <span>Paso de tiempo</span>
        <span class="font-mono text-slate-800 font-extrabold"
          >{sim.config.fixedDt.toFixed(3)} s</span
        >
      </div>
      <div class="flex justify-between text-xs font-bold text-slate-500">
        <span>FPS físico</span>
        <span class="font-mono text-slate-800 font-extrabold"
          >{(1 / sim.config.fixedDt).toFixed(0)} Hz</span
        >
      </div>
    </div>
  </div>
</div>
