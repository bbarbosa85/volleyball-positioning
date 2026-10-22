<script lang="ts">
  import { onMount } from 'svelte';
  import type { Player, AttackScenario, DefenseSchemeConfig, CoedBlockMode } from './types/volleyball';
  import { defaultRoster } from './data/defaultRoster';
  import { attackScenarios } from './data/scenarios';
  import { loadAllSchemes, saveScheme, getMovements, rotateMovementsForRotation, builtInSchemes } from './data/schemeRegistry';
  import { applyCoedBlockingRules } from './data/coedRules';
  import { loadCustomScenarios, saveCustomScenario, deleteCustomScenario } from './data/customScenarios';

  import Court from './components/Court.svelte';
  import Controls from './components/Controls.svelte';
  import PlayerFocusCard from './components/PlayerFocusCard.svelte';
  import SaveAdjustmentModal from './components/SaveAdjustmentModal.svelte';
  import ExportGifModal from './components/ExportGifModal.svelte';
  import DatabaseModal from './components/DatabaseModal.svelte';
  import RosterModal from './components/RosterModal.svelte';
  import JsonManagerModal from './components/JsonManagerModal.svelte';
  import Badge from './components/ui/Badge.svelte';

  import {
    loadDbData,
    saveScenarioToDb,
    deleteScenarioFromDb,
    saveRosterToDb,
    checkDbStatus,
    type DbStatus
  } from './services/dbClient';

  import { Shield, Info, Database, Film, Users, FileCode } from '@lucide/svelte';

  // State
  let roster = $state<Player[]>(defaultRoster);
  let allSchemes = $state<DefenseSchemeConfig[]>(builtInSchemes);
  let currentScheme = $state<DefenseSchemeConfig>(builtInSchemes[0]);
  let customScenarios = $state<AttackScenario[]>([]);
  let currentScenario = $state<AttackScenario>(attackScenarios[0]);
  let rotation = $state<number>(1);
  let coedBlockMode = $state<CoedBlockMode>('single_man');

  // Modals state
  let isEditMode = $state<boolean>(false);
  let editModeTarget = $state<'defense' | 'base'>('defense');
  let isSaveModalOpen = $state<boolean>(false);
  let isExportGifModalOpen = $state<boolean>(false);
  let isDbModalOpen = $state<boolean>(false);
  let isRosterModalOpen = $state<boolean>(false);
  let isJsonModalOpen = $state<boolean>(false);
  let dbStatus = $state<DbStatus | null>(null);

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
  let showZones = $state<boolean>(true);
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
            const updated = JSON.parse(JSON.stringify(currentScheme)) as DefenseSchemeConfig;
            if (!updated.schemes) updated.schemes = {};
            for (const [scId, rotMap] of Object.entries(dbData.schemes)) {
              updated.schemes[scId] = rotMap;
            }
            handleSaveScheme(updated);
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
  });

  // Raw movements from active JSON scheme
  const rawMovements = $derived(
    getMovements(currentScheme, currentScenario.id, rotation)
  );

  // COED blocking rules: only men in front block, 1 solo man blocks in most cases, women pull off net
  // In Edit Mode, user coordinates are 100% preserved so all players can be positioned freely
  const coedResolved = $derived(
    applyCoedBlockingRules(rawMovements, roster, rotation, currentScenario, coedBlockMode, isEditMode)
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
    const updated = JSON.parse(JSON.stringify(currentScheme)) as DefenseSchemeConfig;
    if (!updated.schemes) updated.schemes = {};
    if (!updated.schemes[currentScenario.id]) {
      updated.schemes[currentScenario.id] = {};
    }
    if (!updated.schemes[currentScenario.id][rotation]) {
      updated.schemes[currentScenario.id][rotation] = JSON.parse(JSON.stringify(movements));
    }

    const moves = updated.schemes[currentScenario.id][rotation];
    const targetMove = moves.find(m => m.playerId === playerId);
    if (targetMove) {
      if (isDefense) {
        targetMove.defensePosition = { x: Math.round(pos.x), y: Math.round(pos.y) };
      } else {
        targetMove.basePosition = { x: Math.round(pos.x), y: Math.round(pos.y) };
      }
      handleSaveScheme(updated);
    }
  }

  // Update attacker or target landing spot coordinates on the court
  function handleUpdateScenario(updates: Partial<AttackScenario>) {
    currentScenario = {
      ...currentScenario,
      ...updates
    };
    if (currentScenario.isCustom) {
      saveCustomScenario(currentScenario);
      customScenarios = loadCustomScenarios();
    }
  }

  // Save current dragged court setup as a brand new named custom adjustment
  function handleSaveNewAdjustment(data: {
    name: string;
    label: string;
    type: 'hard_cross' | 'line' | 'tip' | 'pipe' | 'quick_middle' | 'custom';
    description: string;
    defensiveKey: string;
  }) {
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

    // Save current defender positions for this new scenario across rotations in current scheme
    const updatedScheme = JSON.parse(JSON.stringify(currentScheme)) as DefenseSchemeConfig;
    if (!updatedScheme.schemes) updatedScheme.schemes = {};
    updatedScheme.schemes[newId] = {};
    for (let r = 1; r <= 6; r++) {
      updatedScheme.schemes[newId][r] = rotateMovementsForRotation(movements, r);
    }
    handleSaveScheme(updatedScheme);

    // Save to SQLite database
    saveScenarioToDb(newScenario, updatedScheme.schemes[newId]);

    // Switch to new scenario
    currentScenario = newScenario;
    isEditMode = false;
  }

  // Quick save modifications to the current custom adjustment
  function handleQuickSaveAdjustment() {
    if (!currentScenario.isCustom) return;
    saveCustomScenario(currentScenario);
    customScenarios = loadCustomScenarios();

    const updatedScheme = JSON.parse(JSON.stringify(currentScheme)) as DefenseSchemeConfig;
    if (!updatedScheme.schemes) updatedScheme.schemes = {};
    if (!updatedScheme.schemes[currentScenario.id]) {
      updatedScheme.schemes[currentScenario.id] = {};
    }
    updatedScheme.schemes[currentScenario.id][rotation] = JSON.parse(JSON.stringify(movements));
    handleSaveScheme(updatedScheme);

    // Save to SQLite database
    saveScenarioToDb(currentScenario, updatedScheme.schemes[currentScenario.id]);
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
</script>

<div class="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
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
          onclick={() => isJsonModalOpen = true}
          class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer shadow-sm"
          title="Inspect and edit defense coordinates JSON"
        >
          <FileCode class="w-3.5 h-3.5 text-amber-400" />
          <span class="hidden md:inline">JSON Schemes</span>
        </button>

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

        <button
          type="button"
          onclick={() => isExportGifModalOpen = true}
          class="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer shadow-sm"
          title="Export current rotation animation as an animated GIF"
        >
          <Film class="w-3.5 h-3.5 text-amber-400" />
          <span>Export GIF</span>
        </button>

        <div class="px-3 py-1 text-xs font-black text-blue-400 bg-slate-900 rounded-lg border border-slate-800">
          R{rotation}
        </div>
      </div>
    </div>
  </header>

  <!-- MAIN APP CONTAINER -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    
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
        {is3DView}
        {isEditMode}
        {editModeTarget}
        onUpdatePosition={handleUpdatePosition}
        onUpdateScenario={handleUpdateScenario}
      />

      <!-- Quick Guidance Footer under the court -->
      <div class="w-full max-w-[560px] p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <Info class="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            {isEditMode
              ? `Edit Mode Active: Drag attacker (red), target circle, or any defender (${editModeTarget === 'defense' ? 'Defense Position' : 'Base Position'}).`
              : currentPositionMode === 'base'
              ? 'Base Reading: Defenders in home zones watching the opposing setter.'
              : 'Spike Defense: Block formed at the net and perimeter defenders aligned.'}
          </span>
        </div>
        <span class="text-[10px] text-slate-500 hidden sm:inline font-medium">
          {isEditMode ? 'All players movable' : 'Click any player to inspect'}
        </span>
      </div>

      <!-- Player Focus Card / Team Role Card -->
      <div class="w-full max-w-[560px]">
        <PlayerFocusCard
          {roster}
          {movements}
          {selectedPlayerId}
          scenario={currentScenario}
          {rotation}
          onSelectPlayer={(id) => selectedPlayerId = id}
        />
      </div>
    </div>

    <!-- RIGHT COLUMN: STREAMLINED CONTROLS (5 cols) -->
    <div class="lg:col-span-5 flex flex-col gap-4">
      <Controls
        scenarios={allScenarios}
        {currentScenario}
        onSelectScenario={(s) => {
          currentScenario = s;
          progress = currentPositionMode === 'base' ? 0 : 1;
        }}
        {rotation}
        onChangeRotation={(r) => {
          rotation = r;
          progress = currentPositionMode === 'base' ? 0 : 1;
        }}
        {allSchemes}
        {currentScheme}
        onChangeScheme={(s) => currentScheme = s}
        onOpenJsonModal={() => isJsonModalOpen = true}
        {coedBlockMode}
        onChangeCoedBlockMode={(mode) => coedBlockMode = mode}
        {currentPositionMode}
        onSelectPositionMode={handleSelectPositionMode}
        {isEditMode}
        onToggleEditMode={() => {
          isEditMode = !isEditMode;
          if (isEditMode) {
            progress = editModeTarget === 'base' ? 0 : 1;
          }
        }}
        {editModeTarget}
        onChangeEditModeTarget={(t) => {
          editModeTarget = t;
          currentPositionMode = t === 'base' ? 'base' : 'spike';
          animateToPosition(t === 'base' ? 0 : 1);
        }}
        onOpenSaveModal={() => isSaveModalOpen = true}
        onQuickSaveAdjustment={handleQuickSaveAdjustment}
        onDeleteAdjustment={handleDeleteAdjustment}
        onOpenExportGifModal={() => isExportGifModalOpen = true}
        onOpenRosterModal={() => isRosterModalOpen = true}
        {is3DView}
        onToggle3D={() => is3DView = !is3DView}
        {showZones}
        onToggleZones={() => showZones = !showZones}
        {showBlockShadow}
        onToggleBlockShadow={() => showBlockShadow = !showBlockShadow}
      />
    </div>

  </main>

  <!-- MODALS -->
  <SaveAdjustmentModal
    open={isSaveModalOpen}
    onClose={() => isSaveModalOpen = false}
    initialName={currentScenario.name}
    initialLabel={currentScenario.label}
    initialType={currentScenario.type}
    onSave={handleSaveNewAdjustment}
  />

  <ExportGifModal
    open={isExportGifModalOpen}
    onClose={() => isExportGifModalOpen = false}
    scenario={currentScenario}
    {movements}
    {roster}
    {rotation}
    {showBlockShadow}
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

  <JsonManagerModal
    open={isJsonModalOpen}
    onClose={() => isJsonModalOpen = false}
    {currentScheme}
    {allSchemes}
    onSaveScheme={handleSaveScheme}
  />
</div>
