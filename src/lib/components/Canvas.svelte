<script lang="ts">
    import { onMount } from 'svelte';
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    function loop() {
      ctx?.clearRect(0,0, canvas.width, canvas.height);

      requestAnimationFrame(loop);
    }

    onMount(() => {
        if (canvas) {
            ctx = canvas.getContext('2d');
            if (ctx) {
                loop();
            }
        }
    });
</script>

<canvas bind:this={canvas}>
</canvas>
