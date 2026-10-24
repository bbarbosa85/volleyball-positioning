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
  import DatabaseModal from './components/DatabaseModal.svelte';
  import RosterModal from './components/RosterModal.svelte';
  import Badge from './components/ui/Badge.svelte';

  import {
    loadDbData,
    saveScenarioToDb,
    deleteScenarioFromDb,
    saveRosterToDb,
    checkDbStatus,
    type DbStatus
  } from './services/dbClient';

  import { Shield, Info, Database, Users, Share2, Play, Check } from '@lucide/svelte';

  // State
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
  let isDbModalOpen = $state<boolean>(false);
  let isRosterModalOpen = $state<boolean>(false);
  let dbStatus = $state<DbStatus | null>(null);

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

  // Load persistence (localStorage + SQLite)
  onMount(async () => {
    // 1. Initial localStorage load
    const loaded = loadAllSchemes();
    if (loaded && loaded.length > 0) {
      allSchemes = loaded;
      currentScheme = loaded[0];
    }
    const savedRoster = localStorage.getItem('volleyball_coed_roster_v1');
    if (savedRoster) {
      try {
        roster = JSON.parse(savedRoster);
      } catch (e) {
        console.error(e);
      }
    }
    customScenarios = loadCustomScenarios();

    // 2. Connect and sync with SQLite database (data/volleyball.db)
    try {
      dbStatus = await checkDbStatus();
      if (dbStatus.connected) {
        const dbData = await loadDbData();
        if (dbData) {
          // If SQLite already has custom scenarios, merge and load them
          if (dbData.scenarios.length > 0) {
            const combined = new Map<string, AttackScenario>();
            for (const s of customScenarios) combined.set(s.id, s);
            for (const s of dbData.scenarios) combined.set(s.id, s);
            customScenarios = Array.from(combined.values());
            localStorage.setItem('volleyball_custom_adjustments_v1', JSON.stringify(customScenarios));
          } else if (customScenarios.length > 0) {
            // SQLite is fresh, auto-migrate existing custom scenarios to SQLite
            for (const sc of customScenarios) {
              const scMoves = currentScheme.schemes?.[sc.id];
              await saveScenarioToDb(sc, scMoves);
            }
          }

          // Merge custom schemes from SQLite
          if (dbData.schemes && Object.keys(dbData.schemes).length > 0) {
            attackSchemes = {
              ...attackSchemes,
              ...dbData.schemes
            };
          }

          // Roster
          if (dbData.roster && dbData.roster.length > 0) {
            roster = dbData.roster;
            localStorage.setItem('volleyball_coed_roster_v1', JSON.stringify(roster));
          } else if (roster.length > 0) {
            await saveRosterToDb(roster);
          }
        }
      }
    } catch (err) {
      console.warn('SQLite init warning:', err);
    }

    // 3. Parse URL share parameters
    try {
      const params = new URLSearchParams(window.location.search);
      const paramBase = params.get('base');
      const paramAttack = params.get('attack');
      const paramRot = params.get('rot');
      const paramPlay = params.get('play');

      if (paramBase) {
        const foundScheme = allSchemes.find(s => s.id === paramBase);
        if (foundScheme) currentScheme = foundScheme;
      }
      if (paramAttack) {
        const foundSc = allScenarios.find(s => s.id === paramAttack);
        if (foundSc) currentScenario = foundSc;
      }
      if (paramRot === '1' || paramRot === '2') {
        rotation = parseInt(paramRot);
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

  function handleShare() {
    const url = new URL(window.location.href);
    url.searchParams.set('base', currentScheme.id);
    url.searchParams.set('attack', currentScenario.id);
    url.searchParams.set('rot', rotation.toString());
    url.searchParams.set('play', '1');

    const shareUrl = url.toString();
    navigator.clipboard.writeText(shareUrl).then(() => {
      shareToast = 'Share link copied! Opening it loads this tactic & plays transition.';
      if (shareToastTimer) clearTimeout(shareToastTimer);
      shareToastTimer = setTimeout(() => {
        shareToast = null;
      }, 3500);
    }).catch(() => {
      prompt('Copy this share link:', shareUrl);
    });
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

  function handleSaveRoster(newRoster: Player[]) {
    roster = newRoster;
    localStorage.setItem('volleyball_coed_roster_v1', JSON.stringify(newRoster));
    saveRosterToDb(newRoster);
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
      // Save as new custom Base Defense Preset
      const newSchemeId = `custom_base_${Date.now()}`;
      const newScheme: DefenseSchemeConfig = {
        id: newSchemeId,
        fileName: `${newSchemeId}.json`,
        name: data.name,
        description: data.description || 'Custom base defense preset',
        systemType: 'custom',
        isCustom: true,
        schemes: JSON.parse(JSON.stringify(currentScheme.schemes || {}))
      };

      // Set current dragged base positions for this rotation across all scenarios in new scheme
      for (const scKey of Object.keys(newScheme.schemes)) {
        if (!newScheme.schemes[scKey][rotation]) {
          newScheme.schemes[scKey][rotation] = JSON.parse(JSON.stringify(movements));
        }
        const rotMoves = newScheme.schemes[scKey][rotation];
        if (Array.isArray(rotMoves)) {
          movements.forEach(currentM => {
            const m = rotMoves.find(rm => rm.playerId === currentM.playerId);
            if (m) {
              m.basePosition = { ...currentM.basePosition };
            }
          });
        }
      }

      handleSaveScheme(newScheme);
      currentScheme = newScheme;
      isBaseModified = false;
      return;
    }

    // Save as new custom Attack Preset
    const newId = `custom_adj_${Date.now()}`;
    const newScenario: AttackScenario = {
      id: newId,
      name: data.name,
      label: data.label,
      type: data.type,
      originZone: 'Custom Adjustment',
      attackerX: currentScenario.attackerX ?? 82,
      attackerY: currentScenario.attackerY ?? 86,
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

    // Save to SQLite database
    saveScenarioToDb(newScenario, updatedAttack[newId]);

    // Switch to new scenario
    currentScenario = newScenario;
    isAttackModified = false;
  }

  // Quick save modifications to the current custom base defense preset
  function handleQuickSaveBaseScheme() {
    if (!currentScheme.isCustom) return;
    const updated = JSON.parse(JSON.stringify(currentScheme)) as DefenseSchemeConfig;
    for (const scKey of Object.keys(updated.schemes || {})) {
      const rotMoves = updated.schemes[scKey]?.[rotation];
      if (Array.isArray(rotMoves)) {
        movements.forEach(currentM => {
          const m = rotMoves.find(rm => rm.playerId === currentM.playerId);
          if (m) {
            m.basePosition = { ...currentM.basePosition };
          }
        });
      }
    }
    handleSaveScheme(updated);
    isBaseModified = false;
  }

  // Delete a custom base defense preset
  function handleDeleteScheme(schemeId: string) {
    deleteScheme(schemeId);
    allSchemes = loadAllSchemes();
    if (currentScheme.id === schemeId) {
      currentScheme = allSchemes[0] || builtInSchemes[0];
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

    // Save to SQLite database
    saveScenarioToDb(currentScenario, updatedAttack[currentScenario.id]);
    isAttackModified = false;
  }

  // Delete a custom adjustment
  function handleDeleteAdjustment(scenarioId: string) {
    const remaining = deleteCustomScenario(scenarioId);
    customScenarios = remaining;
    if (currentScenario.id === scenarioId) {
      currentScenario = attackScenarios[0];
    }
    // Delete from SQLite database
    deleteScenarioFromDb(scenarioId);
  }

  // Rename a custom base defense preset
  function handleRenameScheme(schemeId: string, newName: string) {
    const cleanName = newName.trim();
    if (!cleanName) return;
    const target = allSchemes.find(s => s.id === schemeId);
    if (target && target.isCustom) {
      const updated = { ...target, name: cleanName };
      saveScheme(updated);
      allSchemes = loadAllSchemes();
      if (currentScheme.id === schemeId) {
        currentScheme = updated;
      }
    }
  }

  // Rename a custom attack preset
  function handleRenameAdjustment(scenarioId: string, newName: string) {
    const cleanName = newName.trim();
    if (!cleanName) return;
    const target = customScenarios.find(s => s.id === scenarioId);
    if (target && target.isCustom) {
      const updated: AttackScenario = { ...target, name: cleanName, label: cleanName };
      saveCustomScenario(updated);
      customScenarios = loadCustomScenarios();
      if (currentScenario.id === scenarioId) {
        currentScenario = updated;
      }
      saveScenarioToDb(updated, attackSchemes[scenarioId]);
    }
  }
</script>

<div class="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative">
  <!-- Toast Feedback Notification -->
  {#if shareToast}
    <div class="fixed top-16 right-4 z-50 bg-emerald-950/95 text-emerald-200 border border-emerald-500/60 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold">
      <Check class="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{shareToast}</span>
    </div>
  {/if}

  <!-- TOP NAVIGATION HEADER -->
  <header class="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
      <!-- Brand & Title -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 border border-blue-400/30">
          <Shield class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-black tracking-tight text-white m-0 p-0">
              VolleyDefense <span class="text-blue-400 font-medium">Tactics</span>
            </h1>
            <button
              type="button"
              onclick={() => isRosterModalOpen = true}
              class="group flex items-center gap-1.5 cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-md px-2 py-0.5 text-[10px] font-semibold text-slate-300 transition-colors"
              title="Click to view and edit COED 3M / 3F lineup"
            >
              <Users class="w-3 h-3 text-indigo-400 group-hover:text-indigo-300" />
              <span>COED 3M / 3F</span>
            </button>
          </div>
          <p class="text-xs text-slate-400 m-0">
            Court positioning and defensive transition simulator
          </p>
        </div>
      </div>

      <!-- Quick Status & Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={() => isDbModalOpen = true}
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer shadow-sm"
          title="View SQLite database info (data/volleyball.db)"
        >
          <Database class="w-3.5 h-3.5 text-cyan-400" />
          <span class="hidden sm:inline">SQLite DB</span>
          <span class="w-2 h-2 rounded-full {dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
        </button>

        <!-- Play Transition Button -->
        <button
          type="button"
          onclick={handlePlayTransition}
          class="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer shadow-sm"
          title="Play transition animation from Base Reading to Spike Defense"
        >
          <Play class="w-3.5 h-3.5 fill-current" />
          <span>Play Transition</span>
        </button>

        <!-- Share Tactic Button -->
        <button
          type="button"
          onclick={handleShare}
          class="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition-all cursor-pointer shadow-sm"
          title="Copy shareable link that loads this tactic and plays transition animation"
        >
          <Share2 class="w-3.5 h-3.5 text-blue-400" />
          <span>Share</span>
        </button>

        <div class="px-3 py-1 text-xs font-black text-blue-400 bg-slate-900 rounded-lg border border-slate-800">
          {rotation === 1 ? 'Men Serving' : 'Women Serving'}
        </div>
      </div>
    </div>
  </header>

  <!-- MAIN APP CONTAINER -->
  <main class="flex-1 max-w-[1440px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    
    <!-- LEFT COLUMN: COURT SIMULATOR & PLAYER FOCUS CARD (7 cols) -->
    <div class="lg:col-span-7 flex flex-col items-center gap-4 w-full">
      <!-- Court Component -->
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
        onUpdatePosition={handleUpdatePosition}
        onUpdateScenario={handleUpdateScenario}
      />

      <!-- Quick Guidance Footer under the court -->
      <div class="w-full max-w-[620px] p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <Info class="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            {currentPositionMode === 'base'
              ? 'Base Reading: Drag any defender anytime to adjust reading formation. Off-preset positions can be saved as custom preset.'
              : 'Spike Defense: Drag defenders, attacker, or ball to adjust spike defense. Off-preset positions can be saved as custom preset.'}
          </span>
        </div>
        <span class="text-[10px] text-slate-500 hidden sm:inline font-medium">
          Drag players anytime
        </span>
      </div>
    </div>

    <!-- RIGHT COLUMN: STREAMLINED CONTROLS (5 cols) -->
    <div class="lg:col-span-5 flex flex-col gap-4">
      <Controls
        scenarios={allScenarios}
        {currentScenario}
        onSelectScenario={(s) => {
          currentScenario = s;
          isAttackModified = false;
          progress = currentPositionMode === 'base' ? 0 : 1;
        }}
        {rotation}
        onChangeRotation={(r) => {
          rotation = r;
          isBaseModified = false;
          isAttackModified = false;
          progress = currentPositionMode === 'base' ? 0 : 1;
        }}
        {allSchemes}
        {currentScheme}
        onChangeScheme={(s) => {
          currentScheme = s;
          isBaseModified = false;
          progress = currentPositionMode === 'base' ? 0 : 1;
        }}
        onDeleteScheme={handleDeleteScheme}
        onRenameScheme={handleRenameScheme}
        onQuickSaveBaseScheme={handleQuickSaveBaseScheme}
        {currentPositionMode}
        onSelectPositionMode={handleSelectPositionMode}
        onPlayTransition={handlePlayTransition}
        onShare={handleShare}
        {isBaseModified}
        {isAttackModified}
        onResetBase={handleResetBase}
        onResetAttack={handleResetAttack}
        onOpenSaveModal={handleOpenSaveModal}
        onQuickSaveAdjustment={handleQuickSaveAdjustment}
        onDeleteAdjustment={handleDeleteAdjustment}
        onRenameAdjustment={handleRenameAdjustment}
        onOpenRosterModal={() => isRosterModalOpen = true}
        {roster}
        {attackSchemes}
        {is3DView}
        onToggle3D={() => is3DView = !is3DView}
        {showZones}
        onToggleZones={() => showZones = !showZones}
        {showBlockShadow}
        onToggleBlockShadow={() => showBlockShadow = !showBlockShadow}
        {showAllArrows}
        onToggleAllArrows={() => showAllArrows = !showAllArrows}
      />
    </div>

  </main>

  <!-- MODALS -->
  <SaveAdjustmentModal
    open={isSaveModalOpen}
    onClose={() => isSaveModalOpen = false}
    targetMode={saveTarget}
    initialName={saveTarget === 'base' ? currentScheme?.name : currentScenario.name}
    initialLabel={saveTarget === 'base' ? currentScheme?.name : currentScenario.label}
    initialType={currentScenario.type}
    onSave={handleSaveNewAdjustment}
  />

  <DatabaseModal
    open={isDbModalOpen}
    onClose={() => isDbModalOpen = false}
    customCount={customScenarios.length}
  />

  <RosterModal
    open={isRosterModalOpen}
    onClose={() => isRosterModalOpen = false}
    {roster}
    onSaveRoster={handleSaveRoster}
  />
</div>
