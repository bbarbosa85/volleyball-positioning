<script lang="ts">
  import type { Player, PlayerMovement, AttackScenario } from '../types/volleyball';
  import { Crosshair, Move } from '@lucide/svelte';

  // Common reusable components
  import CourtPhaseToggle from './common/CourtPhaseToggle.svelte';
  import CourtOverlayControls from './common/CourtOverlayControls.svelte';
  import CourtNet from './common/CourtNet.svelte';
  import CourtZones from './common/CourtZones.svelte';
  import CourtPlayerToken from './common/CourtPlayerToken.svelte';
  import CourtOverlaySvg from './common/CourtOverlaySvg.svelte';

  interface Props {
    roster: Player[];
    movements: PlayerMovement[];
    scenario: AttackScenario;
    rotation: number;
    progress: number; // 0 (base) to 1 (defense)
    selectedPlayerId: string | null;
    onSelectPlayer: (id: string | null) => void;
    showBlockShadow?: boolean;
    onToggleBlockShadow?: () => void;
    showZones?: boolean;
    onToggleZones?: () => void;
    showAllArrows?: boolean;
    onToggleArrows?: () => void;
    showCoverageRange?: boolean;
    onToggleCoverageRange?: () => void;
    is3DView?: boolean;
    onToggle3D?: () => void;
    currentPositionMode?: 'base' | 'spike';
    onSelectPositionMode?: (mode: 'base' | 'spike') => void;
    isDirty?: boolean;
    onUpdatePosition?: (playerId: string, pos: { x: number; y: number }, isDefense: boolean) => void;
    onUpdateScenario?: (updates: Partial<AttackScenario>) => void;
  }

  let {
    roster,
    movements,
    scenario,
    rotation: _rotation,
    progress,
    selectedPlayerId,
    onSelectPlayer,
    showBlockShadow = true,
    onToggleBlockShadow,
    showZones = true,
    onToggleZones,
    showAllArrows = false,
    onToggleArrows,
    showCoverageRange = true,
    onToggleCoverageRange,
    is3DView = false,
    onToggle3D,
    currentPositionMode = 'base',
    onSelectPositionMode,
    isDirty = false,
    onUpdatePosition,
    onUpdateScenario,
  }: Props = $props();

  function getPlayer(id: string): Player | undefined {
    if (!id) return undefined;
    const cleanId = id.trim().toLowerCase();
    return roster.find(p => p.id.toLowerCase() === cleanId);
  }

  function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  // Map half-court defending coordinates (0 to 100%) to full-court bottom half (50% to 100%)
  // Net is at Y = 50%, defending baseline is at Y = 100%
  function toFullCourtY(halfY: number): number {
    return 50 + (halfY * 0.5);
  }

  // Interpolated player positions on full court
  const interpolatedPlayers = $derived(
    movements.map(m => {
      const p = getPlayer(m.playerId);
      const effectiveT = easeInOutCubic(progress);

      const currentX = m.basePosition.x + (m.defensePosition.x - m.basePosition.x) * effectiveT;
      const currentY = m.basePosition.y + (m.defensePosition.y - m.basePosition.y) * effectiveT;

      return {
        ...m,
        player: p,
        halfX: currentX,
        halfY: currentY,
        currentX: currentX,
        currentY: toFullCourtY(currentY),
        baseFullY: toFullCourtY(m.basePosition.y),
        defenseFullY: toFullCourtY(m.defensePosition.y),
      };
    })
  );

  // Opponent attacker position in full court (top half: 0 to 50%)
  const attacker = $derived({
    x: scenario.attackerX ?? 82,
    y: (scenario.attackerY !== undefined && scenario.attackerY > 0 ? scenario.attackerY : 86) * 0.5,
    opponentY: scenario.attackerY !== undefined && scenario.attackerY > 0 ? scenario.attackerY : 86
  });

  const isDefensivePhase = $derived(currentPositionMode === 'spike' || progress > 0.5);

  // Active net blockers:
  // Only marked and active in Defensive Formation. A player is a blocker and generates a block shadow
  // IF AND ONLY IF they are actively on the net (currentY <= 55) and within the attack lane (|currentX - attacker.x| <= 24).
  // If dragged far from the net or away from the attack, they won't generate a shadow and have the 'B' marker removed.
  const blockers = $derived(
    isDefensivePhase
      ? interpolatedPlayers.filter(p => {
          const isTouchingNet = p.currentY <= 55;
          const isNextToAttacker = Math.abs(p.currentX - attacker.x) <= 24;
          return isTouchingNet && isNextToAttacker;
        })
      : []
  );

  const blockerPlayerIds = $derived(new Set(blockers.map(b => b.playerId)));

  // Opponent setter position in full court (top half: 0 to 50%)
  const setter = $derived({
    x: scenario.setterX ?? 68,
    y: (scenario.setterY !== undefined && scenario.setterY > 0 ? scenario.setterY : 88) * 0.5,
    opponentY: scenario.setterY !== undefined && scenario.setterY > 0 ? scenario.setterY : 88
  });

  // Phase-anchored ball position: top center of setter in base (0), bottom center of attacker in spike (1)
  const setterBall = $derived({
    x: setter.x,
    y: setter.y - 3.5
  });

  const attackerBall = $derived({
    x: attacker.x,
    y: attacker.y + 3.5
  });

  const ballPos = $derived({
    x: setterBall.x + (attackerBall.x - setterBall.x) * progress,
    y: setterBall.y + (attackerBall.y - setterBall.y) * progress
  });

  // Target impact point on our defending half
  const targetFull = $derived({
    x: scenario.targetX ?? 50,
    y: toFullCourtY(scenario.targetY ?? 70),
    defendingY: scenario.targetY ?? 70
  });

  // Selected player movement definition (used for transition arrow)
  const selectedMovement = $derived(
    selectedPlayerId ? movements.find((m) => m.playerId === selectedPlayerId) : null
  );

  // Multi-entity drag state: always enabled for player, attacker, setter, and target
  type DragKind = { kind: 'player'; id: string } | { kind: 'attacker' } | { kind: 'setter' } | { kind: 'target' };
  let activeDrag = $state<DragKind | null>(null);
  let courtBoundaryBox = $state<HTMLDivElement | null>(null);

  function handleDragMove(clientX: number, clientY: number) {
    if (!activeDrag || !courtBoundaryBox) return;
    const rect = courtBoundaryBox.getBoundingClientRect();

    // Horizontal percentage across court width (5% to 95%)
    const courtX = Math.round(Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100)));

    if (activeDrag.kind === 'attacker') {
      const oppFullY = ((clientY - rect.top) / (rect.height * 0.5)) * 100;
      const oppY = Math.round(Math.max(8, Math.min(94, oppFullY)));
      onUpdateScenario?.({ attackerX: courtX, attackerY: oppY });
    } else if (activeDrag.kind === 'setter') {
      const oppFullY = ((clientY - rect.top) / (rect.height * 0.5)) * 100;
      const oppY = Math.round(Math.max(8, Math.min(94, oppFullY)));
      onUpdateScenario?.({ setterX: courtX, setterY: oppY });
    } else if (activeDrag.kind === 'target') {
      const defFullY = (((clientY - rect.top) - (rect.height * 0.5)) / (rect.height * 0.5)) * 100;
      const defY = Math.round(Math.max(6, Math.min(95, defFullY)));
      onUpdateScenario?.({ targetX: courtX, targetY: defY });
    } else if (activeDrag.kind === 'player') {
      const defFullY = (((clientY - rect.top) - (rect.height * 0.5)) / (rect.height * 0.5)) * 100;
      const defY = Math.round(Math.max(4, Math.min(96, defFullY)));
      const isDefense = currentPositionMode === 'spike';
      onUpdatePosition?.(activeDrag.id, { x: courtX, y: defY }, isDefense);
    }
  }

  function handleMouseMove(e: MouseEvent) {
    handleDragMove(e.clientX, e.clientY);
  }

  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  function handleEndDrag() {
    activeDrag = null;
  }
