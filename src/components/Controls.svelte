<script lang="ts">
  import type { AttackScenario, DefenseSchemeConfig, Player, PlayerMovement } from '../types/volleyball';
  import Button from './ui/Button.svelte';
  import Dialog from './ui/Dialog.svelte';
  import CourtThumbnail from './CourtThumbnail.svelte';
  import { getBaseMovements, getAttackScenarioMovements } from '../data/schemeRegistry';
  import { Shield, Crosshair } from '@lucide/svelte';

  // Common reusable components
  import RotationContextCard from './common/RotationContextCard.svelte';
  import ModificationAlert from './common/ModificationAlert.svelte';
  import PresetDescriptionCallout from './common/PresetDescriptionCallout.svelte';
  import PresetCard from './common/PresetCard.svelte';
  import MarkdownEditor from './common/MarkdownEditor.svelte';

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

  const customAttackList = $derived(scenarios.filter(s => s.isCustom && s.rotation === rotation));
  const presetAttackList = $derived(scenarios.filter(s => !s.isCustom && s.rotation === rotation));
  const allAttackPresets = $derived([...presetAttackList, ...customAttackList]);

  const customBaseList = $derived((allSchemes || []).filter(s => s.isCustom && s.rotation === rotation));
  const presetBaseList = $derived((allSchemes || []).filter(s => !s.isCustom && s.rotation === rotation));
  const allBasePresets = $derived([...presetBaseList, ...customBaseList]);

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

  function handleConfirmEdit() {
    const trimmed = editModalState.name.trim();
    if (!trimmed) return;
    if (editModalState.type === 'base') {
      onRenameScheme?.(editModalState.id, {
        name: trimmed,
        description: editModalState.description
      });
    } else {
      onRenameAdjustment?.(editModalState.id, {
        name: trimmed,
        description: editModalState.description,
        defensiveKey: editModalState.defensiveKey
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
      <span class="badge badge-primary badge-soft font-bold text-[11px] py-1">
        Pre-Contact Reading
      </span>
    </div>

    <!-- Base Scoped Quick-Alert Bar (Approach A: Focused Edit Lock) -->
    {#if isBaseModified}
      <ModificationAlert
        title="Base Formation modified"
        accent="blue"
        isCustom={Boolean(currentScheme?.isCustom)}
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
      {#each allBasePresets as scheme (scheme.id)}
        {@const isCurrent = currentScheme?.id === scheme.id}
        {@const isCustom = Boolean(scheme.isCustom)}
        {@const isDisabled = isBaseModified && !isCurrent}
        <PresetCard
          title={scheme.name}
          {isCustom}
          isSelected={isCurrent}
          isModified={isBaseModified}
          {isDisabled}
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
      <span class="badge badge-secondary badge-soft font-bold text-[11px] py-1">
        Post-Contact Reaction
      </span>
    </div>

    <!-- Defensive Scoped Quick-Alert Bar (Approach A: Focused Edit Lock) -->
    {#if isAttackModified}
      <ModificationAlert
        title="Defensive Formation modified"
        accent="rose"
        isCustom={Boolean(currentScenario?.isCustom)}
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
      {#each allAttackPresets as sc (sc.id)}
        {@const isCurrent = currentScenario.id === sc.id}
        {@const isCustom = Boolean(sc.isCustom)}
        {@const isDisabled = isAttackModified && !isCurrent}
        <PresetCard
          title={sc.label || sc.name}
          {isCustom}
          isSelected={isCurrent}
          isModified={isAttackModified}
          {isDisabled}
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
<Dialog
  open={editModalState.open}
  onClose={closeEditModal}
  title={editModalState.type === 'base' ? 'Edit Base Formation Preset' : 'Edit Defensive Formation Preset'}
  description="Update the preset name and tactical notes"
  maxWidth="max-w-lg"
>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleConfirmEdit();
    }}
    class="flex flex-col gap-4 mt-1 text-xs"
  >
    <div class="flex flex-col gap-1.5">
      <label for="edit-preset-input" class="font-bold text-base-content/90">
        Preset Name <span class="text-error">*</span>
      </label>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        id="edit-preset-input"
        type="text"
        bind:value={editModalState.name}
        placeholder="Enter preset name"
        class="input input-bordered w-full text-xs"
        required
        autofocus
      />
    </div>

    {#if editModalState.type === 'attack'}
      <div class="flex flex-col gap-1.5">
        <label for="edit-preset-key-input" class="font-bold text-base-content/90">
          Defensive Key (Short Summary)
        </label>
        <input
          id="edit-preset-key-input"
          type="text"
          bind:value={editModalState.defensiveKey}
          placeholder="e.g. Line & Cross, Pipe Trap, Tip Coverage"
          class="input input-bordered w-full text-xs"
        />
      </div>
    {/if}

    <MarkdownEditor
      bind:value={editModalState.description}
      label="Preset Description & Tactical Notes (Markdown)"
      placeholder="Enter tactical assignments, positioning cues, or transition instructions..."
      rows={3}
    />

    <div class="flex items-center justify-end gap-2 pt-3 border-t border-base-300">
      <Button
        type="button"
        variant="secondary"
        onclick={closeEditModal}
        class="text-xs"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="default"
        disabled={!editModalState.name.trim()}
        class="btn btn-primary text-xs font-bold"
      >
        Save Changes
      </Button>
    </div>
  </form>
</Dialog>
