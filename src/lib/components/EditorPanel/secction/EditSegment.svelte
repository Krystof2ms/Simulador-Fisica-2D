<script lang="ts">
  import { sim, editor } from "$lib/stores/simulation";

  const presets = [
    {
      name: "Hielo",
      value: 0.1,
      color: "bg-sky-400 text-sky-950 border-sky-300",
    },
    {
      name: "Lodo",
      value: 0.4,
      color: "bg-slate-400 text-slate-900 border-slate-300",
    },
    {
      name: "Tierra",
      value: 0.9,
      color: "bg-emerald-600 text-white border-emerald-500",
    },
    {
      name: "Asfalto",
      value: 1.6,
      color: "bg-orange-600 text-white border-orange-500",
    },
  ];

  function handleFrictionSlider(e: Event) {
    if (editor.selectedSegmentIndex === null) return;
    const value = parseFloat((e.target as HTMLInputElement).value);
    sim.updateSegmentFriction(editor.selectedSegmentIndex, value);
  }

  function applyPreset(value: number) {
    if (editor.selectedSegmentIndex === null) return;
    sim.updateSegmentFriction(editor.selectedSegmentIndex, value);
  }

  function handleAngleInput(e: Event) {
    if (editor.selectedSegmentIndex === null) return;
    const value = parseFloat((e.target as HTMLInputElement).value);
    if (Number.isNaN(value)) return;
    sim.setSegmentAngleDegrees(editor.selectedSegmentIndex, value);
  }
</script>

{#if editor.selectedSegmentIndex !== null}
  {@const activeFriction = sim.segments[editor.selectedSegmentIndex]?.friction ?? 0.9}
  {@const activeAngleDeg = sim.getSegmentAngleDegrees(editor.selectedSegmentIndex) ?? 0}

  <div class="p-3 rounded-xl border border-border bg-secondary">
    <div class="text-xs font-semibold text-muted-foreground">Segmento seleccionado</div>
    <div class="text-sm font-bold text-foreground mt-1">
      Sección {editor.selectedSegmentIndex! + 1}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <div
      class="flex items-center justify-between text-xs font-semibold text-muted-foreground"
    >
      <span>Fricción</span><span class="font-mono text-foreground"
        >{activeFriction.toFixed(2)} μ</span
      >
    </div>
    <input
      type="range"
      min="0"
      max="2"
      step="0.05"
      value={activeFriction}
      oninput={handleFrictionSlider}
      class="w-full h-2 bg-chart-4 rounded-lg appearance-none cursor-ew-resize accent-slate-900"
    />
    <div class="grid grid-cols-2 gap-2">
      {#each presets as pr}
        <button
          onclick={() => applyPreset(pr.value)}
          class="px-2 py-1 text-xs font-bold border rounded-lg {pr.color}
        {Math.abs(activeFriction - pr.value) < 0.01
            ? 'ring-2 ring-foreground ring-offset-1'
            : ''}"
        >
          {pr.name}
        </button>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between text-xs font-semibold text-muted-foreground">
      <span>Ángulo con eje X</span>
      <span class="font-mono text-foreground">{activeAngleDeg.toFixed(1)}°</span>
    </div>
    <input
      type="number"
      min="-80"
      max="80"
      step="0.5"
      value={activeAngleDeg.toFixed(1)}
      oninput={handleAngleInput}
      class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-border bg-secondary text-foreground"
    />
    <div class="text-xs text-muted-foreground">
      Ajusta pendiente ascendente (+) o descendente (-).
    </div>
  </div>
{:else if editor.activeTool === "friction"}
  <div
    class="p-3 rounded-xl border-2 border-sidebar-primary/50 bg-sidebar text-sidebar-primary text-xs font-semibold"
  >
    Selecciona un segmento en el canvas para editar fricción y ángulo.
  </div>
{/if}