</script>

<svelte:window
  onmousemove={handleMouseMove}
  onmouseup={handleEndDrag}
  ontouchmove={handleTouchMove}
  ontouchend={handleEndDrag}
/>

<div class="relative w-full flex flex-col items-center select-none">
  <!-- Court Card Header Bar: Integrated Phase Switcher -->
  <CourtPhaseToggle
    {currentPositionMode}
    {onSelectPositionMode}
  />

  <!-- Court Overlay Controls: Icons with tooltips on top of court container -->
  <CourtOverlayControls
    {showZones}
    {onToggleZones}
    {showAllArrows}
    {onToggleArrows}
    {showBlockShadow}
    {onToggleBlockShadow}
    {showCoverageRange}
    {onToggleCoverageRange}
    {is3DView}
    {onToggle3D}
  />

  <!-- Outer 3D Perspective Wrapper -->
  <div
    class="relative w-full max-w-[620px] flex justify-center py-2 transition-transform duration-700 ease-out"
    style="perspective: 1200px;"
  >
    <!-- Court Frame Container (Transparent by default; lights up with amber outline when dirty) -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      onclick={() => onSelectPlayer(null)}
      class="relative w-full aspect-[1/1.62] rounded-2xl bg-transparent border-2 p-4 flex flex-col items-center justify-center transition-all duration-300 {
        isDirty
          ? 'border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
          : 'border-transparent'
      } {
        is3DView
          ? 'rotate-x-[26deg] scale-[0.98]'
          : ''
      }"
      style="transform-style: preserve-3d;"
    >
      <!-- Background subtle flooring grid -->
      <div class="absolute inset-0 opacity-15 pointer-events-none rounded-2xl bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <!-- FULL VOLLEYBALL COURT BOUNDARY (18m x 9m) -->
      <div
        bind:this={courtBoundaryBox}
        class="relative w-[90%] h-[93%] rounded-sm shadow-md overflow-visible transition-colors duration-300"
        style="background: var(--court-bg); border: 2.5px solid var(--court-border);"
      >
        <!-- Floor wood grain texture -->
        <div
          class="absolute inset-0 pointer-events-none rounded-sm overflow-hidden"
          style="opacity: 0.12; background: linear-gradient(to right, var(--court-grain) 1px, transparent 1px); background-size: 10% 100%;"
        ></div>

        <!-- 1. OPPONENT HALF COURT (0% TO 50%) -->
        <div class="absolute top-0 left-0 right-0 h-1/2 pointer-events-none">
          <div
            class="absolute top-[66.67%] left-0 right-0 h-[3px] transition-colors duration-300"
            style="background-color: var(--court-line);"
          ></div>
        </div>

        <!-- 2. CENTER LINE & ELEVATED ISOMETRIC 3D NET -->
        <CourtNet {is3DView} />

        <!-- 3. DEFENDING HALF COURT (50% TO 100%) -->
        <div class="absolute top-1/2 bottom-0 left-0 right-0 pointer-events-none">
          <div
            class="absolute top-[33.33%] left-0 right-0 h-[3px] transition-colors duration-300"
            style="background-color: var(--court-line);"
          ></div>
          <div
            class="absolute top-0 bottom-0 left-1/2 w-[1px] border-l border-dashed transition-colors duration-300"
            style="border-color: var(--court-line-dashed);"
          ></div>
          <CourtZones visible={showZones} />
        </div>

        <!-- Opponent Attacker Token (Draggable) -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          onmousedown={(e) => {
            e.stopPropagation();
            activeDrag = { kind: 'attacker' };
          }}
          ontouchstart={(e) => {
            e.stopPropagation();
            activeDrag = { kind: 'attacker' };
          }}
          class="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center select-none group w-11 h-11 cursor-grab active:cursor-grabbing"
          style="left: {attacker.x}%; top: {attacker.y}%;"
          title="Drag opponent attacker to adjust attack origin"
        >
          <div class="relative flex items-center justify-center w-11 h-11">
            <div class="w-11 h-11 rounded-2xl bg-error text-error-content flex items-center justify-center shadow-xl border-2 border-error-content/30 transition-transform group-hover:scale-115">
              <span class="text-xs font-black tracking-tight uppercase drop-shadow">ATK</span>
            </div>
          </div>
          <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-base-content bg-base-300 px-1.5 py-0.5 rounded border border-base-content/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
            Drag Attacker
          </span>
        </div>

        <!-- Opponent Setter Token (Draggable) -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          onmousedown={(e) => {
            e.stopPropagation();
            activeDrag = { kind: 'setter' };
          }}
          ontouchstart={(e) => {
            e.stopPropagation();
            activeDrag = { kind: 'setter' };
          }}
          class="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center select-none group w-10 h-10 cursor-grab active:cursor-grabbing"
          style="left: {setter.x}%; top: {setter.y}%;"
          title="Drag opponent setter"
        >
          <div class="relative flex items-center justify-center w-10 h-10">
            <div class="w-10 h-10 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-lg border-2 border-white/30 transition-transform group-hover:scale-115">
              <span class="text-xs font-black tracking-tight uppercase drop-shadow-sm">SET</span>
            </div>
          </div>
          <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-base-content bg-base-300 px-1.5 py-0.5 rounded border border-base-content/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
            Drag Setter
          </span>
        </div>

        <!-- 4. SVG LAYER FOR ATTACK VECTORS AND BLOCK SHADOW -->
        <CourtOverlaySvg
          {attacker}
          {targetFull}
          {blockers}
          {movements}
          {roster}
          {progress}
          {currentPositionMode}
          {showBlockShadow}
          {showAllArrows}
          {selectedPlayerId}
          {selectedMovement}
        />

        <!-- 5. DEFENDING PLAYER TOKENS -->
        {#each interpolatedPlayers as playerItem (playerItem.playerId)}
          {@const isSelected = selectedPlayerId === playerItem.playerId}
          {@const p = playerItem.player}
          {@const isBlocker = blockerPlayerIds.has(playerItem.playerId)}
          <CourtPlayerToken
            playerId={playerItem.playerId}
            currentX={playerItem.currentX}
            currentY={playerItem.currentY}
            gender={p?.gender}
            {isBlocker}
            {isSelected}
            showCoverage={showCoverageRange && isDefensivePhase && !isBlocker}
            isDragging={activeDrag?.kind === 'player' && activeDrag.id === playerItem.playerId}
            onSelect={() => onSelectPlayer(isSelected ? null : playerItem.playerId)}
            onStartDrag={() => {
              onSelectPlayer(playerItem.playerId);
              activeDrag = { kind: 'player', id: playerItem.playerId };
            }}
          />
        {/each}

        <!-- 6. DRAGGABLE ATTACK DESTINATION TARGET -->
        {#if currentPositionMode === 'spike' || progress > 0}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            onmousedown={(e) => {
              e.stopPropagation();
              activeDrag = { kind: 'target' };
            }}
            ontouchstart={(e) => {
              e.stopPropagation();
              activeDrag = { kind: 'target' };
            }}
            class="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-grab active:cursor-grabbing flex items-center justify-center select-none group w-12 h-12"
            style="left: {targetFull.x}%; top: {targetFull.y}%;"
            title="Drag target to change attack landing spot"
          >
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-2.5 rounded-full bg-rose-500/20 blur-sm animate-pulse"></div>
              <div class="w-8 h-8 rounded-full border-2 border-rose-400 border-dashed flex items-center justify-center bg-rose-950/40 shadow-lg">
                <Crosshair class="w-4 h-4 text-rose-300" />
              </div>
            </div>
            <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-rose-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
              Landing Target
            </span>
          </div>
        {/if}

        <!-- 7. PHASE-ANCHORED VOLLEYBALL (Smoothly glides from Setter in Base to Attacker in Spike) -->
        <div
          class="absolute -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-all ease-out"
          style="left: {ballPos.x}%; top: {ballPos.y}%; transform-origin: center center;"
        >
          <div class="relative flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-tr from-amber-200 via-white to-blue-200 border border-slate-800 shadow-md">
            <svg class="w-3.5 h-3.5 text-blue-900/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="M14.83 14.83 19.07 19.07" />
              <path d="m9.17 14.83-4.24 4.24" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
