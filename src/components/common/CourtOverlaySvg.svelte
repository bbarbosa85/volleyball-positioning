<script lang="ts">
  import type { Player, PlayerMovement } from '../../types/volleyball';

  interface Props {
    attacker: { x: number; y: number };
    targetFull: { x: number; y: number };
    blockers: Array<{ currentX: number }>;
    movements: PlayerMovement[];
    roster: Player[];
    progress: number;
    currentPositionMode?: 'base' | 'spike';
    showBlockShadow?: boolean;
    showAllArrows?: boolean;
    selectedPlayerId?: string | null;
    selectedMovement?: PlayerMovement | null;
  }

  let {
    attacker,
    targetFull,
    blockers,
    movements,
    roster,
    progress,
    currentPositionMode = 'base',
    showBlockShadow = true,
    showAllArrows = false,
    selectedPlayerId = null,
    selectedMovement = null
  }: Props = $props();

  function getPlayer(id: string): Player | undefined {
    if (!id) return undefined;
    const cleanId = id.trim().toLowerCase();
    return roster.find(p => p.id.toLowerCase() === cleanId);
  }

  function toFullCourtY(halfY: number): number {
    return 50 + (halfY * 0.5);
  }
</script>

<svg
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
  class="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
>
  <defs>
    <!-- Info player arrow marker (Men) -->
    <marker
      id="playerMoveArrowInfo"
      viewBox="0 0 10 10"
      refX="6"
      refY="5"
      markerWidth="4.8"
      markerHeight="4.8"
      orient="auto-start-reverse"
    >
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-info)" />
    </marker>
    <!-- Warning player arrow marker (Women) -->
    <marker
      id="playerMoveArrowWarning"
      viewBox="0 0 10 10"
      refX="6"
      refY="5"
      markerWidth="4.8"
      markerHeight="4.8"
      orient="auto-start-reverse"
    >
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--color-warning)" />
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

  <!-- Block Shadow Cone -->
  {#if showBlockShadow && (currentPositionMode === 'spike' || progress > 0) && blockers.length > 0}
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
      {@const isFemale = p ? p.gender === 'F' : false}
      {@const arrowColor = isFemale ? 'var(--color-warning)' : 'var(--color-info)'}
      {@const markerId = isFemale ? 'url(#playerMoveArrowWarning)' : 'url(#playerMoveArrowInfo)'}
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
        <!-- Solid arrow line matching gender color (info for men, warning for women) -->
        <line
          x1="{startX}"
          y1="{startY}"
          x2="{endX}"
          y2="{endY}"
          stroke={arrowColor}
          stroke-width={isPlayerSelected ? 0.45 : 0.35}
          stroke-linecap="round"
          marker-end="{markerId}"
          class={isPlayerSelected ? 'drop-shadow-[0_0_6px_currentColor]' : 'drop-shadow-[0_0_2px_currentColor]'}
        />
        <!-- Destination target ghost circle matching gender color -->
        <circle
          cx="{endX}"
          cy="{endY}"
          r={isPlayerSelected ? 1.6 : 1.2}
          fill={arrowColor}
          fill-opacity="0.25"
          stroke={arrowColor}
          stroke-width="0.3"
          class={isPlayerSelected ? 'animate-pulse' : ''}
        />
      {/if}
    {/each}
  {/if}
</svg>
