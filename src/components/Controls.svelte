<script lang="ts">
  import type { AttackScenario, DefenseSchemeConfig, Player, PlayerMovement } from '../types/volleyball';
  import Button from './ui/Button.svelte';
  import Dialog from './ui/Dialog.svelte';
  import CourtThumbnail from './CourtThumbnail.svelte';
  import { getBaseMovements, getAttackScenarioMovements } from '../data/schemeRegistry';
  import {
    Shield,
    Zap,
    RotateCcw,
    BookmarkPlus,
    Trash2,
    Pencil,
    Check,
    Box,
    Share2,
    Play,
    Users,
    User,
    RefreshCw
  } from '@lucide/svelte';

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
    onRenameScheme?: (schemeId: string, newName: string) => void;
    onQuickSaveBaseScheme?: () => void;

    currentPositionMode: 'base' | 'spike';
    onSelectPositionMode: (mode: 'base' | 'spike') => void;
    onPlayTransition?: () => void;
    onShare?: () => void;

    isBaseModified?: boolean;
    isAttackModified?: boolean;
    onResetBase?: () => void;
    onResetAttack?: () => void;
    onOpenSaveModal?: (target: 'base' | 'attack') => void;
    onQuickSaveAdjustment?: () => void;
    onDeleteAdjustment?: (scenarioId: string) => void;
    onRenameAdjustment?: (scenarioId: string, newName: string) => void;
    onOpenRosterModal?: () => void;

    roster?: Player[];
    attackSchemes?: Record<string, Record<number, PlayerMovement[]>>;

    is3DView: boolean;
    onToggle3D: () => void;
    showZones: boolean;
    onToggleZones: () => void;
    showBlockShadow: boolean;
    onToggleBlockShadow: () => void;
    showAllArrows?: boolean;
    onToggleAllArrows?: () => void;
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
    onPlayTransition,
    onShare,
    isBaseModified = false,
    isAttackModified = false,
    onResetBase,
    onResetAttack,
    onOpenSaveModal,
    onQuickSaveAdjustment,
    onDeleteAdjustment,
    onRenameAdjustment,
    onOpenRosterModal,
    roster = [],
    attackSchemes,
    is3DView,
    onToggle3D,
    showZones,
    onToggleZones,
    showBlockShadow,
    onToggleBlockShadow,
    showAllArrows = false,
    onToggleAllArrows,
  }: Props = $props();

  const customAttackList = $derived(scenarios.filter(s => s.isCustom));
  const presetAttackList = $derived(scenarios.filter(s => !s.isCustom));
  const allAttackPresets = $derived([...presetAttackList, ...customAttackList]);

  const customBaseList = $derived((allSchemes || []).filter(s => s.isCustom));
  const presetBaseList = $derived((allSchemes || []).filter(s => !s.isCustom));
  const allBasePresets = $derived([...presetBaseList, ...customBaseList]);

  // Rename preset modal state
  let renameModalState = $state<{
    open: boolean;
    type: 'base' | 'attack';
    id: string;
    name: string;
  }>({
    open: false,
    type: 'base',
    id: '',
    name: ''
  });

  function openRenameModal(type: 'base' | 'attack', id: string, currentName: string) {
    renameModalState = {
      open: true,
      type,
      id,
      name: currentName
    };
  }

  function closeRenameModal() {
    renameModalState.open = false;
  }

  function handleConfirmRename() {
    const trimmed = renameModalState.name.trim();
    if (!trimmed) return;
    if (renameModalState.type === 'base') {
      onRenameScheme?.(renameModalState.id, trimmed);
    } else {
      onRenameAdjustment?.(renameModalState.id, trimmed);
    }
    closeRenameModal();
  }
</script>

