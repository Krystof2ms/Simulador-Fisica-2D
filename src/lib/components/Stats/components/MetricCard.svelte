<script lang="ts">
  interface Props {
    label: string;
    children?: import("svelte").Snippet;
  }
  let { label, children }: Props = $props();
</script>

<div
  class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-inner"
>
  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
    {label}
  </span>
  {@render children?.()}
</div>
