<script lang="ts">
  import { onMount } from "svelte";
  import { confirm } from "@tauri-apps/plugin-dialog";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { closeStore, loadStore, saveStore } from "$lib/utils/store/tauri";
  import { invoke } from "@tauri-apps/api/core";
  import "$lib/styles/globals.css";

  let initialized = $state(false);

  onMount(() => {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const appWindow = getCurrentWindow();

    const unlistenPromise = appWindow.onCloseRequested(async (event) => {
      event.preventDefault();

      const ok = await confirm("¿Salir del simulador?");

      if (ok) {
        await closeStore();
        await appWindow.destroy();
      }
    });

    loadStore().then(({ theme }) => {
      settingsStore.theme = theme ?? (systemPrefersDark ? "dark" : "light");

      initialized = true;

      invoke("log", {
        message: "Loaded theme: " + settingsStore.theme,
      });
    });

    return () => {
      unlistenPromise.then((f) => f());
    };
  });

  let { children } = $props();

  $effect(() => {
    if (!initialized) return;

    document.documentElement.classList.toggle("dark", settingsStore.theme === "dark");

    saveStore({
      theme: settingsStore.theme,
    });

    if (settingsStore.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });
</script>

<svelte:head>
  <title>{settingsStore.proyectName} - TerraSim 2D</title>
  <meta
    name="description"
    content="Simulador físico 2D interactivo con deformación de relieve por puntos y fricción configurable por sección."
  />
</svelte:head>

{@render children()}
