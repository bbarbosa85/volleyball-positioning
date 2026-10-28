import type { Strategy, BaseLayout, DefenseLayout, Zone, CourtPosition } from '../types/volleyball';

export const DEFAULT_DEFENDERS: Record<Zone, CourtPosition> = {
  1: { x: 78, y: 72 },
  2: { x: 80, y: 12 },
  3: { x: 50, y: 12 },
  4: { x: 20, y: 12 },
  5: { x: 22, y: 72 },
  6: { x: 50, y: 78 }
};

export const DEFAULT_SETTER: CourtPosition = { x: 68, y: 88 };
export const DEFAULT_ATTACKER: CourtPosition = { x: 82, y: 86 };
export const DEFAULT_TARGET: CourtPosition = { x: 25, y: 72 };

export function getDefaultBaseLayout(): BaseLayout {
  return {
    defenders: { ...DEFAULT_DEFENDERS }
  };
}

export function getDefaultDefenseLayout(): DefenseLayout {
  return {
    defenders: { ...DEFAULT_DEFENDERS },
    actions: {
      3: 'block_primary',
      4: 'tip_cover',
      5: 'dig_cross',
      6: 'dig_deep',
      1: 'tip_cover',
      2: 'off_block_cover'
    }
  };
}

export function createDefaultStrategy(
  id: string = `strat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  name: string = 'New Strategy',
  rotation: 1 | 2 = 1
): Strategy {
  return {
    id,
    name,
    description: '',
    rotation,
    setter: { ...DEFAULT_SETTER },
    attacker: { ...DEFAULT_ATTACKER },
    target: { ...DEFAULT_TARGET },
    base: getDefaultBaseLayout(),
    defense: getDefaultDefenseLayout()
  };
}

export function cloneStrategy(source: Strategy): Strategy {
  return {
    id: `strat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: `${source.name} (Copy)`,
    description: source.description || '',
    rotation: source.rotation,
    setter: { ...source.setter },
    attacker: { ...source.attacker },
    target: { ...source.target },
    base: {
      defenders: { ...source.base.defenders }
    },
    defense: {
      defenders: { ...source.defense.defenders },
      actions: source.defense.actions ? { ...source.defense.actions } : undefined
    }
  };
}
