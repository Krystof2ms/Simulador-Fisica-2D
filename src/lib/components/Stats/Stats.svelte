<!-- Stats.svelte — punto de entrada público del módulo Stats -->
<script lang="ts">
  import StatsPanel from "./StatsPanel.svelte";

  interface Props {
    isDocked: boolean;
  }
  let { isDocked = $bindable(true) }: Props = $props();
</script>

<StatsPanel bind:isDocked />
