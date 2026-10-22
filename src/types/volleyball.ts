export type Gender = 'M' | 'F';

export type PlayerRole = 
  | 'Outside Hitter'
  | 'Opposite Hitter'
  | 'Middle Blocker'
  | 'Setter'
  | 'Universal'
  | 'Libero';

export interface Player {
  id: string; // e.g. 'P1', 'P2', etc.
  number: number;
  name: string;
  gender: Gender;
  role: PlayerRole;
  avatarColor?: string;
}

export interface CourtPosition {
  x: number; // 0 to 100 (percentage of court width, 0=left, 100=right)
  y: number; // 0 to 100 (percentage of court length from net, 0=net, 33.3=3m line, 100=baseline)
}

export type CoedBlockMode = 'single_man' | 'double_if_possible';

export type DefenseActionType = 
  | 'block_primary'
  | 'block_assist'
  | 'dig_cross'
  | 'dig_line'
  | 'dig_deep'
  | 'tip_cover'
  | 'off_block_cover';

export interface PlayerMovement {
  playerId: string;
  zone: 1 | 2 | 3 | 4 | 5 | 6; // Zone occupied in this rotation
  basePosition: CourtPosition;
  defensePosition: CourtPosition;
  actionType: DefenseActionType;
  actionTitle: string;
  instructions: string;
}

export interface AttackScenario {
  id: string;
  name: string;
  originZone: string; // e.g. 'Opponent Outside (Zone 4)', 'Custom Adjustment'
  type: 'hard_cross' | 'line' | 'tip' | 'pipe' | 'quick_middle' | 'custom';
  label: string;
  attackerX: number; // 0-100 on opponent court (0=left, 100=right)
  attackerY: number; // 0-100 on opponent court (0=baseline, 100=net)
  targetX: number; // expected hot zone of the spike on defending court (0-100)
  targetY: number; // expected hot zone of the spike on defending court (0-100 from net to baseline)
  secondaryTargetX?: number;
  secondaryTargetY?: number;
  description: string;
  defensiveKey: string;
  isCustom?: boolean;
}

export interface RotationState {
  rotation: 1 | 2 | 3 | 4 | 5 | 6;
  playerOrder: string[]; // array of 6 player IDs starting from zone 1,2,3,4,5,6
}

export interface DefenseSchemeConfig {
  id: string;
  fileName: string;
  name: string;
  description: string;
  systemType: '6-recuado' | '6-avancado' | 'fechando-linha' | 'fechando-diagonal';
  // Mapping: scenarioId -> rotation (1..6) -> movements for all 6 players
  schemes: Record<string, Record<number, PlayerMovement[]>>;
}
