<script lang="ts">
  import { onMount } from "svelte";
  import { strategyStore } from "./data/strategyStore.svelte";
  import { parseSharedUrl } from "./data/shareCodec";
  import TopHeader from "./components/layout/TopHeader.svelte";
  import Strategies from "./components/layout/Strategies.svelte";
  import StrategyEditForm from "./components/strategies/StrategyEditForm.svelte";
  import Court from "./components/layout/Court.svelte";
  import Phases from "./components/layout/Phases.svelte";
  import PhaseTogglerCard from "./components/controls/PhaseTogglerCard.svelte";
  import MobileBottomControls from "./components/controls/MobileBottomControls.svelte";
  import CourtOverlayControls from "./components/court/CourtOverlayControls.svelte";
  import ShareModal from "./components/modals/ShareModal.svelte";
  import ImportSharedModal from "./components/modals/ImportSharedModal.svelte";
  import NotesModal from "./components/modals/NotesModal.svelte";
  import ManSignIcon from "./components/common/icons/ManSignIcon.svelte";
  import WomanSignIcon from "./components/common/icons/WomanSignIcon.svelte";
  import type { AttackScenario, Zone } from "./types/volleyball";
  import { Plus, Layers, Play, RotateCcw, FileText, PanelRightClose, PanelLeftOpen, Crosshair, Pencil, Copy } from "@lucide/svelte";

  // Local UI / view states
  let isDarkMode = $state<boolean>(true);
  let isShareModalOpen = $state<boolean>(false);
  let isImportSharedModalOpen = $state<boolean>(false);
  let isNotesModalOpen = $state<boolean>(false);
  let isScenariosDrawerOpen = $state<boolean>(false);
  let isRightColumnOpen = $state<boolean>(false);
  let selectedPlayerId = $state<string | null>(null);

  // Overlay toggles (default: only Blocker Shadow on)
  let showBlockShadow = $state<boolean>(true);
  let showZones = $state<boolean>(false);
  let showAllArrows = $state<boolean>(false);
  let showCoverageRange = $state<boolean>(false);
  let is3DView = $state<boolean>(false);

  // Animation progress between Base (0) and Defensive (1)
  let progress = $state<number>(0);
  let animFrameId: number | null = null;

  // Theme & Shared URL setup (default to dark mode on every session start)
  onMount(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      isDarkMode = !savedTheme || savedTheme === "dark";
    } catch {}

    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.toggle("theme-light", !isDarkMode);

    // Check shared URL: isolate shared strategies in read-only mode
    const shared = parseSharedUrl();
    if (shared && shared.strategies.length > 0) {
      strategyStore.enterSharedMode(shared.strategies, shared.title);
      showZones = shared.courtConfig.showZones;
      showAllArrows = shared.courtConfig.showAllArrows;
      showBlockShadow = shared.courtConfig.showBlockShadow;
      showCoverageRange = shared.courtConfig.showCoverageRange;
      is3DView = shared.courtConfig.is3DView;
    }
  });

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.toggle("theme-light", !isDarkMode);
    try {
      localStorage.setItem("theme", theme);
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
    const target = strategyStore.visiblePhase === "base" ? 0 : 1;
    const dur = customDurationMs ?? 400;
    customDurationMs = null;
    animateToPosition(target, dur);
  });

  function handlePlayTransition() {
    progress = 0;
    isPlayingTransition = true;
    customDurationMs = 2200; // >= 2 seconds transition animation
    strategyStore.setVisiblePhase("defense");
  }

  function handleResetTransition() {
    isPlayingTransition = false;
    customDurationMs = 400;
    strategyStore.setVisiblePhase("base");
  }

  function handleUpdatePosition(playerId: string, pos: { x: number; y: number }, isDefense: boolean) {
    const movement = strategyStore.movements.find((m) => m.playerId === playerId);
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
      targetY: updates.targetY,
    });
  }

  const showRightColumn = $derived(isRightColumnOpen || strategyStore.isEditing);
</script>

