<script lang="ts">
  import { onMount } from 'svelte';
  import { strategyStore } from './data/strategyStore.svelte';
  import { parseSharedUrl } from './data/shareCodec';
  import TopHeader from './components/layout/TopHeader.svelte';
  import Strategies from './components/layout/Strategies.svelte';
  import Court from './components/layout/Court.svelte';
  import Phases from './components/layout/Phases.svelte';
  import PhaseTogglerCard from './components/controls/PhaseTogglerCard.svelte';
  import CourtOverlayControls from './components/court/CourtOverlayControls.svelte';
  import ShareModal from './components/modals/ShareModal.svelte';
  import ImportSharedModal from './components/modals/ImportSharedModal.svelte';
  import type { AttackScenario, Zone } from './types/volleyball';
  import { Menu, Plus, X, ChevronRight, Layers, Pencil, Play, RotateCcw, Check, Copy } from '@lucide/svelte';

  // Local UI / view states
  let isDarkMode = $state<boolean>(true);
  let isShareModalOpen = $state<boolean>(false);
  let isImportSharedModalOpen = $state<boolean>(false);
  let isMobileDrawerOpen = $state<boolean>(false);
  let isStrategiesCollapsed = $state<boolean>(false);
  let selectedPlayerId = $state<string | null>(null);

  // Overlay toggles
  let showBlockShadow = $state<boolean>(true);
  let showZones = $state<boolean>(true);
  let showAllArrows = $state<boolean>(false);
  let showCoverageRange = $state<boolean>(true);
  let is3DView = $state<boolean>(false);

  // Animation progress between Base (0) and Defensive (1)
  let progress = $state<number>(0);
  let animFrameId: number | null = null;

  // Theme & Shared URL setup
  onMount(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        isDarkMode = savedTheme === 'dark';
      }
    } catch {}

    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('theme-light', !isDarkMode);

    // Check shared URL: isolate shared strategies in read-only mode
    const shared = parseSharedUrl();
    if (shared && shared.strategies.length > 0) {
      strategyStore.enterSharedMode(shared.strategies, shared.title);
    }
  });

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('theme-light', !isDarkMode);
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }

  let isPlayingTransition = $state<boolean>(false);
  let customDurationMs: number | null = null;

  const canSave = $derived.by(() => {
    return Boolean(strategyStore.draft?.name.trim());
  });

  // Smooth animation between Base (0) and Defensive (1)
  function animateToPosition(targetProgress: number, duration = 400) {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    const startProgress = progress;
    const distance = targetProgress - startProgress;
    if (Math.abs(distance) < 0.001) {
      progress = targetProgress;
      isPlayingTransition = false;
      return;
    }

    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      progress = startProgress + distance * eased;

      if (t < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        progress = targetProgress;
        animFrameId = null;
        isPlayingTransition = false;
      }
    }

    animFrameId = requestAnimationFrame(step);
  }

  // Synchronize animation when visible phase changes
  $effect(() => {
    const target = strategyStore.visiblePhase === 'base' ? 0 : 1;
    const dur = customDurationMs ?? 400;
    customDurationMs = null;
    animateToPosition(target, dur);
  });

  function handlePlayTransition() {
    progress = 0;
    isPlayingTransition = true;
    customDurationMs = 2200; // >= 2 seconds transition animation
    strategyStore.setVisiblePhase('defense');
  }

  function handleResetTransition() {
    isPlayingTransition = false;
    customDurationMs = 400;
    strategyStore.setVisiblePhase('base');
  }

  function handleUpdatePosition(playerId: string, pos: { x: number; y: number }, isDefense: boolean) {
    const movement = strategyStore.movements.find(m => m.playerId === playerId);
    if (!movement) return;
    strategyStore.updateDefenderPosition(movement.zone as Zone, pos, isDefense);
  }

  function handleUpdateScenario(updates: Partial<AttackScenario>) {
    strategyStore.updateOpponentScenario({
      setterX: updates.setterX,
      setterY: updates.setterY,
      attackerX: updates.attackerX,
      attackerY: updates.attackerY,
      targetX: updates.targetX,
      targetY: updates.targetY
    });
  }

  // Responsive column spans based on Read Mode (Expanded vs Collapsed) vs Edit Mode
  const leftColSpan = $derived.by(() => {
    if (strategyStore.isEditing) {
      return 'flex lg:col-span-3';
    }
    return isStrategiesCollapsed ? 'hidden lg:flex lg:col-span-1' : 'hidden lg:flex lg:col-span-3';
  });

  const rightWorkspaceSpan = $derived.by(() => {
    if (strategyStore.isEditing) {
      return 'lg:col-span-9';
    }
    return isStrategiesCollapsed ? 'lg:col-span-11' : 'lg:col-span-9';
  });
</script>

