<script lang="ts">
  import { Layers } from '@lucide/svelte';

  interface Props {
    currentPositionMode?: 'base' | 'spike';
    onSelectPositionMode?: (mode: 'base' | 'spike') => void;
  }

  let {
    currentPositionMode = 'base',
    onSelectPositionMode
  }: Props = $props();
</script>

<div
  id="cardCourtPhase"
  class="card bg-base-200/60 border border-base-300 p-4 w-full max-w-[620px] mb-3 transition-all duration-200"
>
  <div class="flex items-center justify-between flex-wrap gap-2">
    <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/80">
      <Layers class="w-4 h-4 text-primary" />
      <span>Court Simulation Phase</span>
    </div>
    <span class="badge badge-primary badge-soft font-bold text-[11px] py-1">
      {currentPositionMode === 'base' ? 'Pre-Contact Reading' : 'Post-Contact Defense'}
    </span>
  </div>

  <!-- Segmented Control matching Rotation Context style -->
  <div class="grid grid-cols-2 gap-2 p-1 rounded-xl bg-base-300/50 border border-base-300 transition-all">
    <button
      type="button"
      onclick={() => onSelectPositionMode?.('base')}
      class="py-2.5 px-3 rounded-lg font-bold text-xs flex flex-col items-center gap-0.5 transition-all text-center {
        currentPositionMode === 'base'
          ? 'btn btn-primary h-auto py-2'
          : 'btn btn-ghost h-auto py-2 hover:bg-base-200 text-base-content/70'
      } cursor-pointer"
    >
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full {currentPositionMode === 'base' ? 'bg-primary-content' : 'bg-primary'}"></span>
        <span class="font-extrabold text-xs">1. Base Formation</span>
      </div>
      <span class="text-[10px] opacity-80 font-normal">Pre-Contact Reading Stance</span>
    </button>

    <button
      type="button"
      onclick={() => onSelectPositionMode?.('spike')}
      class="py-2.5 px-3 rounded-lg font-bold text-xs flex flex-col items-center gap-0.5 transition-all text-center {
        currentPositionMode === 'spike'
          ? 'btn btn-primary h-auto py-2'
          : 'btn btn-ghost h-auto py-2 hover:bg-base-200 text-base-content/70'
      } cursor-pointer"
    >
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full {currentPositionMode === 'spike' ? 'bg-primary-content' : 'bg-secondary'}"></span>
        <span class="font-extrabold text-xs">2. Defensive Formation</span>
      </div>
      <span class="text-[10px] opacity-80 font-normal">Post-Contact Reaction & Dig</span>
    </button>
  </div>
</div>
