import type { Strategy } from '../types/volleyball';
import { cloneStrategy, DEFAULT_SETTER } from './defaultLayout';

export const INITIAL_SEEDS: Strategy[] = [
  {
    id: 'strat_r1_outside_cross',
    name: 'Man Serving - Outside Cross',
    description: 'Standard 6-deep perimeter defense against an opponent outside hitter attacking cross-court. Zone 3 solo man blocker seals the primary angle, while front-row women peel off to cover tips.',
    rotation: 1,
    setter: { ...DEFAULT_SETTER },
    attacker: { x: 82, y: 86 },
    target: { x: 28, y: 68 },
    base: {
      defenders: {
        1: { x: 78, y: 72 },
        2: { x: 80, y: 12 },
        3: { x: 50, y: 12 },
        4: { x: 20, y: 12 },
        5: { x: 22, y: 72 },
        6: { x: 50, y: 78 }
      }
    },
    defense: {
      defenders: {
        1: { x: 82, y: 55 },
        2: { x: 78, y: 28 },
        3: { x: 76, y: 8 },
        4: { x: 35, y: 32 },
        5: { x: 28, y: 65 },
        6: { x: 52, y: 82 }
      },
      actions: {
        3: 'block_primary',
        4: 'tip_cover',
        2: 'tip_cover',
        5: 'dig_cross',
        6: 'dig_deep',
        1: 'dig_line'
      }
    }
  },
  {
    id: 'strat_r1_outside_line',
    name: 'Man Serving - Outside Line',
    description: 'Perimeter line defense against an outside hitter cutting down the sideline. Zone 1 protects the alley behind the block.',
    rotation: 1,
    setter: { ...DEFAULT_SETTER },
    attacker: { x: 84, y: 88 },
    target: { x: 85, y: 78 },
    base: {
      defenders: {
        1: { x: 78, y: 72 },
        2: { x: 80, y: 12 },
        3: { x: 50, y: 12 },
        4: { x: 20, y: 12 },
        5: { x: 22, y: 72 },
        6: { x: 50, y: 78 }
      }
    },
    defense: {
      defenders: {
        1: { x: 85, y: 72 },
        2: { x: 70, y: 30 },
        3: { x: 82, y: 8 },
        4: { x: 35, y: 35 },
        5: { x: 25, y: 65 },
        6: { x: 58, y: 78 }
      },
      actions: {
        3: 'block_primary',
        1: 'dig_line',
        2: 'tip_cover',
        4: 'tip_cover',
        5: 'dig_cross',
        6: 'dig_deep'
      }
    }
  },
  {
    id: 'strat_r2_outside_cross',
    name: 'Woman Serving - Wing Block Cross',
    description: 'Two men in the front row (Zones 4 & 2). Zone 2 man blocker jumps on the wing, while Zone 3 woman peels off into the donut to absorb roll shots.',
    rotation: 2,
    setter: { ...DEFAULT_SETTER },
    attacker: { x: 82, y: 86 },
    target: { x: 30, y: 70 },
    base: {
      defenders: {
        1: { x: 78, y: 72 },
        2: { x: 80, y: 12 },
        3: { x: 50, y: 12 },
        4: { x: 20, y: 12 },
        5: { x: 22, y: 72 },
        6: { x: 50, y: 78 }
      }
    },
    defense: {
      defenders: {
        1: { x: 82, y: 52 },
        2: { x: 80, y: 8 },
        3: { x: 55, y: 32 },
        4: { x: 30, y: 30 },
        5: { x: 26, y: 68 },
        6: { x: 54, y: 84 }
      },
      actions: {
        2: 'block_primary',
        3: 'tip_cover',
        4: 'tip_cover',
        1: 'tip_cover',
        5: 'dig_cross',
        6: 'dig_deep'
      }
    }
  }
];

const STRATEGIES_STORAGE_KEY = 'volleydefense.strategies.v1';
const ACTIVE_STRATEGY_STORAGE_KEY = 'volleydefense.activeStrategy.v1';

export function loadAllStrategies(): Strategy[] {
  try {
    const raw = localStorage.getItem(STRATEGIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load strategies from localStorage', err);
  }
  return [];
}

export function saveAllStrategies(strategies: Strategy[]): void {
  try {
    localStorage.setItem(STRATEGIES_STORAGE_KEY, JSON.stringify(strategies));
  } catch (err) {
    console.warn('Failed to save strategies to localStorage', err);
  }
}

export function saveStrategy(strategy: Strategy): Strategy[] {
  const current = loadAllStrategies();
  const index = current.findIndex(s => s.id === strategy.id);
  if (index >= 0) {
    current[index] = strategy;
  } else {
    current.push(strategy);
  }
  saveAllStrategies(current);
  return current;
}

export function deleteStrategy(id: string): Strategy[] {
  const current = loadAllStrategies().filter(s => s.id !== id);
  saveAllStrategies(current);
  return current;
}

export function duplicateStrategy(id: string): { strategies: Strategy[]; cloned: Strategy | null } {
  const current = loadAllStrategies();
  const source = current.find(s => s.id === id);
  if (!source) {
    return { strategies: current, cloned: null };
  }
  const cloned = cloneStrategy(source);
  const sourceIndex = current.findIndex(s => s.id === id);
  current.splice(sourceIndex + 1, 0, cloned);
  saveAllStrategies(current);
  return { strategies: current, cloned };
}

export function getActiveStrategyId(): string {
  try {
    const saved = localStorage.getItem(ACTIVE_STRATEGY_STORAGE_KEY);
    if (saved) return saved;
  } catch {}
  return '';
}

export function setActiveStrategyId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_STRATEGY_STORAGE_KEY, id);
  } catch {}
}
