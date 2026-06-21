<script lang="ts">
  import { onMount } from 'svelte';
  import { listen } from '@tauri-apps/api/event';
  import { EVENTS,  type ThemeEvent } from '$lib/utils/view/constants';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();

  // svelte-ignore state_referenced_locally
  if (data.theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  onMount(async () => {
    const appWindow = getCurrentWindow();

    const unlisten = await listen(EVENTS.THEME_SELECTED_CHANGE, (event) => {
      const { theme } = event.payload as ThemeEvent;


      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    });

    const unlistenMainClose = await listen(EVENTS.MAIN_CLOSE, (event) => {
      const { closed } = event.payload as { closed: boolean };
        appWindow.destroy();
        console.log("close", closed);
    });
  })
</script>

<svelte:head>
  <title>Acerca de TerraSim 2D</title>
  <meta
    name="description"
    content="Simulador físico 2D interactivo con deformación de relieve por puntos y fricción configurable por sección."
  />
</svelte:head>

{@render children()}
