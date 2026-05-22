<script lang="ts">
  import Toolbar from "$lib/components/Toolbar.svelte";
  import EditorPanel from "$lib/components/EditorPanel/EditorPanel.svelte";
  import Canvas from "$lib/components/Canvas/Canvas.svelte";
  import Controls from "$lib/components/Controls.svelte";
  import Stats from "$lib/components/Stats/Stats.svelte";
  import { sim } from "$lib/stores/simulation";
  import { onMount } from "svelte";
  import "$lib/styles/globals.css";

  let isDocked = $state(true);
  let projectName = $state("Simulación de Terreno 01");

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

<svelte:head>
  <title>{projectName} - TerraSim 2D</title>
  <meta
    name="description"
    content="Simulador físico 2D interactivo con deformación de relieve por puntos y fricción configurable por sección."
  />
</svelte:head>

<main
  class="h-screen w-full bg-slate-50/60 p-2 md:p-3 flex flex-col items-center justify-start antialiased font-sans select-none overflow-hidden"
>
  <!-- Header Bar -->
  <header
    class="w-full shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300"
  >
    <div class="flex items-center gap-3.5">
      <!-- Logo vehicle badge -->
      <div
        class="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-cyan-500/20"
      >
        <svg
          class="w-6 h-6 animate-pulse"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.014L1.5 6.75h16.5a.75.75 0 01.75.75v3.75m-.75 7.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.5m-16.5-7.5h16.5m-1.5-6h-3.75m3.75 0V3.75m-11.25 3h11.25M6.75 19.5v-6"
          />
        </svg>
      </div>

      <div class="flex flex-col">
        <h1
          class="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2"
        >
          TerraSim 2D
          <span
            class="px-2 py-0.5 text-[9px] font-bold tracking-widest text-cyan-700 bg-cyan-50 border border-cyan-150 rounded-full uppercase"
            >Física</span
          >
        </h1>
        <p class="text-xs font-semibold text-slate-500 mt-0.5">
          Simulador de móvil sobre terreno editable por puntos y fricción
          segmentada
        </p>
      </div>
    </div>

    <!-- Project Name Box & Active status info -->
    <div class="flex items-center gap-4">
      <div class="project-name-box min-w-60">
        <svg
          class="w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <input
          type="text"
          bind:value={projectName}
          placeholder="Nombre del proyecto..."
          class="project-name-input"
        />
      </div>

      <div
        class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm text-xs font-bold text-slate-600"
      >
        <span
          class="w-2 h-2 rounded-full {sim.isPlaying
            ? 'bg-emerald-500 animate-ping'
            : sim.isFinished
              ? 'bg-indigo-500'
              : 'bg-slate-400'}"
        ></span>
        <span
          >{sim.isPlaying
            ? "Simulando a 60 FPS"
            : sim.isFinished
              ? "Simulación terminada"
              : "En pausa"}</span
        >
      </div>
    </div>
  </header>

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
            <Stats bind:isDocked {projectName} />
          </div>
        {/if}
      </div>

      <!-- Simulation Time Playback Controls -->
      <Controls />
    </div>

    <!-- Right Telemetry Workspace (Sidebar Stats - Rendered inline if Docked) -->
    {#if isDocked}
      <div class="shrink-0 flex items-stretch select-none">
        <Stats bind:isDocked {projectName} />
      </div>
    {/if}
  </section>
</main>

<style>
  /* Base styles overrides */
  :global(:root) {
    font-family:
      "Outfit",
      "Inter",
      system-ui,
      -apple-system,
      sans-serif;
  }
</style>
