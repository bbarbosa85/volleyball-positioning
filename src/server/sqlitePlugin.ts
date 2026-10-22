import type { Plugin } from 'vite';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

interface SqlitePluginOptions {
  dbDir?: string;
  dbName?: string;
}

export function sqlitePlugin(options: SqlitePluginOptions = {}): Plugin {
  const dbDir = path.resolve(options.dbDir || 'data');
  const dbName = options.dbName || 'volleyball.db';
  const dbPath = path.join(dbDir, dbName);

  let db: Database.Database | null = null;

  function getDb(): Database.Database {
    if (!db) {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      const instance = new Database(dbPath);
      initTables(instance);
      db = instance;
    }
    return db;
  }

  function initTables(database: Database.Database) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS custom_scenarios (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        label TEXT,
        type TEXT NOT NULL,
        origin_zone TEXT,
        attacker_x REAL NOT NULL,
        attacker_y REAL NOT NULL,
        target_x REAL NOT NULL,
        target_y REAL NOT NULL,
        description TEXT,
        defensive_key TEXT,
        is_custom INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS custom_scheme_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scenario_id TEXT NOT NULL,
        rotation INTEGER NOT NULL,
        player_id TEXT NOT NULL,
        base_x REAL NOT NULL,
        base_y REAL NOT NULL,
        def_x REAL NOT NULL,
        def_y REAL NOT NULL,
        role TEXT,
        instructions TEXT,
        UNIQUE(scenario_id, rotation, player_id)
      );

      CREATE TABLE IF NOT EXISTS roster (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        number INTEGER,
        role TEXT NOT NULL,
        gender TEXT NOT NULL,
        default_zone INTEGER NOT NULL,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }

  return {
    name: 'vite-plugin-sqlite-volleyball',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/db')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        try {
          const database = getDb();

          // 1. Database status
          if (pathname === '/api/db/status' && req.method === 'GET') {
            const scenarioCount = (database.prepare('SELECT COUNT(*) as count FROM custom_scenarios').get() as any)?.count || 0;
            const movementsCount = (database.prepare('SELECT COUNT(*) as count FROM custom_scheme_movements').get() as any)?.count || 0;
            const rosterCount = (database.prepare('SELECT COUNT(*) as count FROM roster').get() as any)?.count || 0;
            const stats = fs.statSync(dbPath);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
              ok: true,
              dbPath,
              fileSize: stats.size,
              lastModified: stats.mtime.toISOString(),
              counts: {
                customScenarios: scenarioCount,
                customMovements: movementsCount,
                roster: rosterCount,
              }
            }));
          }

          // 2. Load all database data
          if (pathname === '/api/db/data' && req.method === 'GET') {
            const rawScenarios = database.prepare('SELECT * FROM custom_scenarios ORDER BY updated_at DESC').all() as any[];
            const scenarios = rawScenarios.map(s => ({
              id: s.id,
              name: s.name,
              label: s.label,
              type: s.type,
              originZone: s.origin_zone,
              attackerX: s.attacker_x,
              attackerY: s.attacker_y,
              targetX: s.target_x,
              targetY: s.target_y,
              description: s.description,
              defensiveKey: s.defensive_key,
              isCustom: Boolean(s.is_custom)
            }));

            const rawMovements = database.prepare('SELECT * FROM custom_scheme_movements').all() as any[];
            // Group by scenario_id -> rotation -> PlayerMovement[]
            const schemes: Record<string, Record<number, any[]>> = {};
            for (const m of rawMovements) {
              if (!schemes[m.scenario_id]) schemes[m.scenario_id] = {};
              if (!schemes[m.scenario_id][m.rotation]) schemes[m.scenario_id][m.rotation] = [];
              schemes[m.scenario_id][m.rotation].push({
                playerId: m.player_id,
                basePosition: { x: m.base_x, y: m.base_y },
                defensePosition: { x: m.def_x, y: m.def_y },
                role: m.role,
                instructions: m.instructions
              });
            }

            const rawRoster = database.prepare('SELECT * FROM roster').all() as any[];
            const roster = rawRoster.map(r => ({
              id: r.id,
              name: r.name,
              number: r.number,
              role: r.role,
              gender: r.gender,
              defaultZone: r.default_zone
            }));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
              ok: true,
              scenarios,
              schemes,
              roster
            }));
          }

          // 3. Save Scenario & its movements
          if (pathname === '/api/db/save-scenario' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const s = data.scenario;
                const now = new Date().toISOString();

                const upsertScenario = database.prepare(`
                  INSERT INTO custom_scenarios (
                    id, name, label, type, origin_zone, attacker_x, attacker_y, target_x, target_y,
                    description, defensive_key, is_custom, created_at, updated_at
                  ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, COALESCE((SELECT created_at FROM custom_scenarios WHERE id = ?), ?), ?
                  )
                  ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    label = excluded.label,
                    type = excluded.type,
                    origin_zone = excluded.origin_zone,
                    attacker_x = excluded.attacker_x,
                    attacker_y = excluded.attacker_y,
                    target_x = excluded.target_x,
                    target_y = excluded.target_y,
                    description = excluded.description,
                    defensive_key = excluded.defensive_key,
                    updated_at = excluded.updated_at
                `);

                upsertScenario.run(
                  s.id, s.name, s.label || '', s.type, s.originZone || '',
                  s.attackerX ?? 82, s.attackerY ?? 86, s.targetX ?? 50, s.targetY ?? 70,
                  s.description || '', s.defensiveKey || '', s.id, now, now
                );

                // If scheme movements for rotations were provided, save them
                if (data.schemes && typeof data.schemes === 'object') {
                  const upsertMove = database.prepare(`
                    INSERT INTO custom_scheme_movements (
                      scenario_id, rotation, player_id, base_x, base_y, def_x, def_y, role, instructions
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(scenario_id, rotation, player_id) DO UPDATE SET
                      base_x = excluded.base_x,
                      base_y = excluded.base_y,
                      def_x = excluded.def_x,
                      def_y = excluded.def_y,
                      role = excluded.role,
                      instructions = excluded.instructions
                  `);

                  const insertMany = database.transaction((scenarioId: string, rotationsMap: Record<number, any[]>) => {
                    for (const [rotStr, moves] of Object.entries(rotationsMap)) {
                      const rot = parseInt(rotStr, 10);
                      if (Array.isArray(moves)) {
                        for (const m of moves) {
                          upsertMove.run(
                            scenarioId, rot, m.playerId,
                            m.basePosition.x, m.basePosition.y,
                            m.defensePosition.x, m.defensePosition.y,
                            m.role || '', m.instructions || ''
                          );
                        }
                      }
                    }
                  });

                  insertMany(s.id, data.schemes);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: true, id: s.id }));
              } catch (e: any) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: false, error: e.message }));
              }
            });
            return;
          }

          // 4. Delete Scenario
          if (pathname.startsWith('/api/db/scenario/') && req.method === 'DELETE') {
            const scenarioId = pathname.replace('/api/db/scenario/', '');
            if (scenarioId) {
              database.prepare('DELETE FROM custom_scheme_movements WHERE scenario_id = ?').run(scenarioId);
              database.prepare('DELETE FROM custom_scenarios WHERE id = ?').run(scenarioId);
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true, deleted: scenarioId }));
          }

          // 5. Save Roster
          if (pathname === '/api/db/save-roster' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { roster } = JSON.parse(body);
                const now = new Date().toISOString();
                const upsertRoster = database.prepare(`
                  INSERT INTO roster (id, name, number, role, gender, default_zone, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    number = excluded.number,
                    role = excluded.role,
                    gender = excluded.gender,
                    default_zone = excluded.default_zone,
                    updated_at = excluded.updated_at
                `);

                const saveAll = database.transaction((players: any[]) => {
                  for (const p of players) {
                    upsertRoster.run(p.id, p.name, p.number || 0, p.role, p.gender, p.defaultZone || 1, now);
                  }
                });

                saveAll(roster);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: true, count: roster.length }));
              } catch (e: any) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: false, error: e.message }));
              }
            });
            return;
          }

          // 6. Direct binary download of volleyball.db
          if (pathname === '/api/db/download' && req.method === 'GET') {
            const fileStream = fs.createReadStream(dbPath);
            res.writeHead(200, {
              'Content-Type': 'application/x-sqlite3',
              'Content-Disposition': 'attachment; filename="volleyball.db"'
            });
            fileStream.pipe(res);
            return;
          }

          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: false, error: err.message }));
        }
      });
    }
  };
}
