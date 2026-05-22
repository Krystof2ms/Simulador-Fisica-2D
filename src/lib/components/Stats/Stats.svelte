<!-- Stats.svelte — punto de entrada público del módulo Stats -->
<script lang="ts">
  import StatsPanel from "./StatsPanel.svelte";

  interface Props {
    isDocked: boolean;
    projectName: string;
  }
  let { isDocked = $bindable(true), projectName }: Props = $props();
</script>

<StatsPanel bind:isDocked {projectName} />
