<script lang="ts">
  import { sim, editor } from "$lib/stores/simulation";
  import EditSegment from "./secction/EditSegment.svelte";
  import EditVehicle from "./secction/EditVehicle.svelte";
</script>

<aside
  class="w-full xl:w-65 h-full shrink-0 bg-card backdrop-blur-md p-4 rounded-2xl border-2 border-border shadow-sm flex flex-col gap-4 overflow-y-auto"
>
  <fieldset disabled={sim.isPlaying} class="contents disabled:opacity-60">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-extrabold text-foreground tracking-wide uppercase">
        Panel de Edición
      </h2>
      <span class="text-xs font-mono text-muted-foreground">{editor.activeTool}</span>
    </div>

    <EditSegment />

    <!-- line -->
    <div class="h-px bg-slate-200 my-1"></div>

    <EditVehicle />
  </fieldset>

  {#if sim.isPlaying}
    <div
      class="p-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold"
    >
      Edición bloqueada durante la simulación.
    </div>
  {/if}
</aside>
