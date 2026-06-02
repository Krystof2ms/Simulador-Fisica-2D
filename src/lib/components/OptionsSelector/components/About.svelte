<script lang="ts">
  import { openAboutWindow } from "$lib/utils/view/about";
  import type { WebviewWindow } from "@tauri-apps/api/webviewWindow";

  let aboutWindow = $state<WebviewWindow | null>(null);
  async function openAbout() {
    try {
      aboutWindow = await openAboutWindow();
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
