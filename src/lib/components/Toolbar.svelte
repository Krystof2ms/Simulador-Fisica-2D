<script lang="ts">
  import { sim, editor, type ToolType } from "$lib/stores/simulation";
  import { ArrowDown, ArrowUp, Eye, Info, Link, Move, RefreshCw, Zap } from "lucide-svelte";

  const tools = [
    {
      id: "points",
      label: "Puntos",
      icon: Eye,
      desc: "Mueve manijas de relieve. Doble clic añade punto. Delete lo elimina.",
    },
    {
      id: "friction",
      label: "Secmento",
      icon: Zap,
      desc: "Pincha un segmento en el canvas para configurar su rozamiento.",
    },
    {
      id: "elevate",
      label: "Elevar",
      icon: ArrowUp,
      desc: "Mantén presionado y arrastra para elevar terreno como pincel.",
    },
    {
      id: "lower",
      label: "Bajar",
      icon: ArrowDown,
      desc: "Mantén presionado y arrastra para hundir relieve.",
    },
    {
      id: "smooth",
      label: "Suavizar",
      icon: Link,
      desc: "Suaviza y modera relieves empinados con el pincel.",
    },
  ];

  function setTool(toolId: ToolType) {
    if (editor.activeTool === toolId) {
      editor.clearSelection();
      return;
    }
    editor.activeTool = toolId;
    editor.startPositionEditMode = false;
    editor.clearSelection();
  }
</script>

<div
  class="w-full flex flex-col gap-4 bg-background backdrop-blur-md p-4 rounded-2xl border-2 border-border shadow-sm transition-all duration-300"
>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <!-- Left: Tool selector -->
    <div
      class="flex flex-wrap items-center gap-1.5 bg-sidebar-accent p-1 rounded-xl border border-border justify-center"
    >
      {#each tools as tool}
        {@const isActive = editor.activeTool === tool.id}
        {@const Icon = tool.icon}
        <button
          onclick={() => setTool(tool.id)}
          disabled={sim.isPlaying}
          class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none {isActive
            ? 'bg-foreground text-background shadow-md scale-[1.02]'
            : sim.isPlaying
              ? 'text-muted-foreground/50 cursor-not-allowed'
              : 'text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground'}"
          title={tool.desc}
        >
          <Icon class="w-5 h-5" strokeWidth={2} />
          <span>{tool.label}</span>
        </button>
      {/each}

      <button
        onclick={() => {
          editor.startPositionEditMode = !editor.startPositionEditMode;
          if (editor.startPositionEditMode) editor.clearSelection();
        }}
        disabled={sim.isPlaying}
        class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none {editor.startPositionEditMode
          ? 'bg-chart-2 text-background shadow-md scale-[1.02]'
          : sim.isPlaying
            ? 'text-muted-foreground/50 cursor-not-allowed'
            : 'text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground'}"
        title="Activa arrastre del punto de inicio del móvil"
      >
        <Move class="w-5 h-5" strokeWidth={2} />
        <span>Mover inicio</span>
      </button>
    </div>

    <!-- Right: Quick actions -->
    <div class="flex items-center gap-2">
      <button
        onclick={() => sim.resetTerrainToDefault()}
        disabled={sim.isPlaying}
        class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 border border-destructive bg-muted-foreground/20 hover:bg-destructive-foreground hover:text-destructive active:bg-destructive-foreground active:text-destructive rounded-xl transition-all cursor-pointer focus:outline-none shadow-sm"
      >
        <RefreshCw class="w-4 h-4" strokeWidth={2} />
        <span>Reiniciar Terreno</span>
      </button>
    </div>
  </div>

  <!-- Description of active tool -->
  <div class="text-xs text-slate-500 font-medium px-1 flex items-center gap-1.5">
    <Info class="w-3.5 h-3.5 text-sidebar-ring shrink-0" strokeWidth={2.5} />
    <span>{tools.find((t) => t.id === editor.activeTool)?.desc}</span>
  </div>
</div>
