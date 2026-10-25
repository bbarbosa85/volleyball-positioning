import type { AttackScenario } from '../types/volleyball';

export const attackScenarios: AttackScenario[] = [
  // =============================================================
  // MEN SERVING (ROTATION 1) - 1 MAN ON NET (P3 SOLO BLOCK)
  // =============================================================
  {
    id: 'r1_outside_cross',
    name: 'Outside Cross (Solo Block)',
    originZone: 'Opponent Outside (Zone 4)',
    type: 'hard_cross',
    label: 'Outside Cross',
    rotation: 1,
    attackerX: 82,
    attackerY: 86,
    setterX: 68,
    setterY: 92,
    targetX: 25,
    targetY: 72,
    secondaryTargetX: 45,
    secondaryTargetY: 82,
    description: 'Opponent outside attack cutting cross-court against a solo middle block. P3 seals the sharp angle while back-row perimeter defenders dig deep cross.',
    defensiveKey: 'P3 solo block seals angle; P4 peels off net to cover short tips; P5 and P6 dig deep cross-court.'
  },
  {
    id: 'r1_outside_line',
    name: 'Outside Line (Solo Block)',
    originZone: 'Opponent Outside (Zone 4)',
    type: 'line',
    label: 'Outside Line',
    rotation: 1,
    attackerX: 84,
    attackerY: 88,
    setterX: 68,
    setterY: 92,
    targetX: 85,
    targetY: 78,
    secondaryTargetX: 75,
    secondaryTargetY: 45,
    description: 'Opponent outside hitter attacks down the sideline alley. Solo blocker forces hitter outside while perimeter defense protects the line.',
    defensiveKey: 'P1 and P2 hold sideline coverage; P6 steps into mid-court perimeter to anticipate off-block ricochets.'
  },
  {
    id: 'r1_middle_quick',
    name: 'Middle Quick (Solo Block)',
    originZone: 'Opponent Middle Blocker (Zone 3)',
    type: 'quick_middle',
    label: 'Middle Quick',
    rotation: 1,
    attackerX: 50,
    attackerY: 90,
    setterX: 55,
    setterY: 90,
    targetX: 35,
    targetY: 60,
    secondaryTargetX: 65,
    secondaryTargetY: 60,
    description: 'Fast 1st-tempo attack through the middle. Solo man P3 jumps head-to-head with the spiker to take away primary angle.',
    defensiveKey: 'P3 commits with opponent middle; wings collapse low and compact for fast-reflex deflections.'
  },

  // =============================================================
  // WOMEN SERVING (ROTATION 2) - 2 MEN ON NET (DOUBLE WALL BLOCK)
  // =============================================================
  {
    id: 'r2_outside_cross',
    name: 'Outside Cross (Double Wall)',
    originZone: 'Opponent Outside (Zone 4)',
    type: 'hard_cross',
    label: 'Outside Cross',
    rotation: 2,
    attackerX: 82,
    attackerY: 86,
    setterX: 68,
    setterY: 92,
    targetX: 25,
    targetY: 72,
    secondaryTargetX: 45,
    secondaryTargetY: 82,
    description: 'Opponent outside attack against our 2-man front wall (P4 & P2). Solid double block seals cross seam and channel.',
    defensiveKey: 'P4 & P2 close tight double block; P3 woman peels off into short donut/tip cover; P5 & P6 defend baseline.'
  },
  {
    id: 'r2_fast_line',
    name: 'Fast Line (Pinch Block)',
    originZone: 'Opponent Outside (Zone 4)',
    type: 'line',
    label: 'Fast Line D',
    rotation: 2,
    attackerX: 84,
    attackerY: 88,
    setterX: 68,
    setterY: 92,
    targetX: 85,
    targetY: 78,
    secondaryTargetX: 75,
    secondaryTargetY: 45,
    description: 'Opponent outside attack targeted down our sideline. P4 seals antenna line tightly while P2 pinches inside.',
    defensiveKey: 'P4 seals antenna; P2 slides behind for off-block coverage; P5 digs line alley.'
  },
  {
    id: 'r2_pipe_attack',
    name: 'Pipe Defense (Double Block)',
    originZone: 'Opponent Backrow Center (Zone 6)',
    type: 'pipe',
    label: 'Pipe Attack',
    rotation: 2,
    attackerX: 50,
    attackerY: 40,
    setterX: 65,
    setterY: 90,
    targetX: 50,
    targetY: 75,
    secondaryTargetX: 30,
    secondaryTargetY: 80,
    description: 'Opponent back-row middle attack from Zone 6 behind the 3-meter line with full momentum.',
    defensiveKey: 'P4 & P2 double block forms in court center; back-row wings step wide for sharp cut-back digs.'
  }
];
