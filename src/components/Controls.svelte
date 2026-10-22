<script lang="ts">
  import type { AttackScenario, DefenseSchemeConfig, CoedBlockMode } from '../types/volleyball';
  import Button from './ui/Button.svelte';
  import Badge from './ui/Badge.svelte';
  import {
    Shield,
    Zap,
    RotateCcw,
    Edit3,
    BookmarkPlus,
    Trash2,
    Check,
    Move,
    Box,
    Layers,
    Film,
    Users,
    FileCode,
    SlidersHorizontal
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
    onOpenJsonModal?: () => void;

    coedBlockMode?: CoedBlockMode;
    onChangeCoedBlockMode?: (mode: CoedBlockMode) => void;

    currentPositionMode: 'base' | 'spike';
    onSelectPositionMode: (mode: 'base' | 'spike') => void;

    isEditMode?: boolean;
    onToggleEditMode?: () => void;
    editModeTarget?: 'defense' | 'base';
    onChangeEditModeTarget?: (target: 'defense' | 'base') => void;
    onOpenSaveModal?: () => void;
    onQuickSaveAdjustment?: () => void;
    onDeleteAdjustment?: (scenarioId: string) => void;
    onOpenExportGifModal?: () => void;
    onOpenRosterModal?: () => void;

    is3DView: boolean;
    onToggle3D: () => void;
    showZones: boolean;
    onToggleZones: () => void;
    showBlockShadow: boolean;
    onToggleBlockShadow: () => void;
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
    onOpenJsonModal,
    coedBlockMode = 'single_man',
    onChangeCoedBlockMode,
    currentPositionMode = 'base',
    onSelectPositionMode,
    isEditMode = false,
    onToggleEditMode,
    editModeTarget = 'defense',
    onChangeEditModeTarget,
    onOpenSaveModal,
    onQuickSaveAdjustment,
    onDeleteAdjustment,
    onOpenExportGifModal,
    onOpenRosterModal,
    is3DView,
    onToggle3D,
    showZones,
    onToggleZones,
    showBlockShadow,
    onToggleBlockShadow,
  }: Props = $props();

  const customList = $derived(scenarios.filter(s => s.isCustom));
  const presetList = $derived(scenarios.filter(s => !s.isCustom));
</script>

