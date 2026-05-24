<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    children?: Snippet;
  }
  let { label, children }: Props = $props();
</script>

<div
  class="p-3 bg-background/40 rounded-xl border-2 border-border flex flex-col gap-1 shadow-inner"
>
  <span class="text-xs font-bold text-foreground uppercase tracking-widest">
    {label}
  </span>
  {@render children?.()}
</div>
