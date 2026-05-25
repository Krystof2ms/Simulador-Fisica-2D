<script lang="ts">
  export let width: number;
  export let step = 100;

  $: marks = Array.from({ length: Math.floor(width / step) + 1 }, (_, i) => i * step).map((value) => ({
    value,
    leftPct: (value / width) * 100
  }));
</script>

<div class="absolute left-6 top-0 z-30 h-6 w-[calc(100%-24px)] rounded-t-lg border border-slate-300 bg-slate-100 pointer-events-none overflow-hidden">
  {#each marks as mark}
    <div class="absolute top-0 h-full border-l border-slate-300" style={`left:${mark.leftPct}%`}>
      <span class="absolute left-1 top-0.5 text-x font-mono text-slate-600">{mark.value}</span>
    </div>
  {/each}
</div>