<div class="flex flex-col gap-4 w-full">
  <!-- 1. TEAM ROTATION (R1 TO R6) -->
  <div class="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <RotateCcw class="w-3.5 h-3.5 text-blue-400" />
        <span class="text-xs font-bold text-slate-200 uppercase tracking-wide">Team Rotation:</span>
      </div>
      <div class="flex items-center gap-2">
        {#if onOpenRosterModal}
          <button
            type="button"
            onclick={onOpenRosterModal}
            class="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
            title="Edit 6-player roster"
          >
            <Users class="w-3 h-3 text-indigo-400" />
            <span>Lineup</span>
          </button>
        {/if}
        <span class="text-xs font-black text-blue-400 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
          R{rotation}
        </span>
      </div>
    </div>

    <!-- 6 rotation buttons -->
    <div class="grid grid-cols-6 gap-1.5 pt-0.5">
      {#each [1, 2, 3, 4, 5, 6] as r}
        {@const isActive = rotation === r}
        <button
          type="button"
          onclick={() => onChangeRotation(r)}
          class="py-2.5 rounded-xl font-black text-xs flex items-center justify-center transition-all {
            isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 ring-2 ring-blue-400 scale-[1.02]'
              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }"
        >
          R{r}
        </button>
      {/each}
    </div>
  </div>

  <!-- 2. DEFENSIVE SYSTEM & COED BLOCK RULES -->
  <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col gap-3">
    <!-- Scheme Selector -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wide">
        <Shield class="w-3.5 h-3.5 text-indigo-400" />
        <span>Defensive Scheme:</span>
      </div>

      {#if onOpenJsonModal}
        <button
          type="button"
          onclick={onOpenJsonModal}
          class="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
          title="Inspect or edit JSON coordinates"
        >
          <FileCode class="w-3 h-3 text-amber-400" />
          <span>JSON</span>
        </button>
      {/if}
    </div>

    {#if allSchemes.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {#each allSchemes as scheme}
          {@const isCurrent = currentScheme?.id === scheme.id}
          <button
            type="button"
            onclick={() => onChangeScheme?.(scheme)}
            class="px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold border transition-all truncate {
              isCurrent
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
            }"
            title={scheme.name}
          >
            <div class="truncate">{scheme.name}</div>
          </button>
        {/each}
      </div>
    {/if}

    <!-- COED Blocking Strategy Toggle -->
    {#if onChangeCoedBlockMode}
      <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <span class="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <SlidersHorizontal class="w-3 h-3 text-cyan-400" />
          COED Block:
        </span>

        <div class="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            type="button"
            onclick={() => onChangeCoedBlockMode('single_man')}
            class="px-2 py-0.5 rounded font-bold transition-all {
              coedBlockMode === 'single_man'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }"
            title="Solo man blocks; women pull off net"
          >
            Solo Man
          </button>
          <button
            type="button"
            onclick={() => onChangeCoedBlockMode('double_if_possible')}
            class="px-2 py-0.5 rounded font-bold transition-all {
              coedBlockMode === 'double_if_possible'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }"
            title="Double block if 2 men in front row"
          >
            Double (2M)
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- 3. TACTICAL ADJUSTMENTS & EDIT MODE -->
  <div class="flex flex-col gap-3.5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg {
    isEditMode ? 'ring-2 ring-amber-500/50 border-amber-500/40' : ''
  }">
    <!-- Header with Edit Mode & Save As New -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <Zap class="w-4 h-4 text-amber-400" />
        <span class="text-xs font-bold uppercase tracking-wider text-slate-200">
          Tactical Adjustments:
        </span>
        {#if currentScenario.isCustom}
          <Badge variant="warning" class="text-[9px]">Custom</Badge>
        {/if}
      </div>

      <div class="flex items-center gap-1.5">
        <!-- Edit Mode Toggle Button -->
        <Button
          variant={isEditMode ? 'default' : 'outline'}
          size="sm"
          onclick={onToggleEditMode}
          class="h-7 px-2.5 text-xs font-bold {
            isEditMode
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950 ring-2 ring-amber-400'
              : 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
          }"
        >
          <Edit3 class="w-3.5 h-3.5" />
          <span>{isEditMode ? 'Exit Edit' : 'Edit Mode'}</span>
        </Button>

        <!-- Save As New Preset Button -->
        <Button
          variant="outline"
          size="sm"
          onclick={onOpenSaveModal}
          class="h-7 px-2 text-xs border-blue-500/50 text-blue-300 hover:bg-blue-950/50 flex items-center gap-1 font-semibold"
          title="Save current attack and defending positions as a new preset"
        >
          <BookmarkPlus class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Save As New</span>
        </Button>

        <!-- Export GIF Animation Button -->
        {#if onOpenExportGifModal}
          <Button
            variant="outline"
            size="sm"
            onclick={onOpenExportGifModal}
            class="h-7 px-2 text-xs border-amber-500/50 text-amber-300 hover:bg-amber-950/50 flex items-center gap-1 font-semibold"
            title="Export court transition animation as an animated GIF"
          >
            <Film class="w-3.5 h-3.5 text-amber-400" />
            <span class="hidden sm:inline">Export GIF</span>
          </Button>
        {/if}
      </div>
    </div>

    <!-- STAGE POSITION BUTTONS INSIDE TACTICAL ADJUSTMENTS BLOCK -->
    <div class="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-300">
          Stage Position:
        </span>
        <span class="text-[10px] font-medium text-slate-400">
          {currentPositionMode === 'base' ? 'Reading Base Position' : 'Defending Spiked Ball'}
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

    <!-- Active Edit Mode Toolbar -->
    {#if isEditMode}
      <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex flex-col gap-2.5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Move class="w-3.5 h-3.5" />
            <span>Dragging Mode:</span>
          </div>

          <!-- Toggle: Base Position vs Defending Position -->
          <div class="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onclick={() => onChangeEditModeTarget?.('base')}
              class="px-2.5 py-1 rounded text-xs font-bold transition-all {
                editModeTarget === 'base'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }"
            >
              Base Pos
            </button>
            <button
              type="button"
              onclick={() => onChangeEditModeTarget?.('defense')}
              class="px-2.5 py-1 rounded text-xs font-bold transition-all {
                editModeTarget === 'defense'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }"
            >
              Defending Pos
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-amber-500/20 text-[11px] text-slate-300">
          <span>
            Drag the <strong>attacker (red)</strong>, <strong>target circle</strong>, or <strong>players</strong>.
          </span>

          <div class="flex items-center gap-1.5">
            {#if currentScenario.isCustom}
              <Button
                variant="secondary"
                size="sm"
                onclick={onQuickSaveAdjustment}
                class="h-6 px-2 text-[11px] bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50"
              >
                <Check class="w-3 h-3" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onclick={() => onDeleteAdjustment?.(currentScenario.id)}
                class="h-6 px-1.5 text-[11px] border-rose-500/40 text-rose-300 hover:bg-rose-950/40"
                title="Delete this custom adjustment"
              >
                <Trash2 class="w-3 h-3" />
              </Button>
            {/if}
            <Button
              variant="default"
              size="sm"
              onclick={onOpenSaveModal}
              class="h-6 px-2 text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              <BookmarkPlus class="w-3 h-3" />
              Save As New
            </Button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Custom Adjustments Section (if any exist) -->
    {#if customList.length > 0}
      <div class="flex flex-col gap-1.5 pt-1">
        <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400">
          <span>My Custom Adjustments ({customList.length}):</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {#each customList as sc}
            {@const isCurrent = currentScenario.id === sc.id}
            <div class="relative group">
              <button
                type="button"
                onclick={() => onSelectScenario(sc)}
                class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150 {
                  isCurrent
                    ? 'bg-amber-600/25 border-amber-500 text-white shadow ring-1 ring-amber-500/50'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }"
              >
                <div class="font-bold truncate pr-3 flex items-center justify-between">
                  <span>{sc.label}</span>
                  <span class="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">★</span>
                </div>
                <div class="text-[10px] text-slate-400 truncate">{sc.name.split('(')[0]}</div>
              </button>
              {#if onDeleteAdjustment}
                <button
                  type="button"
                  onclick={(e) => {
                    e.stopPropagation();
                    onDeleteAdjustment(sc.id);
                  }}
                  class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 bg-slate-900/90 rounded transition-all"
                  title="Delete adjustment"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Standard Presets Section -->
    <div class="flex flex-col gap-1.5 pt-1">
      <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <span>Attack Presets:</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {#each presetList as sc}
          {@const isCurrent = currentScenario.id === sc.id}
          <button
            type="button"
            onclick={() => onSelectScenario(sc)}
            class="text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150 {
              isCurrent
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }"
          >
            <div class="font-bold truncate">{sc.label}</div>
            <div class="text-[10px] text-slate-400 truncate">{sc.name.split('(')[0]}</div>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- 4. VIEW OPTIONS (3D, ZONES, BLOCK SHADOW) -->
  <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
    <span class="text-[11px] font-semibold text-slate-400">View Options:</span>
    <div class="flex items-center gap-1.5">
      <button
        type="button"
        onclick={onToggleZones}
        class="px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-colors {
          showZones
            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-semibold'
            : 'bg-slate-950 border-slate-800 text-slate-500'
        }"
      >
        <span>Zones</span>
      </button>

      <button
        type="button"
        onclick={onToggleBlockShadow}
        class="px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-colors {
          showBlockShadow
            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-semibold'
            : 'bg-slate-950 border-slate-800 text-slate-500'
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
            : 'bg-slate-950 border-slate-800 text-slate-500'
        }"
      >
        <Box class="w-3.5 h-3.5" />
        <span>3D</span>
      </button>
    </div>
  </div>
</div>