<div class="flex flex-col gap-4 w-full">
  <!-- 1. ROTATION (MEN SERVING OR WOMEN SERVING) - FIRST BLOCK OUTSIDE TACTICAL SETUP -->
  <div class="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl transition-all">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-100">
        <RefreshCw class="w-4 h-4 text-sky-400" />
        <span>Rotation</span>
      </div>
      <span class="text-[10px] text-blue-400 font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 shadow-sm">
        {rotation === 1 ? 'Men Serving' : 'Women Serving'}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <button
        type="button"
        onclick={() => onChangeRotation(1)}
        class="py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-0.5 transition-all border text-center {
          rotation === 1
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 border-blue-400 ring-2 ring-blue-400/60 scale-[1.01]'
            : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
        }"
      >
        <span class="font-black text-xs">Men Serving</span>
        <span class="text-[10px] opacity-80 font-normal">1 Man on Net • 2 Women Front</span>
      </button>

      <button
        type="button"
        onclick={() => onChangeRotation(2)}
        class="py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-0.5 transition-all border text-center {
          rotation === 2
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 border-blue-400 ring-2 ring-blue-400/60 scale-[1.01]'
            : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
        }"
      >
        <span class="font-black text-xs">Women Serving</span>
        <span class="text-[10px] opacity-80 font-normal">2 Men on Net • 1 Woman Front</span>
      </button>
    </div>
  </div>

  <!-- 2. TACTICAL SETUP (DEFINES ALL VARIABLES & PRESETS) -->
  <div class="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl transition-all">
    <!-- Header with Title, Status Badges & Action Buttons -->
    <div class="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-800/80">
      <div class="flex items-center gap-2">
        {#if currentPositionMode === 'base'}
          <Shield class="w-4 h-4 text-blue-400" />
        {:else}
          <Zap class="w-4 h-4 text-amber-400" />
        {/if}
        <span class="text-xs font-black uppercase tracking-wider text-slate-100">
          Tactical Setup
        </span>
      </div>

      <div class="flex items-center gap-1.5 flex-wrap">
        <!-- Play Transition Animation Button -->
        {#if onPlayTransition}
          <button
            type="button"
            onclick={onPlayTransition}
            class="h-7 px-2.5 text-xs rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/80 border border-emerald-400/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Play transition animation from Base Reading to Spike Defense"
          >
            <Play class="w-3.5 h-3.5 fill-current" />
            <span>Play</span>
          </button>
        {/if}

        <!-- Share Tactic Button -->
        {#if onShare}
          <button
            type="button"
            onclick={onShare}
            class="h-7 px-2.5 text-xs rounded-md bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white font-bold flex items-center gap-1.5 border border-blue-500/40 transition-all"
            title="Share this tactic link (loads presets and plays animation)"
          >
            <Share2 class="w-3.5 h-3.5 text-blue-400" />
            <span>Share</span>
          </button>
        {/if}

        <!-- Lineup Button -->
        {#if onOpenRosterModal}
          <button
            type="button"
            onclick={onOpenRosterModal}
            class="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 px-2 h-7 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            title="Edit 6-player roster"
          >
            <Users class="w-3 h-3 text-indigo-400" />
            <span class="hidden sm:inline">Lineup</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- STAGE POSITION (BASE POSITION VS SET / SPIKE POSITION) -->
    <div class="flex flex-col gap-2.5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 transition-all">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
          <Zap class="w-3.5 h-3.5 text-amber-400" />
          <span>Stage Position</span>
        </div>
        <span class="text-[10px] text-slate-400 font-medium">
          {currentPositionMode === 'base' ? 'Start (0% Transition)' : 'End (100% Transition)'}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          onclick={() => onSelectPositionMode('base')}
          class="py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition-all duration-200 {
            currentPositionMode === 'base'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md shadow-blue-950/80 ring-2 ring-blue-400/60 scale-[1.01]'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }"
        >
          <Shield class="w-4 h-4 text-blue-300" />
          <span>Base Position</span>
        </button>

        <button
          type="button"
          onclick={() => onSelectPositionMode('spike')}
          class="py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition-all duration-200 {
            currentPositionMode === 'spike'
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-400 shadow-md shadow-rose-950/80 ring-2 ring-rose-400/60 scale-[1.01]'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          }"
        >
          <Zap class="w-4 h-4 text-amber-300" />
          <span>Set / Spike Position</span>
        </button>
      </div>
    </div>

    <!-- BASE DEFENSE PRESETS (ONLY SELECTABLE IN BASE POSITION MODE) -->
    <div class="flex flex-col gap-3 p-3.5 rounded-xl border transition-all duration-200 {
      currentPositionMode === 'base'
        ? 'bg-slate-950/70 border-slate-800'
        : 'bg-slate-950/30 border-slate-850/50 opacity-45'
    }">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider {currentPositionMode === 'base' ? 'text-blue-300' : 'text-slate-500'}">
          <Shield class="w-3.5 h-3.5 {currentPositionMode === 'base' ? 'text-blue-400' : 'text-slate-500'}" />
          <span>Base Defense Presets</span>
          {#if currentPositionMode === 'base'}
            <span class="text-[9px] font-bold text-blue-400 bg-blue-950/90 px-1.5 py-0.5 rounded border border-blue-800 lowercase">
              active
            </span>
          {:else}
            <span class="text-[9px] font-medium text-slate-500 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
              only in base position
            </span>
          {/if}
        </div>
      </div>

      <!-- Modified Base Position Action Alert (Shown if positions are off preset in base mode) -->
      {#if isBaseModified && currentPositionMode === 'base'}
        <div class="p-2.5 rounded-xl bg-blue-950/70 border border-blue-500/50 flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
          <div class="flex items-center gap-2 text-xs text-blue-200">
            <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span class="font-bold">Base positions modified</span>
          </div>

          <div class="flex items-center gap-1.5">
            <Button
              variant="default"
              size="sm"
              onclick={() => onOpenSaveModal?.('base')}
              class="h-6 px-2.5 text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 shadow"
            >
              <BookmarkPlus class="w-3 h-3" />
              <span>Save as Custom</span>
            </Button>

            {#if currentScheme?.isCustom && onQuickSaveBaseScheme}
              <Button
                variant="secondary"
                size="sm"
                onclick={onQuickSaveBaseScheme}
                class="h-6 px-2 text-[11px] bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 font-bold"
                title="Quick save changes to this preset"
              >
                <Check class="w-3 h-3" />
                <span>Save</span>
              </Button>
            {/if}

            {#if onResetBase}
              <Button
                variant="outline"
                size="sm"
                onclick={onResetBase}
                class="h-6 px-2 text-[11px] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                title="Reset positions back to preset"
              >
                <RotateCcw class="w-2.5 h-2.5" />
                <span>Reset</span>
              </Button>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Presets Grid: Built-ins first, then Custom appended at the end -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {#each allBasePresets as scheme (scheme.id)}
          {@const isCurrent = currentScheme?.id === scheme.id}
          {@const isCustom = Boolean(scheme.isCustom)}
          <div class="relative group">
            <button
              type="button"
              disabled={currentPositionMode !== 'base'}
              onclick={() => onChangeScheme?.(scheme)}
              class="w-full p-2.5 rounded-xl border transition-all duration-150 flex flex-col items-center gap-1.5 {
                currentPositionMode !== 'base'
                  ? 'cursor-not-allowed pointer-events-none opacity-60 bg-slate-950/40 border-slate-800/50 text-slate-400'
                  : isCurrent
                  ? 'bg-blue-600/25 border-blue-400 text-white shadow-lg ring-2 ring-blue-500/60 scale-[1.02]'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700'
              }"
              title={currentPositionMode !== 'base' ? 'Select Base Position to choose base defense presets' : scheme.name}
            >
              <!-- Top Row: Name and optional User badge, in line with action buttons -->
              <div class="flex items-center justify-between w-full gap-1 min-h-[22px] px-0.5">
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                  {#if isCustom}
                    <User class="w-3 h-3 text-blue-400 shrink-0" />
                  {/if}
                  <span class="font-bold text-xs truncate text-left {isCurrent && currentPositionMode === 'base' ? 'text-white' : 'text-slate-300'}">
                    {scheme.name}
                  </span>
                </div>
                {#if isCustom && isCurrent && currentPositionMode === 'base'}
                  <!-- Spacer reserving room for the absolute action buttons -->
                  <div class="w-12 shrink-0"></div>
                {/if}
              </div>

              <!-- Court Thumbnail -->
              <div class="relative w-full aspect-square max-w-[84px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 group-hover:border-slate-700 shadow-inner p-0.5">
                <CourtThumbnail
                  movements={getBaseMovements(scheme, rotation)}
                  mode="base"
                  {roster}
                  active={isCurrent && currentPositionMode === 'base'}
                />
              </div>
            </button>

            <!-- Action buttons: ONLY when custom AND selected, and in base mode -->
            {#if isCustom && isCurrent && currentPositionMode === 'base'}
              <div class="absolute top-2 right-2 flex items-center gap-1 z-10 animate-fadeIn">
                {#if onRenameScheme}
                  <button
                    type="button"
                    onclick={(e) => {
                      e.stopPropagation();
                      openRenameModal('base', scheme.id, scheme.name);
                    }}
                    class="p-1 rounded-md text-white bg-blue-600 hover:bg-blue-500 shadow-lg border border-blue-400/80 transition-all cursor-pointer"
                    title="Rename this preset"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                {/if}
                {#if onDeleteScheme}
                  <button
                    type="button"
                    onclick={(e) => {
                      e.stopPropagation();
                      onDeleteScheme(scheme.id);
                    }}
                    class="p-1 rounded-md text-white bg-rose-600 hover:bg-rose-500 shadow-lg border border-rose-400/80 transition-all cursor-pointer"
                    title="Delete this custom preset"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- ATTACK PRESETS (ONLY SELECTABLE IN SPIKE POSITION MODE) -->
    <div class="flex flex-col gap-3 p-3.5 rounded-xl border transition-all duration-200 {
      currentPositionMode === 'spike'
        ? 'bg-slate-950/70 border-slate-800'
        : 'bg-slate-950/30 border-slate-850/50 opacity-45'
    }">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider {currentPositionMode === 'spike' ? 'text-rose-300' : 'text-slate-500'}">
          <Zap class="w-3.5 h-3.5 {currentPositionMode === 'spike' ? 'text-rose-400' : 'text-slate-500'}" />
          <span>Attack Presets</span>
          {#if currentPositionMode === 'spike'}
            <span class="text-[9px] font-bold text-rose-400 bg-rose-950/90 px-1.5 py-0.5 rounded border border-rose-800 lowercase">
              active
            </span>
          {:else}
            <span class="text-[9px] font-medium text-slate-500 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
              only in spike position
            </span>
          {/if}
        </div>
      </div>

      <!-- Modified Attack Action Alert (Shown if positions/attacker/ball are off preset in spike mode) -->
      {#if isAttackModified && currentPositionMode === 'spike'}
        <div class="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
          <div class="flex items-center gap-2 text-xs text-rose-200">
            <span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <span class="font-bold">Attack defense modified</span>
          </div>

          <div class="flex items-center gap-1.5">
            <Button
              variant="default"
              size="sm"
              onclick={() => onOpenSaveModal?.('attack')}
              class="h-6 px-2.5 text-[11px] bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 shadow"
            >
              <BookmarkPlus class="w-3 h-3" />
              <span>Save as Custom</span>
            </Button>

            {#if currentScenario?.isCustom && onQuickSaveAdjustment}
              <Button
                variant="secondary"
                size="sm"
                onclick={onQuickSaveAdjustment}
                class="h-6 px-2 text-[11px] bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 font-bold"
                title="Quick save changes to this custom adjustment"
              >
                <Check class="w-3 h-3" />
                <span>Save</span>
              </Button>
            {/if}

            {#if onResetAttack}
              <Button
                variant="outline"
                size="sm"
                onclick={onResetAttack}
                class="h-6 px-2 text-[11px] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                title="Reset attack positions back to preset"
              >
                <RotateCcw class="w-2.5 h-2.5" />
                <span>Reset</span>
              </Button>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Presets Grid: Built-ins first, then Custom appended at the end -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {#each allAttackPresets as sc (sc.id)}
          {@const isCurrent = currentScenario.id === sc.id}
          {@const isCustom = Boolean(sc.isCustom)}
          <div class="relative group">
            <button
              type="button"
              disabled={currentPositionMode !== 'spike'}
              onclick={() => onSelectScenario(sc)}
              class="w-full p-2 rounded-xl border transition-all duration-150 flex flex-col items-center gap-1.5 {
                currentPositionMode !== 'spike'
                  ? 'cursor-not-allowed pointer-events-none opacity-60 bg-slate-950/40 border-slate-800/50 text-slate-400'
                  : isCurrent
                  ? 'bg-rose-600/25 border-rose-400 text-white shadow-lg ring-2 ring-rose-500/60 scale-[1.02]'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700'
              }"
              title={currentPositionMode !== 'spike' ? 'Select Set / Spike Position to choose attack presets' : (sc.label || sc.name)}
            >
              <!-- Top Row: Name and optional User badge, in line with action buttons -->
              <div class="flex items-center justify-between w-full gap-1 min-h-[22px] px-0.5">
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                  {#if isCustom}
                    <User class="w-3 h-3 text-amber-400 shrink-0" />
                  {/if}
                  <span class="font-bold text-xs truncate text-left {isCurrent && currentPositionMode === 'spike' ? 'text-white' : 'text-slate-300'}">
                    {sc.label || sc.name}
                  </span>
                </div>
                {#if isCustom && isCurrent && currentPositionMode === 'spike'}
                  <!-- Spacer reserving room for the absolute action buttons -->
                  <div class="w-12 shrink-0"></div>
                {/if}
              </div>

              <!-- Court Thumbnail -->
              <div class="relative w-full aspect-square max-w-[74px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 group-hover:border-slate-700 shadow-inner p-0.5">
                <CourtThumbnail
                  movements={getAttackScenarioMovements(sc.id, rotation, attackSchemes)}
                  mode="spike"
                  scenario={sc}
                  {roster}
                  active={isCurrent && currentPositionMode === 'spike'}
                />
              </div>
            </button>

            <!-- Action buttons: ONLY when custom AND selected, and in spike mode -->
            {#if isCustom && isCurrent && currentPositionMode === 'spike'}
              <div class="absolute top-1.5 right-1.5 flex items-center gap-1 z-10 animate-fadeIn">
                {#if onRenameAdjustment}
                  <button
                    type="button"
                    onclick={(e) => {
                      e.stopPropagation();
                      openRenameModal('attack', sc.id, sc.label || sc.name);
                    }}
                    class="p-1 rounded-md text-white bg-amber-600 hover:bg-amber-500 shadow-lg border border-amber-400/80 transition-all cursor-pointer"
                    title="Rename this preset"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                {/if}
                {#if onDeleteAdjustment}
                  <button
                    type="button"
                    onclick={(e) => {
                      e.stopPropagation();
                      onDeleteAdjustment(sc.id);
                    }}
                    class="p-1 rounded-md text-white bg-rose-600 hover:bg-rose-500 shadow-lg border border-rose-400/80 transition-all cursor-pointer"
                    title="Delete this custom preset"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- 2. VIEW OPTIONS (3D, ZONES, ALL ARROWS, BLOCK SHADOW) -->
  <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
    <span class="text-[11px] font-semibold text-slate-400">View Options:</span>
    <div class="flex items-center gap-1.5">
      <button
        type="button"
        onclick={onToggleZones}
        class="px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-colors {
          showZones
            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-semibold'
            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
        }"
      >
        <span>Zones</span>
      </button>

      <button
        type="button"
        onclick={onToggleAllArrows}
        class="px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-colors {
          showAllArrows
            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold'
            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
        }"
        title="Show all player transition arrows"
      >
        <span>All Arrows</span>
      </button>

      <button
        type="button"
        onclick={onToggleBlockShadow}
        class="px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-colors {
          showBlockShadow
            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-semibold'
            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
        }"
      >
        <span>Block Shadow</span>
      </button>

      <button
        type="button"
        onclick={onToggle3D}
        class="px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-colors {
          is3DView
            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-bold'
            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
        }"
      >
        <Box class="w-3.5 h-3.5" />
        <span>3D</span>
      </button>
    </div>
  </div>
</div>

<!-- RENAME PRESET MODAL -->
<Dialog
  open={renameModalState.open}
  onClose={closeRenameModal}
  title={renameModalState.type === 'base' ? 'Rename Base Defense Preset' : 'Rename Attack Preset'}
  description="Update the name of this custom preset"
  maxWidth="max-w-md"
>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleConfirmRename();
    }}
    class="flex flex-col gap-4 mt-1"
  >
    <div>
      <label for="rename-preset-input" class="block text-xs font-semibold text-slate-300 mb-1.5">
        Preset Name
      </label>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        id="rename-preset-input"
        type="text"
        bind:value={renameModalState.name}
        placeholder="Enter preset name"
        class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white text-sm outline-none transition-all"
        required
        autofocus
      />
    </div>

    <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
      <Button
        type="button"
        variant="secondary"
        onclick={closeRenameModal}
        class="text-xs"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="default"
        disabled={!renameModalState.name.trim()}
        class="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold"
      >
        Save Name
      </Button>
    </div>
  </form>
</Dialog>
