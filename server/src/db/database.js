const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '..', '..', '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'readings.db');

let dbInstance = null;
let initPromise = null;
let pendingResolves = [];

function getDb() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (!initPromise) {
    initPromise = new Promise((resolve) => {
      pendingResolves.push(resolve);
    });

    (async () => {
      if (dbInstance) {
        pendingResolves.forEach(r => r(dbInstance));
        return;
      }

      return new Promise((outerResolve, outerReject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
          if (err) return outerReject(err);

          db.serialize(async () => {
            function step(err) {
              if (err) return outerReject(err);
            }

            // Enable WAL mode for better concurrent write performance
            db.run('PRAGMA journal_mode = WAL', step);
            // Enable foreign key enforcement
            db.run('PRAGMA foreign_keys = ON', step);
            // Set busy timeout for concurrent access (5 seconds)
            db.run('PRAGMA busy_timeout = 5000', step);

            db.run(`
              CREATE TABLE IF NOT EXISTS medications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TEXT DEFAULT (datetime('now'))
              )
            `, step);

            db.run(`
              CREATE TABLE IF NOT EXISTS readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                systolic INTEGER NOT NULL,
                diastolic INTEGER NOT NULL,
                heart_rate INTEGER,
                medication_used INTEGER REFERENCES medications(id) DEFAULT 0,
                medication_name TEXT,
                symptoms TEXT,
                notes TEXT,
                arm TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
              )
            `, step);

            db.run(`CREATE INDEX IF NOT EXISTS idx_readings_created ON readings(created_at)`, step);
            db.run(`CREATE INDEX IF NOT EXISTS idx_readings_sync ON readings(updated_at)`, step);

            // Migration: add arm column if missing (properly rejected on error)
            await new Promise((resolve, reject) => {
              db.all('PRAGMA table_info(readings)', (err, rows) => {
                if (err) return reject(err);
                const columns = rows.map(r => r.name);
                if (!columns.includes('arm')) {
                  console.log('Migration: adding arm column to readings table');
                  db.run(`ALTER TABLE readings ADD COLUMN arm TEXT`, (err) => {
                    if (err) {
                      if (err.message.includes('duplicate column') || err.message.includes('duplicate column name')) {
                        console.log('Migration: arm column already exists (race condition resolved)');
                      } else {
                        console.error('Migration error adding arm column:', err.message);
                      }
                    }
                    resolve();
                  });
                } else {
                  resolve();
                }
              });
            });

            db.get('SELECT COUNT(*) as count FROM medications', (err, row) => {
              if (err) return outerReject(err);
              if (row.count === 0) {
                const meds = ['Losartana', 'Enalapril', 'Atenolol', 'Hidroclorotiazida', 'Amlodipina', 'Outro'];
                const stmt = db.prepare('INSERT INTO medications (name) VALUES (?)');
                meds.forEach(med => stmt.run(med));
                stmt.finalize();
              }
              dbInstance = db;
              pendingResolves.forEach(r => r(dbInstance));
              outerResolve(db);
            });
          });
        });
      });
    })();
  }

  return initPromise;
}

/**
 * Initialize a provided database connection (not the singleton).
 * Useful for seeding or testing with a separate DB instance.
 */
function initDb(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      function step(err) {
        if (err) return reject(err);
      }

      db.run('PRAGMA journal_mode = WAL', step);
      db.run('PRAGMA foreign_keys = ON', step);
      db.run('PRAGMA busy_timeout = 5000', step);
      db.run(`
        CREATE TABLE IF NOT EXISTS medications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `, step);

      db.run(`
        CREATE TABLE IF NOT EXISTS readings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          systolic INTEGER NOT NULL,
          diastolic INTEGER NOT NULL,
          heart_rate INTEGER,
          medication_used INTEGER,
          medication_name TEXT,
          symptoms TEXT,
          notes TEXT,
          arm TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `, step);

      db.run(`CREATE INDEX IF NOT EXISTS idx_readings_created ON readings(created_at)`, step);
      db.run(`CREATE INDEX IF NOT EXISTS idx_readings_sync ON readings(updated_at)`, step);

      db.get('SELECT COUNT(*) as count FROM medications', (err, row) => {
        if (err) return reject(err);
        if (row.count === 0) {
          const meds = ['Losartana', 'Enalapril', 'Atenolol', 'Hidroclorotiazida', 'Amlodipina', 'Outro'];
          const stmt = db.prepare('INSERT INTO medications (name) VALUES (?)');
          meds.forEach(med => stmt.run(med));
          stmt.finalize();
        }
        resolve(db);
      });
    });
  });
}

module.exports = { getDb, initDb };
