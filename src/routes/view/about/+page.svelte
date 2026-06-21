<script lang="ts">
  import { getVersion } from "@tauri-apps/api/app";
  import logotipo from "$lib/assets/logotipo.png";
  import gitHubIcon from "$lib/assets/GitHub_iso.svg";

  const versionPromise = getVersion();
</script>

<main
  class="min-h-screen bg-background text-foreground flex items-center justify-center p-6"
>
  <section
    class="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm grid grid-cols-1 place-items-center"
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
      Simulador de física 2D para analizar el movimiento de un móvil sobre un terreno
      editable, con fuerza impulsora, fricción, pendiente y telemetría.
    </p>
    <p class="mt-6 text-xs text-muted-foreground">
      &copy; Copyright 2026 - Krystof2ms Todos los derechos reservados.
    </p>

    <a href="https://github.com/Krystof2ms" target="_blank" class="mt-6 text-xs text-muted-foreground flex items-center gap-3">
      <img src={gitHubIcon} alt="GitHub" class="h-4 w-4" />
      Github
    </a>
  </section>
</main>