<div class="min-h-screen bg-base-100 text-base-content flex flex-col selection:bg-primary selection:text-primary-content relative">
  <!-- Top Navigation Header (Desktop Brand + Share/Theme; Mobile Strategy Selector + Unified Menu) -->
  <TopHeader
    {isDarkMode}
    canShare={strategyStore.strategies.length > 0 && !strategyStore.isEditing}
    isSharedMode={strategyStore.isSharedMode}
    sharedTitle={strategyStore.sharedTitle}
    isEditing={strategyStore.isEditing}
    {canSave}
    strategiesCount={strategyStore.strategies.length}
    hasActiveStrategy={strategyStore.hasActiveOrDraft}
    currentStrategyName={strategyStore.currentStrategy.name}
    currentStrategyRotation={strategyStore.currentStrategy.rotation}
    {showZones}
    onToggleZones={() => {
      showZones = !showZones;
    }}
    {showAllArrows}
    onToggleArrows={() => {
      showAllArrows = !showAllArrows;
    }}
    {showBlockShadow}
    onToggleBlockShadow={() => {
      showBlockShadow = !showBlockShadow;
    }}
    {showCoverageRange}
    onToggleCoverageRange={() => {
      showCoverageRange = !showCoverageRange;
    }}
    {is3DView}
    onToggle3D={() => {
      is3DView = !is3DView;
    }}
    onToggleTheme={toggleTheme}
    onShare={() => {
      isShareModalOpen = true;
    }}
    onOpenImportShared={() => {
      isImportSharedModalOpen = true;
    }}
    onExitSharedMode={() => {
      strategyStore.exitSharedModeToMyBoard();
    }}
    onOpenMobileDrawer={() => {
      isScenariosDrawerOpen = true;
    }}
    onEdit={() => strategyStore.startEdit()}
    onClone={() => strategyStore.duplicateStrategy(strategyStore.activeStrategyId)}
    onSave={() => strategyStore.saveDraft()}
    onSaveAsNew={() => strategyStore.saveDraftAsNew()}
    onCancel={() => strategyStore.cancelEdit()} />

  <!-- Main Workspace -->
  <main
    class="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 pt-2 pb-20 lg:py-4 flex flex-col gap-3">
    <!-- MOBILE EDIT MODE ONLY: Inline Edit Form above the court (Desktop renders Edit Form in the right column) -->
    {#if strategyStore.isEditing && strategyStore.draft}
      <section class="flex lg:hidden flex-col w-full gap-3.5 select-none">
        <StrategyEditForm
          draft={strategyStore.draft}
          visiblePhase={strategyStore.visiblePhase}
          onUpdate={(updates) => strategyStore.updateDraft(updates)}
          onSelectPhase={(phase) => strategyStore.setVisiblePhase(phase)}
          onResetPhase={(phase) => strategyStore.resetPhaseToDefault(phase)} />
      </section>
    {/if}

    <!-- WORKSPACE: Desktop Header Bar + Court & Right Panel -->
    <div class="flex flex-col gap-3 w-full">
      <!-- Desktop Workspace Header Bar: Left (Drawer Toggle + Scenario Name) | Center (Formation Selector) | Right (Actions) -->
      <div class="hidden lg:grid lg:grid-cols-3 w-full items-center gap-4 pb-3 border-b border-base-300 z-20 select-none">
        <!-- Left: Scenarios Drawer Toggle + Active Scenario Name + Edit/Clone Actions -->
        <div class="flex items-center gap-2 min-w-0 justify-self-start max-w-full">
          <button
            type="button"
            onclick={() => {
              isScenariosDrawerOpen = !isScenariosDrawerOpen;
            }}
            class="btn btn-sm btn-ghost border border-base-300 bg-base-200/70 hover:bg-base-200 gap-1.5 px-2.5 text-base-content shrink-0"
            title="Open scenarios drawer"
            aria-label="Open scenarios drawer">
            <PanelLeftOpen class="w-4 h-4 text-primary" />
            <span class="badge badge-xs badge-neutral font-bold">{strategyStore.strategies.length}</span>
          </button>

          {#if strategyStore.hasActiveOrDraft}
            <button
              type="button"
              onclick={() => {
                isScenariosDrawerOpen = !isScenariosDrawerOpen;
              }}
              class="flex items-center gap-2 min-w-0 px-2 py-1 rounded-lg hover:bg-base-200/80 transition-colors cursor-pointer text-left"
              title="Click to open scenarios drawer">
              {#if strategyStore.currentStrategy.rotation === 2}
                <WomanSignIcon class="w-4 h-4 text-warning shrink-0" ariaLabel="Woman Serving" />
              {:else}
                <ManSignIcon class="w-4 h-4 text-info shrink-0" ariaLabel="Man Serving" />
              {/if}
              <span
                class="text-base font-extrabold text-base-content truncate"
                title={strategyStore.currentStrategy.name || "Untitled Scenario"}>
                {strategyStore.currentStrategy.name || (strategyStore.isEditing ? "New Scenario" : "Untitled Scenario")}
              </span>
            </button>

            {#if !strategyStore.isSharedMode && !strategyStore.isEditing}
              <div class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onclick={() => strategyStore.startEdit()}
                  class="btn btn-xs btn-ghost btn-square text-base-content/70 hover:text-primary hover:bg-base-200"
                  title="Edit scenario"
                  aria-label="Edit scenario">
                  <Pencil class="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onclick={() => strategyStore.duplicateStrategy(strategyStore.activeStrategyId)}
                  class="btn btn-xs btn-ghost btn-square text-base-content/70 hover:text-secondary hover:bg-base-200"
                  title="Clone scenario"
                  aria-label="Clone scenario">
                  <Copy class="w-3.5 h-3.5" />
                </button>
              </div>
            {/if}
          {:else}
            <button
              type="button"
              onclick={() => {
                isScenariosDrawerOpen = !isScenariosDrawerOpen;
              }}
              class="text-sm font-medium text-base-content/60 italic truncate px-2 py-1 rounded-lg hover:bg-base-200/80 transition-colors cursor-pointer">
              No active scenario
            </button>
          {/if}
        </div>

        <!-- Center: Formation Selector [ Base | Defensive ] -->
        <div class="w-full max-w-[300px] justify-self-center">
          {#if strategyStore.hasActiveOrDraft}
            <PhaseTogglerCard visiblePhase={strategyStore.visiblePhase} onSelect={(phase) => strategyStore.setVisiblePhase(phase)} />
          {/if}
        </div>

        <!-- Right: Actions (Play/Reset, Notes, Settings) -->
        <div class="flex items-center justify-end gap-2 justify-self-end shrink-0">
          {#if strategyStore.hasActiveOrDraft}
            {#if strategyStore.visiblePhase === "base"}
              <button
                type="button"
                onclick={handlePlayTransition}
                class="btn btn-sm btn-primary gap-1.5 px-3 shadow-xs shrink-0"
                title="Play Base to Defensive formation transition">
                <Play class="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </button>
            {:else}
              <button
                type="button"
                onclick={handleResetTransition}
                disabled={isPlayingTransition}
                class="btn btn-sm btn-secondary gap-1.5 px-3 shadow-xs shrink-0"
                title="Reset animation back to Base formation">
                <RotateCcw class="w-3.5 h-3.5 shrink-0" />
                <span>Reset</span>
              </button>
            {/if}

            {#if !strategyStore.isEditing}
              <button
                type="button"
                onclick={() => {
                  isRightColumnOpen = !isRightColumnOpen;
                }}
                class="relative btn btn-sm btn-ghost border border-base-300 bg-base-200/70 hover:bg-base-200 gap-1.5 px-3 text-base-content/85 shrink-0 transition-colors"
                title={isRightColumnOpen ? "Hide scenario info & notes" : "Show scenario info & notes"}>
                <FileText class="w-3.5 h-3.5 text-primary" />
                <span>{isRightColumnOpen ? "Hide Notes" : "Notes"}</span>
                {#if strategyStore.currentStrategy.description?.trim() && !isRightColumnOpen}
                  <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {/if}
              </button>
            {/if}

            <CourtOverlayControls
              {showZones}
              onToggleZones={() => {
                showZones = !showZones;
              }}
              {showAllArrows}
              onToggleArrows={() => {
                showAllArrows = !showAllArrows;
              }}
              {showBlockShadow}
              onToggleBlockShadow={() => {
                showBlockShadow = !showBlockShadow;
              }}
              {showCoverageRange}
              onToggleCoverageRange={() => {
                showCoverageRange = !showCoverageRange;
              }}
              {is3DView}
              onToggle3D={() => {
                is3DView = !is3DView;
              }} />
          {/if}
        </div>
      </div>

      <!-- Columns 2 & 3 Body Flex (Desktop right column slides in and out) -->
      <div class="relative flex items-start w-full overflow-hidden">
        <!-- COLUMN 2: COURT -->
        <section class="flex-1 min-w-0 flex flex-col items-center gap-2 w-full transition-all duration-300 ease-out">
          {#if strategyStore.hasActiveOrDraft}
            <Court
              roster={strategyStore.roster}
              movements={strategyStore.movements}
              scenario={strategyStore.scenario}
              rotation={strategyStore.currentStrategy.rotation}
              {progress}
              {selectedPlayerId}
              onSelectPlayer={(id) => {
                selectedPlayerId = id;
              }}
              {showBlockShadow}
              {showCoverageRange}
              {showZones}
              {showAllArrows}
              {is3DView}
              currentPositionMode={strategyStore.visiblePhase === "base" ? "base" : "spike"}
              isDirty={strategyStore.isDirty}
              isEditing={strategyStore.isEditing}
              onUpdatePosition={handleUpdatePosition}
              onUpdateScenario={handleUpdateScenario} />
          {:else}
            <!-- Empty State Placeholder for Middle Column -->
            <div
              class="card w-full bg-base-200/40 border border-dashed border-base-300 p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[420px]">
              <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Layers class="w-7 h-7" />
              </div>
              <div class="flex flex-col gap-1.5 max-w-sm">
                <h3 class="text-base font-extrabold text-base-content m-0">No Active Scenario</h3>
                <p class="text-xs text-base-content/65 leading-relaxed">
                  Your board is currently empty. Create your first scenario to position defenders on the court and simulate
                  Base-to-Defensive transitions.
                </p>
              </div>
              {#if !strategyStore.isSharedMode}
                <button
                  type="button"
                  onclick={() => strategyStore.startNewStrategy()}
                  class="btn btn-primary btn-sm gap-1.5 shadow-sm mt-1">
                  <Plus class="w-4 h-4" />
                  <span>Create First Scenario</span>
                </button>
              {/if}
            </div>
          {/if}
        </section>

        <!-- COLUMN 3: SCENARIO EXTRA INFO (Read Mode) OR EDIT FORM + NOTES (Edit Mode) — Desktop slide-in/out panel (always visible in edit mode); mobile opens via NotesModal -->
        <aside
          inert={!showRightColumn}
          class="hidden lg:flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-out {showRightColumn
            ? 'w-80 xl:w-96 ml-5 opacity-100 translate-x-0 border-l border-base-300 pl-5'
            : 'w-0 ml-0 opacity-0 translate-x-8 pointer-events-none'}"
        >
          <div class="w-75 xl:w-91 flex flex-col gap-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                {#if strategyStore.isEditing}
                  <Crosshair class="w-4 h-4 text-warning" />
                  <span class="text-sm font-extrabold text-base-content">Edit Scenario</span>
                {:else}
                  <FileText class="w-4 h-4 text-primary" />
                  <span class="text-sm font-extrabold text-base-content">Scenario Info & Notes</span>
                {/if}
              </div>
              {#if !strategyStore.isEditing}
                <button
                  type="button"
                  onclick={() => {
                    isRightColumnOpen = false;
                  }}
                  class="btn btn-xs btn-ghost btn-square text-base-content/60 hover:text-base-content"
                  title="Close info & notes panel"
                  aria-label="Close info & notes panel"
                >
                  <PanelRightClose class="w-4 h-4" />
                </button>
              {/if}
            </div>

            <Phases />
          </div>
        </aside>
      </div>
    </div>
  </main>

  <!-- MOBILE FIXED BOTTOM CONTROL BAR (Base | Defensive + Play/Reset + Notes) -->
  {#if strategyStore.hasActiveOrDraft}
    <MobileBottomControls
      visiblePhase={strategyStore.visiblePhase}
      {isPlayingTransition}
      hasNotes={Boolean(strategyStore.currentStrategy.description?.trim())}
      onSelectPhase={(phase) => strategyStore.setVisiblePhase(phase)}
      onPlayTransition={handlePlayTransition}
      onResetTransition={handleResetTransition}
      onOpenNotes={() => {
        isNotesModalOpen = true;
      }} />
  {/if}

  <!-- Mobile Notes Dialog Modal -->
  <NotesModal
    open={isNotesModalOpen}
    onClose={() => {
      isNotesModalOpen = false;
    }} />

  <!-- SCENARIOS DRAWER (Mobile: Slides down from top | Desktop: Slides in from left) -->
  <div
    class="fixed inset-0 z-50 flex flex-col lg:flex-row {isScenariosDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}"
    inert={!isScenariosDrawerOpen}>
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      onclick={() => {
        isScenariosDrawerOpen = false;
      }}
      class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out {isScenariosDrawerOpen
        ? 'opacity-100'
        : 'opacity-0'}">
    </div>

    <!-- Drawer Panel (Top slide-down on < lg, Left slide-in on lg+) -->
    <div
      class="relative z-10 w-full max-h-[82vh] lg:w-96 lg:max-h-none lg:h-full bg-base-100 shadow-2xl border-b lg:border-b-0 lg:border-r border-base-300 rounded-b-2xl lg:rounded-b-none lg:rounded-r-2xl p-4 lg:p-5 flex flex-col gap-3 overflow-y-auto transition-transform duration-300 ease-out {isScenariosDrawerOpen
        ? 'translate-y-0 lg:translate-x-0'
        : '-translate-y-full lg:translate-y-0 lg:-translate-x-full'}">
      <Strategies
        onCloseDrawer={() => {
          isScenariosDrawerOpen = false;
        }}
        onAfterSelect={() => {
          isScenariosDrawerOpen = false;
        }} />
    </div>
  </div>

  <!-- Share Modal -->
  <ShareModal
    open={isShareModalOpen}
    onClose={() => {
      isShareModalOpen = false;
    }} />

  <!-- Import Shared Strategies Modal -->
  <ImportSharedModal
    open={isImportSharedModalOpen}
    onClose={() => {
      isImportSharedModalOpen = false;
    }} />
</div>
