<script lang="ts">
  export let height: number;
  export let step = 100;

  $: marks = Array.from({ length: Math.floor(height / step) + 1 }, (_, i) => i * step);
</script>

<div class="absolute left-0 top-6 w-6 rounded-l-lg border border-slate-200 bg-slate-100 overflow-hidden" style={`height:${height}px`}>
  {#each marks as mark}
    <div class="absolute left-0 w-full border-t border-slate-300" style={`top:${mark}px`}>
      <span class="absolute left-0.5 -top-2 text-[10px] font-mono text-slate-500">{mark}</span>
    </div>
  {/each}
</div>
