<script lang="ts">
  import { onMount } from 'svelte';
  import type { Player, AttackScenario, DefenseSchemeConfig, CoedBlockMode, PlayerMovement } from './types/volleyball';
  import { defaultRoster } from './data/defaultRoster';
  import { attackScenarios } from './data/scenarios';
  import {
    loadAllSchemes,
    saveScheme,
    deleteScheme,
    builtInSchemes,
    composeMovements,
    canonicalAttackSchemes,
    rotateMovementsForRotation
  } from './data/schemeRegistry';
  import { applyCoedBlockingRules } from './data/coedRules';
  import { loadCustomScenarios, saveCustomScenario, deleteCustomScenario } from './data/customScenarios';

  import Court from './components/Court.svelte';
  import Controls from './components/Controls.svelte';
  import SaveAdjustmentModal from './components/SaveAdjustmentModal.svelte';
  import ShareModal from './components/ShareModal.svelte';
  import TopHeader from './components/common/TopHeader.svelte';

  import { Check } from '@lucide/svelte';

  // State
  let isDarkMode = $state<boolean>(true);
  let isShareModalOpen = $state<boolean>(false);

  let roster = $state<Player[]>(defaultRoster);
  let allSchemes = $state<DefenseSchemeConfig[]>(builtInSchemes);
  let currentScheme = $state<DefenseSchemeConfig>(builtInSchemes[0]);
  let customScenarios = $state<AttackScenario[]>([]);
  let currentScenario = $state<AttackScenario>(attackScenarios[0]);
  let rotation = $state<number>(1);
  let coedBlockMode = $state<CoedBlockMode>('single_man');

  // Preset modification tracking & Modals
  let isBaseModified = $state<boolean>(false);
  let isAttackModified = $state<boolean>(false);
  let attackSchemes = $state<Record<string, Record<number, PlayerMovement[]>>>(
    JSON.parse(JSON.stringify(canonicalAttackSchemes))
  );
  let saveTarget = $state<'base' | 'attack'>('base');
  let isSaveModalOpen = $state<boolean>(false);

  // Share feedback toast
  let shareToast = $state<string | null>(null);
  let shareToastTimer: any = null;

  // All available scenarios: Custom first, then standard presets
  const allScenarios = $derived<AttackScenario[]>([
    ...customScenarios,
    ...attackScenarios
  ]);

  // Position mode & animation state
  let currentPositionMode = $state<'base' | 'spike'>('base');
  let progress = $state<number>(0);
  let animFrameId: number | null = null;

  // View state
  let selectedPlayerId = $state<string | null>(null);
  let showBlockShadow = $state<boolean>(true);
  let showZones = $state<boolean>(false);
  let showAllArrows = $state<boolean>(false);
  let is3DView = $state<boolean>(false);

  // Load persistence (localStorage only)
  onMount(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'business' : 'nord');
    }
    // 1. Initial localStorage load
    const loaded = loadAllSchemes();
    if (loaded && loaded.length > 0) {
      allSchemes = loaded;
    }
    customScenarios = loadCustomScenarios();

    // 2. Parse URL share parameters
    try {
      const params = new URLSearchParams(window.location.search);
      const paramBase = params.get('base');
      const paramAttack = params.get('attack');
      const paramRot = params.get('rot');
      const paramPlay = params.get('play');

      if (paramRot === '1' || paramRot === '2') {
        rotation = parseInt(paramRot);
      }
      if (paramBase) {
        const foundScheme = allSchemes.find(s => s.id === paramBase && s.rotation === rotation);
        if (foundScheme) currentScheme = foundScheme;
        else {
          const matchingBase = allSchemes.find(s => s.rotation === rotation && !s.isCustom) || allSchemes.find(s => s.rotation === rotation);
          if (matchingBase) currentScheme = matchingBase;
        }
      } else {
        const matchingBase = allSchemes.find(s => s.rotation === rotation && !s.isCustom) || allSchemes.find(s => s.rotation === rotation);
        if (matchingBase) currentScheme = matchingBase;
      }
      if (paramAttack) {
        const foundSc = allScenarios.find(s => s.id === paramAttack && s.rotation === rotation);
        if (foundSc) currentScenario = foundSc;
        else {
          const matchingAttack = allScenarios.find(s => s.rotation === rotation && !s.isCustom) || allScenarios.find(s => s.rotation === rotation);
          if (matchingAttack) currentScenario = matchingAttack;
        }
      } else {
        const matchingAttack = allScenarios.find(s => s.rotation === rotation && !s.isCustom) || allScenarios.find(s => s.rotation === rotation);
        if (matchingAttack) currentScenario = matchingAttack;
      }
      if (paramPlay === '1') {
        currentPositionMode = 'base';
        progress = 0;
        setTimeout(() => {
          handlePlayTransition();
        }, 700);
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  });

  // Raw movements composed from active Base Defense Scheme (START) and active Attack Scenario (END)
  const rawMovements = $derived(
    composeMovements(currentScheme, currentScenario.id, rotation, attackSchemes)
  );

  // COED blocking rules: only men in front block, 1 solo man blocks in most cases, women pull off net
  // When positions are modified by user, coordinates are 100% preserved
  const coedResolved = $derived(
    applyCoedBlockingRules(rawMovements, roster, rotation, currentScenario, coedBlockMode, isBaseModified || isAttackModified)
  );

  // Final adjusted movements passed to Court
  const movements = $derived(coedResolved.movements);

  // Smooth animation between Base Position (0) and Spike Position (1)
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

  function handleSelectPositionMode(mode: 'base' | 'spike') {
    currentPositionMode = mode;
    animateToPosition(mode === 'base' ? 0 : 1);
  }

  function handlePlayTransition() {
    if (progress > 0.05) {
      currentPositionMode = 'base';
      progress = 0;
      setTimeout(() => {
        currentPositionMode = 'spike';
        animateToPosition(1);
      }, 200);
    } else {
      currentPositionMode = 'spike';
      animateToPosition(1);
    }
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (typeof document !== 'undefined') {
      const theme = isDarkMode ? 'business' : 'nord';
      document.documentElement.setAttribute('data-theme', theme);
      document.body.classList.toggle('theme-light', !isDarkMode);
    }
  }

  function handleShare() {
    isShareModalOpen = true;
  }

  function handleChangeRotation(newRot: number) {
    if (isBaseModified || isAttackModified) return;
    rotation = newRot;
    const matchingBases = allSchemes.filter(s => s.rotation === newRot);
    const targetBase = matchingBases.find(s => !s.isCustom) || matchingBases[0];
    if (targetBase) currentScheme = targetBase;

    const matchingAttacks = allScenarios.filter(s => s.rotation === newRot);
    const targetAttack = matchingAttacks.find(s => !s.isCustom) || matchingAttacks[0];
    if (targetAttack) currentScenario = targetAttack;

    isBaseModified = false;
    isAttackModified = false;
    progress = currentPositionMode === 'base' ? 0 : 1;
  }

  function handleResetBase() {
    const freshSchemes = loadAllSchemes();
    const clean = freshSchemes.find(s => s.id === currentScheme.id) || builtInSchemes.find(s => s.id === currentScheme.id);
    if (clean) {
      currentScheme = JSON.parse(JSON.stringify(clean));
    }
    isBaseModified = false;
  }

  function handleResetAttack() {
    const pristineSc = allScenarios.find(s => s.id === currentScenario.id);
    if (pristineSc) {
      currentScenario = JSON.parse(JSON.stringify(pristineSc));
    }
    const updated = JSON.parse(JSON.stringify(attackSchemes));
    if (canonicalAttackSchemes[currentScenario.id]) {
      updated[currentScenario.id] = JSON.parse(JSON.stringify(canonicalAttackSchemes[currentScenario.id]));
    }
    attackSchemes = updated;
    isAttackModified = false;
  }

  function handleOpenSaveModal(target: 'base' | 'attack') {
    saveTarget = target;
    isSaveModalOpen = true;
  }

  function handleSaveScheme(newScheme: DefenseSchemeConfig) {
    saveScheme(newScheme);
    allSchemes = loadAllSchemes();
    currentScheme = newScheme;
  }

  // Update real-time position of a defending player (either base or defense position)
  function handleUpdatePosition(playerId: string, pos: { x: number; y: number }, isDefense: boolean) {
    if (isDefense) {
      // 1. Modifying Attack Preset (END of animation)
      const updatedAttack = JSON.parse(JSON.stringify(attackSchemes));
      if (!updatedAttack[currentScenario.id]) {
        updatedAttack[currentScenario.id] = {};
      }
      if (!updatedAttack[currentScenario.id][rotation]) {
        updatedAttack[currentScenario.id][rotation] = JSON.parse(JSON.stringify(movements));
      }
      const moves = updatedAttack[currentScenario.id][rotation];
      const target = moves.find((m: PlayerMovement) => m.playerId === playerId);
      if (target) {
        target.defensePosition = { x: Math.round(pos.x), y: Math.round(pos.y) };
      }
      attackSchemes = updatedAttack;
      isAttackModified = true;
    } else {
      // 2. Modifying Base Defense reading position (START of animation)
      const updated = JSON.parse(JSON.stringify(currentScheme)) as DefenseSchemeConfig;
      if (!updated.schemes) updated.schemes = {};
      const roundedBase = { x: Math.round(pos.x), y: Math.round(pos.y) };
      for (const scKey of Object.keys(updated.schemes)) {
        const scRotMoves = updated.schemes[scKey]?.[rotation];
        if (Array.isArray(scRotMoves)) {
          const m = scRotMoves.find((pm: PlayerMovement) => pm.playerId === playerId);
          if (m) {
            m.basePosition = roundedBase;
          }
        }
      }
      currentScheme = updated;
      isBaseModified = true;
    }
  }

  // Update attacker or target landing spot coordinates on the court
  function handleUpdateScenario(updates: Partial<AttackScenario>) {
    currentScenario = {
      ...currentScenario,
      ...updates
    };
    isAttackModified = true;
    if (currentScenario.isCustom) {
      saveCustomScenario(currentScenario);
      customScenarios = loadCustomScenarios();
    }
  }

  // Save current dragged court setup as a brand new named custom adjustment (either base or attack)
  function handleSaveNewAdjustment(data: {
    name: string;
    label: string;
    type: 'hard_cross' | 'line' | 'tip' | 'pipe' | 'quick_middle' | 'custom';
    description: string;
    defensiveKey: string;
  }) {
    if (saveTarget === 'base') {
      // Save as new custom Base Defense Preset (strictly rotation-scoped)
      const newSchemeId = `custom_base_${Date.now()}`;
      const baseMovementsToSave = movements.map(m => ({
        ...m,
        basePosition: { ...m.basePosition }
      }));

      const newSchemesRecord: Record<string, Record<number, PlayerMovement[]>> = {
        base_formation: {
          [rotation]: baseMovementsToSave
        }
      };

      const newScheme: DefenseSchemeConfig = {
        id: newSchemeId,
        fileName: `${newSchemeId}.json`,
        name: data.name,
        description: data.description || 'Custom base formation preset',
        systemType: 'custom',
        isCustom: true,
        rotation: rotation as (1 | 2),
        schemes: newSchemesRecord
      };

      handleSaveScheme(newScheme);
      currentScheme = newScheme;
      isBaseModified = false;
      return;
    }

    // Save as new custom Attack Preset (scoped to active rotation)
    const newId = `custom_adj_${Date.now()}`;
    const newScenario: AttackScenario = {
      id: newId,
      name: data.name,
      label: data.label,
      type: data.type,
      originZone: 'Custom Adjustment',
      rotation: rotation as (1 | 2),
      attackerX: currentScenario.attackerX ?? 82,
      attackerY: currentScenario.attackerY ?? 86,
      setterX: currentScenario.setterX ?? 68,
      setterY: currentScenario.setterY ?? 92,
      targetX: currentScenario.targetX ?? 50,
      targetY: currentScenario.targetY ?? 70,
      description: data.description,
      defensiveKey: data.defensiveKey,
      isCustom: true
    };

    // Save in custom scenarios
    saveCustomScenario(newScenario);
    customScenarios = loadCustomScenarios();

    // Save current defender positions for this new scenario across rotations in attackSchemes
    const updatedAttack = JSON.parse(JSON.stringify(attackSchemes));
    updatedAttack[newId] = {};
    for (let r = 1; r <= 6; r++) {
      updatedAttack[newId][r] = rotateMovementsForRotation(movements, r);
    }
    attackSchemes = updatedAttack;

    // Switch to new scenario
    currentScenario = newScenario;
    isAttackModified = false;
  }

  // Quick save modifications to the current custom base defense preset
  function handleQuickSaveBaseScheme() {
    if (!currentScheme.isCustom) return;
    const updated = JSON.parse(JSON.stringify(currentScheme)) as DefenseSchemeConfig;
    if (!updated.schemes) updated.schemes = {};
    const targetKey = updated.schemes['base_formation'] ? 'base_formation' : (Object.keys(updated.schemes)[0] || 'base_formation');
    if (!updated.schemes[targetKey]) updated.schemes[targetKey] = {};

    updated.schemes[targetKey][rotation] = movements.map(m => ({
      ...m,
      basePosition: { ...m.basePosition }
    }));

    handleSaveScheme(updated);
    currentScheme = updated;
    isBaseModified = false;
  }

  // Delete a custom base defense preset
  function handleDeleteScheme(schemeId: string) {
    deleteScheme(schemeId);
    allSchemes = loadAllSchemes();
    if (currentScheme.id === schemeId) {
      const fallback = allSchemes.find(s => s.rotation === rotation && !s.isCustom) || allSchemes.find(s => s.rotation === rotation);
      if (fallback) currentScheme = fallback;
    }
  }

  // Quick save modifications to the current custom adjustment
  function handleQuickSaveAdjustment() {
    if (!currentScenario.isCustom) return;
    saveCustomScenario(currentScenario);
    customScenarios = loadCustomScenarios();

    const updatedAttack = JSON.parse(JSON.stringify(attackSchemes));
    if (!updatedAttack[currentScenario.id]) {
      updatedAttack[currentScenario.id] = {};
    }
    updatedAttack[currentScenario.id][rotation] = JSON.parse(JSON.stringify(movements));
    attackSchemes = updatedAttack;

    isAttackModified = false;
  }

  // Delete a custom adjustment
  function handleDeleteAdjustment(scenarioId: string) {
    const remaining = deleteCustomScenario(scenarioId);
    customScenarios = remaining;
    if (currentScenario.id === scenarioId) {
      const fallback = allScenarios.find(s => s.rotation === rotation && !s.isCustom) || allScenarios.find(s => s.rotation === rotation);
      if (fallback) currentScenario = fallback;
    }
  }

  // Edit a custom base defense preset (name and description)
  function handleRenameScheme(schemeId: string, updates: { name: string; description?: string }) {
    const cleanName = updates.name.trim();
    if (!cleanName) return;
    const target = allSchemes.find(s => s.id === schemeId);
    if (target && target.isCustom) {
      const updated: DefenseSchemeConfig = {
        ...target,
        name: cleanName,
        description: updates.description !== undefined ? updates.description.trim() : (target.description || '')
      };
      saveScheme(updated);
      allSchemes = loadAllSchemes();
      if (currentScheme.id === schemeId) {
        currentScheme = updated;
      }
    }
  }

  // Edit a custom attack preset (name, description, defensiveKey)
  function handleRenameAdjustment(scenarioId: string, updates: { name: string; description?: string; defensiveKey?: string }) {
    const cleanName = updates.name.trim();
    if (!cleanName) return;
    const target = customScenarios.find(s => s.id === scenarioId);
    if (target && target.isCustom) {
      const updated: AttackScenario = {
        ...target,
        name: cleanName,
        label: cleanName,
        description: updates.description !== undefined ? updates.description.trim() : (target.description || ''),
        defensiveKey: updates.defensiveKey !== undefined ? updates.defensiveKey.trim() : (target.defensiveKey || '')
      };
      saveCustomScenario(updated);
      customScenarios = loadCustomScenarios();
      if (currentScenario.id === scenarioId) {
        currentScenario = updated;
      }
    }
  }
