<script lang="ts">
  import { sim } from "$lib/stores/simulation";
  import { Pause, Play, RotateCcw } from "lucide-svelte";

  const TIMELINE_MARKS = 6;
  const timelineLabels = $derived(
    Array.from(
      { length: TIMELINE_MARKS },
      (_, i) => (sim.maxTime * i) / (TIMELINE_MARKS - 1),
    ),
  );

  function togglePlay() {
    sim.isPlaying = !sim.isPlaying;
  }

  function handleReset() {
    sim.resetSimulation();
  }

  function handleFinish() {
    sim.finishSimulation();
  }

  function handleTimelineScrub(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    sim.scrubTo(value);
  }
</script>

<div
  class="w-full flex flex-wrap items-center justify-center gap-4 bg-card backdrop-blur-md p-4 rounded-2xl border-2 border-border shadow-sm"
>
  <div class="min-w-125 flex">
    <div class="flex items-center gap-3">
      <!-- Play/Pause Button -->
      <button
        onclick={togglePlay}
        disabled={sim.isFinished}
        class="w-12 h-12 flex items-center justify-center rounded-xl font-bold cursor-pointer transition-all focus:outline-none shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 {sim.isPlaying
          ? 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80'}"
        title={sim.isFinished
          ? "Simulación terminada (Reinicie para volver a empezar)"
          : sim.isPlaying
            ? "Pausar"
            : "Iniciar Simulación"}
      >
        {#if sim.isPlaying}
          <Pause class="w-5 h-5" fill="currentColor" strokeWidth={0} />
        {:else}
          <Play class="w-5 h-5 translate-x-0.5" fill="currentColor" strokeWidth={0} />
        {/if}
      </button>

      <!-- Reset Button -->
      <button
        onclick={handleReset}
        class="w-10 h-10 flex items-center justify-center rounded-xl bg-border/50 hover:bg-border/40 active:bg-border/30 text-muted-foreground border border-border cursor-pointer transition-all focus:outline-none shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        title="Reiniciar móvil al inicio"
      >
        <RotateCcw class="w-5 h-5" strokeWidth={2.5} />
      </button>

      <button
        onclick={handleFinish}
        disabled={sim.isFinished}
        class="px-3 h-10 flex items-center justify-center rounded-xl bg-indigo-100 hover:bg-indigo-200 active:bg-indigo-300 text-indigo-800 border border-indigo-200 cursor-pointer transition-all focus:outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title={sim.isFinished ? "La simulación ya ha finalizado" : "Finalizar simulación"}
      >
        Finalizar
      </button>
    </div>

    <!-- Timeline scrub slider -->
    <div class="flex-1 flex flex-col gap-1.5 px-3">
      <div
        class="flex items-center justify-between text-xs text-muted-foreground font-bold font-mono"
      >
        {#each timelineLabels as label}
          <span>{label.toFixed(2)}s</span>
        {/each}
      </div>

      <div class="relative w-full">
        <input
          type="range"
          min="0.0"
          max={sim.maxTime}
          step={sim.config.fixedDt}
          value={sim.time}
          oninput={handleTimelineScrub}
          class="w-full h-2.5 bg-primary/40 rounded-lg appearance-none cursor-ew-resize accent-slate-800 focus:outline-none"
        />
      </div>
    </div>
  </div>

  <!-- Telemetry timer text -->
  <div
    class="px-5 py-2.5 rounded-xl border border-border bg-background shadow-inner flex flex-col justify-center items-end shrink-0 min-w-[180px]"
  >
    <span
      class="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none"
    >
      {sim.isFinished ? "Terminada" : "Tiempo"}
    </span>
    <span class="text-sm font-extrabold text-muted-foreground font-mono mt-0.5">
      t = {sim.time.toFixed(2)}s
      <span class="text-xs text-muted-foreground font-normal"
        >/ {sim.maxTime.toFixed(2)}s</span
      >
    </span>
  </div>
</div>
