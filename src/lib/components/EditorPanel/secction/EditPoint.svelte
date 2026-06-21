<script lang="ts">
  import { sim, editor } from "$lib/stores/simulation";

  function handleInputChange(field: "x" | "y", index: number) {
    return (event: Event) => {
      console.log("Input change", field, index);
      const input = event.target as HTMLInputElement;
      const value = parseFloat(input.value);
      if (!isNaN(value)) {
        sim.terrainPoints[index] = { ...sim.terrainPoints[index], [field]: value };
      }
    };
  }
</script>

{#if editor.selectedPointIndex !== null}
  {@const point = sim.terrainPoints[editor.selectedPointIndex]}

  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <div
        class="flex items-center justify-between text-xs font-semibold text-muted-foreground"
      >
        <label for="pointY">Posicion en y</label>
        <span class="font-mono text-foreground">{point.y.toFixed(2)}</span>
      </div>
      <input
        type="number"
        id="pointY"
        min="11"
        max="700"
        step="0.5"
        value={point.y.toFixed(2)}
        oninput={handleInputChange("y", editor.selectedPointIndex)}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-border bg-secondary text-foreground"
      />
    </div>
    <div class="flex flex-col gap-2">
      <div
        class="flex items-center justify-between text-xs font-semibold text-muted-foreground"
      >
        <label for="pointX">Posicion en x</label>
        <span class="font-mono text-foreground">{point.x.toFixed(2)}</span>
      </div>
      <input
        type="number"
        id="pointX"
        min="11"
        max="700"
        step="0.5"
        value={point.x.toFixed(2)}
        oninput={handleInputChange("x", editor.selectedPointIndex)}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-border bg-secondary text-foreground"
      />
    </div>
  </div>
{:else if editor.activeTool === "points"}
  <div
    class="p-3 rounded-xl border-2 border-sidebar-primary/50 bg-sidebar text-sidebar-primary text-xs font-semibold"
  >
    Selecciona un punto en el canvas para editar pocicion.
  </div>
{/if}
