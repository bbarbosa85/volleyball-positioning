import type { Player } from '../types/volleyball';

export const defaultRoster: Player[] = [
  {
    id: 'p1',
    number: 1,
    name: 'Bruno',
    gender: 'M',
    role: 'Outside Hitter',
    avatarColor: '#2563eb' // Blue
  },
  {
    id: 'p2',
    number: 2,
    name: 'Camila',
    gender: 'F',
    role: 'Setter',
    avatarColor: '#facc15' // Yellow
  },
  {
    id: 'p3',
    number: 3,
    name: 'Diego',
    gender: 'M',
    role: 'Middle Blocker',
    avatarColor: '#2563eb' // Blue
  },
  {
    id: 'p4',
    number: 4,
    name: 'Fernanda',
    gender: 'F',
    role: 'Outside Hitter',
    avatarColor: '#facc15' // Yellow
  },
  {
    id: 'p5',
    number: 5,
    name: 'Lucas',
    gender: 'M',
    role: 'Opposite Hitter',
    avatarColor: '#2563eb' // Blue
  },
  {
    id: 'p6',
    number: 6,
    name: 'Larissa',
    gender: 'F',
    role: 'Universal',
    avatarColor: '#facc15' // Yellow
  }
];

// Zone numbers on volleyball court
export const ZONE_NAMES: Record<number, string> = {
  1: 'Position 1 (Right Back / Serve)',
  2: 'Position 2 (Right Front)',
  3: 'Position 3 (Middle Front)',
  4: 'Position 4 (Left Front)',
  5: 'Position 5 (Left Back)',
  6: 'Position 6 (Middle Back)'
};

// Map which player index occupies which zone in each rotation (1 to 6)
// In volleyball, players rotate clockwise: 1 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1
export function getPlayersForRotation(roster: Player[], rotation: number): { player: Player; zone: 1 | 2 | 3 | 4 | 5 | 6 }[] {
  const zones: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];
  return roster.map((player, index) => {
    const zoneCycle = [1, 6, 5, 4, 3, 2];
    const initialPos = zoneCycle.indexOf(zones[index]);
    const shiftedIndex = (initialPos + (rotation - 1)) % 6;
    const currentZone = zoneCycle[shiftedIndex] as (1 | 2 | 3 | 4 | 5 | 6);
    return { player, zone: currentZone };
  });
}
