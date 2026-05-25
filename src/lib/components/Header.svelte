<script>
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { sim } from "$lib/stores/simulation";
  import { Car } from "lucide-svelte";
  import ThemeSelector from "./ThemeSelector.svelte";
  import Selector from "./OptionsSelector/Selector.svelte";
</script>

<header
  class="relative z-50 w-full shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-card backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-border shadow-sm transition-all duration-300"
>
  <div class="flex items-center gap-3.5">
    <!-- Logo vehicle badge -->
    <div
      class="w-16 h-12 bg-chart-2 rounded-xl flex items-center justify-center text-background shadow-md shadow-cyan-500/20"
    >
      <Car class="w-6 h-6" />
    </div>

    <div class="flex flex-col">
      <h1
        class="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2"
      >
        TerraSim 2D
        <span
          class="px-2 py-0.5 text-x font-bold tracking-widest text-cyan-700 bg-cyan-50 border border-cyan-150 rounded-full uppercase"
          >Física</span
        >
      </h1>
      <p class="text-xs font-semibold text-muted-foreground mt-0.5">
        Simulador de móvil sobre terreno editable por puntos y fricción segmentada
      </p>
    </div>
  </div>

  <!-- Project Name Box & Active status info -->
  <div class="flex items-center gap-4">
    <div class="project-name-box min-w-60">
      <svg
        class="w-4 h-4 text-muted-foreground"
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
        bind:value={settingsStore.proyectName}
        placeholder="Nombre del proyecto..."
        class="project-name-input"
      />
    </div>

    <div
      class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary border border-border shadow-sm text-xs font-bold text-muted-foreground/90"
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
    <Selector />
  </div>
</header>

<style>
  @reference "#globals.css";

  .project-name-box {
    @apply px-4 py-1.5 bg-sidebar-accent border-2 border-sidebar-border rounded-lg text-muted-foreground
      font-bold text-sm focus-within:bg-white focus-within:ring-2
      focus-within:ring-cyan-500/20 focus-within:border-cyan-500 transition-all flex
      items-center gap-2 outline-none shadow-inner;
  }

  .project-name-input {
    @apply bg-transparent border-none outline-none p-0 w-full focus:ring-0
    placeholder:text-muted-foreground;
  }
</style>
