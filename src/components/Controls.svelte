<script lang="ts">
  import type { AttackScenario, DefenseSchemeConfig, Player, PlayerMovement } from '../types/volleyball';
  import CourtThumbnail from './CourtThumbnail.svelte';
  import { getBaseMovements, getAttackScenarioMovements } from '../data/schemeRegistry';
  import { Shield, Crosshair, Plus } from '@lucide/svelte';

  // Common reusable components
  import RotationContextCard from './common/RotationContextCard.svelte';
  import ModificationAlert from './common/ModificationAlert.svelte';
  import PresetDescriptionCallout from './common/PresetDescriptionCallout.svelte';
  import PresetCard from './common/PresetCard.svelte';
  import PresetEditModal from './common/PresetEditModal.svelte';

  interface Props {
    scenarios: AttackScenario[];
    currentScenario: AttackScenario;
    onSelectScenario: (s: AttackScenario) => void;

    rotation: number;
    onChangeRotation: (r: number) => void;

    allSchemes?: DefenseSchemeConfig[];
    currentScheme?: DefenseSchemeConfig;
    onChangeScheme?: (scheme: DefenseSchemeConfig) => void;
    onDeleteScheme?: (schemeId: string) => void;
    onRenameScheme?: (schemeId: string, updates: { name: string; description?: string }) => void;
    onQuickSaveBaseScheme?: () => void;

    currentPositionMode?: 'base' | 'spike';
    onSelectPositionMode?: (mode: 'base' | 'spike') => void;

    isBaseModified?: boolean;
    isAttackModified?: boolean;
    onResetBase?: () => void;
    onResetAttack?: () => void;
    onOpenSaveModal?: (target: 'base' | 'attack') => void;
    onQuickSaveAdjustment?: () => void;
    onDeleteAdjustment?: (scenarioId: string) => void;
    onRenameAdjustment?: (scenarioId: string, updates: { name: string; description?: string; defensiveKey?: string }) => void;

    roster?: Player[];
    attackSchemes?: Record<string, Record<number, PlayerMovement[]>>;
  }

  let {
    scenarios,
    currentScenario,
    onSelectScenario,
    rotation,
    onChangeRotation,
    allSchemes = [],
    currentScheme,
    onChangeScheme,
    onDeleteScheme,
    onRenameScheme,
    onQuickSaveBaseScheme,
    currentPositionMode = 'base',
    onSelectPositionMode,
    isBaseModified = false,
    isAttackModified = false,
    onResetBase,
    onResetAttack,
    onOpenSaveModal,
    onQuickSaveAdjustment,
    onDeleteAdjustment,
    onRenameAdjustment,
    roster = [],
    attackSchemes
  }: Props = $props();

  const isAnyDirty = $derived(isBaseModified || isAttackModified);

  const currentBaseList = $derived((allSchemes || []).filter(s => s.rotation === rotation));
  const currentAttackList = $derived(scenarios.filter(s => s.rotation === rotation));

  // Edit preset modal state
  let editModalState = $state<{
    open: boolean;
    type: 'base' | 'attack';
    id: string;
    name: string;
    description: string;
    defensiveKey: string;
  }>({
    open: false,
    type: 'base',
    id: '',
    name: '',
    description: '',
    defensiveKey: ''
  });

  function openEditModal(
    type: 'base' | 'attack',
    id: string,
    currentName: string,
    currentDescription: string = '',
    currentKey: string = ''
  ) {
    editModalState = {
      open: true,
      type,
      id,
      name: currentName,
      description: currentDescription,
      defensiveKey: currentKey
    };
  }

  function closeEditModal() {
    editModalState.open = false;
  }

  function handleConfirmEdit(updates: { name: string; description: string; defensiveKey?: string }) {
    if (editModalState.type === 'base') {
      onRenameScheme?.(editModalState.id, {
        name: updates.name,
        description: updates.description
      });
    } else {
      onRenameAdjustment?.(editModalState.id, {
        name: updates.name,
        description: updates.description,
        defensiveKey: updates.defensiveKey
      });
    }
    closeEditModal();
  }
