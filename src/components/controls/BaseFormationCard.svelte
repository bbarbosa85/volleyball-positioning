<script lang="ts">
  import type { DefenseSchemeConfig, Player } from '../../types/volleyball';
  import CourtThumbnail from '../court/CourtThumbnail.svelte';
  import { getBaseMovements } from '../../data/schemeRegistry';
  import { Shield, Plus } from '@lucide/svelte';
  import ModificationAlert from './ModificationAlert.svelte';
  import PresetTableRow from './PresetTableRow.svelte';

  interface Props {
    rotation: number;
    allSchemes?: DefenseSchemeConfig[];
    currentScheme?: DefenseSchemeConfig;
    isBaseModified?: boolean;
    roster?: Player[];
    onChangeScheme?: (scheme: DefenseSchemeConfig) => void;
    onSelectPositionMode?: (mode: 'base' | 'spike') => void;
    onOpenSaveModal?: (target: 'base') => void;
    onQuickSaveBaseScheme?: () => void;
    onResetBase?: () => void;
    onDeleteScheme?: (schemeId: string) => void;
    onOpenEditModal?: (type: 'base', id: string, name: string, description: string) => void;
  }

  let {
    rotation,
    allSchemes = [],
    currentScheme,
    isBaseModified = false,
    roster = [],
    onChangeScheme,
    onSelectPositionMode,
    onOpenSaveModal,
    onQuickSaveBaseScheme,
    onResetBase,
    onDeleteScheme,
    onOpenEditModal
  }: Props = $props();

  const currentBaseList = $derived((allSchemes || []).filter(s => s.rotation === rotation));
</script>

<div
  id="cardBasePresets"
  class="card bg-base-200/60 border gap-4 p-4 transition-all duration-200 {
    isBaseModified
      ? 'border-warning shadow-[0_0_20px_rgba(245,158,11,0.25)]'
      : 'border-base-300'
  }"
>
  <div class="flex items-center justify-between flex-wrap gap-2">
    <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/80">
      <Shield class="w-4 h-4 text-primary" />
      <span>2. Base Formation</span>
    </div>
    <button
      type="button"
      onclick={() => onOpenSaveModal?.('base')}
      class="btn btn-xs btn-outline btn-primary gap-1"
      title="Create new base formation preset"
    >
      <Plus class="w-3.5 h-3.5" />
      <span>New Preset</span>
    </button>
  </div>

  <!-- Base Scoped Quick-Alert Bar (Approach A: Focused Edit Lock) -->
  {#if isBaseModified}
    <ModificationAlert
      title="Base Formation modified"
      accent="blue"
      onSave={onQuickSaveBaseScheme}
      onSaveAsNew={() => onOpenSaveModal?.('base')}
      onReset={onResetBase}
    />
  {/if}

  <!-- Base Presets Table -->
  <div class="overflow-hidden rounded-xl border border-base-300 bg-base-100/50">
    <table class="table table-sm w-full">
      <tbody class="divide-y divide-base-300/50">
        {#each currentBaseList as scheme (scheme.id)}
          {@const isCurrent = currentScheme?.id === scheme.id}
          {@const isDisabled = isBaseModified && !isCurrent}
          {@const canDelete = currentBaseList.length > 1}
          <PresetTableRow
            title={scheme.name}
            subtitle={scheme.description}
            isSelected={isCurrent}
            isModified={isBaseModified}
            {isDisabled}
            {canDelete}
            accent="blue"
            onSelect={() => {
              onChangeScheme?.(scheme);
              onSelectPositionMode?.('base');
            }}
            onRename={onOpenEditModal ? () => onOpenEditModal('base', scheme.id, scheme.name, scheme.description || '') : undefined}
            onDelete={onDeleteScheme ? () => onDeleteScheme(scheme.id) : undefined}
          >
            <CourtThumbnail
              movements={getBaseMovements(scheme, rotation)}
              mode="base"
              {roster}
              active={isCurrent}
            />
          </PresetTableRow>
        {/each}
      </tbody>
    </table>
  </div>
</div>
