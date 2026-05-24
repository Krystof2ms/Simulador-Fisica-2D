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
  class="p-3 bg-background/40 rounded-xl border-2 border-border flex flex-col gap-1.5 shadow-inner"
>
  <span class="text-xs font-bold text-foreground uppercase tracking-widest">
    {title}
  </span>

  {#each rows as row, i}
    <div
      class="flex items-center justify-between {row.highlight
        ? 'text-sm font-extrabold text-muted-foreground pt-0.5'
        : 'text-xs font-bold text-muted-foreground/80 border-b border-border pb-1'}"
    >
      <span>{row.label}</span>
      <div class="flex gap-2">
        <span
          class="font-mono font-extrabold {row.highlight
            ? (row.highlightColor ?? 'text-foreground') + ' text-base'
            : 'text-foreground'}"
        >
          {row.value}
        </span>
        <span
          class="font-mono font-extrabold {row.highlight
            ? (row.highlightColor ?? 'text-muted-foreground') + ' text-base'
            : 'text-muted-foreground'}"
        >
          {row.unit}
        </span>
      </div>
    </div>
  {/each}
</div>
