<script lang="ts">
  interface Row {
    label: string;
    value: string;
    unit: string;
    highlight?: boolean;
    highlightColor?: string;
  }

  interface Props {
    title: string;
    rows: Row[];
  }
  let { title, rows }: Props = $props();
</script>

<div
  class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-inner"
>
  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
    {title}
  </span>

  {#each rows as row, i}
    <div
      class="flex items-center justify-between {row.highlight
        ? 'text-sm font-extrabold text-slate-800 pt-0.5'
        : 'text-xs font-bold text-slate-500 border-b border-slate-200 pb-1'}"
    >
      <span>{row.label}</span>
      <span class="font-mono font-extrabold {row.highlight ? (row.highlightColor ?? 'text-slate-900') + ' text-base' : 'text-slate-800'}">
        {row.value} {row.unit}
      </span>
    </div>
  {/each}
</div>
