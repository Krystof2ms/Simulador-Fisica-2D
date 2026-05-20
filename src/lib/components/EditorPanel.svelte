<script lang="ts">
  import { sim } from '../stores/simulation.svelte';

  const presets = [
    { name: 'Hielo', value: 0.1, color: 'bg-sky-400 text-sky-950 border-sky-300' },
    { name: 'Lodo', value: 0.4, color: 'bg-slate-400 text-slate-900 border-slate-300' },
    { name: 'Tierra', value: 0.9, color: 'bg-emerald-600 text-white border-emerald-500' },
    { name: 'Asfalto', value: 1.6, color: 'bg-orange-600 text-white border-orange-500' }
  ];

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

  function updateVehicleMass(e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    if (Number.isNaN(value)) return;
    const nextMass = Math.max(50, value);
    sim.vehicle = { ...sim.vehicle, mass: nextMass };
    sim.initialVehicleState = { ...sim.initialVehicleState, mass: nextMass };
  }

  function updateConfigNumber(
    key: 'propulsionForce' | 'propulsionOscillation' | 'propulsionFrequencyHz' | 'propulsionDropFactor' | 'drag',
    value: number
  ) {
    if (Number.isNaN(value)) return;
    sim.config = { ...sim.config, [key]: value };
  }

  function updateInitialX(e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    if (Number.isNaN(value)) return;
    sim.setInitialVehiclePosition(value, sim.initialVehicleState.position.y);
  }

  function updateInitialY(e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    if (Number.isNaN(value)) return;
    sim.setInitialVehiclePosition(sim.initialVehicleState.position.x, value);
  }

  function toggleStartPositionEditMode() {
    sim.startPositionEditMode = !sim.startPositionEditMode;
  }
</script>

