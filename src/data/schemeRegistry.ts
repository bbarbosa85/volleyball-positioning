import type { DefenseSchemeConfig, PlayerMovement } from '../types/volleyball';
import defesa6Recuado from './schemes/defesa-6-recuado-tradicional.json';

export const initialBaseSchemes: DefenseSchemeConfig[] = [
  // Rotation 1 (Men Serving)
  {
    ...(defesa6Recuado as DefenseSchemeConfig),
    id: 'base_r1_standard',
    name: 'Base Read',
    rotation: 1,
    description: 'Pre-contact reading stance with P6 defending deep baseline and solo blocker P3 holding net center.'
  },
  // Rotation 2 (Women Serving)
  {
    ...(defesa6Recuado as DefenseSchemeConfig),
    id: 'base_r2_standard',
    name: 'Double Wall Read',
    rotation: 2,
    description: 'Two-man front wall (P4 & P2) ready to close either wing; back-row defends deep perimeter.'
  }
];

const LOCAL_STORAGE_KEY = 'volleyball_base_schemes_v4';

export function loadAllSchemes(): DefenseSchemeConfig[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s: DefenseSchemeConfig) => ({
          ...s,
          rotation: (s.rotation === 2 ? 2 : 1) as (1 | 2)
        }));
      }
    }
  } catch (err) {
    console.warn('Failed to load schemes from localStorage', err);
  }
  // If no saved schemes in localStorage, seed with initial starter presets
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialBaseSchemes));
  } catch {}
  return JSON.parse(JSON.stringify(initialBaseSchemes));
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

export function deleteScheme(schemeId: string): DefenseSchemeConfig[] {
  try {
    const current = loadAllSchemes();
    const filtered = current.filter(s => s.id !== schemeId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.warn('Failed to delete scheme from localStorage', err);
    return [];
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
      return scenarioSchemes[rotation];
    }
    if (scenarioSchemes[1]) {
      return rotateMovementsForRotation(scenarioSchemes[1], rotation);
    }
  }
  return [];
}

const scenarioAliasMap: Record<string, string> = {
  r1_outside_cross: 'outside_cross',
  r1_outside_line: 'outside_line',
  r1_middle_quick: 'middle_quick',
  r2_outside_cross: 'outside_cross',
  r2_fast_line: 'outside_line',
  r2_pipe_attack: 'pipe_attack'
};

export function getAttackScenarioMovements(
  scenarioId: string,
  rotation: number,
  customSource?: Record<string, Record<number, PlayerMovement[]>>
): PlayerMovement[] {
  const resolvedKey = scenarioAliasMap[scenarioId] || scenarioId;
  const source = customSource?.[scenarioId] || canonicalAttackSchemes[scenarioId] || canonicalAttackSchemes[resolvedKey];
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

