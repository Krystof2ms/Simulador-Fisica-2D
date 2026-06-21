import type { Theme } from '$lib/utils/types';
import type { LayoutLoad } from './$types';

// Carga datos para todo este grupo de rutas
export const load: LayoutLoad = async ({ url }) => {
  const themeParam = url.searchParams.get("theme") ?? "light";
  const theme: Theme = themeParam as Theme;

    return { theme };
};
