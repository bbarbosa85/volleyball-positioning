<script lang="ts">
  import type { Player, PlayerMovement, AttackScenario } from '../../types/volleyball';
  import CourtThumbnail from '../court/CourtThumbnail.svelte';
  import { Eye, RotateCcw } from '@lucide/svelte';

  interface Props {
    phase: 'base' | 'defense';
    title: string;
    subtitle: string;
    isVisible: boolean;
    isDirty?: boolean;
    isEditing?: boolean;
    movements: PlayerMovement[];
    roster: Player[];
    scenario: AttackScenario;
    onSelect: () => void;
    onReset?: () => void;
  }

  let {
    phase,
    title,
    subtitle,
    isVisible,
    isDirty = false,
    isEditing = false,
    movements,
    roster,
    scenario,
    onSelect,
    onReset
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<div
  role="button"
  tabindex="0"
  onclick={onSelect}
  class="relative w-full rounded-2xl border p-3 flex flex-col gap-2.5 transition-all duration-200 cursor-pointer text-left {
    isDirty
      ? 'border-amber-500/80 bg-base-200/90 shadow-sm ring-1 ring-amber-500/40'
      : isVisible
        ? 'border-success bg-success/5 shadow-sm ring-1 ring-success/40'
        : 'border-base-300 bg-base-200/60 hover:bg-base-200 hover:border-base-content/20'
  }"
>
  <!-- Card Header -->
  <div class="flex items-center justify-between gap-2">
    <div class="flex flex-col">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full {phase === 'base' ? 'bg-primary' : 'bg-secondary'}"></span>
        <span class="font-extrabold text-xs text-base-content">{title}</span>
      </div>
      <span class="text-[10px] text-base-content/70 ml-3.5">{subtitle}</span>
    </div>

    <div class="flex items-center gap-1.5" onclick={(e) => e.stopPropagation()} role="toolbar" tabindex="-1">
      {#if isDirty}
        <span class="badge badge-warning badge-xs font-bold text-[10px] px-1.5 py-0.5">
          Modified
        </span>
      {/if}

      {#if isVisible}
        <span class="badge badge-success badge-xs font-bold text-[10px] px-1.5 py-0.5 gap-1">
          <Eye class="w-2.5 h-2.5" />
          Visible
        </span>
      {/if}

      {#if isEditing && onReset}
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          class="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-base-content hover:bg-base-300"
          title="Reset to default positioning"
          aria-label="Reset to default positioning"
        >
          <RotateCcw class="w-3.5 h-3.5" />
        </button>
      {/if}
    </div>
  </div>

  <!-- SVG Court Thumbnail -->
  <div class="w-full aspect-[1/1] max-h-[160px] rounded-xl overflow-hidden bg-base-300/40 flex items-center justify-center p-1 pointer-events-none">
    <CourtThumbnail
      {movements}
      mode={phase === 'base' ? 'base' : 'spike'}
      {roster}
      {scenario}
      active={isVisible}
    />
  </div>
</div>