<div class="min-h-screen bg-base-100 text-base-content flex flex-col selection:bg-primary selection:text-primary-content relative">
  <!-- Top Navigation Header -->
  <TopHeader
    {isDarkMode}
    canShare={strategyStore.strategies.length > 0 && !strategyStore.isEditing}
    isSharedMode={strategyStore.isSharedMode}
    sharedTitle={strategyStore.sharedTitle}
    onToggleTheme={toggleTheme}
    onShare={() => { isShareModalOpen = true; }}
    onOpenImportShared={() => { isImportSharedModalOpen = true; }}
    onExitSharedMode={() => { strategyStore.exitSharedModeToMyBoard(); }}
  />

  <!-- Main Workspace -->
  <main class="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
    
    <!-- MOBILE STRATEGIES BAR (Visible above court on < lg in Read Mode) -->
    {#if !strategyStore.isEditing}
      <div class="lg:hidden w-full">
        <button
          type="button"
          onclick={() => { isMobileDrawerOpen = true; }}
          class="w-full p-3 rounded-xl border border-base-300 bg-base-200/70 hover:bg-base-200 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center text-primary shrink-0">
              <Menu class="w-4 h-4" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-[10px] font-bold uppercase tracking-wider text-base-content/60">
                Strategies ({strategyStore.strategies.length})
              </span>
              {#if strategyStore.hasActiveOrDraft}
                <div class="flex items-center gap-1.5 min-w-0">
                  {#if strategyStore.currentStrategy.rotation === 2}
                    <svg class="w-3.5 h-3.5 text-warning shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-label="Woman Serving">
                      <circle cx="12" cy="9" r="6" />
                      <path d="M12 15v7" />
                      <path d="M9 19h6" />
                    </svg>
                  {:else}
                    <svg class="w-3.5 h-3.5 text-info shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-label="Man Serving">
                      <circle cx="10" cy="14" r="6" />
                      <path d="M14.5 9.5 20 4" />
                      <path d="M15 4h5v5" />
                    </svg>
                  {/if}
                  <span class="font-bold text-sm text-base-content truncate">
                    {strategyStore.currentStrategy.name || 'New Draft Strategy'}
                  </span>
                </div>
              {:else}
                <span class="text-xs font-medium text-base-content/50 italic">
                  No strategy selected — tap to open
                </span>
              {/if}
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <ChevronRight class="w-4 h-4 text-base-content/60" />
          </div>
        </button>
      </div>
    {/if}

    <!-- COLUMN 1: STRATEGIES LIST (Read Mode, collapsible on desktop) OR EDIT FORM (Edit Mode, non-collapsible) -->
    <section class="{leftColSpan} flex-col h-full lg:min-h-[540px] lg:border-r lg:border-base-300 lg:pr-5">
      <Strategies
        isCollapsed={isStrategiesCollapsed}
        onToggleCollapse={() => { isStrategiesCollapsed = !isStrategiesCollapsed; }}
      />
    </section>

    <!-- COLUMNS 2 & 3 WORKSPACE: Shared Header + Court (Col 2) & Details/Notes (Col 3) -->
    <div class="{rightWorkspaceSpan} flex flex-col gap-3 w-full">
      {#if strategyStore.hasActiveOrDraft}
        <!-- Shared Header for Columns 2 & 3 (Both Read Mode and Edit Mode) -->
        <div class="w-full flex items-center justify-between gap-3 pb-3 border-b border-base-300 z-20 select-none flex-wrap">
          <div class="flex items-center gap-2.5 flex-1 min-w-[260px]">
            <div class="w-full max-w-[300px]">
              <PhaseTogglerCard
                visiblePhase={strategyStore.visiblePhase}
                onSelect={(phase) => strategyStore.setVisiblePhase(phase)}
              />
            </div>

            {#if strategyStore.visiblePhase === 'base'}
              <button
                type="button"
                onclick={handlePlayTransition}
                class="btn btn-sm btn-primary gap-1.5 shadow-xs shrink-0"
                title="Play Base to Defensive formation transition"
              >
                <Play class="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </button>
            {:else}
              <button
                type="button"
                onclick={handleResetTransition}
                disabled={isPlayingTransition}
                class="btn btn-sm btn-ghost border border-base-300 bg-base-200/70 hover:bg-base-200 gap-1.5 text-base-content/85 shrink-0"
                title="Reset animation back to Base formation"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            {/if}
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <CourtOverlayControls
              {showZones}
              onToggleZones={() => { showZones = !showZones; }}
              {showAllArrows}
              onToggleArrows={() => { showAllArrows = !showAllArrows; }}
              {showBlockShadow}
              onToggleBlockShadow={() => { showBlockShadow = !showBlockShadow; }}
              {showCoverageRange}
              onToggleCoverageRange={() => { showCoverageRange = !showCoverageRange; }}
              {is3DView}
              onToggle3D={() => { is3DView = !is3DView; }}
            />

            {#if strategyStore.isEditing}
              <button
                type="button"
                onclick={() => strategyStore.cancelEdit()}
                class="btn btn-sm btn-ghost border border-base-300 bg-base-200/70 hover:bg-base-200 gap-1 text-base-content/75 hover:text-base-content"
                title="Discard draft changes"
              >
                <X class="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onclick={() => strategyStore.saveDraftAsNew()}
                disabled={!canSave}
                class="btn btn-sm btn-neutral gap-1 shadow-xs"
                title="Save as a new strategy"
              >
                <Copy class="w-3.5 h-3.5" />
                <span>Save as new</span>
              </button>

              <button
                type="button"
                onclick={() => strategyStore.saveDraft()}
                disabled={!canSave}
                class="btn btn-sm btn-primary gap-1 shadow-sm"
                title="Save strategy changes"
              >
                <Check class="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            {:else if !strategyStore.isSharedMode}
              <button
                type="button"
                onclick={() => strategyStore.startEdit()}
                class="btn btn-sm btn-ghost border border-base-300 bg-base-200/70 hover:bg-base-200 gap-1.5 text-base-content/80 hover:text-primary"
                title="Edit active strategy"
              >
                <Pencil class="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Columns 2 & 3 Body Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
        <!-- COLUMN 2: COURT -->
        <section class="lg:col-span-8 flex flex-col items-center gap-2 w-full">
          {#if strategyStore.hasActiveOrDraft}
            <Court
              roster={strategyStore.roster}
              movements={strategyStore.movements}
              scenario={strategyStore.scenario}
              rotation={strategyStore.currentStrategy.rotation}
              {progress}
              {selectedPlayerId}
              onSelectPlayer={(id) => { selectedPlayerId = id; }}
              {showBlockShadow}
              {showCoverageRange}
              {showZones}
              {showAllArrows}
              {is3DView}
              currentPositionMode={strategyStore.visiblePhase === 'base' ? 'base' : 'spike'}
              isDirty={strategyStore.isDirty}
              isEditing={strategyStore.isEditing}
              onUpdatePosition={handleUpdatePosition}
              onUpdateScenario={handleUpdateScenario}
            />
          {:else}
            <!-- Empty State Placeholder for Middle Column -->
            <div class="card w-full bg-base-200/40 border border-dashed border-base-300 p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[420px]">
              <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Layers class="w-7 h-7" />
              </div>
              <div class="flex flex-col gap-1.5 max-w-sm">
                <h3 class="text-base font-extrabold text-base-content m-0">
                  No Active Strategy
                </h3>
                <p class="text-xs text-base-content/65 leading-relaxed">
                  Your board is currently empty. Create your first strategy to position defenders on the court and simulate Base-to-Defensive transitions.
                </p>
              </div>
              {#if !strategyStore.isSharedMode}
                <button
                  type="button"
                  onclick={() => strategyStore.startNewStrategy()}
                  class="btn btn-primary btn-sm gap-1.5 shadow-sm mt-1"
                >
                  <Plus class="w-4 h-4" />
                  <span>Create First Strategy</span>
                </button>
              {/if}
            </div>
          {/if}
        </section>

        <!-- COLUMN 3: STRATEGY EXTRA INFO (Read Mode) OR NOTES INPUT (Edit Mode) -->
        <section class="lg:col-span-4 flex flex-col h-full w-full">
          <Phases />
        </section>
      </div>
    </div>

  </main>

  <!-- MOBILE LEFT SLIDE-OUT DRAWER FOR STRATEGIES -->
  {#if isMobileDrawerOpen && !strategyStore.isEditing}
    <div class="fixed inset-0 z-50 lg:hidden flex">
      <!-- Backdrop -->
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <div
        onclick={() => { isMobileDrawerOpen = false; }}
        class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      ></div>

      <!-- Left Slide-Over Panel -->
      <div class="relative z-10 w-80 max-w-[85vw] bg-base-100 h-full shadow-2xl border-r border-base-300 p-4 flex flex-col gap-3 overflow-y-auto">
        <div class="flex items-center justify-end border-b border-base-300 pb-2">
          <button
            type="button"
            onclick={() => { isMobileDrawerOpen = false; }}
            class="btn btn-ghost btn-xs btn-circle"
            aria-label="Close strategies menu"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <Strategies
          onAfterSelect={() => {
            isMobileDrawerOpen = false;
          }}
        />
      </div>
    </div>
  {/if}

  <!-- Share Modal -->
  <ShareModal
    open={isShareModalOpen}
    onClose={() => { isShareModalOpen = false; }}
  />

  <!-- Import Shared Strategies Modal -->
  <ImportSharedModal
    open={isImportSharedModalOpen}
    onClose={() => { isImportSharedModalOpen = false; }}
  />
</div>
