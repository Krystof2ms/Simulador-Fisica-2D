<script lang="ts">
  import { sim } from "$lib/stores/simulation";
  import StateSection from "./sections/StateSection.svelte";
  import SeriesSection from "./sections/SeriesSection.svelte";
  import ExportSection from "./sections/ExportSection.svelte";
  import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from "lucide-svelte";

  interface Props {
    isDocked: boolean;
  }
  let { isDocked = $bindable(true) }: Props = $props();

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
  class="relative h-full flex items-stretch transition-all duration-300 ease-out select-none bg-card border-3 border-border rounded-2xl {isCollapsed
    ? 'w-0'
    : 'w-107.5'} {!isDocked && !isCollapsed
    ? 'absolute top-0 right-2 z-20 drop-shadow-2xl'
    : ''}"
>
  <!-- Collapse toggle -->
  <button
    onclick={toggleCollapse}
    class="absolute -left-6.5 top-6 w-6.5 h-14 bg-foreground border-y border-l border-border/80 hover:bg-foreground/70 text-background rounded-l-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none shadow-md z-30"
    title={isCollapsed ? "Desplegar Panel" : "Colapsar Panel"}
  >
    {#if isCollapsed}
      <ChevronLeft class="w-4 h-4" strokeWidth={3} />
    {:else}
      <ChevronRight class="w-4 h-4" strokeWidth={3} />
    {/if}
  </button>

  {#if !isCollapsed}
    <div
      class="w-107.5 bg-card rounded-2xl flex flex-col items-stretch shadow-lg overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-border bg-card/50"
      >
        <div class="flex flex-col">
          <span
            class="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none"
          >
            Telemetría
          </span>
          <span class="text-base font-extrabold text-foreground mt-1"
            >Estado de Dinámica</span
          >
        </div>

        <button
          onclick={toggleDock}
          aria-label={isDocked ? "Desanclar Panel" : "Anclar Panel"}
          title={isDocked ? "Desanclar Panel" : "Anclar Panel"}
          class="p-2 rounded-lg border transition-all cursor-pointer focus:outline-none {isDocked
            ? 'bg-foreground border-border/80 text-background shadow-sm'
          : 'bg-background border-border text-muted-foreground hover:bg-background/60 hover:text-muted-foreground'}"
        >
          {#if isDocked}
            <PanelRightOpen class="w-4 h-4" strokeWidth={2.5} />
          {:else}
            <PanelRightClose class="w-4 h-4" strokeWidth={2.5} />
          {/if}
        </button>
      </div>

      <!-- Tab bar -->
      <div
        class="flex gap-1 p-2 bg-sidebar-accent border-b border-border text-sm font-semibold"
      >
        {#each tabs as tab}
          <button onclick={() => (activeTab = tab.id)} data-state={activeTab === tab.id ? 'active' : 'inactive'} class="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow text-slate-500 hover:bg-slate-200/50 hover:text-slate-700">{tab.label}</button>
        {/each}
      </div>

      <!-- Content area -->
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {#if activeTab === "estado"}
          <StateSection />
        {:else if activeTab === "serie"}
          <SeriesSection />
        {:else}
          <ExportSection/>
        {/if}
      </div>

      <!-- Status footer -->
      <div
        class="p-3 bg-card-50 border-t border-border text-xs font-semibold text-muted-foreground flex items-center justify-between"
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
        <span class="font-mono text-x text-muted-foreground font-bold uppercase">v1.2</span>
      </div>
    </div>
  {/if}
</div>
