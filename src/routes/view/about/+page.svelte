<script lang="ts">
  import { getVersion } from "@tauri-apps/api/app";
  import logotipo from "$lib/assets/logotipo.png";

  const versionPromise = getVersion();
</script>

<main class="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
  <section
    class="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
  >
    <img class="mx-auto h-24 w-24 object-contain" src={logotipo} alt="Logotipo" />
    <h1 class="mt-5 text-3xl font-bold tracking-tight">TerraSim 2D</h1>
    <div class="mt-3 text-sm text-muted-foreground">
      {#await versionPromise}
        <span>Versión: cargando...</span>
      {:then version}
        <span>Versión: {version}</span>
      {:catch}
        <span>Versión no disponible</span>
      {/await}
    </div>
    <p class="mt-6 text-sm leading-6 text-muted-foreground">
      Simulador de física 2D para analizar el movimiento de un móvil sobre un terreno editable,
      con fuerza impulsora, fricción, pendiente y telemetría.
    </p>
    <p class="mt-6 text-xs text-muted-foreground">Copyright 2026</p>
  </section>
</main>
