<script lang="ts">
  import type { Strategy } from '../../types/volleyball';
  import { strategyStore } from '../../data/strategyStore.svelte';
  import PhaseTogglerCard from '../controls/PhaseTogglerCard.svelte';
  import { RotateCcw } from '@lucide/svelte';

  interface Props {
    draft: Strategy;
    visiblePhase: 'base' | 'defense';
    onUpdate: (updates: Partial<Strategy>) => void;
    onSelectPhase: (phase: 'base' | 'defense') => void;
    onResetPhase: (phase: 'base' | 'defense') => void;
  }

  let {
    draft,
    visiblePhase,
    onUpdate,
    onSelectPhase,
    onResetPhase
  }: Props = $props();

  function handleNameChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    onUpdate({ name: val });
  }

  function handleRotationChange(r: 1 | 2) {
    onUpdate({ rotation: r });
  }
</script>

<div class="flex flex-col gap-4 w-full select-none">
  <!-- 1. Strategy Name Input -->
  <div class="flex flex-col gap-1 w-full">
    <label for="strategy-name-input" class="text-xs font-bold text-base-content/90 flex items-center justify-between">
      <span>Strategy Name <span class="text-error">*</span></span>
      <span class="text-[10px] text-base-content/60 font-normal">Required</span>
    </label>
    <input
      id="strategy-name-input"
      type="text"
      value={draft.name}
      oninput={handleNameChange}
      placeholder="e.g. Deep & Tip Cover vs. Outside Cross"
      maxlength="60"
      class="input input-sm input-bordered w-full font-medium text-xs {
        strategyStore.nameError ? 'input-error focus:input-error' : 'focus:input-primary'
      }"
      required
    />
    {#if strategyStore.nameError}
      <span class="text-[11px] font-semibold text-error mt-0.5">
        {strategyStore.nameError}
      </span>
    {/if}
  </div>

  <!-- 2. Serving Rotation Switcher (Segmented Container with Male/Female sign SVG icons) -->
  <div class="flex flex-col gap-1.5 w-full">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-base-content/90">Serving Rotation</span>
      <span class="text-[10px] text-base-content/60 font-normal">Lineup & blocker roles</span>
    </div>

    <div class="grid grid-cols-2 p-1 rounded-xl bg-base-300/90 w-full">
      <button
        type="button"
        onclick={() => handleRotationChange(1)}
        class="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer {
          draft.rotation === 1
            ? 'bg-base-100 text-base-content shadow-sm'
            : 'bg-transparent text-base-content/60 hover:text-base-content'
        }"
      >
        <!-- Male Sign SVG (Circle with arrow up) -->
        <svg class="w-4 h-4 text-info shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="10" cy="14" r="6" />
          <path d="M14.5 9.5 20 4" />
          <path d="M15 4h5v5" />
        </svg>
        <span class="truncate">Man Serving</span>
      </button>

      <button
        type="button"
        onclick={() => handleRotationChange(2)}
        class="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer {
          draft.rotation === 2
            ? 'bg-base-100 text-base-content shadow-sm'
            : 'bg-transparent text-base-content/60 hover:text-base-content'
        }"
      >
        <!-- Female Sign SVG (Circle with cross down) -->
        <svg class="w-4 h-4 text-warning shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="9" r="6" />
          <path d="M12 15v7" />
          <path d="M9 19h6" />
        </svg>
        <span class="truncate">Woman Serving</span>
      </button>
    </div>
  </div>

  <!-- 3. Formations Inline Toggle [Base | Defensive] -->
  <div class="flex flex-col gap-1.5 w-full">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-base-content/90">Formations</span>
      <button
        type="button"
        onclick={() => onResetPhase(visiblePhase)}
        class="btn btn-ghost btn-xs h-6 min-h-0 px-2 gap-1 text-[11px] text-base-content/65 hover:text-base-content"
        title="Reset active formation positions to default"
      >
        <RotateCcw class="w-3 h-3" />
        <span>Reset {visiblePhase === 'base' ? 'Base' : 'Defensive'}</span>
      </button>
    </div>

    <PhaseTogglerCard
      {visiblePhase}
      onSelect={onSelectPhase}
    />

    <span class="text-[11px] text-base-content/60 mt-0.5">
      Select a formation and drag players on the court to adjust positions.
    </span>
  </div>
</div>
