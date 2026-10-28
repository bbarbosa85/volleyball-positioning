<script lang="ts">
  import { Crosshair } from '@lucide/svelte';

  interface Props {
    target: { x: number; y: number };
    isCovered?: boolean;
    onStartDrag: () => void;
  }

  let {
    target,
    isCovered = false,
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
  class="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-grab active:cursor-grabbing flex items-center justify-center select-none touch-none group w-[10.5cqw] h-[10.5cqw]"
  style="left: {target.x}%; top: {target.y}%;"
  title="Drag target to test attack coverage"
>
  <div class="relative flex items-center justify-center">
    <div
      class="absolute -inset-[2cqw] rounded-full blur-sm animate-pulse transition-colors duration-200 {
        isCovered ? 'bg-emerald-500/30' : 'bg-rose-500/30'
      }"
    ></div>
    <div
      class="w-[7.2cqw] h-[7.2cqw] rounded-full border-2 border-dashed flex items-center justify-center shadow-lg transition-colors duration-200 {
        isCovered
          ? 'border-emerald-400 bg-emerald-950/60'
          : 'border-rose-400 bg-rose-950/60'
      }"
    >
      <Crosshair
        class="w-[3.6cqw] h-[3.6cqw] transition-colors duration-200 {
          isCovered ? 'text-emerald-300' : 'text-rose-300'
        }"
      />
    </div>
  </div>
  <span
    class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold bg-slate-950/85 px-1.5 py-0.5 rounded border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow {
      isCovered ? 'text-emerald-300' : 'text-rose-300'
    }"
  >
    {isCovered ? 'Covered' : 'Uncovered'}
  </span>
</div>
