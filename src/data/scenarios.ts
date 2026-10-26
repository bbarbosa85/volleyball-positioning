import type { AttackScenario } from '../types/volleyball';

export const initialAttackScenarios: AttackScenario[] = [
  // =============================================================
  // MEN SERVING (ROTATION 1)
  // =============================================================
  {
    id: 'r1_outside_cross',
    name: 'Outside Cross',
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
    name: 'Outside Line',
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

  // =============================================================
  // WOMEN SERVING (ROTATION 2)
  // =============================================================
  {
    id: 'r2_outside_cross',
    name: 'Outside Cross',
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
    name: 'Fast Line',
    originZone: 'Opponent Outside (Zone 4)',
    type: 'line',
    label: 'Fast Line',
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
  }
];

export const attackScenarios = initialAttackScenarios;

const SCENARIOS_STORAGE_KEY = 'volleyball_defensive_presets_v4';

export function loadAllScenarios(): AttackScenario[] {
  try {
    const raw = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s: AttackScenario) => ({
          ...s,
          rotation: (s.rotation === 2 ? 2 : 1) as (1 | 2)
        }));
      }
    }
  } catch (err) {
    console.warn('Failed to load attack scenarios from localStorage', err);
  }
  try {
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(initialAttackScenarios));
  } catch {}
  return JSON.parse(JSON.stringify(initialAttackScenarios));
}

export function saveScenario(scenario: AttackScenario): AttackScenario[] {
  try {
    const existing = loadAllScenarios();
    const index = existing.findIndex(s => s.id === scenario.id);
    if (index >= 0) {
      existing[index] = scenario;
    } else {
      existing.push(scenario);
    }
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(existing));
    return existing;
  } catch (err) {
    console.warn('Failed to save scenario to localStorage', err);
    return [];
  }
}

export function deleteScenario(scenarioId: string): AttackScenario[] {
  try {
    const existing = loadAllScenarios();
    const filtered = existing.filter(s => s.id !== scenarioId);
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.warn('Failed to delete scenario from localStorage', err);
    return [];
  }
}
