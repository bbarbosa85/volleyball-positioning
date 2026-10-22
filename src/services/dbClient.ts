import type { AttackScenario, Player, PlayerMovement, DefenseSchemeConfig } from '../types/volleyball';

export interface DbStatus {
  connected: boolean;
  dbPath?: string;
  fileSize?: number;
  lastModified?: string;
  counts?: {
    customScenarios: number;
    customMovements: number;
    roster: number;
  };
  error?: string;
}

export async function checkDbStatus(): Promise<DbStatus> {
  try {
    const res = await fetch('/api/db/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      connected: true,
      dbPath: data.dbPath,
      fileSize: data.fileSize,
      lastModified: data.lastModified,
      counts: data.counts
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message
    };
  }
}

export async function loadDbData(): Promise<{
  scenarios: AttackScenario[];
  schemes: Record<string, Record<number, PlayerMovement[]>>;
  roster: Player[];
} | null> {
  try {
    const res = await fetch('/api/db/data');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.ok) return null;
    return {
      scenarios: data.scenarios || [],
      schemes: data.schemes || {},
      roster: data.roster || []
    };
  } catch (err) {
    console.warn('[dbClient] Failed to load data from SQLite backend:', err);
    return null;
  }
}

export async function saveScenarioToDb(
  scenario: AttackScenario,
  schemes?: Record<number, PlayerMovement[]>
): Promise<boolean> {
  try {
    const res = await fetch('/api/db/save-scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, schemes })
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.error('[dbClient] Error saving scenario to SQLite:', err);
    return false;
  }
}

export async function deleteScenarioFromDb(scenarioId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/db/scenario/${encodeURIComponent(scenarioId)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.error('[dbClient] Error deleting scenario from SQLite:', err);
    return false;
  }
}

export async function saveRosterToDb(roster: Player[]): Promise<boolean> {
  try {
    const res = await fetch('/api/db/save-roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roster })
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.error('[dbClient] Error saving roster to SQLite:', err);
    return false;
  }
}

export function downloadSqliteDbFile() {
  const link = document.createElement('a');
  link.href = '/api/db/download';
  link.download = 'volleyball.db';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
