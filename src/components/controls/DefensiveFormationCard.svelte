<script lang="ts">
  import type { AttackScenario, Player, PlayerMovement } from '../../types/volleyball';
  import CourtThumbnail from '../court/CourtThumbnail.svelte';
  import { getAttackScenarioMovements } from '../../data/schemeRegistry';
  import { Crosshair, Plus } from '@lucide/svelte';
  import ModificationAlert from './ModificationAlert.svelte';
  import PresetTableRow from './PresetTableRow.svelte';

  interface Props {
    rotation: number;
    scenarios: AttackScenario[];
    currentScenario: AttackScenario;
    isAttackModified?: boolean;
    roster?: Player[];
    attackSchemes?: Record<string, Record<number, PlayerMovement[]>>;
    onSelectScenario: (s: AttackScenario) => void;
    onSelectPositionMode?: (mode: 'base' | 'spike') => void;
    onOpenSaveModal?: (target: 'attack') => void;
    onQuickSaveAdjustment?: () => void;
    onResetAttack?: () => void;
    onDeleteAdjustment?: (scenarioId: string) => void;
    onOpenEditModal?: (type: 'attack', id: string, name: string, description: string, key?: string) => void;
  }

  let {
    rotation,
    scenarios,
    currentScenario,
    isAttackModified = false,
    roster = [],
    attackSchemes,
    onSelectScenario,
    onSelectPositionMode,
    onOpenSaveModal,
    onQuickSaveAdjustment,
    onResetAttack,
    onDeleteAdjustment,
    onOpenEditModal
  }: Props = $props();

  const currentAttackList = $derived(scenarios.filter(s => s.rotation === rotation));
</script>

<div
  id="cardAttackPresets"
  class="card bg-base-200/60 border gap-4 p-4 transition-all duration-200 {
    isAttackModified
      ? 'border-warning shadow-[0_0_20px_rgba(245,158,11,0.25)]'
      : 'border-base-300'
  }"
>
  <div class="flex items-center justify-between flex-wrap gap-2">
    <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/80">
      <Crosshair class="w-4 h-4 text-secondary" />
      <span>3. Defensive Formation</span>
    </div>
    <button
      type="button"
      onclick={() => onOpenSaveModal?.('attack')}
      class="btn btn-xs btn-outline btn-secondary gap-1"
      title="Create new defensive formation preset"
    >
      <Plus class="w-3.5 h-3.5" />
      <span>New Preset</span>
    </button>
  </div>

  <!-- Defensive Scoped Quick-Alert Bar (Approach A: Focused Edit Lock) -->
  {#if isAttackModified}
    <ModificationAlert
      title="Defensive Formation modified"
      accent="rose"
      onSave={onQuickSaveAdjustment}
      onSaveAsNew={() => onOpenSaveModal?.('attack')}
      onReset={onResetAttack}
    />
  {/if}

  <!-- Defensive Presets Table -->
  <div class="overflow-hidden rounded-xl border border-base-300 bg-base-100/50">
    <table class="table table-sm w-full">
      <tbody class="divide-y divide-base-300/50">
        {#each currentAttackList as sc (sc.id)}
          {@const isCurrent = currentScenario.id === sc.id}
          {@const isDisabled = isAttackModified && !isCurrent}
          {@const canDelete = currentAttackList.length > 1}
          <PresetTableRow
            title={sc.label || sc.name}
            subtitle={sc.defensiveKey || sc.description}
            isSelected={isCurrent}
            isModified={isAttackModified}
            {isDisabled}
            {canDelete}
            accent="rose"
            onSelect={() => {
              onSelectScenario(sc);
              onSelectPositionMode?.('spike');
            }}
            onRename={onOpenEditModal ? () => onOpenEditModal('attack', sc.id, sc.label || sc.name, sc.description || '', sc.defensiveKey || '') : undefined}
            onDelete={onDeleteAdjustment ? () => onDeleteAdjustment(sc.id) : undefined}
          >
            <CourtThumbnail
              movements={getAttackScenarioMovements(sc.id, rotation, attackSchemes)}
              mode="spike"
              scenario={sc}
              {roster}
              active={isCurrent}
            />
          </PresetTableRow>
        {/each}
      </tbody>
    </table>
  </div>
</div>
