<script lang="ts">
  import { Settings } from "lucide-svelte";
  import ThemeSelector from "$lib/components/ThemeSelector.svelte";
  import Config from "./components/Config.svelte";

  let isOpen = $state(false);

  function toggleConfig() {
    isOpen = !isOpen;
  }
</script>

<div class="relative">
  <button
    onclick={toggleConfig}
    class="inline-flex items-center justify-center rounded-lg p-2 hover:bg-accent transition-colors"
  >
    <Settings size={24} />
  </button>

  {#if isOpen}
    <div
      class="absolute right-0 top-full mt-2 z-99999 w-56 rounded-xl border border-border bg-background shadow-2xl p-2 grid gap-2"
    >
      <Config />
      <ThemeSelector />
    </div>
  {/if}
</div>
