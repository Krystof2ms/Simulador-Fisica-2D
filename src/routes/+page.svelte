<script lang="ts">
  import Toolbar from "$lib/components/Toolbar.svelte";
  import EditorPanel from "$lib/components/EditorPanel/EditorPanel.svelte";
  import Canvas from "$lib/components/Canvas/Canvas.svelte";
  import Controls from "$lib/components/Controls.svelte";
  import Header from "$lib/components/Header.svelte";
  import Stats from "$lib/components/Stats/Stats.svelte";
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { sim } from "$lib/stores/simulation";
  import { onMount } from "svelte";
  import { saveStore } from "$lib/utils/store/tauri";

  let isDocked = $state(true);
  // Auto-pause if window becomes hidden
  function handleVisibilityChange() {
    if (document.hidden) {
      sim.isPlaying = false;
    }
  }

  onMount(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  });
</script>

<div class="h-screen w-full bg-background">
  <main
    class="p-2 md:p-3 flex flex-col items-center justify-start antialiased font-sans select-none overflow-hidden"
  >
    <!-- Header Bar -->
    <Header />
    <!-- Interactive Simulator Section -->
    <section
      class="w-full flex-1 flex flex-col xl:flex-row items-stretch justify-center gap-5 transition-all duration-300 relative overflow-hidden"
    >
      <EditorPanel />

      <!-- Center Workspace (Toolbar, Canvas, Controls) -->
      <div class="flex-1 flex flex-col gap-4 min-w-75">
        <!-- Toolbar -->
        <Toolbar />

        <!-- Canvas container -->
        <div class="relative flex-1 min-h-0">
          <Canvas />

          <!-- Absolute Overlay: Stats sidebar if NOT docked and NOT collapsed -->
          {#if !isDocked}
            <div class="absolute top-4 right-4 bottom-4 z-20 drop-shadow-2xl">
              <Stats bind:isDocked />
            </div>
          {/if}
        </div>

        <!-- Simulation Time Playback Controls -->
        <Controls />
      </div>

      <!-- Right Telemetry Workspace (Sidebar Stats - Rendered inline if Docked) -->
      {#if isDocked}
        <div class="shrink-0 flex items-stretch select-none">
          <Stats bind:isDocked />
        </div>
      {/if}
    </section>
  </main>
</div>
