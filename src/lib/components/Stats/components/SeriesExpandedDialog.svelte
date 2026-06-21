<script lang="ts">
  import SeriesUPlot from "$lib/components/SeriesUPlot.svelte";

  type SeriesMode = "dist" | "vel" | "acc";
  type HistoryItem = {
    time: number;
    vehicle: {
      position: { x: number; y: number };
      velocity: { x: number; y: number };
      acceleration: { x: number; y: number };
    };
  };

  interface Props {
    open: boolean;
    history: HistoryItem[];
    mode: SeriesMode;
    scale: number;
    title: string;
  }

  let { open = $bindable(false), history, mode, scale, title }: Props = $props();

  let plotWidth = $state(0);
  let plotHeight = $state(0);

  const chartWidth = $derived(Math.max(plotWidth - 80, 360));
  const chartHeight = $derived(Math.max(plotHeight - 128, 260));

  function close() {
    open = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") close();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 flex items-center justify-center bg-slate-950/45 p-6 backdrop-blur-sm"
    style="z-index: 1000;"
    role="dialog"
    aria-modal="true"
    aria-label="Gráfico expandido"
  >
    <button
      type="button"
      class="absolute inset-0 cursor-default"
      aria-label="Cerrar gráfico expandido"
      onclick={close}
    ></button>

    <section
      class="relative z-10 flex h-[min(84vh,850px)] w-[min(94vw,1280px)] flex-col rounded-2xl border-2 border-border bg-card shadow-2xl"
    >
      <header class="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div class="flex flex-col">
          <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Gráfico expandido
          </span>
          <span class="text-lg font-extrabold text-foreground">{title}</span>
        </div>

        <button
          type="button"
          class="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground shadow-sm transition-colors hover:bg-slate-100 hover:text-foreground focus:outline-none"
          onclick={close}
        >
          Cerrar
        </button>
      </header>

      <div
        class="min-h-0 flex-1 px-8 pb-8 pt-6"
        bind:clientWidth={plotWidth}
        bind:clientHeight={plotHeight}
      >
        <div
          class="h-full w-full rounded-xl border-2 border-border bg-background px-6 pb-5 pt-6 shadow-inner"
        >
          <SeriesUPlot
            {history}
            {mode}
            {scale}
            width={chartWidth}
            height={chartHeight}
            showHoverInfo
            yAxisSize={72}
          />
        </div>
      </div>
    </section>
  </div>
{/if}
