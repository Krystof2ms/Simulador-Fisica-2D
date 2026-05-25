<script lang="ts">
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { Moon, Sun } from "lucide-svelte";

  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const stored = localStorage.getItem("theme");

  if (stored === "light" || stored === "dark") {
    settingsStore.theme = stored;
  } else {
    settingsStore.theme = systemPrefersDark ? "dark" : "light";
  }

  function applyTheme() {
    localStorage.setItem("theme", settingsStore.theme);

    if (settingsStore.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggleTheme() {
    if (settingsStore.theme === "dark") {
      settingsStore.theme = "light";
    } else {
      settingsStore.theme = "dark";
    }
    applyTheme();
  }
</script>

<div class="flex items-center gap-2 text-xs text-muted-foreground">
  <button
    class="h-8 w-full px-2 py-4 flex items-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none rounded-lg"
    onclick={toggleTheme}
    aria-label="Cambiar tema"
  >
    {#if settingsStore.theme === "dark"}
      <Moon size={24} />
    {:else}
      <Sun size={24} />
    {/if}
    <span>
      {#if settingsStore.theme === "light"}
        Claro
      {:else}
        Oscuro
      {/if}
    </span>
  </button>
</div>
