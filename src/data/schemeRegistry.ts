import type { DefenseSchemeConfig, PlayerMovement } from '../types/volleyball';
import defesa6Recuado from './schemes/defesa-6-recuado-tradicional.json';
import defesa6Avancado from './schemes/defesa-6-avancado-cobertura.json';

export const builtInSchemes: DefenseSchemeConfig[] = [
  {
    ...(defesa6Recuado as DefenseSchemeConfig),
    id: 'defesa-6-recuado',
    name: 'Deep',
    description: 'Rotational 6 Deep (P6 deep baseline perimeter)'
  },
  {
    ...(defesa6Avancado as DefenseSchemeConfig),
    id: 'defesa-6-avancado',
    name: 'Tip Cover',
    description: 'Rotational 6 Advanced (P6 short covering tips & donut)'
  }
];

const LOCAL_STORAGE_KEY = 'volleyball_defense_schemes_v2';

export function loadAllSchemes(): DefenseSchemeConfig[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const builtInIds = new Set(builtInSchemes.map(s => s.id));
        const customSchemes = parsed.filter((s: DefenseSchemeConfig) => s.isCustom && !builtInIds.has(s.id));
        return [...builtInSchemes, ...customSchemes];
      }
    }
  } catch (err) {
    console.warn('Failed to load custom schemes from localStorage', err);
  }
  return builtInSchemes;
}

export function saveScheme(scheme: DefenseSchemeConfig): void {
  try {
    const current = loadAllSchemes();
    const index = current.findIndex(s => s.id === scheme.id);
    if (index >= 0) {
      current[index] = scheme;
    } else {
      current.push(scheme);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to save scheme to localStorage', err);
  }
}

export function deleteScheme(schemeId: string): void {
  try {
    const current = loadAllSchemes();
    const filtered = current.filter(s => s.id !== schemeId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to delete scheme from localStorage', err);
  }
}

export const canonicalAttackSchemes: Record<string, Record<number, PlayerMovement[]>> =
  ((defesa6Recuado as any).schemes || {}) as Record<string, Record<number, PlayerMovement[]>>;

export function rotateMovementsForRotation(
  movements: PlayerMovement[],
  targetRotation: number
): PlayerMovement[] {
  const rot = Math.max(1, Math.min(6, Math.round(targetRotation) || 1));
  return movements.map((m, idx) => {
    let zoneNum: number = m.zone;
    if (typeof zoneNum !== 'number' || isNaN(zoneNum)) {
      const pNum = parseInt(String(m.playerId || '').replace(/\D/g, ''), 10);
      if (!isNaN(pNum) && pNum >= 1 && pNum <= 6) {
        zoneNum = ((((pNum - rot) % 6) + 6) % 6) + 1;
      } else {
        zoneNum = (idx % 6) + 1;
      }
    }
    const playerNum = ((((zoneNum + rot - 2) % 6) + 6) % 6) + 1;
    return {
      ...m,
      zone: zoneNum as (1 | 2 | 3 | 4 | 5 | 6),
      playerId: `p${playerNum}`
    };
  });
}

export function getBaseMovements(
  scheme: DefenseSchemeConfig,
  rotation: number
): PlayerMovement[] {
  if (!scheme || !scheme.schemes) return [];
  // Base reading formation is consistent across scenarios in a base scheme
  const scKey = Object.keys(scheme.schemes)[0] || 'outside_cross';
  const scenarioSchemes = scheme.schemes[scKey];
  if (scenarioSchemes) {
    if (scenarioSchemes[rotation]) {
      return rotateMovementsForRotation(scenarioSchemes[rotation], rotation);
    }
    if (scenarioSchemes[1]) {
      return rotateMovementsForRotation(scenarioSchemes[1], rotation);
    }
  }
  return [];
}

export function getAttackScenarioMovements(
  scenarioId: string,
  rotation: number,
  customSource?: Record<string, Record<number, PlayerMovement[]>>
): PlayerMovement[] {
  const source = customSource?.[scenarioId] || canonicalAttackSchemes[scenarioId];
  if (source) {
    if (source[rotation]) {
      return rotateMovementsForRotation(source[rotation], rotation);
    }
    if (source[1]) {
      return rotateMovementsForRotation(source[1], rotation);
    }
  }
  // Fallback to default scenario
  const fallback = canonicalAttackSchemes['outside_cross'];
  if (fallback) {
    const moves = fallback[rotation] || fallback[1] || [];
    return rotateMovementsForRotation(moves, rotation);
  }
  return [];
}

export function composeMovements(
  baseScheme: DefenseSchemeConfig,
  scenarioId: string,
  rotation: number,
  attackSource?: Record<string, Record<number, PlayerMovement[]>>
): PlayerMovement[] {
  // Attack movements define defensePosition, actionType, actionTitle, instructions (END of animation)
  const attackMoves = getAttackScenarioMovements(scenarioId, rotation, attackSource);

  // Base movements define basePosition (START of animation)
  const baseMoves = getBaseMovements(baseScheme, rotation);

  const basePosMap = new Map<string, { x: number; y: number }>();
  baseMoves.forEach(bm => basePosMap.set(bm.playerId, bm.basePosition));

  return attackMoves.map(am => ({
    ...am,
    basePosition: basePosMap.get(am.playerId) ? { ...basePosMap.get(am.playerId)! } : { ...am.basePosition }
  }));
}

export function getMovements(
  scheme: DefenseSchemeConfig,
  scenarioId: string,
  rotation: number
): PlayerMovement[] {
  return composeMovements(scheme, scenarioId, rotation);
}

