<script lang="ts">
  import type { Player, PlayerMovement, AttackScenario } from '../types/volleyball';

  interface Props {
    movements?: PlayerMovement[];
    mode?: 'base' | 'spike';
    roster?: Player[];
    scenario?: AttackScenario;
    active?: boolean;
    class?: string;
  }

  let {
    movements = [],
    mode = 'base',
    roster = [],
    scenario,
    active = false,
    class: className = ''
  }: Props = $props();

  function getPlayer(playerId: string): Player | undefined {
    const clean = playerId.toLowerCase().trim();
    return roster.find(player => player.id.toLowerCase() === clean);
  }

  // Defending court is 9m x 9m (square). We map 0..100% court coordinates to 6..94 in SVG viewBox 0 0 100 100
  function toSvgX(courtX: number): number {
    return 6 + (Math.max(0, Math.min(100, courtX)) / 100) * 88;
  }

  function toSvgY(courtY: number): number {
    return 6 + (Math.max(0, Math.min(100, courtY)) / 100) * 88;
  }

  const ballPos = $derived.by(() => {
    if (mode !== 'spike' || !scenario) return null;
    const tx = scenario.targetX ?? 50;
    const ty = scenario.targetY ?? 70;
    return {
      cx: toSvgX(tx),
      cy: toSvgY(ty)
    };
  });

  const attackerEntryX = $derived.by(() => {
    if (mode !== 'spike' || !scenario) return null;
    return toSvgX(scenario.attackerX ?? 82);
  });
</script>

<div class="relative w-full h-full flex items-center justify-center select-none {className}">
  <svg
    viewBox="0 0 100 100"
    class="w-full h-full rounded-md overflow-hidden transition-all duration-200 {
      active ? 'ring-1 ring-primary' : ''
    }"
  >
    <!-- Court Background -->
    <rect
      x="0"
      y="0"
      width="100"
      height="100"
      class="{active ? 'fill-slate-900' : 'fill-slate-950'}"
    />

    <!-- Defending Court Boundaries (Half-court: Net at top, baseline at bottom) -->
    <rect
      x="6"
      y="6"
      width="88"
      height="88"
      rx="2"
      fill={active ? '#132338' : '#0e1726'}
      stroke={active ? '#3b82f6' : '#334155'}
      stroke-width="1.8"
    />

    <!-- Subtle wood grain lines on court -->
    <line x1="28" y1="6" x2="28" y2="94" stroke="#ffffff" stroke-width="0.4" opacity="0.04" />
    <line x1="50" y1="6" x2="50" y2="94" stroke="#ffffff" stroke-width="0.4" opacity="0.04" />
    <line x1="72" y1="6" x2="72" y2="94" stroke="#ffffff" stroke-width="0.4" opacity="0.04" />

    <!-- 3-Meter Attack Line (35.3% from net) -->
    <line
      x1="6"
      y1="35.3"
      x2="94"
      y2="35.3"
      stroke={active ? '#60a5fa' : '#64748b'}
      stroke-width="1.2"
      stroke-dasharray="3,2"
      opacity="0.85"
    />

    <!-- The Net across the top (y = 6) -->
    <line
      x1="2"
      y1="6"
      x2="98"
      y2="6"
      stroke="#f8fafc"
      stroke-width="2.5"
      stroke-linecap="round"
      opacity="0.95"
    />
    <!-- Net Top Mesh Texture -->
    <line
      x1="2"
      y1="4.5"
      x2="98"
      y2="4.5"
      stroke="#94a3b8"
      stroke-width="0.8"
      opacity="0.6"
    />

    <!-- Attack Trajectory Line (Spike Mode only) -->
    {#if ballPos && attackerEntryX !== null}
      <line
        x1={attackerEntryX}
        y1="6"
        x2={ballPos.cx}
        y2={ballPos.cy}
        stroke="#f43f5e"
        stroke-width="1.2"
        stroke-dasharray="2,1.5"
        opacity="0.7"
      />
    {/if}

    <!-- 6 Player Defense Dots -->
    {#each movements as m (m.playerId)}
      {@const pos = mode === 'base' ? m.basePosition : m.defensePosition}
      {@const cx = toSvgX(pos.x)}
      {@const cy = toSvgY(pos.y)}
      {@const p = getPlayer(m.playerId)}
      {@const isFemale = p?.gender === 'F'}
      <!-- Player Dot: Warning for Women, Info for Men -->
      <circle
        {cx}
        {cy}
        r="4.2"
        fill={isFemale ? 'var(--color-warning)' : 'var(--color-info)'}
        stroke="var(--color-base-100)"
        stroke-width="1.2"
        class="filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
      />
    {/each}

    <!-- Ball Target Impact Marker (Spike Mode only) -->
    {#if ballPos}
      <circle
        cx={ballPos.cx}
        cy={ballPos.cy}
        r="3.2"
        fill="#ffffff"
        stroke="#f59e0b"
        stroke-width="1.2"
        class="filter drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]"
      />
    {/if}
  </svg>
</div>
