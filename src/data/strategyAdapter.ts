import type { Strategy, PlayerMovement, AttackScenario, Zone, DefenseActionType, Player } from '../types/volleyball';
import { defaultRoster } from './defaultRoster';

/**
 * Returns the players ordered by zone (1 to 6) for a given rotation.
 * In Rotation 1 (Man Serving):
 *   Zone 1: p1 (M)
 *   Zone 2: p2 (F)
 *   Zone 3: p3 (M)
 *   Zone 4: p4 (F)
 *   Zone 5: p5 (M)
 *   Zone 6: p6 (F)
 * In Rotation 2 (Woman Serving):
 *   Zone 1: p6 (F)
 *   Zone 2: p1 (M)
 *   Zone 3: p2 (F)
 *   Zone 4: p3 (M)
 *   Zone 5: p4 (F)
 *   Zone 6: p5 (M)
 */
export function getZonePlayerMap(rotation: 1 | 2): Record<Zone, Player> {
  const pMap = new Map(defaultRoster.map(p => [p.id, p]));
  if (rotation === 2) {
    return {
      1: pMap.get('p6')!,
      2: pMap.get('p1')!,
      3: pMap.get('p2')!,
      4: pMap.get('p3')!,
      5: pMap.get('p4')!,
      6: pMap.get('p5')!
    };
  }
  return {
    1: pMap.get('p1')!,
    2: pMap.get('p2')!,
    3: pMap.get('p3')!,
    4: pMap.get('p4')!,
    5: pMap.get('p5')!,
    6: pMap.get('p6')!
  };
}

export function getRosterForRotation(rotation: 1 | 2): Player[] {
  const map = getZonePlayerMap(rotation);
  return [map[1], map[2], map[3], map[4], map[5], map[6]];
}

export function strategyToMovements(strategy: Strategy): PlayerMovement[] {
  const zonePlayerMap = getZonePlayerMap(strategy.rotation);
  const zones: Zone[] = [1, 2, 3, 4, 5, 6];

  return zones.map(zone => {
    const player = zonePlayerMap[zone];
    const basePos = strategy.base.defenders[zone] || { x: 50, y: 50 };
    const defPos = strategy.defense.defenders[zone] || { x: 50, y: 50 };
    const actionType: DefenseActionType = strategy.defense.actions?.[zone] || 'tip_cover';

    return {
      playerId: player.id,
      zone,
      basePosition: { ...basePos },
      defensePosition: { ...defPos },
      actionType,
      actionTitle: formatActionTitle(actionType),
      instructions: ''
    };
  });
}

export function strategyToScenario(strategy: Strategy): AttackScenario {
  return {
    id: strategy.id,
    name: strategy.name,
    originZone: 'Opponent Outside',
    type: 'hard_cross',
    label: strategy.name,
    attackerX: strategy.attacker.x,
    attackerY: strategy.attacker.y,
    setterX: strategy.setter.x,
    setterY: strategy.setter.y,
    targetX: strategy.target.x,
    targetY: strategy.target.y,
    description: strategy.description || '',
    defensiveKey: '',
    rotation: strategy.rotation
  };
}

function formatActionTitle(action: DefenseActionType): string {
  switch (action) {
    case 'block_primary':
      return 'Primary Block';
    case 'block_assist':
      return 'Assist Block';
    case 'dig_cross':
      return 'Cross Dig';
    case 'dig_line':
      return 'Line Dig';
    case 'dig_deep':
      return 'Deep Dig';
    case 'tip_cover':
      return 'Tip Cover';
    case 'off_block_cover':
      return 'Off-Block Cover';
    default:
      return 'Defense Coverage';
  }
}
