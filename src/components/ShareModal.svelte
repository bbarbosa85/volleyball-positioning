<script lang="ts">
  import Dialog from './ui/Dialog.svelte';
  import Button from './ui/Button.svelte';
  import CourtThumbnail from './CourtThumbnail.svelte';
  import type { AttackScenario, DefenseSchemeConfig, Player, PlayerMovement } from '../types/volleyball';
  import { getBaseMovements, getAttackScenarioMovements } from '../data/schemeRegistry';
  import {
    Share2,
    Shield,
    Crosshair,
    ArrowLeftRight,
    Check,
    Copy,
    User
  } from '@lucide/svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
    activeRotation: number;
    currentSchemeId?: string;
    currentScenarioId?: string;
    allSchemes: DefenseSchemeConfig[];
    scenarios: AttackScenario[];
    roster?: Player[];
    attackSchemes?: Record<string, Record<number, PlayerMovement[]>>;
  }

  let {
    open,
    onClose,
    activeRotation = 1,
    currentSchemeId,
    currentScenarioId,
    allSchemes = [],
    scenarios = [],
    roster = [],
    attackSchemes
  }: Props = $props();

  let modalRotation = $state<number>(1);
  let selectedBaseIds = $state<string[]>([]);
  let selectedAttackIds = $state<string[]>([]);
  let isCopied = $state<boolean>(false);

  const availableBaseSchemes = $derived(allSchemes.filter(s => s.rotation === modalRotation));
  const availableScenarios = $derived(scenarios.filter(s => s.rotation === modalRotation));

  function handleSelectModalRotation(rot: number) {
    modalRotation = rot;
    const baseList = allSchemes.filter(s => s.rotation === rot);
    selectedBaseIds = baseList.slice(0, 3).map(s => s.id);
    const attackList = scenarios.filter(s => s.rotation === rot);
    selectedAttackIds = attackList.slice(0, 3).map(s => s.id);
  }

  // Initialize selections when modal opens or activeRotation changes
  $effect(() => {
    if (open) {
      modalRotation = activeRotation;
      const baseList = allSchemes.filter(s => s.rotation === activeRotation);
      const initialBase = currentSchemeId && baseList.some(s => s.id === currentSchemeId) ? [currentSchemeId] : [];
      const remainingBase = baseList.map(s => s.id).filter(id => id !== currentSchemeId).slice(0, 2);
      selectedBaseIds = [...initialBase, ...remainingBase].slice(0, 3);

      const attackList = scenarios.filter(s => s.rotation === activeRotation);
      const initialAttack = currentScenarioId && attackList.some(s => s.id === currentScenarioId) ? [currentScenarioId] : [];
      const remainingAttack = attackList.map(s => s.id).filter(id => id !== currentScenarioId).slice(0, 2);
      selectedAttackIds = [...initialAttack, ...remainingAttack].slice(0, 3);
      isCopied = false;
    }
  });

  function toggleBaseSelection(id: string) {
    if (selectedBaseIds.includes(id)) {
      if (selectedBaseIds.length > 1) {
        selectedBaseIds = selectedBaseIds.filter(x => x !== id);
      }
    } else {
      if (selectedBaseIds.length < 3) {
        selectedBaseIds = [...selectedBaseIds, id];
      }
    }
  }

  function toggleAttackSelection(id: string) {
    if (selectedAttackIds.includes(id)) {
      if (selectedAttackIds.length > 1) {
        selectedAttackIds = selectedAttackIds.filter(x => x !== id);
      }
    } else {
      if (selectedAttackIds.length < 3) {
        selectedAttackIds = [...selectedAttackIds, id];
      }
    }
  }

  function handleCopyShareLink() {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('rot', modalRotation.toString());
    if (selectedBaseIds[0]) url.searchParams.set('base', selectedBaseIds[0]);
    if (selectedAttackIds[0]) url.searchParams.set('attack', selectedAttackIds[0]);
    if (selectedBaseIds.length > 1) url.searchParams.set('base_bundle', selectedBaseIds.join(','));
    if (selectedAttackIds.length > 1) url.searchParams.set('attack_bundle', selectedAttackIds.join(','));
    url.searchParams.set('play', '1');

    const shareUrl = url.toString();
    navigator.clipboard.writeText(shareUrl).then(() => {
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
        onClose();
      }, 1500);
    }).catch(() => {
      prompt('Copy share link:', shareUrl);
    });
  }
</script>

<Dialog
  {open}
  {onClose}
  title="Share Tactical Playbook"
  description="Select up to 3 Base Formations and 3 Defensive Formations to bundle with the active rotation multiplier"
  maxWidth="max-w-2xl"
