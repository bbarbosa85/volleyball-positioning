// Script to generate comprehensive, named JSON defensive schemes for volleyball in English
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roster = [
  { id: 'p1', number: 7, name: 'Bruno', gender: 'M', role: 'Outside Hitter' },
  { id: 'p2', number: 4, name: 'Camila', gender: 'F', role: 'Setter' },
  { id: 'p3', number: 11, name: 'Diego', gender: 'M', role: 'Middle Blocker' },
  { id: 'p4', number: 2, name: 'Fernanda', gender: 'F', role: 'Outside Hitter' },
  { id: 'p5', number: 9, name: 'Lucas', gender: 'M', role: 'Opposite Hitter' },
  { id: 'p6', number: 5, name: 'Larissa', gender: 'F', role: 'Universal' },
];

function getZoneToPlayerMap(rotation) {
  const zoneCycle = [1, 6, 5, 4, 3, 2];
  const initialZones = [1, 2, 3, 4, 5, 6];
  const zoneToPlayer = {};

  roster.forEach((player, idx) => {
    const startZone = initialZones[idx];
    const posInCycle = zoneCycle.indexOf(startZone);
    const shiftedPos = (posInCycle + (rotation - 1)) % 6;
    const currentZone = zoneCycle[shiftedPos];
    zoneToPlayer[currentZone] = player.id;
  });

  return zoneToPlayer;
}

const scenarios = [
  'outside_cross',
  'outside_line',
  'outside_tip',
  'opposite_cross',
  'opposite_line',
  'middle_quick',
  'pipe_attack',
];

