import type { Player, PlayerMovement, AttackScenario, CoedBlockMode } from '../types/volleyball';

export interface CoedFrontRowAnalysis {
  frontRowPlayers: { player: Player; zone: number }[];
  menInFront: { player: Player; zone: number }[];
  womenInFront: { player: Player; zone: number }[];
  activeBlockerIds: string[];
  blockDescription: string;
}

/**
 * Analyzes the front row (Zones 4, 3, 2) in the active rotation and applies
 * authentic COED volleyball blocking rules:
 * - Women on the net do not block; they pull off the net to cover tips.
 * - If only 1 man is front, only 1 blocks (solo man block).
 * - If 2 men are front, by default only 1 blocks (single block), or 2 if double block mode is enabled.
 */
export function applyCoedBlockingRules(
  rawMovements: PlayerMovement[],
  roster: Player[],
  rotation: number,
  scenario: AttackScenario,
  blockMode: CoedBlockMode = 'single_man',
  preserveUserPositions: boolean = false
): { movements: PlayerMovement[]; analysis: CoedFrontRowAnalysis } {
  // Map player to zone
  const playerZoneMap = new Map<string, number>();
  rawMovements.forEach(m => playerZoneMap.set(m.playerId, m.zone));

  const frontRowPlayers = roster
    .filter(p => {
      const z = playerZoneMap.get(p.id);
      return z === 4 || z === 3 || z === 2;
    })
    .map(p => ({ player: p, zone: playerZoneMap.get(p.id)! }));

  const menInFront = frontRowPlayers.filter(fp => fp.player.gender === 'M');
  const womenInFront = frontRowPlayers.filter(fp => fp.player.gender === 'F');

  // Determine attack target side (P4 side = left, P2 side = right, P3 = center)
  let attackTargetZone = 2; // Default outside attack aims at our right side (P2)
  if (scenario.attackerX !== undefined) {
    if (scenario.attackerX < 35) {
      attackTargetZone = 4; // Opponent right side attacks our left side (P4)
    } else if (scenario.attackerX > 65) {
      attackTargetZone = 2; // Opponent outside attacks our right side (P2)
    } else {
      attackTargetZone = 3; // Center attacks (middle / pipe)
    }
  } else if (scenario.id.startsWith('opposite')) {
    attackTargetZone = 4;
  } else if (scenario.type === 'quick_middle' || scenario.type === 'pipe') {
    attackTargetZone = 3;
  }

  // Determine which man/men will block
  let activeBlockerIds: string[] = [];
  let blockDescription = '';

  if (menInFront.length === 0) {
    activeBlockerIds = [];
    blockDescription = 'No men in front row: 0 blockers';
  } else if (menInFront.length === 1) {
    const soloMan = menInFront[0];
    activeBlockerIds = [soloMan.player.id];
    blockDescription = `1 man in front (P${soloMan.zone}): Solo Man Block`;
  } else {
    if (blockMode === 'double_if_possible') {
      activeBlockerIds = menInFront.map(m => m.player.id);
      blockDescription = `2 men in front: Double Block (P${menInFront[0].zone} & P${menInFront[1].zone})`;
    } else {
      const sortedByProximity = [...menInFront].sort((a, b) => {
        const distA = Math.abs(a.zone - attackTargetZone);
        const distB = Math.abs(b.zone - attackTargetZone);
        return distA - distB;
      });
      const chosenSoloMan = sortedByProximity[0];
      activeBlockerIds = [chosenSoloMan.player.id];
      blockDescription = `2 men in front: 1 Man Blocks Solo (P${chosenSoloMan.zone})`;
    }
  }

  // When positions are modified or for customized presets, PRESERVE user coordinates completely!
  // All players can be dragged and positioned freely without snapping back.
  if (preserveUserPositions || scenario) {
    const adjustedMovements: PlayerMovement[] = rawMovements.map(m => {
      const isBlocker = activeBlockerIds.includes(m.playerId);
      return {
        ...m,
        actionType: isBlocker ? 'block_primary' : m.actionType
      };
    });

    return {
      movements: adjustedMovements,
      analysis: {
        frontRowPlayers,
        menInFront,
        womenInFront,
        activeBlockerIds,
        blockDescription
      }
    };
  }

  // Default preset transformation for standard built-ins when not in edit mode
  const adjustedMovements: PlayerMovement[] = rawMovements.map(m => {
    const player = roster.find(p => p.id === m.playerId);
    const isFrontRow = m.zone === 4 || m.zone === 3 || m.zone === 2;
    const isWoman = player?.gender === 'F';
    const isBlocker = activeBlockerIds.includes(m.playerId);

    if (isFrontRow && isWoman) {
      const pullOffX = m.zone === 4 ? 26 : m.zone === 2 ? 74 : 50;
      return {
        ...m,
        defensePosition: { x: pullOffX, y: 30 },
        actionType: 'tip_cover',
        actionTitle: `Off-Net Tip Cover (P${m.zone})`,
        instructions: `As a woman in front row, pull 10 feet off the net to cover short tips and roll shots.`
      };
    }

    if (isFrontRow && !isBlocker) {
      // A front-row man who is NOT blocking drops off to cover tip / donut
      const pullOffX = m.zone === 4 ? 32 : m.zone === 2 ? 68 : 50;
      return {
        ...m,
        defensePosition: { x: pullOffX, y: 32 },
        actionType: 'off_block_cover',
        actionTitle: `Off-Block Cover (P${m.zone})`,
        instructions: `Drop off the net to cover the donut hole behind the solo block.`
      };
    }

    if (isFrontRow && isBlocker) {
      let blockX = m.defensePosition.x;
      let actionTitle = m.actionTitle;
      let instructions = m.instructions;

      if (activeBlockerIds.length === 1) {
        if (attackTargetZone === 2) blockX = 80;
        else if (attackTargetZone === 4) blockX = 20;
        else blockX = 50;
        actionTitle = `Solo Man Block (P${m.zone})`;
        instructions = `Solo block: Seal the main attack angle at the net.`;
      } else if (activeBlockerIds.length === 2) {
        // Double block: primary blocker seals the pin/point of attack, assist blocker closes seam
        const isCloserToTarget = Math.abs(m.zone - attackTargetZone) <= 1;
        if (attackTargetZone === 2) {
          blockX = isCloserToTarget ? 80 : 72;
        } else if (attackTargetZone === 4) {
          blockX = isCloserToTarget ? 20 : 28;
        } else {
          blockX = m.zone === 4 ? 45 : 55;
        }
        actionTitle = isCloserToTarget ? `Primary Block (P${m.zone})` : `Assist Block (P${m.zone})`;
        instructions = `Double block: Close shoulder-to-shoulder with partner at the net.`;
      }

      return {
        ...m,
        defensePosition: { x: blockX, y: 5 },
        actionType: 'block_primary',
        actionTitle,
        instructions
      };
    }

    // Backrow players remain unchanged
    return { ...m };
  });

  return {
    movements: adjustedMovements,
    analysis: {
      frontRowPlayers,
      menInFront,
      womenInFront,
      activeBlockerIds,
      blockDescription
    }
  };
}