</script>

<div class="min-h-screen bg-base-100 text-base-content flex flex-col selection:bg-primary selection:text-primary-content relative">
  <!-- Toast Feedback Notification -->
  {#if shareToast}
    <div class="fixed top-16 right-4 z-50">
      <div role="alert" class="alert alert-success shadow-2xl py-2.5 px-4 text-xs font-semibold flex items-center gap-2">
        <Check class="w-4 h-4 shrink-0" />
        <span>{shareToast}</span>
      </div>
    </div>
  {/if}

  <!-- TOP NAVIGATION HEADER: Clean 1-liner (REQ-09, Layout.md Section 2) -->
  <TopHeader
    {isDarkMode}
    onToggleTheme={toggleTheme}
    onShare={handleShare}
    {showZones}
    onToggleZones={() => showZones = !showZones}
    {showAllArrows}
    onToggleArrows={() => showAllArrows = !showAllArrows}
    {showBlockShadow}
    onToggleBlockShadow={() => showBlockShadow = !showBlockShadow}
    {is3DView}
    onToggle3D={() => is3DView = !is3DView}
  />

  <!-- MAIN APP CONTAINER -->
  <main class="flex-1 max-w-[1720px] w-full mx-auto px-4 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    
    <!-- LEFT COLUMN: COURT SIMULATOR (Full Clean Viewport, REQ-06, REQ-08) (7 cols) -->
    <div class="lg:col-span-7 flex flex-col items-center gap-4 w-full">
      <Court
        {roster}
        {movements}
        scenario={currentScenario}
        {rotation}
        {progress}
        {selectedPlayerId}
        onSelectPlayer={(id) => selectedPlayerId = id}
        {showBlockShadow}
        {showZones}
        {showAllArrows}
        {is3DView}
        {currentPositionMode}
        onSelectPositionMode={handleSelectPositionMode}
        isDirty={isBaseModified || isAttackModified}
        onUpdatePosition={handleUpdatePosition}
        onUpdateScenario={handleUpdateScenario}
      />
    </div>

    <!-- RIGHT COLUMN: 3 STANDALONE CONTROLS CARDS (REQ-11, Layout.md Section 4) (5 cols) -->
    <div class="lg:col-span-5 flex flex-col gap-4">
      <Controls
        scenarios={allScenarios}
        {currentScenario}
        onSelectScenario={(s) => {
          currentScenario = s;
          isAttackModified = false;
          progress = 1;
          currentPositionMode = 'spike';
        }}
        {rotation}
        onChangeRotation={handleChangeRotation}
        {allSchemes}
        {currentScheme}
        onChangeScheme={(s) => {
          currentScheme = s;
          isBaseModified = false;
          progress = 0;
          currentPositionMode = 'base';
        }}
        onDeleteScheme={handleDeleteScheme}
        onRenameScheme={handleRenameScheme}
        onQuickSaveBaseScheme={handleQuickSaveBaseScheme}
        {currentPositionMode}
        onSelectPositionMode={handleSelectPositionMode}
        {isBaseModified}
        {isAttackModified}
        onResetBase={handleResetBase}
        onResetAttack={handleResetAttack}
        onOpenSaveModal={handleOpenSaveModal}
        onQuickSaveAdjustment={handleQuickSaveAdjustment}
        onDeleteAdjustment={handleDeleteAdjustment}
        onRenameAdjustment={handleRenameAdjustment}
        {roster}
        {attackSchemes}
      />
    </div>

  </main>

  <!-- MODALS -->
  <ShareModal
    open={isShareModalOpen}
    onClose={() => isShareModalOpen = false}
    activeRotation={rotation}
    currentSchemeId={currentScheme?.id}
    currentScenarioId={currentScenario?.id}
    {allSchemes}
    scenarios={allScenarios}
    {roster}
    {attackSchemes}
  />

  <SaveAdjustmentModal
    open={isSaveModalOpen}
    onClose={() => isSaveModalOpen = false}
    targetMode={saveTarget}
    initialName={saveTarget === 'base' ? currentScheme?.name : currentScenario.name}
    initialLabel={saveTarget === 'base' ? currentScheme?.name : currentScenario.label}
    initialType={currentScenario.type}
    onSave={handleSaveNewAdjustment}
  />
</div>