function buildScheme(id, fileName, name, description, systemType) {
  const schemes = {};

  scenarios.forEach((scenarioId) => {
    schemes[scenarioId] = {};

    for (let r = 1; r <= 6; r++) {
      const zoneToPlayer = getZoneToPlayerMap(r);
      const movements = [];

      for (let z = 1; z <= 6; z++) {
        const playerId = zoneToPlayer[z];

        // Base positions depending on system
        let base = { x: 50, y: 50 };
        if (z === 4) base = { x: 20, y: 12 };
        if (z === 3) base = { x: 50, y: 12 };
        if (z === 2) base = { x: 80, y: 12 };
        if (z === 5) base = { x: 22, y: 72 };
        if (z === 1) base = { x: 78, y: 72 };
        if (z === 6) {
          base = systemType === '6-avancado' ? { x: 50, y: 48 } : { x: 50, y: 84 };
        }

        let defense = { ...base };
        let actionType = 'dig_deep';
        let actionTitle = 'Read & React Base';
        let instructions = 'Maintain low athletic stance and read the setter touch.';

        if (scenarioId === 'outside_cross') {
          if (z === 2) {
            defense = systemType === 'fechando-diagonal' ? { x: 74, y: 5 } : { x: 83, y: 5 };
            actionType = 'block_primary';
            actionTitle = systemType === 'fechando-diagonal' ? 'Primary Block (Cross-Seam)' : 'Primary Block on Antenna';
            instructions = 'Time the jump with the high ball; seal the outside arm to prevent tool outs.';
          } else if (z === 3) {
            defense = systemType === 'fechando-diagonal' ? { x: 65, y: 5 } : { x: 73, y: 5 };
            actionType = 'block_assist';
            actionTitle = 'Double Block (Middle Assist)';
            instructions = 'Quick lateral footwork to close shoulder-to-shoulder with P2.';
          } else if (z === 4) {
            defense = { x: 30, y: 32 };
            actionType = 'off_block_cover';
            actionTitle = 'Off-Block Transition & Tip Cover';
            instructions = 'Pull 3 meters off the net to dig block rebounds or sharp inside angles.';
          } else if (z === 1) {
            if (systemType === 'fechando-diagonal') {
              defense = { x: 84, y: 74 };
              actionType = 'dig_line';
              actionTitle = 'Line Defense (Open Alley)';
              instructions = 'Block is taking away the cross; your responsibility is the line alley!';
            } else {
              defense = { x: 75, y: 48 };
              actionType = 'tip_cover';
              actionTitle = 'Tip Cover & Short Alley';
              instructions = 'Take two aggressive steps forward to scoop soft tips and roll shots.';
            }
          } else if (z === 6) {
            if (systemType === '6-avancado') {
              defense = { x: 62, y: 42 };
              actionType = 'tip_cover';
              actionTitle = 'Active Perimeter Tip Cover';
              instructions = 'Step up into the center "donut" area right behind the block.';
            } else {
              defense = { x: 48, y: 88 };
              actionType = 'dig_deep';
              actionTitle = 'Deep Baseline Defense';
              instructions = 'Guard the deep baseline against deflections or deep pushes.';
            }
          } else if (z === 5) {
            defense = { x: 26, y: 70 };
            actionType = 'dig_cross';
            actionTitle = 'Main Cross-Court Dig';
            instructions = 'Square body up to the hitter hitting shoulder. Stay balanced on balls of feet.';
          }
        } else if (scenarioId === 'outside_line') {
          if (z === 2) {
            defense = { x: 86, y: 5 };
            actionType = 'block_primary';
            actionTitle = 'Block Sealing Antenna';
            instructions = 'Zero daylight between the outside hand and the antenna.';
          } else if (z === 3) {
            defense = { x: 76, y: 5 };
            actionType = 'block_assist';
            actionTitle = 'Double Block';
            instructions = 'Close the seam with the right-side blocker.';
          } else if (z === 4) {
            defense = { x: 32, y: 34 };
            actionType = 'off_block_cover';
            actionTitle = 'Middle Off-Block Cover';
            instructions = 'Position ready for center deflections.';
          } else if (z === 1) {
            defense = { x: 86, y: 78 };
            actionType = 'dig_line';
            actionTitle = 'Hard Line Dig';
            instructions = 'Hug the right sideline ready to absorb the fast line shot.';
          } else if (z === 6) {
            defense = { x: 55, y: 84 };
            actionType = 'dig_deep';
            actionTitle = 'Deep Center Cover';
            instructions = 'Balance the backcourt in the middle third.';
          } else if (z === 5) {
            defense = { x: 30, y: 68 };
            actionType = 'dig_cross';
            actionTitle = 'Open Cross Dig';
            instructions = 'Watch for wrist turns back into the diagonal.';
          }
        } else if (scenarioId === 'outside_tip') {
          if (z === 2) {
            defense = { x: 84, y: 5 };
            actionType = 'block_primary';
            actionTitle = 'Block (Soft Touch Attempt)';
            instructions = 'Try to reach hands backwards if you see the roll early.';
          } else if (z === 3) {
            defense = { x: 74, y: 5 };
            actionType = 'block_assist';
            actionTitle = 'Double Block';
            instructions = 'Land in balance and react immediately.';
          } else if (z === 4) {
            defense = { x: 40, y: 30 };
            actionType = 'tip_cover';
            actionTitle = 'Infield Dive Cover';
            instructions = 'Sprint inwards to scoop the short ball.';
          } else if (z === 1) {
            defense = { x: 72, y: 35 };
            actionType = 'tip_cover';
            actionTitle = 'Short Tip Recovery';
            instructions = 'Dive on the soft tip landing near the 3-meter line.';
          } else if (z === 6) {
            defense = { x: 54, y: 44 };
            actionType = 'tip_cover';
            actionTitle = 'Center Hole Cover';
            instructions = 'Enter the dead zone and bump set the ball for the counterattack.';
          } else if (z === 5) {
            defense = { x: 32, y: 62 };
            actionType = 'dig_cross';
            actionTitle = 'Mid-Court Support';
            instructions = 'Take two forward steps to cover medium-range tips.';
          }
        } else if (scenarioId === 'opposite_cross') {
          if (z === 4) {
            defense = systemType === 'fechando-diagonal' ? { x: 26, y: 5 } : { x: 17, y: 5 };
            actionType = 'block_primary';
            actionTitle = 'Block Against Opponent Right Side';
            instructions = 'Take away the line alley or cross angle according to team call.';
          } else if (z === 3) {
            defense = systemType === 'fechando-diagonal' ? { x: 35, y: 5 } : { x: 27, y: 5 };
            actionType = 'block_assist';
            actionTitle = 'Middle Block Assist';
            instructions = 'Sprint left to close tight with P4.';
          } else if (z === 2) {
            defense = { x: 70, y: 34 };
            actionType = 'off_block_cover';
            actionTitle = 'Off-Block Transition';
            instructions = 'Drop off the net to defend center tip.';
          } else if (z === 5) {
            defense = { x: 16, y: 74 };
            actionType = 'dig_line';
            actionTitle = 'Left Line Defense';
            instructions = 'Hold the sideline in Zone 5.';
          } else if (z === 6) {
            defense = systemType === '6-avancado' ? { x: 38, y: 45 } : { x: 52, y: 88 };
            actionType = systemType === '6-avancado' ? 'tip_cover' : 'dig_deep';
            actionTitle = systemType === '6-avancado' ? 'Short Tip Cover' : 'Deep Middle';
            instructions = 'Read the cross-court power spike or deep corner push.';
          } else if (z === 1) {
            defense = { x: 74, y: 72 };
            actionType = 'dig_cross';
            actionTitle = 'Primary Cross Dig';
            instructions = 'Positioned for the heavy cross-court swing from the opposite.';
          }
        } else if (scenarioId === 'opposite_line') {
          if (z === 4) {
            defense = { x: 15, y: 5 };
            actionType = 'block_primary';
            actionTitle = 'Block Sealing Left Antenna';
            instructions = 'Prevent any ball slipping through the outside seam.';
          } else if (z === 3) {
            defense = { x: 25, y: 5 };
            actionType = 'block_assist';
            actionTitle = 'Double Block';
            instructions = 'Solid wall beside P4.';
          } else if (z === 2) {
            defense = { x: 68, y: 34 };
            actionType = 'off_block_cover';
            actionTitle = 'Center Off-Block Cover';
            instructions = 'Ready for tooling deflections.';
          } else if (z === 5) {
            defense = { x: 15, y: 80 };
            actionType = 'dig_line';
            actionTitle = 'Fast Line Dig';
            instructions = 'Eyes on the ball, firm platform angled towards the setter.';
          } else if (z === 6) {
            defense = { x: 46, y: 84 };
            actionType = 'dig_deep';
            actionTitle = 'Deep Baseline Support';
            instructions = 'Support the line digger on deep deflections.';
          } else if (z === 1) {
            defense = { x: 70, y: 68 };
            actionType = 'dig_cross';
            actionTitle = 'Open Cross Dig';
            instructions = 'Cover cut shots directed to back-right corner.';
          }
        } else if (scenarioId === 'middle_quick') {
          if (z === 3) {
            defense = { x: 50, y: 5 };
            actionType = 'block_primary';
            actionTitle = 'Middle Block Jump on Tempo';
            instructions = 'Commit jump with arms pressing aggressively across the net plane.';
          } else if (z === 4) {
            defense = { x: 36, y: 7 };
            actionType = 'block_assist';
            actionTitle = 'Pinch In Block';
            instructions = 'Pinch inside to narrow the opposing middle hitting window.';
          } else if (z === 2) {
            defense = { x: 64, y: 7 };
            actionType = 'block_assist';
            actionTitle = 'Pinch In Block';
            instructions = 'Pinch inside to close the right seam.';
          } else if (z === 5) {
            defense = { x: 25, y: 62 };
            actionType = 'dig_cross';
            actionTitle = 'Low Reflex Dig (Left)';
            instructions = 'Very low base; quick reaction for hard bounced spikes.';
          } else if (z === 6) {
            defense = { x: 50, y: 66 };
            actionType = 'dig_deep';
            actionTitle = 'Center 1st Tempo Dig';
            instructions = 'Step 2 steps forward from baseline to dig fast spikes.';
          } else if (z === 1) {
            defense = { x: 75, y: 62 };
            actionType = 'dig_cross';
            actionTitle = 'Low Reflex Dig (Right)';
            instructions = 'Platform formed early to absorb fast pace.';
          }
        } else if (scenarioId === 'pipe_attack') {
          if (z === 3) {
            defense = { x: 50, y: 6 };
            actionType = 'block_primary';
            actionTitle = 'Pipe Block (Delayed Jump)';
            instructions = 'Slightly delayed jump to meet the 3m attacker at their peak.';
          } else if (z === 4) {
            defense = { x: 28, y: 16 };
            actionType = 'off_block_cover';
            actionTitle = '10-Foot Line Defense';
            instructions = 'Drop off the net to dig deflection deflections.';
          } else if (z === 2) {
            defense = { x: 72, y: 16 };
            actionType = 'off_block_cover';
            actionTitle = '10-Foot Line Defense';
            instructions = 'Drop off the net to dig block rebounds.';
          } else if (z === 5) {
            defense = { x: 22, y: 78 };
            actionType = 'dig_deep';
            actionTitle = 'Deep Left Corner Dig';
            instructions = 'Protect the left corner against deep high spikes.';
          } else if (z === 6) {
            defense = { x: 50, y: 86 };
            actionType = 'dig_deep';
            actionTitle = 'Primary Pipe Dig (Center Baseline)';
            instructions = 'Pipe missiles usually land deep center. Plant feet and dig up!';
          } else if (z === 1) {
            defense = { x: 78, y: 78 };
            actionType = 'dig_deep';
            actionTitle = 'Deep Right Corner Dig';
            instructions = 'Protect the right corner against deep high spikes.';
          }
        }

        movements.push({
          playerId,
          zone: z,
          basePosition: base,
          defensePosition: defense,
          actionType,
          actionTitle,
          instructions,
        });
      }

      schemes[scenarioId][r] = movements;
    }
  });

  return {
    id,
    fileName,
    name,
    description,
    systemType,
    schemes,
  };
}

