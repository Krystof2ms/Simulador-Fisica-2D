<script lang="ts">
  import { sim, type ToolType } from '../stores/simulation.svelte';

  const tools: { id: ToolType; label: string; icon: string; desc: string }[] = [
    {
      id: 'points',
      label: 'Puntos',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
      desc: 'Mueve manijas de relieve. Doble clic añade punto. Delete lo elimina.'
    },
    {
      id: 'friction',
      label: 'Fricción',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
      desc: 'Pincha un segmento en el canvas para configurar su rozamiento.'
    },
    {
      id: 'elevate',
      label: 'Elevar',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"/></svg>`,
      desc: 'Mantén presionado y arrastra para elevar terreno como pincel.'
    },
    {
      id: 'lower',
      label: 'Bajar',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"/></svg>`,
      desc: 'Mantén presionado y arrastra para hundir relieve.'
    },
    {
      id: 'smooth',
      label: 'Suavizar',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`,
      desc: 'Suaviza y modera relieves empinados con el pincel.'
    }
  ];

  function setTool(toolId: ToolType) {
    sim.activeTool = toolId;
    sim.startPositionEditMode = false;
  }
</script>

<div class="w-full flex flex-col gap-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <!-- Left: Tool selector -->
    <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
      {#each tools as tool}
        {@const isActive = sim.activeTool === tool.id}
        <button
          onclick={() => setTool(tool.id)}
          class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none {
            isActive
              ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
          }"
          title={tool.desc}
        >
          <!-- svelte-ignore state_referenced_locally -->
          {@html tool.icon}
          <span>{tool.label}</span>
        </button>
      {/each}

      <button
        onclick={() => (sim.startPositionEditMode = !sim.startPositionEditMode)}
        class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none {
          sim.startPositionEditMode
            ? 'bg-cyan-600 text-white shadow-md scale-[1.02]'
            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
        }"
        title="Activa arrastre del punto de inicio del móvil"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4m5-5l-5 5 5 5m6-10l5 5-5 5" />
        </svg>
        <span>Mover inicio</span>
      </button>
    </div>

    <!-- Right: Quick actions -->
    <div class="flex items-center gap-2">
      <button
        onclick={() => sim.resetTerrainToDefault()}
        class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 border border-rose-200 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-700 active:bg-rose-200 rounded-xl transition-all cursor-pointer focus:outline-none shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        <span>Reiniciar Terreno</span>
      </button>
    </div>
  </div>

  <!-- Description of active tool -->
  <div class="text-xs text-slate-500 font-medium px-1 flex items-center gap-1.5">
    <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
    </svg>
    <span>{tools.find(t => t.id === sim.activeTool)?.desc}</span>
  </div>

</div>
