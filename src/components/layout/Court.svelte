<script lang="ts">
  import type { Player, PlayerMovement, AttackScenario } from '../../types/volleyball';

  // Court modular components
  import CourtPhaseToggle from '../court/CourtPhaseToggle.svelte';
  import CourtOverlayControls from '../court/CourtOverlayControls.svelte';
  import CourtFloor from '../court/CourtFloor.svelte';
  import CourtPlayerToken from '../court/CourtPlayerToken.svelte';
  import CourtOverlaySvg from '../court/CourtOverlaySvg.svelte';
  import CourtOpponents from '../court/CourtOpponents.svelte';
  import CourtLandingTarget from '../court/CourtLandingTarget.svelte';
  import CourtBall from '../court/CourtBall.svelte';

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
        <!-- Court Floor Markings, Net, and Zones -->
        <CourtFloor {is3DView} {showZones} />

        <!-- Opponent Attacker & Setter Tokens (Draggable) -->
        <CourtOpponents
          {attacker}
          {setter}
          onStartDragAttacker={() => { activeDrag = { kind: 'attacker' }; }}
          onStartDragSetter={() => { activeDrag = { kind: 'setter' }; }}
        />

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
          <CourtLandingTarget
            target={targetFull}
            onStartDrag={() => { activeDrag = { kind: 'target' }; }}
          />
        {/if}

        <!-- 7. PHASE-ANCHORED VOLLEYBALL (Smoothly glides from Setter in Base to Attacker in Spike) -->
        <CourtBall
          x={ballPos.x}
          y={ballPos.y}
        />
      </div>
    </div>
  </div>

  <!-- Court Overlay Controls: Bottom center of the court -->
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
</div>