<aside class="w-full xl:w-65 shrink-0 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
  <fieldset disabled={sim.isPlaying} class="contents disabled:opacity-60">
  <div class="flex items-center justify-between">
    <h2 class="text-sm font-extrabold text-slate-800 tracking-wide uppercase">Panel de Edición</h2>
    <span class="text-[11px] font-mono text-slate-500">{sim.activeTool}</span>
  </div>

  {#if sim.selectedSegmentIndex !== null}
    {@const activeFriction = sim.segments[sim.selectedSegmentIndex]?.friction ?? 0.9}
    {@const activeAngleDeg = sim.getSegmentAngleDegrees(sim.selectedSegmentIndex) ?? 0}

    <div class="p-3 rounded-xl border border-slate-200 bg-slate-50">
      <div class="text-xs font-semibold text-slate-500">Segmento seleccionado</div>
      <div class="text-sm font-bold text-slate-800 mt-1">Sección {sim.selectedSegmentIndex + 1}</div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Fricción</span><span class="font-mono text-slate-800">{activeFriction.toFixed(2)} μ</span>
      </div>
      <input type="range" min="0" max="2" step="0.05" value={activeFriction} oninput={handleFrictionSlider} class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-ew-resize accent-slate-900" />
      <div class="grid grid-cols-2 gap-2">
        {#each presets as pr}
          <button onclick={() => applyPreset(pr.value)} class="px-2 py-1 text-xs font-bold border rounded-lg {pr.color}
            {Math.abs(activeFriction - pr.value) < 0.01 ? 'ring-2 ring-slate-900 ring-offset-1' : ''}">
            {pr.name}
          </button>
        {/each}
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Ángulo con eje X</span>
        <span class="font-mono text-slate-800">{activeAngleDeg.toFixed(1)}°</span>
      </div>
      <input type="number" min="-80" max="80" step="0.5" value={activeAngleDeg.toFixed(1)} oninput={handleAngleInput}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800" />
      <div class="text-xs text-slate-500">Ajusta pendiente ascendente (+) o descendente (-).</div>
    </div>
  {:else}
    <div class="p-3 rounded-xl border border-slate-200 bg-sky-50 text-sky-800 text-xs font-semibold">
      Selecciona un segmento en el canvas para editar fricción y ángulo.
    </div>
  {/if}

  <div class="h-px bg-slate-200 my-1"></div>

  <div class="flex items-center justify-between">
    <h3 class="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Carro</h3>
    <span class="text-[11px] font-mono text-slate-500">Física</span>
  </div>

  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1.5">
      <button
        onclick={toggleStartPositionEditMode}
        class="w-full px-3 py-2 rounded-lg border text-sm font-semibold transition-colors cursor-pointer
          {sim.startPositionEditMode
            ? 'bg-cyan-600 text-white border-cyan-700'
            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}"
      >
        {sim.startPositionEditMode ? 'Modo mover inicio: ACTIVO' : 'Modo mover inicio: INACTIVO'}
      </button>
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Posición inicial X</span>
        <span class="font-mono text-slate-800">{sim.initialVehicleState.position.x.toFixed(0)} px</span>
      </div>
      <input
        type="number"
        min="0"
        max="1400"
        step="1"
        value={sim.initialVehicleState.position.x}
        oninput={updateInitialX}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Posición inicial Y</span>
        <span class="font-mono text-slate-800">{sim.initialVehicleState.position.y.toFixed(0)} px</span>
      </div>
      <input
        type="number"
        min="0"
        max="510"
        step="1"
        value={sim.initialVehicleState.position.y}
        oninput={updateInitialY}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Peso (masa)</span>
        <span class="font-mono text-slate-800">{sim.vehicle.mass.toFixed(0)} kg</span>
      </div>
      <input
        type="number"
        min="50"
        step="10"
        value={sim.vehicle.mass}
        oninput={updateVehicleMass}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Fuerza impulsora</span>
        <span class="font-mono text-slate-800">{sim.config.propulsionForce.toFixed(0)} N</span>
      </div>
      <input
        type="number"
        min="0"
        max="20000"
        step="10"
        value={sim.config.propulsionForce}
        oninput={(e) => updateConfigNumber('propulsionForce', parseFloat((e.target as HTMLInputElement).value))}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Oscilación impulsora</span>
        <span class="font-mono text-slate-800">{sim.config.propulsionOscillation.toFixed(0)} N</span>
      </div>
      <input
        type="number"
        min="0"
        max="10000"
        step="10"
        value={sim.config.propulsionOscillation}
        oninput={(e) => updateConfigNumber('propulsionOscillation', parseFloat((e.target as HTMLInputElement).value))}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Frecuencia (Hz)</span>
        <span class="font-mono text-slate-800">{sim.config.propulsionFrequencyHz.toFixed(2)}</span>
      </div>
      <input
        type="number"
        min="0"
        max="10"
        step="0.01"
        value={sim.config.propulsionFrequencyHz}
        oninput={(e) => updateConfigNumber('propulsionFrequencyHz', parseFloat((e.target as HTMLInputElement).value))}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Factor de caída (impulso)</span>
        <span class="font-mono text-slate-800">{sim.config.propulsionDropFactor.toFixed(4)}</span>
      </div>
      <input
        type="number"
        min="0"
        max="1"
        step="0.0001"
        value={sim.config.propulsionDropFactor}
        oninput={(e) => updateConfigNumber('propulsionDropFactor', parseFloat((e.target as HTMLInputElement).value))}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Resistencia (drag)</span>
        <span class="font-mono text-slate-800">{sim.config.drag.toFixed(3)}</span>
      </div>
      <input
        type="number"
        min="0"
        max="1"
        step="0.001"
        value={sim.config.drag}
        oninput={(e) => updateConfigNumber('drag', parseFloat((e.target as HTMLInputElement).value))}
        class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
      />
    </div>
  </div>
  </fieldset>

  {#if sim.isPlaying}
    <div class="p-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold">
      Edición bloqueada durante la simulación.
    </div>
  {/if}
</aside>
