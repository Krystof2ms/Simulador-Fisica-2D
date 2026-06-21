<script lang="ts">
  import type { WebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { openAboutWindow } from "$lib/utils/view/about";

  let aboutWindow = $state<WebviewWindow | null>(null);
  async function openAbout() {
    try {
      aboutWindow = await openAboutWindow(settingsStore.theme);
    } catch (error) {
      console.error("No se pudo abrir la ventana About", error);
      window.location.href = "/about";
    }
  }
</script>

<button
  type="button"
  class="w-full p-2 text-sm flex items-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none rounded-lg"
  onclick={openAbout}
>
  Acerca de
</button>
