<script lang="ts">
  import { sim } from "$lib/stores/simulation";
  import SeriesUPlot from "$lib/components/SeriesUPlot.svelte";

  const SCALE = 25;

  let seriesMode = $state<"dist" | "vel" | "acc">("vel");

  const seriesTitle = $derived(
    seriesMode === "dist"
      ? "Distancia / Tiempo"
      : seriesMode === "acc"
        ? "Aceleración / Tiempo"
        : "Velocidad / Tiempo",
  );

  const seriesButtons = [
    { id: "dist", label: "Dist/Tiempo" },
    { id: "vel", label: "Vel/Tiempo" },
    { id: "acc", label: "Acc/Tiempo" },
  ];

  function setSeriesMode(mode: "dist" | "vel" | "acc") {
    seriesMode = mode;
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Mode selector -->
  <div
    class="flex items-center gap-1.5 bg-muted p-1 rounded-lg border border-border text-xs font-semibold"
  >
    {#each seriesButtons as btn}
      <button
        type="button"
        onclick={() => setSeriesMode(btn.id as "dist" | "vel" | "acc")}
        class="px-2 py-1 rounded-md transition-colors cursor-pointer flex-1 {seriesMode ===
        btn.id
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
      >
        {btn.label}
      </button>
    {/each}
  </div>

  <div class="flex-1 flex flex-col justify-between h-full py-1">
    <div class="flex flex-col">
      <span class="text-x font-bold text-slate-400 uppercase tracking-widest">
        Gráfico de Serie
      </span>
      <span class="text-xs text-slate-500 mt-1 leading-normal font-semibold">
        {seriesTitle}
      </span>
    </div>

    <div
      class="w-full h-80 border-2 border-border bg-background rounded-xl relative shadow-inner p-2 flex items-center justify-center mt-3"
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
      class="mt-4 p-3 bg-background/80 rounded-xl border-2 border-border/90 flex flex-col gap-1.5 shadow-inner"
    >
      <span
        class="text-xs font-bold text-muted-foreground/95 uppercase tracking-widest leading-none"
      >
        Configuración de Física
      </span>
      <div class="flex justify-between text-xs font-bold text-muted-foreground/70 mt-1">
        <span>Masa Móvil</span>
        <span class="font-mono text-foreground font-extrabold">{sim.vehicle.mass} kg</span
        >
      </div>
      <div class="flex justify-between text-xs font-bold text-muted-foreground/70">
        <span>Paso de tiempo</span>
        <span class="font-mono text-foreground font-extrabold"
          >{sim.config.fixedDt.toFixed(3)} s</span
        >
      </div>
      <div class="flex justify-between text-xs font-bold text-muted-foreground/70 ">
        <span>FPS físico</span>
        <span class="font-mono text-foreground font-extrabold"
          >{(1 / sim.config.fixedDt).toFixed(0)} Hz</span
        >
      </div>
    </div>
  </div>
</div>
