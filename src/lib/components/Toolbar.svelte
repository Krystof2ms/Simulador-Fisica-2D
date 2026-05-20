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

  const presets = [
    { name: 'Hielo', value: 0.1, color: 'bg-sky-400 text-sky-950 border-sky-300' },
    { name: 'Lodo', value: 0.4, color: 'bg-slate-400 text-slate-900 border-slate-300' },
    { name: 'Tierra', value: 0.9, color: 'bg-emerald-600 text-white border-emerald-500' },
    { name: 'Asfalto', value: 1.6, color: 'bg-orange-600 text-white border-orange-500' }
  ];

  function setTool(toolId: ToolType) {
    sim.activeTool = toolId;
  }

  function handleFrictionSlider(e: Event) {
    if (sim.selectedSegmentIndex === null) return;
    const value = parseFloat((e.target as HTMLInputElement).value);
    sim.updateSegmentFriction(sim.selectedSegmentIndex, value);
  }

  function applyPreset(value: number) {
    if (sim.selectedSegmentIndex === null) return;
    sim.updateSegmentFriction(sim.selectedSegmentIndex, value);
  }

  function handleAngleInput(e: Event) {
    if (sim.selectedSegmentIndex === null) return;
    const value = parseFloat((e.target as HTMLInputElement).value);
    if (Number.isNaN(value)) return;
    sim.setSegmentAngleDegrees(sim.selectedSegmentIndex, value);
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

  <!-- Bottom slide-in section for segment friction customization -->
  {#if sim.selectedSegmentIndex !== null}
    {@const activeFriction = sim.segments[sim.selectedSegmentIndex]?.friction ?? 0.9}
    {@const activeAngleDeg = sim.getSegmentAngleDegrees(sim.selectedSegmentIndex) ?? 0}
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/80 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-sm">
          Sección {sim.selectedSegmentIndex + 1}
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-semibold text-slate-500">Coeficiente de Fricción</span>
          <span class="text-sm font-bold text-slate-800 font-mono">{activeFriction.toFixed(2)} μ</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-semibold text-slate-500">Ángulo con eje X</span>
          <span class="text-sm font-bold text-slate-800 font-mono">
            {activeAngleDeg.toFixed(1)}° {activeAngleDeg > 0 ? '↗ Ascendente' : activeAngleDeg < 0 ? '↘ Descendente' : '→ Plano'}
          </span>
        </div>
      </div>

      <!-- Friction slider -->
      <div class="flex-1 max-w-md flex items-center gap-3">
        <span class="text-xs text-slate-400 font-bold font-mono">0.0 (Hielo)</span>
        <input
          type="range"
          min="0.0"
          max="2.0"
          step="0.05"
          value={activeFriction}
          oninput={handleFrictionSlider}
          class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-ew-resize accent-slate-900 focus:outline-none"
        />
        <span class="text-xs text-slate-400 font-bold font-mono">2.0 (Rugoso)</span>
      </div>

      <!-- Preset Buttons -->
      <div class="flex items-center gap-2.5">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
        <div class="flex gap-1.5">
          {#each presets as pr}
            <button
              onclick={() => applyPreset(pr.value)}
              class="px-2.5 py-1 text-xs font-bold border rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-[1.04] active:scale-[0.98] {pr.color} {
                Math.abs(activeFriction - pr.value) < 0.01 ? 'ring-2 ring-slate-900 ring-offset-1' : ''
              }"
            >
              {pr.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-500">Ángulo (°)</span>
        <input
          type="number"
          min="-80"
          max="80"
          step="0.5"
          value={activeAngleDeg.toFixed(1)}
          oninput={handleAngleInput}
          class="w-24 px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
          title="Ajusta el ángulo del segmento; se mueve el punto anterior."
        />
      </div>
    </div>
  {:else if sim.activeTool === 'friction'}
    <div
      class="p-3.5 rounded-xl border border-slate-200 bg-sky-50 text-sky-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300"
    >
      <svg class="w-4 h-4 text-sky-600 shrink-0 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.011 12H9M12 9v6m-9-3c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9-9 4.03-9 9z"/>
      </svg>
      <span>Pincha sobre cualquier línea del relieve en el Canvas para configurar o aplicar presets de fricción a esa sección de terreno.</span>
    </div>
  {/if}
</div>
