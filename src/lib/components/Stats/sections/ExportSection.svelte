<script lang="ts">
  import { sim } from "$lib/stores/simulation";
  import { exportToCSV, type ExportOptions } from "$lib/utils/export";

  interface Props {
    projectName: string;
  }
  let { projectName }: Props = $props();

  let exportOptions = $state<ExportOptions>({
    distance: true,
    velocity: true,
    acceleration: true,
    friction: true,
  });
  let isExporting = $state(false);
  let exportSuccess = $state<boolean | undefined>(undefined);

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

  const options = [
    { key: "distance" as const, label: "Distancia y Posición" },
    { key: "velocity" as const, label: "Velocidad (X, Y, Total)" },
    { key: "acceleration" as const, label: "Aceleración (X, Y, Neta)" },
    { key: "friction" as const, label: "Fricción y Pendiente" },
  ];
</script>

<div class="flex flex-col gap-4">
  <!-- Checkbox options -->
  <div class="p-4 bg-background rounded-xl border-2 border-border shadow-inner">
    <span
      class="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-3"
    >
      Series a Exportar
    </span>
    <div class="flex flex-col gap-3">
      {#each options as option}
        <label
          class="flex items-center gap-3 text-sm font-semibold text-muted-foreground/80 cursor-pointer"
        >
          <input
            type="checkbox"
            bind:checked={exportOptions[option.key]}
            class="w-4 h-4 rounded border-border text-cyan-600 focus:ring-cyan-500"
          />
          {option.label}
        </label>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <!-- Export button -->
    <button
      onclick={handleExport}
      disabled={sim.history.length === 0 || isExporting}
      class="w-full py-3 px-4 bg-foreground text-background rounded-xl font-bold text-sm shadow-md hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Generar CSV de Telemetría
      {/if}
    </button>

    <!-- Status feedback -->
    {#if exportSuccess === true}
      <div
        class="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-2 animate-in fade-in zoom-in-95"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        ¡Exportación completada con éxito!
      </div>
    {:else if exportSuccess === false}
      <div
        class="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2 animate-in fade-in zoom-in-95"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        Error al exportar. Intente de nuevo.
      </div>
    {/if}

    <p class="text-xs text-muted-foreground font-medium leading-relaxed px-1">
      Seleccione los datos que desea incluir en el archivo CSV. El archivo incluirá una
      fila por cada paso de tiempo de la simulación.
    </p>
  </div>
</div>
