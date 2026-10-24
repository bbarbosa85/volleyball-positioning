<script lang="ts">
  import type { Player, PlayerMovement, AttackScenario } from '../types/volleyball';
  import { Crosshair, Move } from '@lucide/svelte';

  interface Props {
    roster: Player[];
    movements: PlayerMovement[];
    scenario: AttackScenario;
    rotation: number;
    progress: number; // 0 (base) to 1 (defense)
    selectedPlayerId: string | null;
    onSelectPlayer: (id: string | null) => void;
    showBlockShadow?: boolean;
    showZones?: boolean;
    showAllArrows?: boolean;
    is3DView?: boolean;
    currentPositionMode?: 'base' | 'spike';
    onUpdatePosition?: (playerId: string, pos: { x: number; y: number }, isDefense: boolean) => void;
    onUpdateScenario?: (updates: Partial<AttackScenario>) => void;
  }

  let {
    roster,
    movements,
    scenario,
    rotation,
    progress,
    selectedPlayerId,
    onSelectPlayer,
    showBlockShadow = true,
    showZones = true,
    showAllArrows = false,
    is3DView = false,
    currentPositionMode = 'base',
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

  // Active net blockers:
  // Consider only players touching the net (currentY <= 55) next to the attacker (|currentX - attacker.x| <= 22)
  const blockers = $derived(
    interpolatedPlayers.filter(p => {
      const isTouchingNet = p.currentY <= 55;
      const isNextToAttacker = Math.abs(p.currentX - attacker.x) <= 22;
      const isBlockerRole = p.actionType === 'block_primary' || p.actionType === 'block_assist';
      return isTouchingNet && isNextToAttacker && isBlockerRole;
    })
  );

  // Opponent attacker position in full court (top half: 0 to 50%)
  const attacker = $derived({
    x: scenario.attackerX ?? 82,
    y: (scenario.attackerY !== undefined && scenario.attackerY > 0 ? scenario.attackerY : 86) * 0.5,
    opponentY: scenario.attackerY !== undefined && scenario.attackerY > 0 ? scenario.attackerY : 86
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

  // Multi-entity drag state: always enabled for player, attacker, and target
  type DragKind = { kind: 'player'; id: string } | { kind: 'attacker' } | { kind: 'target' };
  let activeDrag = $state<DragKind | null>(null);
  let courtBoundaryBox = $state<HTMLDivElement | null>(null);

  function handleDragMove(clientX: number, clientY: number) {
    if (!activeDrag || !courtBoundaryBox) return;
    const rect = courtBoundaryBox.getBoundingClientRect();

    // Horizontal percentage across court width (5% to 95%)
    const courtX = Math.round(Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100)));

    if (activeDrag.kind === 'attacker') {
      // Opponent half: top 0 to 50% of full court
      // On opponent half: 0% is baseline, 100% is net
      const oppFullY = ((clientY - rect.top) / (rect.height * 0.5)) * 100;
      const oppY = Math.round(Math.max(10, Math.min(92, oppFullY)));
      onUpdateScenario?.({ attackerX: courtX, attackerY: oppY });
    } else if (activeDrag.kind === 'target') {
      // Defending half: bottom 50% to 100% of full court
      // On defending half: 0% is net, 100% is baseline
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
  <!-- Outer 3D Perspective Wrapper -->
  <div
    class="relative w-full max-w-[620px] flex justify-center py-2 transition-transform duration-700 ease-out"
    style="perspective: 1200px;"
  >
    <!-- Court Frame Container -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      onclick={() => onSelectPlayer(null)}
      class="relative w-full aspect-[1/1.62] rounded-2xl bg-[#0a1120] border-2 border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-4 flex flex-col items-center justify-center transition-all duration-500 {
        is3DView
          ? 'rotate-x-[26deg] scale-[0.98] shadow-[0_35px_80px_rgba(30,58,138,0.35)]'
          : ''
      }"
      style="transform-style: preserve-3d;"
    >
      <!-- Background subtle flooring grid -->
      <div class="absolute inset-0 opacity-15 pointer-events-none rounded-2xl bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <!-- THE FULL VOLLEYBALL COURT BOUNDARY (18m x 9m) - EXPANDED & OVERFLOW VISIBLE FOR NET -->
      <div
        bind:this={courtBoundaryBox}
        class="relative w-[90%] h-[93%] bg-gradient-to-b from-[#111f36] via-[#142642] to-[#111f36] border-[2.5px] border-white/85 rounded-sm shadow-inner overflow-visible"
      >
        <!-- Floor wood grain texture -->
        <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:10%_100%] pointer-events-none rounded-sm overflow-hidden"></div>

        <!-- 1. OPPONENT HALF COURT (0% TO 50%) -->
        <div class="absolute top-0 left-0 right-0 h-1/2 pointer-events-none">
          <!-- Opponent 10ft / 3m Attack line (3m from net = 66.67% from baseline) -->
          <div class="absolute top-[66.67%] left-0 right-0 h-[3px] bg-white/60"></div>
        </div>

        <!-- 2. CENTER LINE & ELEVATED ISOMETRIC 3D NET (EXACTLY AT Y = 50%, EXTENDING PAST SIDELINES) -->
        <!-- Center boundary line on the court floor -->
        <div class="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-white/60 pointer-events-none z-10"></div>
        <!-- Shadow cast on the court floor beneath the elevated net -->
        <div class="absolute top-1/2 left-[-8%] right-[-8%] h-[5px] -translate-y-1/2 bg-black/50 blur-[2px] pointer-events-none z-10"></div>

        <!-- Elevated Isometric 3D Net Structure (Wider than the court) -->
        <div
          class="absolute top-1/2 left-[-8%] right-[-8%] -translate-y-1/2 z-30 pointer-events-none transition-all duration-500 ease-out"
          style="transform: translateZ({is3DView ? '40px' : '14px'}) translateY({is3DView ? '-30px' : '-14px'}); transform-style: preserve-3d;"
        >
          <!-- Left Net Pole (Vertical steel post outside left court sideline) -->
          <div class="absolute -left-1 -top-10 w-2.5 h-24 bg-gradient-to-r from-slate-500 via-slate-200 to-slate-600 rounded-sm shadow-xl border border-slate-700"></div>
          <!-- Right Net Pole (Vertical steel post outside right court sideline) -->
          <div class="absolute -right-1 -top-10 w-2.5 h-24 bg-gradient-to-r from-slate-500 via-slate-200 to-slate-600 rounded-sm shadow-xl border border-slate-700"></div>

          <!-- Left Antenna (Over the left sideline at 7.4% of total net span) -->
          <div class="absolute left-[7.4%] -top-14 w-1.5 h-26 bg-[repeating-linear-gradient(to_bottom,#dc2626_0px,#dc2626_6px,#ffffff_6px,#ffffff_12px)] border border-black/50 rounded-sm shadow-md z-40"></div>
          <!-- Right Antenna (Over the right sideline at 92.6% of total net span) -->
          <div class="absolute right-[7.4%] -top-14 w-1.5 h-26 bg-[repeating-linear-gradient(to_bottom,#dc2626_0px,#dc2626_6px,#ffffff_6px,#ffffff_12px)] border border-black/50 rounded-sm shadow-md z-40"></div>

          <!-- Vertical Net Mesh Plane (Elevated in the air, spanning full width across poles) -->
          <div
            class="relative w-full h-11 bg-slate-950/40 border-y border-white shadow-lg flex flex-col justify-between"
            style="backdrop-filter: blur(0.5px);"
          >
            <!-- Top white canvas tape headband -->
            <div class="w-full h-1.5 bg-white border-b border-slate-300 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></div>

            <!-- Square grid mesh pattern -->
            <div class="w-full flex-1 bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.45)_0px,rgba(255,255,255,0.45)_1px,transparent_1px,transparent_6px),repeating-linear-gradient(to_bottom,rgba(255,255,255,0.35)_0px,rgba(255,255,255,0.35)_1px,transparent_1px,transparent_5px)] opacity-75"></div>

            <!-- Bottom white canvas band -->
            <div class="w-full h-1 bg-white/90 border-t border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.4)]"></div>
          </div>
        </div>

        <!-- 3. DEFENDING HALF COURT (50% TO 100%) -->
        <div class="absolute top-1/2 bottom-0 left-0 right-0 pointer-events-none">
          <!-- Defending 10ft / 3m Attack line (matte white, slightly transparent, no label) -->
          <div class="absolute top-[33.33%] left-0 right-0 h-[3px] bg-white/60"></div>

          <!-- Center vertical court guideline -->
          <div class="absolute top-0 bottom-0 left-1/2 w-[1px] border-l border-dashed border-white/15"></div>

          <!-- Rectangular Transparent Defending Zones -->
          {#if showZones}
            <div class="absolute inset-0 grid grid-cols-3 grid-rows-3 select-none pointer-events-none z-10">
              <!-- FRONT ROW RECTANGLES (Net to 3m line: row 1, 33.33% height) -->
              <!-- Zone 4: Left Front -->
              <div class="col-start-1 row-start-1 border border-blue-400/20 bg-blue-500/[0.03] flex items-center justify-center p-1">
                <span class="text-white/25 font-bold text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none">
                  Zone 4
                </span>
              </div>
              <!-- Zone 3: Middle Front -->
              <div class="col-start-2 row-start-1 border border-blue-400/20 bg-blue-500/[0.02] flex items-center justify-center p-1">
                <span class="text-white/25 font-bold text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none">
                  Zone 3
                </span>
              </div>
              <!-- Zone 2: Right Front -->
              <div class="col-start-3 row-start-1 border border-blue-400/20 bg-blue-500/[0.03] flex items-center justify-center p-1">
                <span class="text-white/25 font-bold text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none">
                  Zone 2
                </span>
              </div>

              <!-- BACK ROW RECTANGLES (3m line to baseline: row 2 & 3, 66.67% height) -->
              <!-- Zone 5: Left Back -->
              <div class="col-start-1 row-start-2 row-span-2 border border-blue-400/20 bg-blue-500/[0.02] flex items-center justify-center p-1">
                <span class="text-white/25 font-bold text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none">
                  Zone 5
                </span>
              </div>
              <!-- Zone 6: Middle Back -->
              <div class="col-start-2 row-start-2 row-span-2 border border-blue-400/20 bg-blue-500/[0.04] flex items-center justify-center p-1">
                <span class="text-white/25 font-bold text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none">
                  Zone 6
                </span>
              </div>
              <!-- Zone 1: Right Back -->
              <div class="col-start-3 row-start-2 row-span-2 border border-blue-400/20 bg-blue-500/[0.02] flex items-center justify-center p-1">
                <span class="text-white/25 font-bold text-[10px] sm:text-xs tracking-wider uppercase select-none pointer-events-none">
                  Zone 1
                </span>
              </div>
            </div>
          {/if}
        </div>

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
            <!-- Red/Crimson attacker jersey avatar -->
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 flex items-center justify-center shadow-xl shadow-rose-950 border-2 border-rose-300 transition-transform group-hover:scale-115">
              <span class="text-xs font-black tracking-tight text-white uppercase drop-shadow">ATK</span>
            </div>
          </div>
          <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-rose-200 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
            Drag Attacker
          </span>
        </div>

        <!-- 4. SVG LAYER FOR ATTACK VECTORS AND BLOCK SHADOW -->
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          class="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        >
          <defs>
            <!-- Blue player arrow marker -->
            <marker
              id="playerMoveArrowBlue"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="4.8"
              markerHeight="4.8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
            </marker>
            <!-- Yellow player arrow marker -->
            <marker
              id="playerMoveArrowYellow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="4.8"
              markerHeight="4.8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#facc15" />
            </marker>
            <!-- Attack gradient -->
            <linearGradient id="fullSpikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.25" />
            </linearGradient>
            <!-- Shadow gradient behind block -->
            <linearGradient id="blockShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.32" />
              <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.02" />
            </linearGradient>
          </defs>

          <!-- Block Shadow Cone (projected from attacker through net blockers) -->
          {#if showBlockShadow && blockers.length > 0}
            {@const minBlockerX = Math.min(...blockers.map(b => b.currentX))}
            {@const maxBlockerX = Math.max(...blockers.map(b => b.currentX))}
            {@const leftNetX = Math.max(3, minBlockerX - 4)}
            {@const rightNetX = Math.min(97, maxBlockerX + 4)}
            {@const netY = 50}
            {@const dyNet = Math.max(4, netY - attacker.y)}
            {@const dyBase = 98 - attacker.y}
            {@const projLeft = attacker.x + ((leftNetX - attacker.x) / dyNet) * dyBase}
            {@const projRight = attacker.x + ((rightNetX - attacker.x) / dyNet) * dyBase}
            {@const baseLeftX = Math.round(Math.max(2, Math.min(98, projLeft)) * 10) / 10}
            {@const baseRightX = Math.round(Math.max(2, Math.min(98, projRight)) * 10) / 10}
            <polygon
              points="{leftNetX} {netY}, {rightNetX} {netY}, {baseRightX} 98, {baseLeftX} 98"
              fill="url(#blockShadowGrad)"
              stroke="rgba(96,165,250,0.25)"
              stroke-width="0.4"
              stroke-dasharray="1,1"
            />
          {/if}

          <!-- Spike Attack Trajectory Vector across the net (only needed on spike position) -->
          {#if currentPositionMode === 'spike' || progress > 0}
            <line
              x1="{attacker.x}"
              y1="{attacker.y}"
              x2="{targetFull.x}"
              y2="{targetFull.y}"
              stroke="url(#fullSpikeGrad)"
              stroke-width="0.8"
              stroke-dasharray="1.5,1"
              class="animate-pulse"
            />
          {/if}

          <!-- Player Transition Movement Arrows (Base position -> Spike/Defense position) -->
          {#if progress === 0}
            {@const arrowsToRender = showAllArrows
              ? movements
              : (selectedPlayerId && selectedMovement ? [selectedMovement] : [])}
            {#each arrowsToRender as m (m.playerId)}
              {@const startX = m.basePosition.x}
              {@const startY = toFullCourtY(m.basePosition.y)}
              {@const endX = m.defensePosition.x}
              {@const endY = toFullCourtY(m.defensePosition.y)}
              {@const dist = Math.hypot(endX - startX, endY - startY)}
              {@const isPlayerSelected = selectedPlayerId === m.playerId}
              {@const p = getPlayer(m.playerId)}
              {@const isMale = p ? p.gender === 'M' : true}
              {@const arrowColor = isMale ? '#2563eb' : '#facc15'}
              {@const markerId = isMale ? 'url(#playerMoveArrowBlue)' : 'url(#playerMoveArrowYellow)'}
              {#if dist > 1.2}
                <!-- Subtle dark underlay solid line for high contrast -->
                <line
                  x1="{startX}"
                  y1="{startY}"
                  x2="{endX}"
                  y2="{endY}"
                  stroke="rgba(15, 23, 42, 0.7)"
                  stroke-width={isPlayerSelected ? 0.8 : 0.65}
                  stroke-linecap="round"
                />
                <!-- Solid arrow line matching gender color (blue for men, yellow for women) -->
                <line
                  x1="{startX}"
                  y1="{startY}"
                  x2="{endX}"
                  y2="{endY}"
                  stroke={arrowColor}
                  stroke-width={isPlayerSelected ? 0.45 : 0.35}
                  stroke-linecap="round"
                  marker-end="{markerId}"
                  class={isPlayerSelected
                    ? (isMale ? 'drop-shadow-[0_0_8px_rgba(37,99,235,0.95)]' : 'drop-shadow-[0_0_8px_rgba(250,204,21,0.95)]')
                    : (isMale ? 'drop-shadow-[0_0_3px_rgba(37,99,235,0.7)]' : 'drop-shadow-[0_0_3px_rgba(250,204,21,0.7)]')}
                />
                <!-- Destination target ghost circle matching gender color -->
                <circle
                  cx="{endX}"
                  cy="{endY}"
                  r={isPlayerSelected ? 1.6 : 1.2}
                  fill={isMale ? 'rgba(37, 99, 235, 0.25)' : 'rgba(250, 204, 21, 0.25)'}
                  stroke={arrowColor}
                  stroke-width="0.3"
                  class={isPlayerSelected ? 'animate-pulse' : ''}
                />
              {/if}
            {/each}
          {/if}
        </svg>

        <!-- 5. DEFENDING PLAYER TOKENS (BLUE FOR MEN, YELLOW FOR GIRLS, P1-P6) - ALWAYS DRAGGABLE -->
        {#each interpolatedPlayers as playerItem (playerItem.playerId)}
          {@const isSelected = selectedPlayerId === playerItem.playerId}
          {@const p = playerItem.player}
          {@const isMale = p ? p.gender === 'M' : true}
          {@const isBlocker = playerItem.actionType === 'block_primary' || playerItem.actionType === 'block_assist'}

          <!-- Player Container Token -->
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <div
            onclick={(e) => {
              e.stopPropagation();
              onSelectPlayer(isSelected ? null : playerItem.playerId);
            }}
            onmousedown={(e) => {
              e.stopPropagation();
              onSelectPlayer(playerItem.playerId);
              activeDrag = { kind: 'player', id: playerItem.playerId };
            }}
            ontouchstart={(e) => {
              e.stopPropagation();
              onSelectPlayer(playerItem.playerId);
              activeDrag = { kind: 'player', id: playerItem.playerId };
            }}
            class="absolute z-30 -translate-x-1/2 -translate-y-1/2 group cursor-grab active:cursor-grabbing {
              activeDrag ? 'transition-none' : 'transition-all duration-500 ease-out'
            } select-none"
            style="left: {playerItem.currentX}%; top: {playerItem.currentY}%;"
          >
            <!-- Selected Glow & Emphasis Aura -->
            {#if isSelected}
              <div class="absolute -inset-3.5 rounded-full {isMale ? 'bg-blue-400/60' : 'bg-yellow-400/60'} blur-lg animate-pulse pointer-events-none"></div>
            {/if}

            <!-- Main Token Circle -->
            <div
              class="relative w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shadow-xl border-2 transition-transform duration-150 group-hover:scale-115 {
                isMale
                  ? 'bg-blue-600 text-white border-blue-300 shadow-blue-950/80'
                  : 'bg-yellow-400 text-slate-950 border-yellow-100 shadow-yellow-950/80 font-black'
              } {
                isSelected
                  ? 'ring-4 ring-white shadow-[0_0_22px_rgba(255,255,255,0.9)] scale-120 z-40'
                  : isBlocker
                  ? 'ring-2 ring-amber-400/90'
                  : ''
              }"
            >
              <!-- Player Identity Label (P1 to P6) -->
              <span class="tracking-tight leading-none text-sm font-black">
                {playerItem.playerId.toUpperCase()}
              </span>

              <!-- Blocker Badge -->
              {#if isBlocker}
                <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950 border border-amber-400 text-amber-300 flex items-center justify-center text-[8px] font-black shadow">
                  B
                </span>
              {/if}
            </div>
          </div>
        {/each}

        <!-- 6. THE BALL (only needed on spike position) -->
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
          class="absolute -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center select-none group w-8 h-8 cursor-grab active:cursor-grabbing filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          style="left: {targetFull.x}%; top: {targetFull.y}%;"
          title="Drag the ball to adjust landing spot"
        >
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute -inset-1 rounded-full bg-white/30 blur-sm animate-ping pointer-events-none"></div>
            <!-- Authentic 18-panel white leather volleyball matching reference image -->
            <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shadow-xl shadow-slate-950/80 border-[1.5px] border-slate-100 transition-transform group-hover:scale-115 overflow-hidden ring-2 ring-white/60">
              <svg viewBox="0 0 100 100" class="w-full h-full rounded-full">
                <defs>
                  <clipPath id="ballClip">
                    <circle cx="50" cy="50" r="49" />
                  </clipPath>
                  <!-- Base spherical leather shading (highlight at upper-right) -->
                  <radialGradient id="ballBaseLeather" cx="62%" cy="38%" r="62%">
                    <stop offset="0%" stop-color="#ffffff" />
                    <stop offset="45%" stop-color="#f8fafc" />
                    <stop offset="72%" stop-color="#e2e8f0" />
                    <stop offset="88%" stop-color="#cbd5e1" />
                    <stop offset="100%" stop-color="#94a3b8" />
                  </radialGradient>
                  <!-- Ambient sphere perimeter shadow -->
                  <radialGradient id="ballAmbientShadow" cx="35%" cy="68%" r="65%">
                    <stop offset="0%" stop-color="#1e293b" stop-opacity="0" />
                    <stop offset="55%" stop-color="#1e293b" stop-opacity="0" />
                    <stop offset="85%" stop-color="#0f172a" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="#020617" stop-opacity="0.65" />
                  </radialGradient>
                </defs>

                <g clip-path="url(#ballClip)">
                  <!-- 3D White Leather Sphere Base -->
                  <circle cx="50" cy="50" r="50" fill="url(#ballBaseLeather)" />

                  <!-- Panel Seam Highlights (embossed leather ridge on lit side) -->
                  <g stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" fill="none">
                    <!-- Central Section Highlights -->
                    <path d="M 48.5 25.5 L 58.5 36.5 L 30.5 63.5" />
                    <path d="M 58.5 36.5 L 78.5 47.5" />
                    <path d="M 37.5 72.5 L 63.5 53.5 L 82.5 61.5" />
                    <path d="M 46.5 83.5 L 69.5 69.5 L 85.5 75.5" />
                    <!-- Top-Right Section Highlights -->
                    <path d="M 63.5 18.5 L 68.5 41.5" />
                    <path d="M 77.5 23.5 L 83.5 49.5" />
                    <!-- Left Section Highlights -->
                    <path d="M 14.5 31.5 C 21.5 27.5 31.5 22.5 47.5 25.5" />
                    <path d="M 14.5 47.5 C 19.5 43.5 25.5 37.5 37.5 33.5" />
                    <path d="M 15.5 56.5 C 21.5 54.5 25.5 57.5 29.5 63.5" />
                    <!-- Bottom-Left Highlights -->
                    <path d="M 18.5 71.5 C 22.5 69.5 25.5 66.5 29.5 63.5" />
                    <path d="M 24.5 80.5 C 28.5 77.5 32.5 75.5 37.5 72.5" />
                    <path d="M 32.5 89.5 C 37.5 87.5 42.5 85.5 46.5 83.5" />
                  </g>

                  <!-- Panel Seam Grooves (Deep grey/charcoal stitches matching reference) -->
                  <g stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85">
                    <!-- Central 3-stripe section -->
                    <path d="M 48 26 L 58 37 L 30 64" />
                    <path d="M 58 37 L 78 48" />
                    <path d="M 37 73 L 63 54 L 82 62" />
                    <path d="M 46 84 L 69 70 L 85 76" />
                    <path d="M 57 95 L 75 84 L 89 88" />

                    <!-- Top-Right 3-stripe section -->
                    <path d="M 64 19 L 69 42" />
                    <path d="M 78 24 L 84 50" />
                    <path d="M 47 15 L 67 18 L 86 31" />

                    <!-- Upper-Left 3-stripe section -->
                    <path d="M 21 17 L 37 15 L 48 26" />
                    <path d="M 15 32 C 22 28 32 23 48 26" />
                    <path d="M 15 48 C 20 44 26 38 38 34" />
                    <path d="M 16 57 C 22 55 26 58 30 64" />

                    <!-- Bottom-Left 3-stripe section -->
                    <path d="M 19 72 C 23 70 26 67 30 64" />
                    <path d="M 25 81 C 29 78 33 76 37 73" />
                    <path d="M 33 90 C 38 88 42 86 46 84" />

                    <!-- Outer perimeter seams -->
                    <path d="M 78 48 C 84 46 89 44 95 42" />
                    <path d="M 82 62 C 87 60 92 58 97 55" />
                    <path d="M 85 76 C 89 74 93 72 98 69" />
                  </g>

                  <!-- Deep Inner Seam Crease (Core shadow) -->
                  <g stroke="#334155" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95">
                    <path d="M 48 26 L 58 37 L 30 64" />
                    <path d="M 58 37 L 78 48" />
                    <path d="M 37 73 L 63 54 L 82 62" />
                    <path d="M 46 84 L 69 70 L 85 76" />
                    <path d="M 64 19 L 69 42" />
                    <path d="M 78 24 L 84 50" />
                    <path d="M 15 32 C 22 28 32 23 48 26" />
                    <path d="M 15 48 C 20 44 26 38 38 34" />
                    <path d="M 19 72 C 23 70 26 67 30 64" />
                    <path d="M 25 81 C 29 78 33 76 37 73" />
                  </g>

                  <!-- Spherical Volume Ambient Shadow Overlay -->
                  <circle cx="50" cy="50" r="50" fill="url(#ballAmbientShadow)" />

                  <!-- Specular Gloss Highlight (matching reference shine) -->
                  <ellipse cx="64" cy="34" rx="14" ry="7" fill="#ffffff" opacity="0.4" transform="rotate(-25 64 34)" />
                </g>
              </svg>
            </div>
          </div>
          <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-amber-200 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-700/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
            Drag Ball
          </span>
        </div>
        {/if}

      </div>
    </div>
  </div>
</div>