const configs = [
  {
    id: 'defesa-6-recuado',
    fileName: 'defesa-6-recuado-tradicional.json',
    name: 'Rotational Defense 6 Deep (Perimeter)',
    description: 'Classic & solid system: P6 defends the deep baseline, P1 and P5 defend cross/line, and the block seals the primary angle.',
    systemType: '6-recuado',
  },
  {
    id: 'defesa-6-avancado',
    fileName: 'defesa-6-avancado-cobertura.json',
    name: 'Defense 6 Up (Tip Cover / Donut)',
    description: 'P6 steps up into the 10-foot area to cover all tips, rolls, and off-block touches. Ideal against teams that tip frequently.',
    systemType: '6-avancado',
  },
  {
    id: 'defesa-fechando-paralela',
    fileName: 'defesa-fechando-paralela.json',
    name: 'Line-Sealing Defense',
    description: 'The block strictly seals the line alley, funneling all attacks into the cross-court where defenders are waiting.',
    systemType: 'fechando-linha',
  },
  {
    id: 'defesa-fechando-diagonal',
    fileName: 'defesa-fechando-diagonal.json',
    name: 'Cross-Sealing Defense',
    description: 'The block takes away the sharp and middle cross angle, opening the line with a dedicated defender locked on the sideline.',
    systemType: 'fechando-diagonal',
  },
];

const targetDir = path.resolve(__dirname, '../src/data/schemes');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

configs.forEach((cfg) => {
  const schemeData = buildScheme(cfg.id, cfg.fileName, cfg.name, cfg.description, cfg.systemType);
  const filePath = path.join(targetDir, cfg.fileName);
  fs.writeFileSync(filePath, JSON.stringify(schemeData, null, 2), 'utf-8');
  console.log(`Generated: ${cfg.fileName}`);
});
