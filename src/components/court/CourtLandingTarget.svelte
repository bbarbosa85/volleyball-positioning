<script lang="ts">
  import { Crosshair } from '@lucide/svelte';

  interface Props {
    target: { x: number; y: number };
    onStartDrag: () => void;
  }

  let {
    target,
    onStartDrag
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  onmousedown={(e) => {
    e.stopPropagation();
    onStartDrag();
  }}
  ontouchstart={(e) => {
    e.stopPropagation();
    onStartDrag();
  }}
  class="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-grab active:cursor-grabbing flex items-center justify-center select-none group w-12 h-12"
  style="left: {target.x}%; top: {target.y}%;"
  title="Drag target to change attack landing spot"
>
  <div class="relative flex items-center justify-center">
    <div class="absolute -inset-2.5 rounded-full bg-rose-500/20 blur-sm animate-pulse"></div>
    <div class="w-8 h-8 rounded-full border-2 border-rose-400 border-dashed flex items-center justify-center bg-rose-950/40 shadow-lg">
      <Crosshair class="w-4 h-4 text-rose-300" />
    </div>
  </div>
  <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-rose-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
    Landing Target
  </span>
</div>
