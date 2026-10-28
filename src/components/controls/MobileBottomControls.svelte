<script lang="ts">
  import { Play, RotateCcw, FileText } from '@lucide/svelte';

  interface Props {
    visiblePhase: 'base' | 'defense';
    isPlayingTransition?: boolean;
    hasNotes?: boolean;
    onSelectPhase: (phase: 'base' | 'defense') => void;
    onPlayTransition: () => void;
    onResetTransition: () => void;
    onOpenNotes: () => void;
  }

  let {
    visiblePhase,
    isPlayingTransition = false,
    hasNotes = false,
    onSelectPhase,
    onPlayTransition,
    onResetTransition,
    onOpenNotes
  }: Props = $props();
</script>

<div class="fixed bottom-3 inset-x-3 z-40 lg:hidden flex justify-center pointer-events-none select-none">
  <div class="w-full max-w-md bg-base-200/95 backdrop-blur-md border border-base-300 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1.5 pointer-events-auto">
    <!-- Segmented Formation Toggle (Base | Defensive) -->
    <div class="grid grid-cols-2 p-1 rounded-xl bg-base-300/90 flex-1">
      <button
        type="button"
        onclick={() => onSelectPhase('base')}
        class="py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate {
          visiblePhase === 'base'
            ? 'bg-base-100 text-base-content shadow-sm'
            : 'bg-transparent text-base-content/60 hover:text-base-content'
        }"
      >
        Base
      </button>

      <button
        type="button"
        onclick={() => onSelectPhase('defense')}
        class="py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate {
          visiblePhase === 'defense'
            ? 'bg-base-100 text-base-content shadow-sm'
            : 'bg-transparent text-base-content/60 hover:text-base-content'
        }"
      >
        Defensive
      </button>
    </div>

    <!-- Play / Reset Transition Animation Button -->
    {#if visiblePhase === 'base'}
      <button
        type="button"
        onclick={onPlayTransition}
        class="btn btn-sm btn-primary gap-1.5 px-3 w-[82px] h-9 min-h-0 rounded-xl shadow-xs shrink-0"
        title="Play Base to Defensive formation transition"
      >
        <Play class="w-3.5 h-3.5 fill-current" />
        <span>Play</span>
      </button>
    {:else}
      <button
        type="button"
        onclick={onResetTransition}
        disabled={isPlayingTransition}
        class="btn btn-sm btn-secondary gap-1.5 px-3 w-[82px] h-9 min-h-0 rounded-xl shadow-xs shrink-0"
        title="Reset animation back to Base formation"
      >
        <RotateCcw class="w-3.5 h-3.5 shrink-0" />
        <span>Reset</span>
      </button>
    {/if}

    <!-- Notes Modal Button (Right of Play/Reset) -->
    <button
      type="button"
      onclick={onOpenNotes}
      class="relative btn btn-sm btn-ghost border border-base-300 bg-base-300/70 hover:bg-base-300 gap-1 px-2.5 h-9 min-h-0 rounded-xl text-base-content/85 shrink-0"
      title="Open strategy notes & rotation details"
      aria-label="Open strategy notes"
    >
      <FileText class="w-3.5 h-3.5 text-primary" />
      <span>Notes</span>
      {#if hasNotes}
        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
      {/if}
    </button>
  </div>
</div>

