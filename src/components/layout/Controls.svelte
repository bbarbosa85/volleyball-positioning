<script lang="ts">
  import type { AttackScenario, DefenseSchemeConfig, Player, PlayerMovement } from '../../types/volleyball';

  // Modular components
  import RotationContextCard from '../controls/RotationContextCard.svelte';
  import BaseFormationCard from '../controls/BaseFormationCard.svelte';
  import DefensiveFormationCard from '../controls/DefensiveFormationCard.svelte';
  import PresetEditModal from '../modals/PresetEditModal.svelte';

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
  <BaseFormationCard
    {rotation}
    {allSchemes}
    {currentScheme}
    {isBaseModified}
    {roster}
    {onChangeScheme}
    {onSelectPositionMode}
    {onOpenSaveModal}
    {onQuickSaveBaseScheme}
    {onResetBase}
    {onDeleteScheme}
    onOpenEditModal={(type, id, name, desc) => openEditModal(type, id, name, desc)}
  />

  <!-- BLOCK 3: DEFENSIVE FORMATION (REACTION PHASE) -->
  <DefensiveFormationCard
    {rotation}
    {scenarios}
    {currentScenario}
    {isAttackModified}
    {roster}
    {attackSchemes}
    {onSelectScenario}
    {onSelectPositionMode}
    {onOpenSaveModal}
    {onQuickSaveAdjustment}
    {onResetAttack}
    {onDeleteAdjustment}
    onOpenEditModal={(type, id, name, desc, key) => openEditModal(type, id, name, desc, key)}
  />
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