</script>

<div class="flex flex-col gap-4 w-full">
  <!-- BLOCK 1: ROTATION CONTEXT (TACTICAL MULTIPLIER) -->
  <RotationContextCard
    {rotation}
    isLocked={isAnyDirty}
    {onChangeRotation}
  />

  <!-- BLOCK 2: BASE FORMATION (READING PHASE) -->
  <div
    id="cardBasePresets"
    class="card bg-base-200/60 border p-4 transition-all duration-200 {
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

    <!-- Selected Base Preset Description Callout (REQ-10A) -->
    <PresetDescriptionCallout
      description={currentScheme?.description}
      accent="blue"
    />

    <!-- Base Presets Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {#each currentBaseList as scheme (scheme.id)}
        {@const isCurrent = currentScheme?.id === scheme.id}
        {@const isDisabled = isBaseModified && !isCurrent}
        {@const canDelete = currentBaseList.length > 1}
        <PresetCard
          title={scheme.name}
          isSelected={isCurrent}
          isModified={isBaseModified}
          {isDisabled}
          {canDelete}
          accent="blue"
          thumbnailSize="base"
          onSelect={() => {
            onChangeScheme?.(scheme);
            onSelectPositionMode?.('base');
          }}
          onRename={onRenameScheme ? () => openEditModal('base', scheme.id, scheme.name, scheme.description || '') : undefined}
          onDelete={onDeleteScheme ? () => onDeleteScheme(scheme.id) : undefined}
        >
          <CourtThumbnail
            movements={getBaseMovements(scheme, rotation)}
            mode="base"
            {roster}
            active={isCurrent}
          />
        </PresetCard>
      {/each}
    </div>
  </div>

  <!-- BLOCK 3: DEFENSIVE FORMATION (REACTION PHASE) -->
  <div
    id="cardAttackPresets"
    class="card bg-base-200/60 border p-4 transition-all duration-200 {
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

    <!-- Selected Defensive Preset Description & Key Callout (REQ-10A) -->
    <PresetDescriptionCallout
      description={currentScenario?.description}
      defensiveKey={currentScenario?.defensiveKey}
      accent="rose"
    />

    <!-- Defensive Presets Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {#each currentAttackList as sc (sc.id)}
        {@const isCurrent = currentScenario.id === sc.id}
        {@const isDisabled = isAttackModified && !isCurrent}
        {@const canDelete = currentAttackList.length > 1}
        <PresetCard
          title={sc.label || sc.name}
          isSelected={isCurrent}
          isModified={isAttackModified}
          {isDisabled}
          {canDelete}
          accent="rose"
          thumbnailSize="attack"
          onSelect={() => {
            onSelectScenario(sc);
            onSelectPositionMode?.('spike');
          }}
          onRename={onRenameAdjustment ? () => openEditModal('attack', sc.id, sc.label || sc.name, sc.description || '', sc.defensiveKey || '') : undefined}
          onDelete={onDeleteAdjustment ? () => onDeleteAdjustment(sc.id) : undefined}
        >
          <CourtThumbnail
            movements={getAttackScenarioMovements(sc.id, rotation, attackSchemes)}
            mode="spike"
            scenario={sc}
            {roster}
            active={isCurrent}
          />
        </PresetCard>
      {/each}
    </div>
  </div>
</div>

<!-- EDIT PRESET MODAL (Allows updating name and markdown description) -->
<PresetEditModal
  open={editModalState.open}
  type={editModalState.type}
  bind:name={editModalState.name}
  bind:description={editModalState.description}
  bind:defensiveKey={editModalState.defensiveKey}
  onClose={closeEditModal}
  onSave={handleConfirmEdit}
/>
