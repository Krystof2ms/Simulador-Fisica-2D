<script lang="ts">
    import { sim, editor } from "$lib/stores/simulation";

    function updateVehicleMass(e: Event) {
        const value = parseFloat((e.target as HTMLInputElement).value);
        if (Number.isNaN(value)) return;
        const nextMass = Math.max(50, value);
        sim.vehicle = { ...sim.vehicle, mass: nextMass };
        sim.initialVehicleState = { ...sim.initialVehicleState, mass: nextMass };
    }

    function updateConfigNumber(
        key:
            | "propulsionForce"
            | "propulsionOscillation"
            | "propulsionFrequencyHz"
            | "propulsionDropFactor"
            | "drag",
        value: number,
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
        editor.startPositionEditMode = !editor.startPositionEditMode;
    }
</script>

<div>
    <div class="flex items-center justify-between">
        <h3 class="text-xs font-extrabold text-slate-700 tracking-wide uppercase">
            Carro
        </h3>
        <span class="text-[11px] font-mono text-slate-500">Física</span>
    </div>

    <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
            <button
                onclick={toggleStartPositionEditMode}
                class="w-full px-3 py-2 rounded-lg border text-sm font-semibold transition-colors cursor-pointer
          {editor.startPositionEditMode
                    ? 'bg-cyan-600 text-white border-cyan-700'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}"
            >
                {editor.startPositionEditMode
                    ? "Modo mover inicio: ACTIVO"
                    : "Modo mover inicio: INACTIVO"}
            </button>
        </div>

        <div class="flex flex-col gap-1.5">
            <div
                class="flex items-center justify-between text-xs font-semibold text-slate-500"
            >
                <span>Posición inicial X</span>
                <span class="font-mono text-slate-800"
                    >{sim.initialVehicleState.position.x.toFixed(0)} px</span
                >
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
            <div
                class="flex items-center justify-between text-xs font-semibold text-slate-500"
            >
                <span>Posición inicial Y</span>
                <span class="font-mono text-slate-800"
                    >{sim.initialVehicleState.position.y.toFixed(0)} px</span
                >
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
            <div
                class="flex items-center justify-between text-xs font-semibold text-slate-500"
            >
                <span>Peso (masa)</span>
                <span class="font-mono text-slate-800"
                    >{sim.vehicle.mass.toFixed(0)} kg</span
                >
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
            <div
                class="flex items-center justify-between text-xs font-semibold text-slate-500"
            >
                <span>Fuerza impulsora</span>
                <span class="font-mono text-slate-800"
                    >{sim.config.propulsionForce.toFixed(0)} N</span
                >
            </div>
            <input
                type="number"
                min="0"
                max="20000"
                step="10"
                value={sim.config.propulsionForce}
                oninput={(e) =>
                    updateConfigNumber(
                        "propulsionForce",
                        parseFloat((e.target as HTMLInputElement).value),
                    )}
                class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
            />
        </div>

<!--
        <div class="flex flex-col gap-1.5">
            <div
                class="flex items-center justify-between text-xs font-semibold text-slate-500"
            >
                <span>Oscilación impulsora</span>
                <span class="font-mono text-slate-800"
                    >{sim.config.propulsionOscillation.toFixed(0)} N</span
                >
            </div>
            <input
                type="number"
                min="0"
                max="10000"
                step="10"
                value={sim.config.propulsionOscillation}
                oninput={(e) =>
                    updateConfigNumber(
                        "propulsionOscillation",
                        parseFloat((e.target as HTMLInputElement).value),
                    )}
                class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
            />
        </div>
        <div class="flex flex-col gap-1.5">
            <div
                class="flex items-center justify-between text-xs font-semibold text-slate-500"
            >
                <span>Frecuencia (Hz)</span>
                <span class="font-mono text-slate-800"
                    >{sim.config.propulsionFrequencyHz.toFixed(2)}</span
                >
            </div>
            <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={sim.config.propulsionFrequencyHz}
                oninput={(e) =>
                    updateConfigNumber(
                        "propulsionFrequencyHz",
                        parseFloat((e.target as HTMLInputElement).value),
                    )}
                class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
            />
        </div>

        <div class="flex flex-col gap-1.5">
            <div
                class="flex items-center justify-between text-xs font-semibold text-slate-500"
            >
                <span>Factor de caída (impulso)</span>
                <span class="font-mono text-slate-800"
                    >{sim.config.propulsionDropFactor.toFixed(4)}</span
                >
            </div>
            <input
                type="number"
                min="0"
                max="1"
                step="0.0001"
                value={sim.config.propulsionDropFactor}
                oninput={(e) =>
                    updateConfigNumber(
                        "propulsionDropFactor",
                        parseFloat((e.target as HTMLInputElement).value),
                    )}
                class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
            />
        </div>

        <div class="flex flex-col gap-1.5">
            <div
                class="flex items-center justify-between text-xs font-semibold text-slate-500"
            >
                <span>Resistencia (drag)</span>
                <span class="font-mono text-slate-800">{sim.config.drag.toFixed(3)}</span>
            </div>
            <input
                type="number"
                min="0"
                max="1"
                step="0.001"
                value={sim.config.drag}
                oninput={(e) =>
                    updateConfigNumber(
                        "drag",
                        parseFloat((e.target as HTMLInputElement).value),
                    )}
                class="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
            />
        </div> -->
    </div>
</div>
