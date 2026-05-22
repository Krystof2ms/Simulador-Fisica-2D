<script lang="ts">
  import uPlot from "uplot";
  import type { AlignedData, Options } from "uplot";
  import "uplot/dist/uPlot.min.css";
  import { onDestroy } from "svelte";

  type Mode = "dist" | "vel" | "acc";
  type HistoryItem = {
    time: number;
    vehicle: {
      position: { x: number; y: number };
      velocity: { x: number; y: number };
      acceleration: { x: number; y: number };
    };
  };

  interface Props {
    history: HistoryItem[];
    mode: Mode;
    scale?: number;
    width?: number;
    height?: number;
  }

  let {
    history,
    mode,
    scale = 30,
    width = 260,
    height = 140,
  }: Props = $props();

  let container: HTMLDivElement;
  let chart: uPlot | null = null;

  const metricLabel = $derived(
    mode === "dist"
      ? "Distancia"
      : mode === "acc"
        ? "Aceleración"
        : "Velocidad",
  );
  const metricUnit = $derived(
    mode === "dist" ? "m" : mode === "acc" ? "m/s²" : "m/s",
  );

  const seriesData = $derived.by(() => {
    const times = history.map((h) => h.time);
    if (history.length === 0) return [[], []] as AlignedData;

    const x0 = history[0].vehicle.position.x;
    const values = history.map((h) => {
      if (mode === "dist") return (h.vehicle.position.x - x0) / scale;
      if (mode === "acc")
        return (
          Math.hypot(h.vehicle.acceleration.x, h.vehicle.acceleration.y) / scale
        );
      return Math.hypot(h.vehicle.velocity.x, h.vehicle.velocity.y) / scale;
    });

    return [times, values] as AlignedData;
  });

  const options = $derived.by(() => {
    const opts: Options = {
      width,
      height,
      legend: { show: false },
      cursor: { show: false },
      scales: {
        x: { time: false },
        y: { auto: true },
      },
      axes: [
        {
          stroke: "#94a3b8",
          grid: { stroke: "#e2e8f0", width: 1 },
          values: (_u, splits) => splits.map((v) => `${Number(v).toFixed(1)}s`),
        },
        {
          stroke: "#94a3b8",
          grid: { stroke: "#f1f5f9", width: 1 },
          values: (_u, splits) =>
            splits.map((v) => `${Number(v).toFixed(2)} ${metricUnit}`),
        },
      ],
      series: [
        {},
        {
          label: `${metricLabel} (${metricUnit})`,
          stroke: "#059669",
          width: 2,
          fill: "rgba(16,185,129,0.16)",
        },
      ],
    };
    return opts;
  });

  // Watch for data/options changes and update chart
  $effect(() => {
    if (chart && container) {
      chart.setSize({ width, height });
      chart.setData(seriesData);
    } else if (container && history.length > 1) {
      chart = new uPlot(options, seriesData, container);
    }
  });

  // Re-create chart if options change significantly (uPlot is sometimes picky about dynamic options)
  $effect(() => {
    options; // track
    if (chart) {
      chart.destroy();
      chart = new uPlot(options, seriesData, container);
    }
  });

  onDestroy(() => {
    if (chart) chart.destroy();
  });
</script>

<div
  class="w-full h-full flex items-center justify-center overflow-hidden"
  bind:this={container}
>
  {#if history.length <= 1}
    <div class="text-xs font-semibold text-slate-400 text-center px-4">
      Inicia la simulación para registrar y graficar series.
    </div>
  {/if}
</div>
