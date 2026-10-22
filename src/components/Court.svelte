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
    is3DView?: boolean;
    isEditMode?: boolean;
    editModeTarget?: 'defense' | 'base';
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
    is3DView = false,
    isEditMode = false,
    editModeTarget = 'defense',
    onUpdatePosition,
    onUpdateScenario,
  }: Props = $props();

  function getPlayer(id: string): Player | undefined {
    return roster.find(p => p.id === id);
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
      const effectiveT = isEditMode
        ? (editModeTarget === 'base' ? 0 : 1)
        : easeInOutCubic(progress);

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
      return isTouchingNet && isNextToAttacker && (isBlockerRole || isEditMode);
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

  const secondaryTargetFull = $derived(
    scenario.secondaryTargetX !== undefined && scenario.secondaryTargetY !== undefined
      ? { x: scenario.secondaryTargetX, y: toFullCourtY(scenario.secondaryTargetY) }
      : null
  );

  // Multi-entity drag state
  type DragKind = { kind: 'player'; id: string } | { kind: 'attacker' } | { kind: 'target' };
  let activeDrag = $state<DragKind | null>(null);
  let courtBoundaryBox = $state<HTMLDivElement | null>(null);

  function handleDragMove(clientX: number, clientY: number) {
    if (!activeDrag || !courtBoundaryBox) return;
    // Outside edit mode, only the ball (attacker) can be dragged
    if (!isEditMode && activeDrag.kind !== 'attacker') return;
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
      const isDefense = isEditMode ? editModeTarget === 'defense' : progress > 0.5;
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
    class="relative w-full max-w-[500px] flex justify-center py-2 transition-transform duration-700 ease-out"
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

      <!-- Edit Mode Visual Indicator Banner -->
      {#if isEditMode}
        <div class="absolute top-2 left-4 right-4 z-40 bg-amber-500/20 border border-amber-500/40 rounded-lg py-1 px-3 flex items-center justify-between text-[11px] text-amber-200 backdrop-blur-md shadow-lg pointer-events-none animate-pulse">
          <div class="flex items-center gap-1.5 font-bold">
            <Move class="w-3.5 h-3.5 text-amber-400" />
            <span>EDIT MODE ACTIVE</span>
          </div>
          <span class="text-[10px] text-amber-300/80 font-medium hidden sm:inline">
            Drag Attacker, Target, or Defending Tokens ({editModeTarget === 'defense' ? 'Defense Position' : 'Base Position'})
          </span>
        </div>
      {/if}

      <!-- THE FULL VOLLEYBALL COURT BOUNDARY (18m x 9m) -->
      <div
        bind:this={courtBoundaryBox}
        class="relative w-[86%] h-[92%] bg-gradient-to-b from-[#111f36] via-[#142642] to-[#111f36] border-[2.5px] border-white/85 rounded-sm shadow-inner overflow-hidden {
          isEditMode ? 'ring-2 ring-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : ''
        }"
      >
        <!-- Floor wood grain texture -->
        <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:10%_100%] pointer-events-none"></div>

        <!-- 1. OPPONENT HALF COURT (0% TO 50%) -->
        <div class="absolute top-0 left-0 right-0 h-1/2 pointer-events-none">
          <!-- Opponent 10ft / 3m Attack line (3m from net = 66.67% from baseline) -->
          <div class="absolute top-[66.67%] left-0 right-0 h-[3px] bg-white/60"></div>
        </div>

        <!-- 2. CENTER LINE & ELEVATED ISOMETRIC 3D NET (EXACTLY AT Y = 50%) -->
        <!-- Center boundary line on the court floor -->
        <div class="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-white/60 pointer-events-none z-10"></div>
        <!-- Shadow cast on the court floor beneath the elevated net -->
        <div class="absolute top-1/2 left-0 right-0 h-[5px] -translate-y-1/2 bg-black/50 blur-[2px] pointer-events-none z-10"></div>

        <!-- Elevated Isometric 3D Net Structure -->
        <div
          class="absolute top-1/2 left-[-7%] right-[-7%] -translate-y-1/2 z-30 pointer-events-none transition-all duration-500 ease-out"
          style="transform: translateZ({is3DView ? '34px' : '10px'}) translateY({is3DView ? '-26px' : '-10px'}); transform-style: preserve-3d;"
        >
          <!-- Left Net Pole (Tall vertical steel post outside court) -->
          <div class="absolute left-0 -top-8 w-2.5 h-20 bg-gradient-to-r from-slate-500 via-slate-200 to-slate-600 rounded-sm shadow-xl border border-slate-700"></div>
          <!-- Right Net Pole (Tall vertical steel post outside court) -->
          <div class="absolute right-0 -top-8 w-2.5 h-20 bg-gradient-to-r from-slate-500 via-slate-200 to-slate-600 rounded-sm shadow-xl border border-slate-700"></div>

          <!-- Left Antenna (Tall red/white striped rod over sideline) -->
          <div class="absolute left-[6.5%] -top-10 w-1.5 h-22 bg-[repeating-linear-gradient(to_bottom,#dc2626_0px,#dc2626_6px,#ffffff_6px,#ffffff_12px)] border border-black/50 rounded-sm shadow-md z-40"></div>
          <!-- Right Antenna (Tall red/white striped rod over sideline) -->
          <div class="absolute right-[6.5%] -top-10 w-1.5 h-22 bg-[repeating-linear-gradient(to_bottom,#dc2626_0px,#dc2626_6px,#ffffff_6px,#ffffff_12px)] border border-black/50 rounded-sm shadow-md z-40"></div>

          <!-- Vertical Net Mesh Plane (Elevated in the air) -->
          <div
            class="relative w-full h-8 bg-slate-950/40 border-y border-white shadow-lg flex flex-col justify-between"
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

          <!-- Subtle Defending Zone Indicators -->
          {#if showZones}
            <div class="absolute inset-0 text-slate-400/20 font-black text-xs select-none tracking-wider uppercase">
              <!-- Front row (near net) -->
              <div class="absolute top-[12%] left-[18%]">Zone 4</div>
              <div class="absolute top-[12%] left-[48%]">Zone 3</div>
              <div class="absolute top-[12%] left-[78%]">Zone 2</div>
              <!-- Back row (near baseline) -->
              <div class="absolute top-[72%] left-[18%]">Zone 5</div>
              <div class="absolute top-[72%] left-[48%]">Zone 6</div>
              <div class="absolute top-[72%] left-[78%]">Zone 1</div>
            </div>
          {/if}
        </div>

        <!-- Opponent Attacker / Ball Draggable Marker (Draggable in both normal & edit modes) -->
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
          class="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center select-none group w-9 h-9 cursor-grab active:cursor-grabbing"
          style="left: {attacker.x}%; top: {attacker.y}%;"
          title="Drag the ball to adjust attack origin"
        >
          <div class="relative flex items-center justify-center w-9 h-9">
            <div class="absolute -inset-1.5 rounded-full bg-amber-400/30 blur-sm animate-ping pointer-events-none"></div>
            <!-- Authentic stylized volleyball ball -->
            <div class="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shadow-xl shadow-amber-950 border border-amber-300 transition-transform group-hover:scale-115 overflow-hidden {
              isEditMode ? 'ring-4 ring-amber-400/80 animate-pulse' : ''
            }">
              <svg viewBox="0 0 36 36" class="w-full h-full">
                <!-- Base yellow -->
                <circle cx="18" cy="18" r="18" fill="#f59e0b" />
                <!-- Blue curved panels (classic volleyball style) -->
                <path d="M18 0 A18 18 0 0 1 36 18 C28 18 20 12 18 0 Z" fill="#2563eb" />
                <path d="M18 36 A18 18 0 0 1 0 18 C8 18 16 24 18 36 Z" fill="#2563eb" />
                <!-- White panels -->
                <path d="M0 18 A18 18 0 0 1 18 0 C18 8 12 16 0 18 Z" fill="#f8fafc" />
                <path d="M36 18 A18 18 0 0 1 18 36 C18 28 24 20 36 18 Z" fill="#f8fafc" />
                <!-- Seam lines -->
                <path d="M18 0 C18 12 12 18 0 18" fill="none" stroke="#0f172a" stroke-width="1.3" />
                <path d="M18 36 C18 24 24 18 36 18" fill="none" stroke="#0f172a" stroke-width="1.3" />
                <path d="M18 0 C20 12 28 18 36 18" fill="none" stroke="#0f172a" stroke-width="1.3" />
                <path d="M18 36 C16 24 8 18 0 18" fill="none" stroke="#0f172a" stroke-width="1.3" />
                <!-- Shine reflection -->
                <ellipse cx="13" cy="10" rx="5" ry="3" fill="#ffffff" opacity="0.4" transform="rotate(-30 13 10)" />
              </svg>
            </div>
          </div>
          {#if isEditMode}
            <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] font-black tracking-wider uppercase bg-amber-950/95 text-amber-300 px-1.5 py-0.5 rounded shadow border border-amber-600/70 pointer-events-none whitespace-nowrap">
              Ball (Drag)
            </span>
          {:else}
            <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-amber-200 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
              Drag Ball
            </span>
          {/if}
        </div>

        <!-- Draggable Target Landing Zone Marker -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          onmousedown={(e) => {
            if (!isEditMode) return;
            e.stopPropagation();
            activeDrag = { kind: 'target' };
          }}
          ontouchstart={(e) => {
            if (!isEditMode) return;
            e.stopPropagation();
            activeDrag = { kind: 'target' };
          }}
          class="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center select-none group w-8 h-8 {
            isEditMode ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
          }"
          style="left: {targetFull.x}%; top: {targetFull.y}%;"
        >
          <div class="w-8 h-8 rounded-full border-2 border-dashed border-rose-400 bg-rose-500/20 flex items-center justify-center shadow-lg transition-transform group-hover:scale-120 {
            isEditMode ? 'ring-4 ring-rose-400/80 bg-rose-500/35 animate-pulse' : ''
          }">
            <div class="w-3 h-3 rounded-full bg-rose-500 shadow-md"></div>
          </div>
          {#if isEditMode}
            <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] font-black tracking-wider uppercase bg-rose-950/95 text-rose-300 px-1.5 py-0.5 rounded shadow border border-rose-700/70 pointer-events-none whitespace-nowrap">
              Target (Drag)
            </span>
          {/if}
        </div>

        <!-- 4. SVG LAYER FOR ATTACK VECTORS AND BLOCK SHADOW -->
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          class="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        >
          <defs>
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

          <!-- Spike Attack Trajectory Vector across the net -->
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

          <!-- Secondary Target Zone (Tip) -->
          {#if secondaryTargetFull}
            <circle
              cx="{secondaryTargetFull.x}"
              cy="{secondaryTargetFull.y}"
              r="2.5"
              fill="rgba(251, 191, 36, 0.15)"
              stroke="#fbbf24"
              stroke-width="0.4"
              stroke-dasharray="0.8,0.8"
            />
          {/if}
        </svg>

        <!-- 5. DEFENDING PLAYER TOKENS (BLUE FOR MEN, YELLOW FOR GIRLS, P1-P6) -->
        {#each interpolatedPlayers as playerItem (playerItem.playerId)}
          {@const isSelected = selectedPlayerId === playerItem.playerId}
          {@const p = playerItem.player}
          {@const isMale = p?.gender === 'M'}
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
              if (isEditMode) {
                activeDrag = { kind: 'player', id: playerItem.playerId };
              }
            }}
            ontouchstart={(e) => {
              e.stopPropagation();
              onSelectPlayer(playerItem.playerId);
              if (isEditMode) {
                activeDrag = { kind: 'player', id: playerItem.playerId };
              }
            }}
            class="absolute z-30 -translate-x-1/2 -translate-y-1/2 group {
              isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
            } {
              activeDrag ? 'transition-none' : 'transition-all duration-500 ease-out'
            } select-none"
            style="left: {playerItem.currentX}%; top: {playerItem.currentY}%;"
          >
            <!-- Selected Glow -->
            {#if isSelected}
              <div class="absolute -inset-2 rounded-full {isMale ? 'bg-blue-400/50' : 'bg-yellow-400/50'} blur-md animate-pulse"></div>
            {/if}

            <!-- Main Token Circle (No player names) -->
            <div
              class="relative w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shadow-xl border-2 transition-transform duration-150 group-hover:scale-115 {
                isMale
                  ? 'bg-blue-600 text-white border-blue-300 shadow-blue-950/80'
                  : 'bg-yellow-400 text-slate-950 border-yellow-100 shadow-yellow-950/80 font-black'
              } {
                isSelected
                  ? 'ring-4 ring-white scale-110'
                  : isBlocker
                  ? 'ring-2 ring-amber-400/90'
                  : ''
              } {
                isEditMode ? 'ring-2 ring-dashed ring-amber-300/80' : ''
              }"
            >
              <!-- Player Identity Label (P1 to P6) -->
              <span class="tracking-tight leading-none text-xs font-black">
                {playerItem.playerId.toUpperCase()}
              </span>

              <!-- Blocker Badge -->
              {#if isBlocker}
                <span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-slate-950 border border-amber-400 text-amber-300 flex items-center justify-center text-[7px] font-black shadow">
                  B
                </span>
              {/if}
            </div>

            {#if isEditMode}
              <div class="text-[8px] font-black bg-slate-950/90 text-amber-300 px-1 py-0.2 rounded shadow border border-amber-500/40 text-center mt-0.5 pointer-events-none">
                {editModeTarget === 'defense' ? 'Def' : 'Base'}
              </div>
            {/if}
          </div>
        {/each}

      </div>
    </div>
  </div>
</div>
