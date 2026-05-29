<script lang="ts">
  import { onMount } from "svelte";
  import { confirm } from "@tauri-apps/plugin-dialog";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { closeStore, loadStore, saveStore } from "$lib/utils/store/tauri";
  import "$lib/styles/globals.css";

  onMount(() => {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const appWindow = getCurrentWindow();

      console.log("Setting up close request listener...");
      const unlistenPromise = appWindow.onCloseRequested(async (event) => {
        event.preventDefault();

        const ok = await confirm(
          "¿Salir del simulador?"
        );

        console.log("User confirmed: ", ok);

        if (ok) {
          console.log("Closing store and destroying window...")
          await closeStore();
          await appWindow.destroy();
        }
      });

      loadStore().then(({ theme }) => {
        if (theme) {
          settingsStore.theme = theme;
        } else {
          settingsStore.theme = systemPrefersDark ? "dark" : "light";
        }

        saveStore({theme: settingsStore.theme})
      });

      return () => {
        unlistenPromise.then((f) => f());
      };
    });

	let { children } = $props();
</script>

<svelte:head>
  <title>{settingsStore.proyectName} - TerraSim 2D</title>
  <meta
    name="description"
    content="Simulador físico 2D interactivo con deformación de relieve por puntos y fricción configurable por sección."
  />
</svelte:head>

{@render children()}
