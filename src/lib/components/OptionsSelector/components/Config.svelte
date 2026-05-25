<script lang="ts">

  type Option = {
    label: string;
    value: "import" | "export";
    action: () => void;
  };

  function LoadSimulation() {

  }

  function SaveSimulation() {

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
    }
  ]
</script>

{#each options as option}
  <button
    class="w-full p-2 text-sm flex items-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none rounded-lg"
    onclick={option.action}
  >
    {option.label}
  </button>
{/each}
