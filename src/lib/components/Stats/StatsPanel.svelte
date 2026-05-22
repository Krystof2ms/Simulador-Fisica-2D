<script lang="ts">
  import { sim } from "$lib/stores/simulation";
  import StateSection from "./sections/StateSection.svelte";
  import SeriesSection from "./sections/SeriesSection.svelte";
  import ExportSection from "./sections/ExportSection.svelte";

  interface Props {
    isDocked: boolean;
    projectName: string;
  }
  let { isDocked = $bindable(true), projectName }: Props = $props();

  let isCollapsed = $state(false);
  let activeTab = $state<"estado" | "serie" | "export">("estado");

  const tabs = [
    { id: "estado" as const, label: "Estado" },
    { id: "serie" as const, label: "Serie" },
    { id: "export" as const, label: "Exportar" },
  ];

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }

  function toggleDock() {
    isDocked = !isDocked;
  }
</script>

<div
  class="relative h-full flex items-stretch transition-all duration-300 ease-out select-none {isCollapsed
    ? 'w-0'
    : 'w-107.5'} {!isDocked && !isCollapsed
    ? 'absolute top-0 right-2 z-20 drop-shadow-2xl'
    : ''}"
>
  <!-- Collapse toggle -->
  <button
    onclick={toggleCollapse}
    class="absolute -left-6.5 top-6 w-6.5 h-14 bg-slate-900 border-y border-l border-slate-700/80 hover:bg-slate-800 text-white rounded-l-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-md z-30"
    title={isCollapsed ? "Desplegar Panel" : "Colapsar Panel"}
  >
    {#if isCollapsed}
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    {:else}
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    {/if}
  </button>

  {#if !isCollapsed}
    <div
      class="w-107.5 bg-white border border-slate-200 rounded-2xl flex flex-col items-stretch shadow-lg overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50"
      >
        <div class="flex flex-col">
          <span
            class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none"
          >
            Telemetría
          </span>
          <span class="text-base font-extrabold text-slate-800 mt-1"
            >Estado de Dinámica</span
          >
        </div>

        <button
          onclick={toggleDock}
          aria-label={isDocked ? "Desanclar Panel" : "Anclar Panel"}
          title={isDocked ? "Desanclar Panel" : "Anclar Panel"}
          class="p-2 rounded-lg border transition-all cursor-pointer focus:outline-none {isDocked
            ? 'bg-slate-900 border-slate-800 text-white shadow-sm'
            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}"
        >
          <svg
            class="w-4 h-4 rotate-45"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 12h-15m0 0l3-3m-3 3l3 3"
            />
          </svg>
        </button>
      </div>

      <!-- Tab bar -->
      <div
        class="grid grid-cols-3 p-2 bg-slate-100 border-b border-slate-200 text-sm font-semibold"
      >
        {#each tabs as tab}
          <button
            onclick={() => (activeTab = tab.id)}
            class="py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none {activeTab ===
            tab.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}"
          >
            {tab.label}
          </button>
        {/each}
      </div>

      <!-- Content area -->
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {#if activeTab === "estado"}
          <StateSection />
        {:else if activeTab === "serie"}
          <SeriesSection />
        {:else}
          <ExportSection {projectName} />
        {/if}
      </div>

      <!-- Status footer -->
      <div
        class="p-3 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-slate-500 flex items-center justify-between"
      >
        <span class="flex items-center gap-1.5">
          <span
            class="w-2.5 h-2.5 rounded-full {sim.isPlaying
              ? 'bg-emerald-500 animate-pulse'
              : sim.isFinished
                ? 'bg-indigo-500'
                : 'bg-slate-400'}"
          ></span>
          {sim.isPlaying
            ? "Simulación Activa"
            : sim.isFinished
              ? "Simulación Terminada"
              : "Simulación Pausada"}
        </span>
        <span class="font-mono text-[10px] text-slate-400 font-bold uppercase"
          >v1.2</span
        >
      </div>
    </div>
  {/if}
</div>
