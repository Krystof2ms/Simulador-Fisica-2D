import type { Theme } from '$lib/stores/settings.svelte';
import { invoke } from '@tauri-apps/api/core';
import { LazyStore } from '@tauri-apps/plugin-store';

export type Config = {
  theme?: Theme;
};

const store = new LazyStore('settings.json');

export default store;

export async function loadStore(): Promise<Config> {
  const theme = await store.get<Theme>('theme');
  return { theme };
}

export async function saveStore(config: Partial<Config>): Promise<void> {
  if (config.theme !== undefined) {
    await store.set('theme', config.theme);
  }

  await store.save();
  await invoke("log", { message: "Save theme: " + config.theme });
}

export async function closeStore(): Promise<void> {
  await store.close();
}
