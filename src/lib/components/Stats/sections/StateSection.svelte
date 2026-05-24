<script lang="ts">
  import { sim } from "$lib/stores/simulation";
  import MetricCard from "../components/MetricCard.svelte";
  import VectorMetricCard from "../components/VectorMetricCard.svelte";

  const SCALE = 30;

  const posX = $derived((sim.vehicle.position.x / SCALE).toFixed(2));
  const posY = $derived(((760 - sim.vehicle.position.y) / SCALE).toFixed(2));

  const velX = $derived((sim.vehicle.velocity.x / SCALE).toFixed(2));
  const velY = $derived((-sim.vehicle.velocity.y / SCALE).toFixed(2));
  const totalSpeed = $derived(
    (
      Math.hypot(sim.vehicle.velocity.x, sim.vehicle.velocity.y) / SCALE
    ).toFixed(2),
  );

  const accX = $derived((sim.vehicle.acceleration.x / SCALE).toFixed(2));
  const accY = $derived((-sim.vehicle.acceleration.y / SCALE).toFixed(2));
  const netAcc = $derived(
    (
      Math.hypot(sim.vehicle.acceleration.x, sim.vehicle.acceleration.y) / SCALE
    ).toFixed(2),
  );

  const slopeAngle = $derived(
    sim.vehicle.groundedSurface
      ? ((sim.vehicle.groundedSurface.angle * 180) / Math.PI).toFixed(1)
      : "0.0",
  );

  const surfaceFriction = $derived(
    sim.vehicle.groundedSurface
      ? sim.vehicle.groundedSurface.segment.friction.toFixed(2)
      : "N/A (Aire)",
  );
</script>

<div class="flex flex-col gap-3">
  <!-- Posición -->
  <MetricCard label="Posición (x, y)">
    <div class="flex items-baseline justify-between">
      <span class="text-sm font-bold text-muted-foreground">
        X: <span class="text-base font-extrabold text-foreground font-mono"
          >{posX}</span
        > m
      </span>
      <span class="text-sm font-bold text-muted-foreground">
        Y: <span class="text-base font-extrabold text-foreground  font-mono"
          >{posY}</span
        > m
      </span>
    </div>
  </MetricCard>

  <!-- Velocidad -->
  <VectorMetricCard
    title="Velocidad"
    rows={[
      { label: "Componente X", value: velX, unit: "m/s" },
      { label: "Componente Y", value: velY, unit: "m/s" },
      {
        label: "Velocidad Total",
        value: totalSpeed,
        unit: "m/s",
        highlight: true,
        highlightColor: "text-emerald-600",
      },
    ]}
  />

  <!-- Aceleración -->
  <VectorMetricCard
    title="Aceleración"
    rows={[
      { label: "Componente X", value: accX, unit: "m/s²" },
      { label: "Componente Y", value: accY, unit: "m/s²" },
      {
        label: "neta",
        value: netAcc,
        unit: "m/s²",
        highlight: true,
        highlightColor: "text-blue-600",
      },
    ]}
  />

  <!-- Contacto de Terreno -->
  <MetricCard
    label="Contacto de Terreno"
  >
    <div
      class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1"
    >
      <span>Pendiente</span>
      <span class="font-mono text-foreground font-extrabold">{slopeAngle} °</span
      >
    </div>
    <div
      class="flex items-center justify-between text-xs font-bold text-slate-500 pt-0.5"
    >
      <span>Fricción</span>
      <span class="font-mono text-foreground font-extrabold"
        >{surfaceFriction}</span
      >
    </div>
  </MetricCard>

</div>
