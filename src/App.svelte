<script lang="ts">
  import { onMount } from 'svelte';
  import { strategyStore } from './data/strategyStore.svelte';
  import { parseSharedUrl } from './data/shareCodec';
  import TopHeader from './components/layout/TopHeader.svelte';
  import Strategies from './components/layout/Strategies.svelte';
  import Court from './components/layout/Court.svelte';
  import Phases from './components/layout/Phases.svelte';
  import ShareModal from './components/modals/ShareModal.svelte';
  import type { AttackScenario, Zone } from './types/volleyball';
  import { Download } from '@lucide/svelte';

  // Local UI / view states
  let isDarkMode = $state<boolean>(true);
  let isShareModalOpen = $state<boolean>(false);
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

  // Guest mode state
  let sharedPlaybookTitle = $state<string | null>(null);
  let isGuestMode = $state<boolean>(false);

  // Theme setup
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

    // Check shared URL
    const shared = parseSharedUrl();
    if (shared && shared.strategies.length > 0) {
      isGuestMode = true;
      sharedPlaybookTitle = shared.title || 'Shared Tactics Playbook';
      strategyStore.importSharedStrategies(shared.strategies);
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

  // Smooth animation between Base (0) and Defensive (1)
  function animateToPosition(targetProgress: number) {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    const startProgress = progress;
    const distance = targetProgress - startProgress;
    if (Math.abs(distance) < 0.001) {
      progress = targetProgress;
      return;
    }

    const duration = 400; // ms
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
      }
    }

    animFrameId = requestAnimationFrame(step);
  }

  // Synchronize animation when visible phase changes
  $effect(() => {
    const target = strategyStore.visiblePhase === 'base' ? 0 : 1;
    animateToPosition(target);
  });

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

  function handleDismissGuestMode() {
    isGuestMode = false;
    window.location.hash = '';
  }
</script>

<div class="min-h-screen bg-base-100 text-base-content flex flex-col selection:bg-primary selection:text-primary-content relative">
  <!-- Top Navigation Header -->
  <TopHeader
    {isDarkMode}
    onToggleTheme={toggleTheme}
    onShare={() => { isShareModalOpen = true; }}
  />

  <!-- Guest Mode Read-Only Banner -->
  {#if isGuestMode}
    <div class="w-full bg-info/15 border-b border-info/30 px-4 py-2 flex items-center justify-between gap-4 text-xs">
      <div class="flex items-center gap-2 max-w-[1720px] mx-auto w-full justify-between">
        <span class="font-bold text-info-content">
          Viewing: <strong>{sharedPlaybookTitle}</strong> (Read-Only Guest Mode)
        </span>
        <button
          type="button"
          onclick={handleDismissGuestMode}
          class="btn btn-xs btn-primary gap-1 shadow-xs"
        >
          <Download class="w-3 h-3" />
          <span>Save to My Tactics</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- Main 3-Column Workspace -->
  <main class="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
    
    <!-- COLUMN 1: STRATEGIES LIST (3 cols desktop) -->
    <section class="lg:col-span-3 flex flex-col h-full order-2 lg:order-1">
      <Strategies />
    </section>

    <!-- COLUMN 2: COURT + CONTROLS (6 cols desktop) -->
    <section class="lg:col-span-6 flex flex-col items-center gap-2 w-full order-1 lg:order-2">
      <Court
        roster={strategyStore.roster}
        movements={strategyStore.movements}
        scenario={strategyStore.scenario}
        rotation={strategyStore.currentStrategy.rotation}
        {progress}
        {selectedPlayerId}
        onSelectPlayer={(id) => { selectedPlayerId = id; }}
        {showBlockShadow}
        onToggleBlockShadow={() => { showBlockShadow = !showBlockShadow; }}
        {showCoverageRange}
        onToggleCoverageRange={() => { showCoverageRange = !showCoverageRange; }}
        {showZones}
        onToggleZones={() => { showZones = !showZones; }}
        {showAllArrows}
        onToggleArrows={() => { showAllArrows = !showAllArrows; }}
        {is3DView}
        onToggle3D={() => { is3DView = !is3DView; }}
        currentPositionMode={strategyStore.visiblePhase === 'base' ? 'base' : 'spike'}
        isDirty={strategyStore.isDirty}
        isEditing={strategyStore.isEditing}
        onUpdatePosition={handleUpdatePosition}
        onUpdateScenario={handleUpdateScenario}
      />
    </section>

    <!-- COLUMN 3: PHASES (3 cols desktop) -->
    <section class="lg:col-span-3 flex flex-col h-full order-3 lg:order-3">
      <Phases />
    </section>

  </main>

  <!-- Share Modal -->
  <ShareModal
    open={isShareModalOpen}
    onClose={() => { isShareModalOpen = false; }}
  />
</div>
