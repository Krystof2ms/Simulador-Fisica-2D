<script lang="ts">
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { sim } from "$lib/stores/simulation";
  import {
    importSimulation,
    exportSimulation,
    DEFAULT_VERSION,
    type SimulationExport,
  } from "$lib/utils/export/simulation";

  type Option = {
    label: string;
    value: "import" | "export";
    action: () => void;
  };

  async function LoadSimulation() {
    const result = await importSimulation();
    if (result) {
      sim.loadSimulationData(result.data.simulation);
      settingsStore.importSettings(result.data.settings);
    }
  }

  async function SaveSimulation() {
    const data: SimulationExport = {
      version: DEFAULT_VERSION,
      data: {
        simulation: sim.exportSimulationData(),
        settings: settingsStore.exportSettings(),
      },
    };
    const result = await exportSimulation(settingsStore.proyectName, data);
    if (result) {
      alert("Simulación exportada correctamente");
    } else {
      alert("Error al exportar la simulación");
    }
  }

  const options: Option[] = [
    {
      label: "Importar simulación",
      value: "import",
      action: LoadSimulation,
    },
    {
      label: "Exportar simulación",
      value: "export",
      action: SaveSimulation,
    },
  ];
</script>

{#each options as option}
  <button
    class="w-full p-2 text-sm flex items-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none rounded-lg"
    onclick={option.action}
  >
    {option.label}
  </button>
{/each}
