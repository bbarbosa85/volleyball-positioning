import type { DefenseSchemeConfig, PlayerMovement } from '../types/volleyball';
import defesa6Recuado from './schemes/defesa-6-recuado-tradicional.json';
import defesa6Avancado from './schemes/defesa-6-avancado-cobertura.json';
import defesaFechandoParalela from './schemes/defesa-fechando-paralela.json';
import defesaFechandoDiagonal from './schemes/defesa-fechando-diagonal.json';

export const builtInSchemes: DefenseSchemeConfig[] = [
  defesa6Recuado as DefenseSchemeConfig,
  defesa6Avancado as DefenseSchemeConfig,
  defesaFechandoParalela as DefenseSchemeConfig,
  defesaFechandoDiagonal as DefenseSchemeConfig,
];

const LOCAL_STORAGE_KEY = 'volleyball_defense_schemes_v1';

export function loadAllSchemes(): DefenseSchemeConfig[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with built-in in case new ones were added
        const builtInIds = new Set(builtInSchemes.map(s => s.id));
        const customSchemes = parsed.filter((s: DefenseSchemeConfig) => !builtInIds.has(s.id));
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

export function rotateMovementsForRotation(
  movements: PlayerMovement[],
  targetRotation: number
): PlayerMovement[] {
  return movements.map(m => {
    // Official volleyball rotation: at rotation R, the player in Zone Z is ((Z + R - 2) % 6) + 1
    const playerNum = ((m.zone + targetRotation - 2) % 6) + 1;
    return {
      ...m,
      playerId: `p${playerNum}`
    };
  });
}

export function getMovements(
  scheme: DefenseSchemeConfig,
  scenarioId: string,
  rotation: number
): PlayerMovement[] {
  if (scheme.schemes && scheme.schemes[scenarioId]) {
    const scenarioSchemes = scheme.schemes[scenarioId];
    if (scenarioSchemes[rotation]) {
      return rotateMovementsForRotation(scenarioSchemes[rotation], rotation);
    }
    // If this specific rotation wasn't explicitly saved, rotate from rotation 1
    if (scenarioSchemes[1]) {
      return rotateMovementsForRotation(scenarioSchemes[1], rotation);
    }
  }
  
  // Fallback to default scenario
  const defaultScenario = Object.keys(scheme.schemes || {})[0] || 'outside_cross';
  const rotationMoves = scheme.schemes?.[defaultScenario]?.[rotation] || 
                        scheme.schemes?.[defaultScenario]?.[1] || [];
  return rotateMovementsForRotation(rotationMoves, rotation);
}

