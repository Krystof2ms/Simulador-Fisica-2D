<script lang="ts">
	import favicon from '$lib/assets/favicon.ico';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import "$lib/styles/globals.css";

	let { children } = $props();
</script>

<svelte:head>
  <title>{settingsStore.proyectName} - TerraSim 2D</title>
  <meta
    name="description"
    content="Simulador físico 2D interactivo con deformación de relieve por puntos y fricción configurable por sección."
  />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
