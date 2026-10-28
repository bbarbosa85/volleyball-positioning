<script lang="ts">
  import { strategyStore } from '../../data/strategyStore.svelte';
  import CourtThumbnail from '../court/CourtThumbnail.svelte';

  interface Props {
    visiblePhase: 'base' | 'defense';
    onSelect: (phase: 'base' | 'defense') => void;
  }

  let { visiblePhase, onSelect }: Props = $props();

  const movements = $derived(strategyStore.movements);
  const roster = $derived(strategyStore.roster);
  const scenario = $derived(strategyStore.scenario);
</script>

<div class="grid grid-cols-2 p-1 rounded-xl bg-base-300/90 w-full select-none">
  <button
    type="button"
    onclick={() => onSelect('base')}
    class="flex items-center justify-center gap-2.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer {
      visiblePhase === 'base'
        ? 'bg-base-100 text-base-content shadow-sm'
        : 'bg-transparent text-base-content/60 hover:text-base-content'
    }"
  >
    <div class="w-9 h-9 rounded-md overflow-hidden shrink-0 pointer-events-none ring-1 ring-black/15">
      <CourtThumbnail
        {movements}
        mode="base"
        {roster}
        {scenario}
        active={visiblePhase === 'base'}
      />
    </div>
    <span class="truncate">Base</span>
  </button>

  <button
    type="button"
    onclick={() => onSelect('defense')}
    class="flex items-center justify-center gap-2.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer {
      visiblePhase === 'defense'
        ? 'bg-base-100 text-base-content shadow-sm'
        : 'bg-transparent text-base-content/60 hover:text-base-content'
    }"
  >
    <div class="w-9 h-9 rounded-md overflow-hidden shrink-0 pointer-events-none ring-1 ring-black/15">
      <CourtThumbnail
        {movements}
        mode="spike"
        {roster}
        {scenario}
        active={visiblePhase === 'defense'}
      />
    </div>
    <span class="truncate">Defensive</span>
  </button>
</div>