>
  <div class="flex flex-col gap-5 mt-2 max-h-[75vh] overflow-y-auto pr-1">
    <!-- SECTION 0: ROTATION CONTEXT (TACTICAL MULTIPLIER) -->
    <div class="card bg-base-300/30 border border-base-300 p-3.5 flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs font-bold text-base-content/80 uppercase tracking-wider">
          <ArrowLeftRight class="w-3.5 h-3.5 text-primary" />
          <span>Rotation Context Multiplier</span>
        </div>
        <span class="badge badge-primary badge-soft font-bold text-[10px] py-1">
          {modalRotation === 1 ? 'Man Serving (1 Net)' : 'Woman Serving (2 Net)'}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-1">
        <button
          type="button"
          onclick={() => handleSelectModalRotation(1)}
          class="btn btn-sm {
            modalRotation === 1
              ? 'btn-primary shadow-xs'
              : 'btn-ghost bg-base-200 text-base-content/70'
          } gap-2 text-xs font-bold"
        >
          <span class="w-2 h-2 rounded-full {modalRotation === 1 ? 'bg-primary-content' : 'bg-info'}"></span>
          <span>Man Serving</span>
        </button>

        <button
          type="button"
          onclick={() => handleSelectModalRotation(2)}
          class="btn btn-sm {
            modalRotation === 2
              ? 'btn-primary shadow-xs'
              : 'btn-ghost bg-base-200 text-base-content/70'
          } gap-2 text-xs font-bold"
        >
          <span class="w-2 h-2 rounded-full {modalRotation === 2 ? 'bg-primary-content' : 'bg-secondary'}"></span>
          <span>Woman Serving</span>
        </button>
      </div>
    </div>

    <!-- SECTION 1: BASE FORMATIONS -->
    <div class="flex flex-col gap-2.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs font-bold text-base-content/90">
          <Shield class="w-3.5 h-3.5 text-primary" />
          <span>Base Formation Presets</span>
          <span class="text-[10px] opacity-70 font-normal hidden sm:inline">(Reading Phase)</span>
        </div>
        <span class="badge badge-primary badge-soft font-bold text-[11px] py-1">
          {selectedBaseIds.length} / 3 Selected
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {#each availableBaseSchemes as scheme (scheme.id)}
          {@const isChecked = selectedBaseIds.includes(scheme.id)}
          <button
            type="button"
            onclick={() => toggleBaseSelection(scheme.id)}
            class="p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 {
              isChecked
                ? 'bg-primary/15 border-primary shadow-md ring-1 ring-primary/60'
                : 'bg-base-200/60 border-base-300 opacity-60 hover:opacity-100 hover:border-base-content/30'
            }"
          >
            <div class="flex items-center justify-between gap-1 w-full">
              <span class="font-bold text-xs truncate text-base-content">{scheme.name}</span>
              <div class="w-4 h-4 rounded flex items-center justify-center shrink-0 border {
                isChecked ? 'bg-primary border-primary text-primary-content' : 'border-base-300 bg-base-300'
              }">
                {#if isChecked}
                  <Check class="w-3 h-3 stroke-[3]" />
                {/if}
              </div>
            </div>

            <div class="w-full aspect-[4/3] rounded bg-base-300/40 border border-base-300 overflow-hidden p-0.5">
              <CourtThumbnail
                movements={getBaseMovements(scheme, modalRotation)}
                mode="base"
                {roster}
                active={isChecked}
              />
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- SECTION 2: DEFENSIVE FORMATIONS -->
    <div class="flex flex-col gap-2.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs font-bold text-base-content/90">
          <Crosshair class="w-3.5 h-3.5 text-secondary" />
          <span>Defensive Formation Presets</span>
          <span class="text-[10px] opacity-70 font-normal hidden sm:inline">(Reaction Phase)</span>
        </div>
        <span class="badge badge-secondary badge-soft font-bold text-[11px] py-1">
          {selectedAttackIds.length} / 3 Selected
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {#each availableScenarios as sc (sc.id)}
          {@const isChecked = selectedAttackIds.includes(sc.id)}
          <button
            type="button"
            onclick={() => toggleAttackSelection(sc.id)}
            class="p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 {
              isChecked
                ? 'bg-secondary/15 border-secondary shadow-md ring-1 ring-secondary/60'
                : 'bg-base-200/60 border-base-300 opacity-60 hover:opacity-100 hover:border-base-content/30'
            }"
          >
            <div class="flex items-center justify-between gap-1 w-full">
              <span class="font-bold text-xs truncate text-base-content">{sc.label || sc.name}</span>
              <div class="w-4 h-4 rounded flex items-center justify-center shrink-0 border {
                isChecked ? 'bg-secondary border-secondary text-secondary-content' : 'border-base-300 bg-base-300'
              }">
                {#if isChecked}
                  <Check class="w-3 h-3 stroke-[3]" />
                {/if}
              </div>
            </div>

            <div class="w-full aspect-[4/3] rounded bg-base-300/40 border border-base-300 overflow-hidden p-0.5">
              <CourtThumbnail
                movements={getAttackScenarioMovements(sc.id, modalRotation, attackSchemes)}
                mode="spike"
                scenario={sc}
                {roster}
                active={isChecked}
              />
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="flex items-center justify-between gap-3 pt-4 mt-3 border-t border-base-300">
    <Button variant="secondary" onclick={onClose} class="text-xs">
      Cancel
    </Button>

    <Button
      variant={isCopied ? 'emerald' : 'default'}
      onclick={handleCopyShareLink}
      class="text-xs font-bold flex items-center gap-1.5 px-4 shadow-lg"
    >
      {#if isCopied}
        <Check class="w-4 h-4" />
        <span>Link Copied!</span>
      {:else}
        <Copy class="w-4 h-4" />
        <span>Copy Tactical Link</span>
      {/if}
    </Button>
  </div>
</Dialog>
